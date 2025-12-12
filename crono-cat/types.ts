export interface Agent {
  id: string; // usually name
  name: string;
  scheduleTime: string; // From 'Horario'
  realTime: string; // From 'Franja CAT' (priority)
  effectiveTime: string; // The calculated time used for logic
  isPrestaQualified: boolean;
  isTutorQualified: boolean;
  variable: string; // 'comercial' etc.
  
  // History
  weeksHistory: string[]; // Last 3 weeks
  targetWeekFixed: string; // The 4th week column if pre-filled
  
  // Counters
  countDisca: number;
  countPresta: number;
  countTutor: number;
  countMeds: number;
  countAuth: number;
  countCobranzas: number;
  countVarios: number;
  
  // Attendance
  daysAbsent: number[]; // 1 = absent, 0 = present
  totalAbsences: number;
  isFullyAbsent: boolean; // Computed based on logic (total == max days)

  // Output
  assignedSkill: string | null;
  assignmentReason: string;
}

export enum SkillType {
  TUTOR = 'Tutor',
  PRESTADORES = 'Prestadores',
  DISCAPACIDAD = 'Discapacidad',
  COBRANZAS = 'Cobranzas',
  AUTORIZACIONES = 'Autorizaciones',
  MEDICAMENTOS = 'Medicamentos',
  VARIOS = 'Varios',
  COMERCIAL = 'Comercial', // Special fixed
  ABSENT = 'Ausente Total' // Special
}

export interface SkillRequirement {
  skill: SkillType;
  timeSlot: string;
  count: number;
}

export interface ProcessingResult {
  agents: Agent[];
  unassigned: Agent[];
  logs: string[];
}

export const TIME_SLOTS = ['09:00', '09:15/09:30', '10:00', '14:00', '15:00'];
