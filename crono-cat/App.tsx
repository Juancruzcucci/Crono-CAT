import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConfigPanel } from './components/ConfigPanel';
import { ExceptionsPanel } from './components/ExceptionsPanel';
import { ResultsView } from './components/ResultsView';
import { parseCSV, generateSchedule } from './services/scheduleLogic';
import { INITIAL_CONFIG } from './constants';
import { Agent, SkillRequirement } from './types';
import { CalendarRange } from 'lucide-react';

// Defaults requested by user
const DEFAULT_EXCEPTION_NAMES = [
  "Perales Aime Belen",
  "Occhi Liliana Andrea",
  "Rodriguez Mariana Brenda"
];

function App() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [config, setConfig] = useState<SkillRequirement[]>(INITIAL_CONFIG);
  const [exceptions, setExceptions] = useState<string[]>([]);
  
  const [processedAgents, setProcessedAgents] = useState<Agent[]>([]);
  const [processLogs, setProcessLogs] = useState<string[]>([]);

  const handleFileLoaded = (csvContent: string) => {
    const parsedData = parseCSV(csvContent);
    if (parsedData.length > 0) {
      setAgents(parsedData);
      
      // Auto-select default exceptions if they exist in the file
      const foundDefaults = parsedData
        .filter(a => DEFAULT_EXCEPTION_NAMES.some(def => a.name.toLowerCase().includes(def.toLowerCase())))
        .map(a => a.name);
      
      // Use Set to ensure unique and combine with any existing logic if needed (though here it's fresh load)
      setExceptions(foundDefaults);

      setStep(2);
    } else {
      alert("No se pudieron leer datos válidos del CSV. Verifica el formato.");
    }
  };

  const handleGenerate = () => {
    // Pass exceptions to the logic
    const { agents: result, logs } = generateSchedule(agents, config, exceptions);
    setProcessedAgents(result);
    setProcessLogs(logs);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <CalendarRange className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Armado de cronograma CAT</h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-12">
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl text-center text-slate-600 mb-8">Paso 1: Carga la base de datos de asesores</h2>
            <FileUpload onFileLoaded={handleFileLoaded} />
            <div className="mt-8 mx-auto max-w-4xl bg-slate-100 p-4 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-600 mb-2 text-center">Formato esperado de columnas (CSV):</p>
              <p className="text-sm text-slate-500 text-center leading-relaxed">
                Asesor, Horario, Franja CAT, Presta, Variables, Tutor, Semanas Históricas (3 columnas), Target, 
                Contadores (Disca, Presta, Tutor, Meds, Auth, Cobranzas, Varios), Días de Ausencia (columnas restantes).
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-slate-600">Paso 2: Configura los cupos por Skill y Horario</h2>
              <button onClick={() => setStep(1)} className="text-sm text-emerald-600 hover:underline">
                ← Volver a cargar archivo
              </button>
            </div>
            <ConfigPanel 
              config={config} 
              onConfigChange={setConfig} 
              onConfirm={() => setStep(3)} 
            />
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-slate-600">Paso 3: Excepciones Manuales</h2>
              <button onClick={() => setStep(2)} className="text-sm text-emerald-600 hover:underline">
                ← Volver a Configuración
              </button>
            </div>
            <ExceptionsPanel 
              agents={agents}
              selectedNames={exceptions}
              onSelectionChange={setExceptions}
              onConfirm={handleGenerate}
              onBack={() => setStep(2)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-slate-600">Paso 4: Resultados y Exportación</h2>
              <button onClick={() => setStep(3)} className="text-sm text-emerald-600 hover:underline">
                ← Volver a Excepciones
              </button>
            </div>
            <ResultsView agents={processedAgents} logs={processLogs} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;