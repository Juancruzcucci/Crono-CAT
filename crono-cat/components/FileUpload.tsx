import React, { ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onFileLoaded(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 border-2 border-dashed border-emerald-200 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer relative">
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="text-center flex flex-col items-center">
        <UploadCloud className="w-16 h-16 text-emerald-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">Cargar base de datos (CSV)</h3>
        <p className="text-slate-500 mt-2">Arrastra tu archivo aquí o haz clic para seleccionar</p>
      </div>
    </div>
  );
};