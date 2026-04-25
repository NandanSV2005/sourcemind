const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Create a new notebook
router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { data, error } = await supabase
      .from('notebooks')
      .insert([{ title }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get notebook + its documents
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data: notebook, error: notebookError } = await supabase
      .from('notebooks')
      .select('*')
      .eq('id', id)
      .single();

    if (notebookError) throw notebookError;

    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, title, source_type, created_at')
      .eq('notebook_id', id);

    if (docsError) throw docsError;

    res.json({ ...notebook, documents });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
