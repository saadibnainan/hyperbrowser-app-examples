import { NextResponse } from "next/server";

export const createErrorResponse = (message: string, status: number = 400, debug?: unknown) => {
  return NextResponse.json({ 
    error: message,
    debug,
    ideas: []
  }, { status });
};

export const validateRequest = (niche: string, apiKey: string) => {
  if (!apiKey) {
    return createErrorResponse(
      "API key is required. Please provide your Hyperbrowser API key.",
      400
    );
  }
  
  if (!niche) {
    return createErrorResponse(
      "Niche is required. Please provide a niche to search for.",
      400
    );
  }
  
  return null;
};

export const handleExtractionError = (error: unknown) => {
  console.error("Error in generate API:", error);
  
  // Check if it's an authentication error
  if (error instanceof Error && error.message.includes('401')) {
    return createErrorResponse(
      "Invalid API key. Please check your Hyperbrowser API key and try again.",
      401
    );
  }
  
  return createErrorResponse(
    "An error occurred while processing your request. Please check your API key and try again.",
    500
  );
}; 