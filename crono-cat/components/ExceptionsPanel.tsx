import React, { useState, useMemo } from 'react';
import { Agent } from '../types';
import { UserMinus, Search, X } from 'lucide-react';

interface ExceptionsPanelProps {
  agents: Agent[];
  selectedNames: string[];
  onSelectionChange: (names: string[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const ExceptionsPanel: React.FC<ExceptionsPanelProps> = ({ 
  agents, 
  selectedNames, 
  onSelectionChange, 
  onConfirm,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter agents available for selection (excluding already selected)
  const availableAgents = useMemo(() => {
    return agents.filter(a => 
      !selectedNames.includes(a.name) && 
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agents, selectedNames, searchTerm]);

  const handleAdd = (name: string) => {
    if (selectedNames.length >= 20) {
      alert("Máximo 20 excepciones permitidas.");
      return;
    }
    onSelectionChange([...selectedNames, name]);
  };

  const handleRemove = (name: string) => {
    onSelectionChange(selectedNames.filter(n => n !== name));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 p-2 rounded-lg">
          <UserMinus className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Excepciones Manuales</h2>
          <p className="text-sm text-slate-500">
            Selecciona asesores para asignarlos directamente a <strong>Varios</strong> (ignora cupos).
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-[500px]">
        {/* Left: Search and Available */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-3 bg-slate-50 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar asesor..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {availableAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => handleAdd(agent.name)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 rounded flex justify-between items-center group"
              >
                <span>{agent.name}</span>
                <span className="text-emerald-600 opacity-0 group-hover:opacity-100 font-medium">+ Agregar</span>
              </button>
            ))}
            {availableAgents.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-sm">
                No se encontraron asesores.
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected List */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-slate-50/50">
          <div className="p-3 bg-emerald-50 border-b flex justify-between items-center">
            <h3 className="font-semibold text-emerald-900">Seleccionados</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded ${selectedNames.length === 20 ? 'bg-red-100 text-red-600' : 'bg-white text-emerald-600'}`}>
              {selectedNames.length} / 20
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {selectedNames.map(name => (
              <div key={name} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded shadow-sm">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <button 
                  onClick={() => handleRemove(name)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {selectedNames.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Ningún asesor exceptuado.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
        >
          Atrás
        </button>
        <button 
          onClick={onConfirm}
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Confirmar y Generar Cronograma
        </button>
      </div>
    </div>
  );
};