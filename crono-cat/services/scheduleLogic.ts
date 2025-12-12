import { Agent, SkillType, SkillRequirement, ProcessingResult, TIME_SLOTS } from '../types';

// Helper to normalize time strings from CSV
// More robust to handle "15 a 20", "09:30", "9", "0900"
const normalizeTime = (raw: string): string => {
  if (!raw) return '';
  
  // Clean string but keep structure to find first number
  const clean = raw.trim().toLowerCase();

  // Regex to capture the first Hour and Minute pattern
  // Matches: "9", "09", "9:30", "09.30", "15 a 20", "15-20"
  const match = clean.match(/(\d{1,2})[:.]?(\d{2})?/);

  if (!match) return clean; // Fallback if no numbers found

  let hour = parseInt(match[1]);
  let min = match[2] ? parseInt(match[2]) : 0;

  // Bucket mapping based on specific known slots
  if (hour === 9) {
    if (min >= 15 && min <= 45) return '09:15/09:30';
    return '09:00';
  }
  
  if (hour === 10) return '10:00';
  
  // Logic for afternoon shifts
  // If starts at 12, 13, 14 -> Map to 14:00 if that's the closest start, 
  // BUT user specifically mentioned "15 a 20" mapping to 15 buckets.
  if (hour === 14) return '14:00';
  
  if (hour === 15) return '15:00';

  // Fallback formatting for unmatched times
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

export const parseCSV = (csvText: string): Agent[] => {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  // Skip header, process rows
  const agents: Agent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim()); 
    
    if (cols.length < 15) continue; // Invalid row

    const name = cols[0];
    const horario = cols[1];
    const franjaCat = cols[2];
    
    // Priority: Franja CAT > Horario
    // If Franja CAT has data (e.g., "15 a 20"), use that.
    const effectiveTimeRaw = (franjaCat && franjaCat !== '') ? franjaCat : horario;
    const effectiveTime = normalizeTime(effectiveTimeRaw);

    const isPresta = cols[3].toLowerCase().includes('x');
    const variable = cols[4].toLowerCase();
    const isTutor = cols[5].toLowerCase().includes('x');

    const weeksHistory = [cols[6], cols[7], cols[8]];
    const targetWeekFixed = cols[9]; 

    // Counters
    const countDisca = parseInt(cols[10]) || 0;
    const countPresta = parseInt(cols[11]) || 0;
    const countTutor = parseInt(cols[12]) || 0;
    const countMeds = parseInt(cols[13]) || 0;
    const countAuth = parseInt(cols[14]) || 0;
    const countCobranzas = parseInt(cols[15]) || 0;
    const countVarios = parseInt(cols[16]) || 0;

    // Attendance
    const totalAbsencesStr = cols[cols.length - 1];
    const totalAbsences = parseInt(totalAbsencesStr) || 0;

    const dayColsCount = (cols.length - 1) - 17;
    const maxDays = dayColsCount > 0 ? dayColsCount : 5; 
    
    let isFullyAbsent = totalAbsences >= maxDays;
    if (totalAbsences >= 3 && maxDays <= 3) isFullyAbsent = true;


    agents.push({
      id: name,
      name,
      scheduleTime: horario,
      realTime: franjaCat,
      effectiveTime,
      isPrestaQualified: isPresta,
      isTutorQualified: isTutor,
      variable,
      weeksHistory,
      targetWeekFixed,
      countDisca,
      countPresta,
      countTutor,
      countMeds,
      countAuth,
      countCobranzas,
      countVarios,
      daysAbsent: [],
      totalAbsences,
      isFullyAbsent,
      assignedSkill: null,
      assignmentReason: ''
    });
  }

  return agents;
};

