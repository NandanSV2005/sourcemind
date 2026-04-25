const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { notebook_id } = req.body;
    if (!notebook_id) return res.status(400).json({ error: 'Notebook ID is required' });

    // Fetch documents
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('title, content')
      .eq('notebook_id', notebook_id);

    if (docsError) throw docsError;
    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one document first' });
    }

    const combinedContent = documents.map(d => `Document: ${d.title}\nContent: ${d.content}`).join('\n\n---\n\n');

    const prompt = `You are an expert educator. Generate a structured mind map from these documents.
Return ONLY a valid JSON object in this format:
{
  "root": "Main Topic",
  "nodes": [
    {
      "title": "Branch Title",
      "children": [
        { "title": "Subtopic", "children": [] }
      ]
    }
  ]
}
No markdown, no preamble, no explanation. Just raw JSON.

Documents:
${combinedContent}`;

    let mapData;
    try {
      const llmResponse = await callLLM([{ role: 'user', content: prompt }], false);
      const result = llmResponse.body;
      const content = result.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      mapData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (err) {
      // Retry once
      const llmResponse = await callLLM([{ role: 'user', content: prompt + "\n\nIMPORTANT: Return ONLY raw JSON." }], false);
      const result = llmResponse.body;
      const content = result.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      mapData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    }

    // Store in DB
    const { data: mindmap, error: insertError } = await supabase
      .from('mindmaps')
      .insert([{ notebook_id, title: mapData.root, data: mapData }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json(mindmap);
  } catch (err) {
    console.error('[Mindmap Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
