import { Hyperbrowser } from "@hyperbrowser/sdk";
import { ResponseSchema } from "./schemas";

export const createHyperbrowserClient = (apiKey: string) => {
  return new Hyperbrowser({ apiKey });
};

export const buildRedditSearchUrl = (niche: string) => {
  return `https://www.reddit.com/search/?q=${encodeURIComponent(niche)}&sort=top&t=week`;
};

export const createExtractionPrompt = (niche: string) => {
  return `Analyze the Reddit discussions about "${niche}" and extract valuable business insights. 
      
      For each discussion or pain point you find, create an idea entry with:
      1. topic: The main subject/area being discussed
      2. pain_point: A specific problem or frustration users are experiencing  
      3. suggested_idea: A concrete business solution that could address this pain point
      
      Also provide an implementation_summary that gives the user actionable advice on how to start building the most promising solution.
      
      Focus on finding real problems people are discussing, not just general topics. Look for complaints, frustrations, wishes, or requests for better solutions.`;
};

export const extractIdeasFromReddit = async (apiKey: string, niche: string) => {
  const client = createHyperbrowserClient(apiKey);
  const redditURL = buildRedditSearchUrl(niche);
  const prompt = createExtractionPrompt(niche);

  const extractResult = await client.extract.startAndWait({
    urls: [redditURL],
    prompt,
    schema: ResponseSchema,
  });

  return { extractResult, redditURL };
}; 