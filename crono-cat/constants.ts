import { SkillRequirement, SkillType, TIME_SLOTS } from './types';

// Helper to build defaults
const createReq = (skill: SkillType, time: string, count: number): SkillRequirement => ({ skill, timeSlot: time, count });

export const DEFAULT_REQUIREMENTS: SkillRequirement[] = [
  // Tutores: 5 de 09, 1 de 0915/30, 2 de 10, 3 de 14, 5 de 15
  createReq(SkillType.TUTOR, '09:00', 5),
  createReq(SkillType.TUTOR, '09:15/09:30', 1),
  createReq(SkillType.TUTOR, '10:00', 2),
  createReq(SkillType.TUTOR, '14:00', 3),
  createReq(SkillType.TUTOR, '15:00', 5),

  // Prestadores: 7 de 09, 3 de 0915/30, 2 de 10, 4 de 14, 5 de 15
  createReq(SkillType.PRESTADORES, '09:00', 7),
  createReq(SkillType.PRESTADORES, '09:15/09:30', 3),
  createReq(SkillType.PRESTADORES, '10:00', 2),
  createReq(SkillType.PRESTADORES, '14:00', 4),
  createReq(SkillType.PRESTADORES, '15:00', 5),

  // Discapacidad: 9 de 09, 5 de 0915/30, 2 de 10, 6 de 14, 8 de 15
  createReq(SkillType.DISCAPACIDAD, '09:00', 9),
  createReq(SkillType.DISCAPACIDAD, '09:15/09:30', 5),
  createReq(SkillType.DISCAPACIDAD, '10:00', 2),
  createReq(SkillType.DISCAPACIDAD, '14:00', 6),
  createReq(SkillType.DISCAPACIDAD, '15:00', 8),

  // Cobranzas: 8 de 09, 0 de 0915, 6 de 10, 1 de 14, 8 de 15
  createReq(SkillType.COBRANZAS, '09:00', 8),
  createReq(SkillType.COBRANZAS, '10:00', 6),
  createReq(SkillType.COBRANZAS, '14:00', 1),
  createReq(SkillType.COBRANZAS, '15:00', 8),

  // Autorizaciones: 12 de 09, 5 de 0915, 5 de 10, 3 de 14, 5 de 15
  createReq(SkillType.AUTORIZACIONES, '09:00', 12),
  createReq(SkillType.AUTORIZACIONES, '09:15/09:30', 5),
  createReq(SkillType.AUTORIZACIONES, '10:00', 5),
  createReq(SkillType.AUTORIZACIONES, '14:00', 3),
  createReq(SkillType.AUTORIZACIONES, '15:00', 5),

  // Medicamentos: 12 de 09, 5 de 0915, 11 de 10, 3 de 14, 5 de 15
  createReq(SkillType.MEDICAMENTOS, '09:00', 12),
  createReq(SkillType.MEDICAMENTOS, '09:15/09:30', 5),
  createReq(SkillType.MEDICAMENTOS, '10:00', 11),
  createReq(SkillType.MEDICAMENTOS, '14:00', 3),
  createReq(SkillType.MEDICAMENTOS, '15:00', 5),
];

// Ensure all time slots exist for all skills (zero fill)
const ALL_SKILLS = [
  SkillType.TUTOR, SkillType.PRESTADORES, SkillType.DISCAPACIDAD, 
  SkillType.COBRANZAS, SkillType.AUTORIZACIONES, SkillType.MEDICAMENTOS
];

export const INITIAL_CONFIG = (() => {
  const reqs = [...DEFAULT_REQUIREMENTS];
  ALL_SKILLS.forEach(skill => {
    TIME_SLOTS.forEach(slot => {
      if (!reqs.find(r => r.skill === skill && r.timeSlot === slot)) {
        reqs.push({ skill, timeSlot: slot, count: 0 });
      }
    });
  });
  return reqs;
})();