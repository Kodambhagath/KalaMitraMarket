import { useState } from 'react';

export default function GeminiImageGenerator() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setImageUrl('');
    try {
      const response = await fetch('https://generativeai.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt,
        }),
      });
      const data = await response.json();
      // Adjust this according to Gemini's actual response structure
      setImageUrl(data.imageUrl || '');
    } catch (err) {
      alert('Failed to generate image');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <input
        type="text"
        placeholder="Enter Gemini API Key"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        className="mb-2 w-full border px-2 py-1 rounded"
      />
      <input
        type="text"
        placeholder="Enter prompt"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="mb-2 w-full border px-2 py-1 rounded"
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !apiKey || !prompt}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Generated" className="w-full rounded" />
        </div>
      )}
    </div>
  );
}