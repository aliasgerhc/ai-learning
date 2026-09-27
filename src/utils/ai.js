// AI (Gemini) integration utility
// Stores API key in localStorage and provides a simple call wrapper

const DEFAULT_API_KEY = import.meta.env.VITE_DEFAULT_GEMINI_API_KEY; // Hidden in .env
let availableModelsPromise;
let availableModelsKey;

function modelId(name) {
  return name.replace(/^models\//, '');
}

function modelCostRank(model) {
  const name = model.name.toLowerCase();
  if (name.includes('flash-lite') || name.includes('lite')) return 0;
  if (name.includes('flash')) return 1;
  if (name.includes('nano')) return 2;
  if (name.includes('pro')) return 3;
  return 4;
}

export async function getAvailableModels(apiKey = getApiKey()) {
  if (!apiKey) return [];
  if (!availableModelsPromise || availableModelsKey !== apiKey) {
    availableModelsKey = apiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    availableModelsPromise = fetch(url)
      .then(async response => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error?.error?.message || 'Unable to list Gemini models');
        }
        const data = await response.json();
        return (data.models || [])
          .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
          .sort((left, right) => modelCostRank(left) - modelCostRank(right));
      })
      .catch(error => {
        availableModelsPromise = undefined;
        availableModelsKey = undefined;
        throw error;
      });
  }
  return availableModelsPromise;
}

export function getApiKey() {
  const customKey = localStorage.getItem('eduai_gemini_key');
  return customKey || DEFAULT_API_KEY;
}

export function getModelName() {
  const customKey = localStorage.getItem('eduai_gemini_key');
  if (customKey && customKey !== DEFAULT_API_KEY) {
    return localStorage.getItem('eduai_gemini_model') || '';
  }
  return '';
}

export function setApiKey(key, model = '') {
  if (key && key !== DEFAULT_API_KEY) {
    localStorage.setItem('eduai_gemini_key', key);
    localStorage.setItem('eduai_gemini_model', model);
  } else {
    localStorage.removeItem('eduai_gemini_key');
    localStorage.removeItem('eduai_gemini_model');
  }
}

export async function callGemini(prompt, onChunk = null) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Please set your Gemini API key first using the API Key button in the top bar.');
  }

  const selectedModel = getModelName();
  const models = await getAvailableModels(apiKey);
  const model = models.find(item => modelId(item.name) === selectedModel) || models[0];
  if (!model) {
    throw new Error('No Gemini model supporting generateContent is available for this API key.');
  }
  const modelName = modelId(model.name);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:${onChunk ? 'streamGenerateContent' : 'generateContent'}?key=${apiKey}${onChunk ? '&alt=sse' : ''}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  if (onChunk) {
    // Streaming
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || 'Gemini API error');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const json = JSON.parse(line.replace('data: ', ''));
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) { full += text; onChunk(full); }
        } catch { }
      }
    }
    return full;
  } else {
    // Non-streaming
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || 'Gemini API error');
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}
