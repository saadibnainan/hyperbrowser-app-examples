import { NextResponse } from "next/server";
import { extractIdeasFromReddit } from "../../lib/hyperbrowser";
import { validateRequest, createErrorResponse, handleExtractionError } from "../../lib/errorHandling";

export async function POST(req: Request) {
  const { niche, apiKey } = await req.json();
  
  // Validate request parameters
  const validationError = validateRequest(niche, apiKey);
  if (validationError) {
    return validationError;
  }

  try {
    const { extractResult, redditURL } = await extractIdeasFromReddit(apiKey, niche);

    console.log("Extract result status:", extractResult.status);
    
    if (extractResult.status === "failed") {
      return createErrorResponse(
        `Failed to extract data: ${extractResult.error}. Please check your API key and try again.`,
        500
      );
    }

    // Get the extracted data
    const extractedData = extractResult.data as { 
      ideas: Array<{ topic: string; pain_point: string; suggested_idea: string; }>; 
      implementation_summary: string; 
    } | null;
    
    console.log("Extracted data:", extractedData);

    if (!extractedData || !extractedData.ideas || extractedData.ideas.length === 0) {
      return createErrorResponse(
        "No ideas could be extracted from Reddit. The page might be empty or not accessible. Try a different niche or check if Reddit is accessible.",
        400,
        {
          url: redditURL,
          status: extractResult.status,
          hasData: !!extractedData,
        }
      );
    }

    console.log(`Successfully extracted ${extractedData.ideas.length} ideas for niche: ${niche}`);
    
    return NextResponse.json({ 
      ideas: extractedData.ideas,
      implementation_summary: extractedData.implementation_summary
    });
  } catch (error) {
    return handleExtractionError(error);
  }
}
