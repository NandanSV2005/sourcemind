const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { supabase } = require('../lib/supabase');
const { generateEmbedding } = require('../lib/embeddings');

const upload = multer({ storage: multer.memoryStorage() });

// Helper to chunk text
function chunkText(text, size = 500, overlap = 50) {
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + size));
    index += size - overlap;
  }
  return chunks;
}

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const { notebook_id, type, title: bodyTitle, content: bodyContent } = req.body;
    let title = bodyTitle;
    let content = bodyContent;

    if (type === 'pdf') {
      if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
      console.log(`[Upload] Parsing PDF: ${req.file.originalname}`);
      const data = await pdf(req.file.buffer);
      content = data.text;
      title = title || req.file.originalname;
      console.log(`[Upload] PDF parsed. Content length: ${content?.length || 0} characters`);
    } else if (type === 'url') {
      const { url } = req.body;
      console.log(`[Upload] Fetching URL: ${url}`);
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style').remove();
      content = $('body').text().replace(/\s+/g, ' ').trim();
      title = title || $('title').text() || url;
      console.log(`[Upload] URL fetched. Content length: ${content?.length || 0} characters`);
    }

    if (!content) return res.status(400).json({ error: 'No content found' });
    if (!notebook_id) return res.status(400).json({ error: 'Notebook ID is required' });

    console.log(`[Upload] 🟢 Step 1: Starting DB insert for notebook: ${notebook_id}`);

    // 1. Insert document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert([{ 
        notebook_id: notebook_id, 
        title: title || 'Untitled', 
        content: content, 
        source_type: type 
      }])
      .select()
      .single();

    if (docError) {
      console.error('[Upload] ❌ Step 1 Error:', docError);
      return res.status(500).json({ error: `Database Insert Failed (Table: documents): ${docError.message}. Ensure you have run the Unified SQL script in Supabase.` });
    }

    console.log(`[Upload] ✅ Step 1 Success! Doc ID: ${doc.id}`);
    console.log(`[Upload] 🟡 Step 2: Generating embeddings for ${content.length} chars...`);

    // 2. Chunk and embed
    const chunks = chunkText(content);
    console.log(`[Upload] Splitting into ${chunks.length} chunks...`);
    
    const chunkInserts = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i]);
        chunkInserts.push({
          document_id: doc.id,
          notebook_id,
          content: chunks[i],
          chunk_index: i,
          embedding
        });
      }

      console.log(`[Upload] 🟢 Step 3: Inserting ${chunkInserts.length} chunks into DB...`);
      const { error: chunkError } = await supabase
        .from('chunks')
        .insert(chunkInserts);

      if (chunkError) {
        console.error('[Upload] ❌ Step 3 Error:', chunkError);
        throw chunkError;
      }

      console.log(`[Upload] 🏆 Upload Complete for "${title}"`);
      res.json(doc);
    } catch (innerError) {
      console.error('[Upload] ❌ Embedding/Chunking Phase Failed:', innerError);
      // We still return the doc because it WAS inserted into the 'documents' table, 
      // but we warn the user that chat might not work.
      res.status(207).json({ 
        ...doc, 
        warning: 'Document saved, but AI indexing failed. Chat/Search may be unavailable for this file.' 
      });
    }
  } catch (err) {
    console.error('[Upload] ❌ Critical Failure:', err);
    next(err);
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
