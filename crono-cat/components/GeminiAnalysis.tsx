import React, { useState } from 'react';
import { Agent } from '../types';
import { analyzeSchedule } from '../services/geminiService';
import { Sparkles, Send } from 'lucide-react';

interface Props {
  agents: Agent[];
}

export const GeminiAnalysis: React.FC<Props> = ({ agents }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    
    const result = await analyzeSchedule(agents, query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg shadow-sm border border-indigo-100 p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-800">Asistente IA</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 bg-white/50 rounded p-3 text-sm text-slate-700 min-h-[150px]">
        {loading ? (
          <div className="animate-pulse flex space-x-2 items-center text-slate-400">
             <span>Analizando datos...</span>
          </div>
        ) : response ? (
          <div className="whitespace-pre-wrap">{response}</div>
        ) : (
          <p className="text-slate-400 italic">Pregunta sobre la distribución, ausentismo o detalles de los asesores.</p>
        )}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: ¿Quiénes están en Varios?"
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <button 
          onClick={handleAsk}
          disabled={loading}
          className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};