const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { generateEmbedding } = require('../lib/embeddings');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { notebook_id, question, history = [] } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    // 1. Embed the question
    const queryEmbedding = await generateEmbedding(question);

    // 2. Vector search
    const { data: chunks, error: searchError } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_notebook_id: notebook_id,
      match_count: 8
    });

    if (searchError) throw searchError;

    // 3. Build prompt
    const sourcesText = chunks.map((c, i) =>
      `[SOURCE ${i + 1}] (doc: ${c.document_id}):\n${c.content}`
    ).join('\n\n');

    const messages = [
      {
        role: 'system',
        content: `You are SourceMind, a high-end AI research assistant.
Provide clear, concise, and professional answers based on the documents provided.
Do NOT include any source citations like [SOURCE 1] or [SOURCE 2].
Just provide the information directly in a clean, readable format.
If the information is not in the documents, just say: "I couldn't find this in your research library."
Be minimalist and sophisticated.

Sources:
${sourcesText}`
      },
      ...history,
      { role: 'user', content: question }
    ];

    // 4. Stream response
    const llmResponse = await callLLM(messages, true);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Also send sources as a special header or initial message
    // For simplicity, we'll just stream the text and then save the message to DB at the end.
    // In a production app, we might want to send sources metadata first.
    
    let fullContent = '';
    
    llmResponse.body.on('data', (chunk) => {
      const text = chunk.toString();
      // We process the text and use res.write(content) inside the loop instead
      
      // Try to extract content from the stream chunks (OpenRouter format)
      // Note: OpenRouter chunks are typically "data: {...}"
      const lines = text.split('\n').filter(line => line.trim().startsWith('data: '));
      for (const line of lines) {
        const dataStr = line.replace('data: ', '').trim();
        if (dataStr === '[DONE]') continue;
        try {
          const data = JSON.parse(dataStr);
          const content = data.choices[0]?.delta?.content || '';
          
          // Filter out unwanted preamble
          if (content.includes('OPENROUTER PROCESSING')) continue;
          
          fullContent += content;
          res.write(content); // Send ONLY the actual content to the frontend
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    });

    llmResponse.body.on('end', async () => {
      // Save full message + sources JSON to chat_messages table
      const sourcesMetadata = chunks.map(c => ({ 
        id: c.id, 
        document_id: c.document_id, 
        content: c.content,
        index: c.chunk_index
      }));
      
      await supabase.from('chat_messages').insert([
        { notebook_id, role: 'user', content: question },
        { notebook_id, role: 'assistant', content: fullContent, sources: sourcesMetadata }
      ]);
      
      res.end();
    });

    llmResponse.body.on('error', (err) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

  } catch (err) {
    console.error('[Chat Route Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
