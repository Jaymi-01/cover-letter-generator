import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log('Generating with gemini-1.5-flash-latest...');

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `You are an expert career coach and professional writer specializing in crafting high-impact cover letters. 
      Maintain a professional yet enthusiastic tone.`,
      prompt: prompt,
    });

    return result.toTextStreamResponse({
      headers: {
        'x-vercel-ai-data-stream': 'v1',
      },
    });
  } catch (error) {
    console.error('API ERROR:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
