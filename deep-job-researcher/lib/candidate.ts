import OpenAI from 'openai';

export interface CandidateProfile {
  name?: string;
  headline?: string;
  skills: string[];
  yearsExperience: number;
  topProjects: string[];
  gaps: string[];
  suggestions: string[];
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function buildCandidateProfile(text: string): Promise<CandidateProfile> {
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract candidate profile information from the provided text (resume or portfolio). Return a JSON object with the following structure:
          {
            "name": "string (if present)",
            "headline": "string (brief professional title/summary)",
            "skills": ["array of technical skills, tools, frameworks, languages"],
            "yearsExperience": "number (estimated total years of professional experience)",
            "topProjects": ["array of notable projects or achievements"],
            "gaps": ["array of potential skill gaps or areas for improvement"],
            "suggestions": ["array of suggested improvements or focus areas"]
          }
          
          Be thorough in extracting skills and technologies mentioned. For years of experience, make a reasonable estimate based on career progression, education, and project timelines.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const profile = JSON.parse(content) as CandidateProfile;
    
    // Validate and provide defaults
    return {
      name: profile.name || undefined,
      headline: profile.headline || 'Professional',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      yearsExperience: typeof profile.yearsExperience === 'number' ? profile.yearsExperience : 0,
      topProjects: Array.isArray(profile.topProjects) ? profile.topProjects : [],
      gaps: Array.isArray(profile.gaps) ? profile.gaps : [],
      suggestions: Array.isArray(profile.suggestions) ? profile.suggestions : [],
    };
  } catch (error) {
    console.error('Error building candidate profile:', error);
    throw new Error('Failed to analyze candidate profile');
  }
} 