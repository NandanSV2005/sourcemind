const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { notebook_id, duration, tone } = req.body;

    if (!notebook_id) {
      return res.status(400).json({ error: 'Notebook ID is required' });
    }

    // 1. Fetch all documents for this notebook
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, title, content')
      .eq('notebook_id', notebook_id);

    if (error) throw error;
    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one document first' });
    }

    // 2. Prepare content (truncate if too large)
    let combinedContent = documents
      .map(d => `Source: ${d.title}\nContent: ${d.content}`)
      .join('\n\n---\n\n');

    // Simple truncation to avoid token limits (approx 15k chars)
    if (combinedContent.length > 15000) {
      combinedContent = combinedContent.substring(0, 15000) + '... [Content Truncated]';
    }

    // 3. Define the Prompt
    const systemPrompt = `You are SourceMind Podcast Studio.
Generate a podcast episode based ONLY on the provided documents.
Make it engaging, conversational, and easy to understand.
Use a HOST and CO-HOST format with dialogue.

Rules:
- No hallucinations
- Use only document info
- If something is missing, say it naturally (ex: 'The sources don’t mention exact numbers')
- Include chapter timestamps and a catchy episode title
- The script must be natural spoken English
- Output MUST be valid JSON only, no markdown, no explanation.

Expected JSON format:
{
  "title": "Podcast Episode Title",
  "estimated_minutes": number,
  "script": "Full podcast script text",
  "chapters": [
    { "title": "Intro", "timestamp": "00:00" },
    ...
  ]
}`;

    const userPrompt = `Duration: ${duration || 'medium'} (short=3-5 min, medium=6-10 min, long=12-18 min)
Tone: ${tone || 'casual'}

Documents:
${combinedContent}`;

    // 4. Call LLM with retry logic for JSON parsing
    let podcastData;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ];

        // If it's a retry, add a stricter instruction
        if (attempts > 0) {
          messages.push({ role: 'user', content: 'Return RAW JSON ONLY. No extra characters.' });
        }

        const llmResponse = await callLLM(messages, false);
        const rawContent = llmResponse.body.choices[0]?.message?.content || "";
        
        // Clean markdown code blocks if present
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : rawContent;
        
        podcastData = JSON.parse(jsonStr);
        break; // Success
      } catch (parseError) {
        attempts++;
        if (attempts === maxAttempts) {
          console.error('Failed to parse podcast JSON after retries:', parseError);
          return res.status(500).json({ error: 'Podcast generation failed due to invalid AI response format.' });
        }
      }
    }

    // 5. Store in database
    const { data: insertedPodcast, error: dbError } = await supabase
      .from('podcasts')
      .insert({
        notebook_id,
        title: podcastData.title,
        duration: duration || 'medium',
        tone: tone || 'casual',
        script: podcastData.script,
        chapters: podcastData.chapters
      })
      .select()
      .single();

    if (dbError) {
      console.warn('Failed to store podcast in DB, but returning script anyway:', dbError);
    }

    res.json(podcastData);

  } catch (err) {
    console.error('Podcast Route Error:', err);
    next(err);
  }
});

module.exports = router;
