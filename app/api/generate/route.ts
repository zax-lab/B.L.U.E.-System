import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const { prompt } = await req.json();

    const systemPrompt = `You are the B.L.U.E. System AI.
Given a user's goal (e.g., 'Learn to code a React app'), break it down into a highly actionable, 4-step blueprint.
Your output MUST be valid JSON according to this schema:
{
  "goal": "string",
  "summary": "string",
  "steps": [
    {
      "title": "string",
      "description": "string",
      "estimatedHours": number,
      "actionItems": [ "string", "string" ]
    }
  ],
  "motivationalClosing": "string"
}
Ensure exactly 4 steps. The response MUST be pure JSON with no markdown formatting or code blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
