const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { callLLM } = require('../lib/llm');

router.post('/', async (req, res, next) => {
  try {
    const { doc_id_a, doc_id_b } = req.body;
    if (!doc_id_a || !doc_id_b) return res.status(400).json({ error: 'Two document IDs are required' });
    if (doc_id_a === doc_id_b) return res.status(400).json({ error: 'Please select two different documents' });

    const { data: docA, error: errorA } = await supabase.from('documents').select('*').eq('id', doc_id_a).single();
    const { data: docB, error: errorB } = await supabase.from('documents').select('*').eq('id', doc_id_b).single();

    if (errorA || errorB) throw new Error('Could not fetch documents');

    const prompt = `You are a research analyst. Compare these two documents carefully.

## Where They Agree
Bullet points of agreements with evidence from both documents.

## Where They Contradict
Specific contradictions — state Document A's claim vs Document B's claim.

## Strength of Arguments
Which document makes stronger, better-evidenced arguments and why.

## Key Differences in Approach
How they differ in methodology, scope, or framing.

## Agreement Score
End with exactly this line: "Agreement Score: X/10"

Document A — ${docA.title}:
${docA.content}

Document B — ${docB.title}:
${docB.content}`;

    const llmResponse = await callLLM([{ role: 'user', content: prompt }], false);
    const result = llmResponse.body;
    const comparison = result.choices[0]?.message?.content || "Could not generate comparison.";

    // Parse Agreement Score
    const scoreMatch = comparison.match(/Agreement Score: (\d+)\/10/);
    const agreement_score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    res.json({ comparison, agreement_score });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
