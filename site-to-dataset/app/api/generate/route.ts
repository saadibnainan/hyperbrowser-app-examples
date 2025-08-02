import { NextRequest } from 'next/server';
import { scrapeAndChunk } from '@/lib/scrape';
import { QAPair } from '@/lib/qa';

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const { url } = await request.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  let writerClosed = false;

  const safeWrite = async (data: string) => {
    if (!writerClosed) {
      try {
        await writer.write(encoder.encode(data));
      } catch (error) {
        console.error('Error writing to stream:', error);
        writerClosed = true;
      }
    }
  };

  const safeClose = async () => {
    if (!writerClosed) {
      try {
        await writer.close();
        writerClosed = true;
      } catch (error) {
        console.error('Error closing stream:', error);
        writerClosed = true;
      }
    }
  };

  (async () => {
    try {
      const log = async (message: string) => {
        await safeWrite(JSON.stringify({ type: 'log', message }) + '\n');
      };

      const updateProgress = async (value: number) => {
        await safeWrite(JSON.stringify({ type: 'progress', value }) + '\n');
      };

      const chunks = await scrapeAndChunk(url, log);

      await log(`[PROCESS] Found ${chunks.length} content chunks`);
      await updateProgress(50);

      if (chunks.length === 0) {
        await log('[ERROR] No content chunks found to process');
        await updateProgress(100);
        await safeWrite(
          JSON.stringify({ type: 'result', qaPairs: [] }) + '\n'
        );
        return;
      }

      const progressStep = 50 / chunks.length;

      const qaPairsWithProgress = async (
        chunks: { text: string; sourceUrl: string }[]
      ) => {
        const qaPairs: QAPair[] = [];
        let currentProgress = 50;

        for (let i = 0; i < chunks.length; i++) {
          const { text, sourceUrl } = chunks[i];
          await log(`[Gemini] Processing chunk ${i + 1}/${chunks.length}`);

          try {
            const prompt = `Create a single question-answer pair from this text. Please respond in JSON format with the following structure:
{
  "question": "your question here",
  "answer": "your answer here"
}

Text: "${text}"`;

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateText?key=${process.env.GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt: prompt,
                  temperature: 0.7,
                  candidateCount: 1,
                  maxOutputTokens: 1024,
                }),
              }
            );

            const data = await response.json();

            // Log full response for debugging
            console.log('Gemini response:', JSON.stringify(data, null, 2));

            // Adjust based on Gemini 2.5 response structure
            const content =
              data.candidates?.[0]?.output ??
              data.candidates?.[0]?.content ??
              '';

            if (content) {
              try {
                // Sometimes Gemini returns text with trailing whitespace or newlines, trim it
                const trimmed = content.trim();

                // Parse JSON response text
                const parsed = JSON.parse(trimmed) as {
                  question: string;
                  answer: string;
                };

                const pair = {
                  question: parsed.question,
                  answer: parsed.answer,
                  source_url: sourceUrl,
                };

                qaPairs.push(pair);

                await safeWrite(JSON.stringify({ type: 'qaPair', pair }) + '\n');

                await log(`[Gemini] Generated Q/A pair ${i + 1}/${chunks.length}`);
              } catch (error) {
                await log(
                  `[Gemini] Error parsing response for chunk ${i + 1}: ${error}`
                );
              }
            } else {
              await log(`[Gemini] No content received for chunk ${i + 1}`);
            }
          } catch (error) {
            await log(`[Gemini] Error generating Q/A for chunk ${i + 1}: ${error}`);
          }

          currentProgress += progressStep;
          await updateProgress(Math.min(99, currentProgress));
        }
        return qaPairs;
      };

      const qaPairs = await qaPairsWithProgress(chunks);

      await updateProgress(100);
      await log('[COMPLETE] Processing finished');

      await safeWrite(
        JSON.stringify({
          type: 'result',
          qaPairs,
        }) + '\n'
      );
    } catch (error) {
      await safeWrite(
        JSON.stringify({
          type: 'log',
          message:
            `[ERROR] ` + (error instanceof Error ? error.message : String(error)),
        }) + '\n'
      );
    } finally {
      await safeClose();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
