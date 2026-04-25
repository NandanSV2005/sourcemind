const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { notebook_id } = req.body;
    if (!notebook_id) return res.status(400).json({ error: 'Notebook ID is required' });

    const { data: documents, error } = await supabase
      .from('documents')
      .select('title, content')
      .eq('notebook_id', notebook_id);

    if (error) throw error;
    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one document first' });
    }

    const combinedContent = documents.map(d => `Document: ${d.title}\nContent: ${d.content}`).join('\n\n---\n\n');

    const prompt = `You are a critical research analyst. Analyze these documents as a complete body of research.

Return ONLY a valid JSON object. No preamble, no explanation, no markdown fences. Raw JSON only.

{
  "well_covered": [
    {
      "topic": "topic name",
      "confidence": "high or medium",
      "evidence": "which documents cover this and how well"
    }
  ],
  "contradictions": [
    {
      "topic": "what the contradiction is about",
      "doc_a_claim": "what one source says",
      "doc_b_claim": "what another source says",
      "severity": "high or medium or low"
    }
  ],
  "unanswered_questions": [
    {
      "question": "the unanswered question",
      "why_it_matters": "why this gap is important",
      "suggested_sources": "what type of source would answer this"
    }
  ],
  "research_verdict": "A 2-sentence overall assessment of completeness."
}

Documents:
${combinedContent}`;

    let jsonResponse;
    try {
      const llmResponse = await callLLM([{ role: 'user', content: prompt }], false);
      const result = llmResponse.body;
      const content = result.choices[0]?.message?.content || "";
      // Extract JSON if it's wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      jsonResponse = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.warn('JSON parse failed, retrying with stricter prompt...');
      const llmResponseRetry = await callLLM([{ 
        role: 'user', 
        content: prompt + '\n\nIMPORTANT: Return ONLY raw JSON. No other text.' 
      }], false);
      const resultRetry = llmResponseRetry.body;
      const contentRetry = resultRetry.choices[0]?.message?.content || "";
      const jsonMatchRetry = contentRetry.match(/\{[\s\S]*\}/);
      jsonResponse = JSON.parse(jsonMatchRetry ? jsonMatchRetry[0] : contentRetry);
    }

    res.json(jsonResponse);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
