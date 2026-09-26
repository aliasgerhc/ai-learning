import { useEffect, useState } from 'react';
import { getApiKey, setApiKey, getModelName, getAvailableModels } from '../utils/ai';
import { Key, X, Check, Save, Info } from 'lucide-react';

export default function ApiKeyModal({ onClose }) {
  const [key, setKey] = useState(localStorage.getItem('eduai_gemini_key') || '');
  const [model, setModel] = useState(getModelName());
  const [models, setModels] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (key.trim()) {
      getAvailableModels(key.trim()).then(availableModels => {
        setModels(availableModels);
        if (!availableModels.some(item => item.name.replace(/^models\//, '') === model)) {
          setModel(availableModels[0] ? availableModels[0].name.replace(/^models\//, '') : '');
        }
      }).catch(() => setModels([]));
    } else {
      setModels([]);
    }
  }, [key, model]);

  const handleSave = () => {
    setApiKey(key.trim(), model);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const handleClear = () => {
    setKey('');
    setModel('');
    setApiKey(''); // Clears the custom key, defaults back to the system key
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={20} className="text-primary" /> Gemini API Settings
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, marginBottom: 20 }}>
          <Info size={20} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            The system provides a default key using the lowest-cost model. 
            If you provide your own key, you can choose a more advanced model. Your key is stored locally in your browser.
          </p>
        </div>

        <div className="input-group">
          <label className="input-label">Custom API Key (Optional)</label>
          <input
            type="password"
            className="input"
            placeholder="Leave blank to use the system default key"
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            id="api-key-input"
          />
        </div>

        {key.trim() && (
          <div className="input-group">
            <label className="input-label">Preferred Model</label>
            <select className="select" value={model} onChange={e => setModel(e.target.value)} disabled={!models.length}>
              {models.map(availableModel => (
                <option key={availableModel.name} value={availableModel.name.replace(/^models\//, '')}>
                  {availableModel.displayName || availableModel.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {key.trim() ? (
            <button className="btn btn-outline" onClick={handleClear} style={{ flex: 1, color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
              Clear Key
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          )}
          <button className="btn btn-primary" onClick={handleSave} style={{ flex: 2, justifyContent: 'center' }}>
            {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
