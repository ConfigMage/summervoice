'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Model {
  id: string;
  label: string;
  description: string;
}

interface SettingsPanelProps {
  password: string;
}

export default function SettingsPanel({ password }: SettingsPanelProps) {
  const [chatModel, setChatModel] = useState('');
  const [analysisModel, setAnalysisModel] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/settings', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        const data = await res.json();
        setChatModel(data.settings.chat_model);
        setAnalysisModel(data.settings.analysis_model);
        setModels(data.available_models);
      }
      setLoading(false);
    }
    load();
  }, [password]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ chat_model: chatModel, analysis_model: analysisModel }),
    });

    if (res.ok) {
      setMessage('Settings saved! Changes take effect on the next chat message or analysis run.');
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold text-gray-800 mb-1">Model Configuration</h3>
        <p className="text-sm text-gray-500 mb-6">
          Choose which Claude model powers the chat interviewer and the post-interview analysis.
          Changes apply immediately — no redeployment needed.
        </p>

        <div className="space-y-6">
          {/* Chat Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat Interviewer Model
            </label>
            <div className="space-y-2">
              {models.map((model) => (
                <label
                  key={`chat-${model.id}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    chatModel === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="chatModel"
                    value={model.id}
                    checked={chatModel === model.id}
                    onChange={(e) => setChatModel(e.target.value)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{model.label}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{model.id}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Analysis Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post-Interview Analysis Model
            </label>
            <div className="space-y-2">
              {models.map((model) => (
                <label
                  key={`analysis-${model.id}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    analysisModel === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="analysisModel"
                    value={model.id}
                    checked={analysisModel === model.id}
                    onChange={(e) => setAnalysisModel(e.target.value)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{model.label}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{model.id}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          {message && (
            <p className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-800 mb-2">Model Comparison Notes</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Haiku 4.5</strong> — Fastest responses (~1-2s). Great for rapid testing and iteration.
            Lower cost per conversation. May miss nuance in probing questions.
          </p>
          <p>
            <strong>Sonnet 4.5</strong> — Best balance for production use. Good conversational quality
            and reliable analysis. Recommended default.
          </p>
          <p>
            <strong>Opus 4.6</strong> — Highest quality for both conversation and analysis. Best at
            following complex probing instructions and producing accurate ratings. Higher cost and
            slightly slower.
          </p>
        </div>
      </Card>
    </div>
  );
}
