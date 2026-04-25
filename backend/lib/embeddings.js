const axios = require('axios');

async function generateEmbedding(text) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('[Embedding Error] OPENROUTER_API_KEY is missing!');
    throw new Error("Backend Configuration Error: OpenRouter API Key is missing.");
  }

  // We'll use a widely supported embedding model via OpenRouter
  const url = "https://openrouter.ai/api/v1/embeddings";

  console.log(`[Embedding] Calling OpenRouter for intelligence...`);
  
  try {
    const response = await axios.post(url, 
      { 
        model: "openai/text-embedding-3-small", 
        input: text.slice(0, 8000) // Ensure we stay within token limits
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const result = response.data;
    
    // OpenRouter/OpenAI format: response.data.data[0].embedding
    if (result.data && result.data[0] && result.data[0].embedding) {
      return result.data[0].embedding;
    }

    console.error('[Embedding Error] Unexpected result format:', result);
    throw new Error("Invalid embedding format received from provider");
  } catch (error) {
    if (error.response) {
      console.error(`[Embedding Error] Provider Status ${error.response.status}:`, error.response.data);
      throw new Error(`Intelligence API error: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

module.exports = { generateEmbedding };
