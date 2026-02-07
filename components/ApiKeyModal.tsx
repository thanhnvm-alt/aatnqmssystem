
import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  errorType: 'MISSING' | 'INVALID';
  onClose: () => void;
  onSave: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, errorType, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      onSave();
    }
  };

  const title = errorType === 'INVALID' ? 'Invalid Gemini API Key' : 'Gemini API Key Required';
  const description = errorType === 'INVALID' 
    ? 'The API key you provided is invalid. Please enter a valid key to continue using the Business Continuity simulation.'
    : 'The main server is unreachable. To use the Business Continuity simulation powered by Gemini, please provide your API key.';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          <i className="fas fa-key"></i>
        </div>
        <h2 className="text-xl font-black text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-2 mb-6 text-sm">{description}</p>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Enter your Google Gemini API key"
            className="w-full text-center px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            disabled={!apiKey.trim()}
          >
            Save and Retry
          </button>
          <button
            onClick={onClose}
            className="w-full text-slate-500 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          You can get your API key from{' '}
          <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600">
            Google AI Studio
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
