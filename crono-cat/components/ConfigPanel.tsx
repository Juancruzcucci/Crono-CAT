import React from 'react';
import { SkillRequirement, SkillType, TIME_SLOTS } from '../types';

interface ConfigPanelProps {
  config: SkillRequirement[];
  onConfigChange: (newConfig: SkillRequirement[]) => void;
  onConfirm: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange, onConfirm }) => {
  
  const skills = [
    SkillType.TUTOR, 
    SkillType.PRESTADORES, 
    SkillType.DISCAPACIDAD, 
    SkillType.COBRANZAS, 
    SkillType.AUTORIZACIONES, 
    SkillType.MEDICAMENTOS
  ];

  const getCount = (skill: SkillType, slot: string) => {
    return config.find(c => c.skill === skill && c.timeSlot === slot)?.count || 0;
  };

  const handleChange = (skill: SkillType, slot: string, val: string) => {
    const num = parseInt(val) || 0;
    const newConfig = config.map(c => {
      if (c.skill === skill && c.timeSlot === slot) {
        return { ...c, count: num };
      }
      return c;
    });
    onConfigChange(newConfig);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Configuración de Cupos</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Skill</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="px-4 py-3 text-center">{slot}</th>
              ))}
              <th className="px-4 py-3 text-center rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => {
              const rowTotal = TIME_SLOTS.reduce((sum, slot) => sum + getCount(skill, slot), 0);
              return (
                <tr key={skill} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{skill}</td>
                  {TIME_SLOTS.map(slot => (
                    <td key={slot} className="px-2 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        className="w-16 p-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={getCount(skill, slot)}
                        onChange={(e) => handleChange(skill, slot, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-bold text-emerald-600">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={onConfirm}
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Generar Cronograma
        </button>
      </div>
    </div>
  );
};