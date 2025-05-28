import { z } from "zod";

export const IdeaSchema = z.object({
  topic: z.string(),
  pain_point: z.string(),
  suggested_idea: z.string(),
});

export const ResponseSchema = z.object({ 
  ideas: z.array(IdeaSchema),
  implementation_summary: z.string().describe("A brief, actionable summary of how the user can implement the most promising idea from the list. Should be 1-2 sentences with concrete next steps.")
}); 