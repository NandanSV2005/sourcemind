const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { notebook_id } = req.body;
    if (!notebook_id) return res.status(400).json({ error: 'Notebook ID is required' });

    // Fetch all documents for this notebook
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, title, content')
      .eq('notebook_id', notebook_id);

    if (error) throw error;
    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one document first' });
    }

    const combinedContent = documents.map(d => `Document: ${d.title}\nContent: ${d.content}`).join('\n\n---\n\n');

    const prompt = `Analyze these research documents and provide a structured summary with exactly these 4 sections:

## Key Themes
The 3-5 major themes across all documents as bullet points.

## Main Arguments
The central claim each document makes (one line per document, label by title).

## Key Facts & Data
Important statistics, findings, or evidence mentioned across documents.

## Overall Synthesis
A 2-paragraph synthesis of what all documents collectively say.

Documents:
${combinedContent}`;

    const llmResponse = await callLLM([{ role: 'user', content: prompt }], false);
    const result = llmResponse.body;
    const summary = result.choices[0]?.message?.content || "Could not generate summary.";

    // Save to memory
    await supabase.from('summaries').insert({
      notebook_id,
      content: summary
    });

    res.json({ 
      summary, 
      documents_included: documents.map(d => ({ id: d.id, title: d.title })) 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
