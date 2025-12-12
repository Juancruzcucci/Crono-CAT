import { GoogleGenAI } from "@google/genai";
import { Agent } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    return new GoogleGenAI({ apiKey });
}

export const analyzeSchedule = async (agents: Agent[], query: string): Promise<string> => {
    const ai = getClient();

    // Summarize data for the prompt to avoid token limits with massive CSVs
    const summary = agents.map(a => ({
        name: a.name,
        skill: a.assignedSkill,
        reason: a.assignmentReason,
        time: a.effectiveTime,
        absent: a.isFullyAbsent
    }));

    const prompt = `
    You are an intelligent data analyst for a call center scheduling system.
    Here is a summary of the generated schedule:
    ${JSON.stringify(summary.slice(0, 100))} ${(summary.length > 100) ? '...(data truncated)' : ''}
    
    Stats:
    Total Agents: ${agents.length}
    Fully Absent: ${agents.filter(a => a.isFullyAbsent).length}
    
    User Query: "${query}"
    
    Please answer the user's question based on the schedule data provided. Be concise and professional.
    If the data is truncated, mention that you are analyzing a sample.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "No se pudo generar una respuesta.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Hubo un error al consultar a Gemini. Verifica tu API Key.";
    }
};
