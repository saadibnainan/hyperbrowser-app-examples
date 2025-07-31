import { NextResponse } from "next/server";
import { searchThreads } from "../../../lib/reddit";
import { threadsToJSON } from "../../../lib/json";
import { askQuestion } from "../../../lib/openai";

export async function POST(req: Request) {
  const { query, question, context } = await req.json();
  
  // If it's a question about existing research
  if (question && context) {
    try {
      console.log('Q&A request:', { question: question.slice(0, 50), contextLength: context.length });
      const answer = await askQuestion(question, context);
      console.log('Q&A response:', answer.slice(0, 100));
      return NextResponse.json({ answer });
    } catch (error) {
      console.error('Q&A error:', error);
      return NextResponse.json({ 
        error: "Failed to answer question", 
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
  
  // If it's a new research query
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const { threads, logs, fullContent } = await searchThreads(query);
    const json = threadsToJSON(threads);
    return NextResponse.json({ 
      threads, 
      logs, 
      json, 
      fullContent 
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: "Research failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}