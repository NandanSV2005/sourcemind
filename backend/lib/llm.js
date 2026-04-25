const axios = require('axios');

async function callLLM(messages, stream = false) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing in backend .env");
  }

  try {
    const response = await axios.post(url, 
      {
        model: "google/gemini-2.0-flash-001", // Using the stable production model
        messages,
        stream
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "SourceMind"
        },
        responseType: stream ? 'stream' : 'json',
        proxy: false, // Bypass any local proxy hijacking
        timeout: 60000
      }
    );

    // Axios returns the data stream in .data for responseType: 'stream'
    // But the rest of our code expects the response object with .body
    // So we'll normalize it to look like a fetch response.
    return {
      ok: true,
      body: response.data
    };

  } catch (error) {
    if (error.response) {
      console.error('[LLM Error] Status:', error.response.status);
      let errorData = '';
      if (typeof error.response.data.on === 'function') {
        // It's a stream
        throw new Error(`OpenRouter API error (Stream): ${error.response.status}`);
      } else {
        errorData = JSON.stringify(error.response.data);
        throw new Error(`OpenRouter API error: ${errorData}`);
      }
    }
    console.error('[LLM Error] Message:', error.message);
    throw error;
  }
}

module.exports = { callLLM };
