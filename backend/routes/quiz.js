const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { notebook_id, difficulty = 'medium', question_count = 10 } = req.body;
    const finalCount = Math.min(Math.max(parseInt(question_count) || 10, 1), 25);

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

    const prompt = `You are a professional examiner. Generate a ${difficulty} difficulty quiz with ${finalCount} questions from these documents.
Return ONLY a valid JSON object:
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "....",
      "options": ["A", "B", "C", "D"],
      "correct_index": 2,
      "explanation": "Why that option is correct"
    }
  ]
}
Each question must have exactly 4 options.
correct_index is 0-3.
Return ONLY raw JSON.

Documents:
${combinedContent}`;

    let quizData;
    try {
      const llmResponse = await callLLM([{ role: 'user', content: prompt }], false);
      const result = llmResponse.body;
      const content = result.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      quizData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (err) {
      // Retry once
      const llmResponse = await callLLM([{ role: 'user', content: prompt + "\n\nIMPORTANT: Return ONLY raw JSON." }], false);
      const result = llmResponse.body;
      const content = result.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      quizData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    }

    // Store in DB
    const { data: quiz, error: insertError } = await supabase
      .from('quizzes')
      .insert([{ 
        notebook_id, 
        title: quizData.title, 
        questions: quizData.questions 
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json(quiz);
  } catch (err) {
    console.error('[Quiz Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
