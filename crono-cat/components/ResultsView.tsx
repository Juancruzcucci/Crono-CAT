import React from 'react';
import { Agent } from '../types';
import { Download, AlertTriangle } from 'lucide-react';

interface ResultsViewProps {
  agents: Agent[];
  logs: string[];
}

export const ResultsView: React.FC<ResultsViewProps> = ({ agents, logs }) => {
  
  const downloadCSV = () => {
    // Export only the skill column as requested for easy copy-pasting
    const header = "Skill Asignado\n";
    // We map through the agents in their original order
    const rows = agents.map(a => `${a.assignedSkill || 'Sin Asignar'}`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "cronograma_skills.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {logs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-800 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>Reporte de Asignación</span>
          </div>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {logs.map((log, i) => <li key={i}>{log}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Resultados ({agents.length} Asesores)</h2>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar Solo Skills (CSV)
          </button>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
              <tr>
                <th className="px-4 py-3">Asesor</th>
                <th className="px-4 py-3">Horario (Real)</th>
                <th className="px-4 py-3">Skill Asignado</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, idx) => (
                <tr key={idx} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{agent.name}</td>
                  <td className="px-4 py-3">{agent.effectiveTime}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${agent.assignedSkill === 'Varios' ? 'bg-gray-100 text-gray-800' : 
                        agent.assignedSkill === 'Comercial' ? 'bg-purple-100 text-purple-800' :
                        'bg-emerald-100 text-emerald-800'}`}>
                      {agent.assignedSkill}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{agent.assignmentReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};