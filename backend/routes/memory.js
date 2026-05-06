const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// 1) GET /api/memory/:notebook_id - Fetch latest of everything
router.get('/:notebook_id', async (req, res, next) => {
  try {
    const { notebook_id } = req.params;

    // Parallel fetch for efficiency
    const [
      chatRes,
      summaryRes,
      gapRes,
      compareRes,
      podcastRes
    ] = await Promise.all([
      supabase.from('chat_messages').select('*').eq('notebook_id', notebook_id).order('created_at', { ascending: true }),
      supabase.from('summaries').select('*').eq('notebook_id', notebook_id).order('created_at', { ascending: false }).limit(1),
      supabase.from('gap_reports').select('*').eq('notebook_id', notebook_id).order('created_at', { ascending: false }).limit(1),
      supabase.from('comparisons').select('*').eq('notebook_id', notebook_id).order('created_at', { ascending: false }),
      supabase.from('podcasts').select('*').eq('notebook_id', notebook_id).order('created_at', { ascending: false })
    ]);

    res.json({
      chat: chatRes.data || [],
      latest_summary: summaryRes.data?.[0] || null,
      latest_gap_report: gapRes.data?.[0] || null,
      comparisons: compareRes.data || [],
      podcasts: podcastRes.data || []
    });
  } catch (err) {
    next(err);
  }
});

// 2) GET /api/memory/:notebook_id/summaries - History
router.get('/:notebook_id/summaries', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('notebook_id', req.params.notebook_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 3) GET /api/memory/:notebook_id/gaps - History
router.get('/:notebook_id/gaps', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('gap_reports')
      .select('*')
      .eq('notebook_id', req.params.notebook_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 4) GET /api/memory/:notebook_id/comparisons - History
router.get('/:notebook_id/comparisons', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('comparisons')
      .select('*')
      .eq('notebook_id', req.params.notebook_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 5) GET /api/memory/:notebook_id/podcasts - History
router.get('/:notebook_id/podcasts', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('notebook_id', req.params.notebook_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
