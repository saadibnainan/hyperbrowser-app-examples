import OpenAI from 'openai';

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

export async function askQuestion(question: string, context: string): Promise<string> {
  const openai = getOpenAI();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a Reddit research assistant. You have access to research data from Reddit threads. Answer questions based on the provided context. Be conversational, insightful, and reference specific posts/comments when relevant. If the context doesn't contain enough information to answer the question, say so honestly.`
      },
      {
        role: "user",
        content: `Context from Reddit research:
${context}

Question: ${question}`
      }
    ],
    max_tokens: 800,
    temperature: 0.7
  });

  return response.choices[0]?.message?.content || "I couldn't generate a response.";
}