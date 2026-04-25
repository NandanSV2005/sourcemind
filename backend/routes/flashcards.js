const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { notebook_id, count = 12 } = req.body;
    const finalCount = Math.min(Math.max(parseInt(count) || 12, 1), 30);

    if (!notebook_id) return res.status(400).json({ error: 'Notebook ID is required' });

    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('title, content')
      .eq('notebook_id', notebook_id);

    if (docsError) throw docsError;
    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one document first' });
    }

    const combinedContent = documents.map(d => `Document: ${d.title}\nContent: ${d.content}`).join('\n\n---\n\n');

    const prompt = `You are a study assistant. Generate ${finalCount} flashcards from these documents.
Each flashcard should test a specific concept or fact.
Include a mix of factual and conceptual questions.
Difficulty should be easy, medium, or hard.

Return ONLY a valid JSON array of objects:
[
  {
    "question": "...",
    "answer": "...",
    "difficulty": "easy|medium|hard"
  }
]
No markdown, no preamble. Just raw JSON array.

Documents:
${combinedContent}`;

    let cardsData;
    try {
      const llmResponse = await callLLM([{ role: 'user', content: prompt }], false);
      const result = llmResponse.body;
      const content = result.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      cardsData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (err) {
      // Retry once
      const llmResponse = await callLLM([{ role: 'user', content: prompt + "\n\nIMPORTANT: Return ONLY raw JSON array." }], false);
      const result = llmResponse.body;
      const content = result.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      cardsData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    }

    // Store in DB
    const flashcardsToInsert = cardsData.map(c => ({
      notebook_id,
      question: c.question,
      answer: c.answer,
      difficulty: c.difficulty
    }));

    const { data, error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (insertError) throw insertError;

    res.json(data);
  } catch (err) {
    console.error('[Flashcards Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