// Shuffles array in place (Fisher-Yates) for random tie-breaking
function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const generateSchedule = (
  allAgents: Agent[], 
  requirements: SkillRequirement[],
  exceptionNames: string[] = [] // Names selected in the UI to be excluded from logic
): ProcessingResult => {
  const agents = JSON.parse(JSON.stringify(allAgents)) as Agent[]; // Deep copy
  const logs: string[] = [];

  // 1. Pre-process: Assign Fixed Roles and Exceptions
  agents.forEach(agent => {
    
    // SPECIAL RULE: Paolelli Rosana Mabel -> Always Prestadores, extra quota
    // Takes precedence over Exception list to ensure she is always in Prestadores if present.
    if (agent.name.toLowerCase().includes('paolelli')) {
      agent.assignedSkill = SkillType.PRESTADORES;
      agent.assignmentReason = "Asignación Fija (Paolelli)";
      return; 
    }

    // Manual Exceptions: Strictly assign to VARIOS
    if (exceptionNames.includes(agent.name)) {
      agent.assignedSkill = SkillType.VARIOS;
      agent.assignmentReason = "Excepción Seleccionada (Manual)";
      return;
    }

    // Commercial Variable
    if (agent.variable.includes('comercial')) {
      agent.assignedSkill = SkillType.COMERCIAL;
      agent.assignmentReason = "Variable Comercial";
      return;
    }

    // Full Absence
    if (agent.isFullyAbsent) {
      agent.assignedSkill = SkillType.VARIOS; 
      agent.assignmentReason = "Ausencia Total (Asignado a Varios por defecto)";
      return;
    }

    // Pre-filled in CSV (Target Week Fixed)
    if (agent.targetWeekFixed && agent.targetWeekFixed.length > 1) {
      agent.assignedSkill = agent.targetWeekFixed;
      agent.assignmentReason = "Pre-asignado en CSV";
      return;
    }
  });

  // Helper to find available agents for a specific criteria
  const findCandidates = (
    skill: SkillType, 
    timeSlot: string, 
    filterFn: (a: Agent) => boolean,
    sortFn: (a: Agent, b: Agent) => number
  ) => {
    return agents.filter(a => 
      a.assignedSkill === null && // Not yet assigned (Exceptions are already assigned Varios, so they are skipped here)
      !a.isFullyAbsent &&
      a.effectiveTime === timeSlot &&
      filterFn(a)
    ).sort(sortFn);
  };

  // 2. Process Skills in Order
  const skillOrder = [
    { type: SkillType.TUTOR, counterKey: 'countTutor' as keyof Agent, qualKey: 'isTutorQualified' as keyof Agent },
    { type: SkillType.PRESTADORES, counterKey: 'countPresta' as keyof Agent, qualKey: 'isPrestaQualified' as keyof Agent },
    { type: SkillType.DISCAPACIDAD, counterKey: 'countDisca' as keyof Agent, qualKey: null },
    { type: SkillType.COBRANZAS, counterKey: 'countCobranzas' as keyof Agent, qualKey: null },
    { type: SkillType.AUTORIZACIONES, counterKey: 'countAuth' as keyof Agent, qualKey: null },
    { type: SkillType.MEDICAMENTOS, counterKey: 'countMeds' as keyof Agent, qualKey: null },
  ];

  for (const skillConfig of skillOrder) {
    const reqs = requirements.filter(r => r.skill === skillConfig.type);
    
    for (const req of reqs) {
      if (req.count <= 0) continue;

      // Filter Logic
      const filter = (a: Agent) => {
        if (skillConfig.qualKey && !a[skillConfig.qualKey]) return false;
        return true;
      };

      // Sort Logic (Priority Criteria)
      const sorter = (a: Agent, b: Agent) => {
        const aHistory = a.weeksHistory.some(w => w.toLowerCase().includes(skillConfig.type.toLowerCase()));
        const bHistory = b.weeksHistory.some(w => w.toLowerCase().includes(skillConfig.type.toLowerCase()));
        
        if (aHistory && !bHistory) return 1; // b is better
        if (!aHistory && bHistory) return -1; // a is better

        // Check if was in Varios last week (index 2)
        const aWasVarios = a.weeksHistory[2]?.toLowerCase().includes('varios');
        const bWasVarios = b.weeksHistory[2]?.toLowerCase().includes('varios');

        if (aWasVarios && !bWasVarios) return 1; 
        if (!aWasVarios && bWasVarios) return -1;

        // Counter check (lowest is better)
        const aCount = a[skillConfig.counterKey] as number;
        const bCount = b[skillConfig.counterKey] as number;
        
        return aCount - bCount;
      };

      // Get candidates
      let candidates = findCandidates(skillConfig.type, req.timeSlot, filter, sorter);
      
      // Shuffle first to ensure random tie-breaking
      shuffle(candidates); 
      candidates.sort(sorter);

      // Assign
      const toAssign = candidates.slice(0, req.count);
      toAssign.forEach(a => {
        a.assignedSkill = skillConfig.type;
        
        // Extended logic for the reason
        const historyFlag = a.weeksHistory.some(w => w.toLowerCase().includes(skillConfig.type.toLowerCase())) ? 'Sí' : 'No';
        const counterVal = a[skillConfig.counterKey];
        
        a.assignmentReason = `Cupo ${req.timeSlot} (Hist: ${historyFlag}, Cant: ${counterVal})`;
      });

      if (toAssign.length < req.count) {
        logs.push(`⚠️ No se pudo cubrir el cupo de ${skillConfig.type} a las ${req.timeSlot}. Faltaron ${req.count - toAssign.length} personas.`);
      }
    }
  }

  // 3. Assign Varios (Leftovers)
  // This catches anyone not assigned by Exceptions, Commercial, Pre-assigned, or Skill Quotas
  agents.forEach(a => {
    if (a.assignedSkill === null) {
      a.assignedSkill = SkillType.VARIOS;
      a.assignmentReason = "Remanente (Cupos llenos)";
    }
  });

  return {
    agents,
    unassigned: [],
    logs
  };
};