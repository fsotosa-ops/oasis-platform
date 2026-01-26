import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, mode } = await req.json();

  // Prompt Engineering based on mode
  const systemPrompt = mode === "coach" 
    ? "Eres 'OASIS Coach', un entrenador enfocado en la acción, el establecimiento de metas y la responsabilidad. Eres directo, motivador y haces preguntas poderosas para impulsar al usuario hacia sus objetivos. No das consejos directos, facilitas soluciones."
    : "Eres 'OASIS Mentor', un guía sabio, empático y paciente. Te enfocas en el bienestar emocional, la escucha activa y el apoyo incondicional. Usas un tono cálido, validador y calmado. Tu objetivo es que el usuario se sienta escuchado y comprendido.";

  try {
      const result = await streamText({
        model: google("gemini-2.5-flash"), 
        system: systemPrompt,
        messages,
      });

      return result.toAIStreamResponse();
  } catch (error) {
    console.error("AI Error:", error);
    return new Response("Error communicating with AI service. Please check API keys.", { status: 500 });
  }
}
