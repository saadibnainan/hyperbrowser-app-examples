import { NextRequest, NextResponse } from 'next/server';
import { Hyperbrowser } from '@hyperbrowser/sdk';

// Note: Once we install the Hyperbrowser SDK, we'll uncomment these imports
// import { Hyperbrowser } from '@hyperbrowser/sdk';
// import { connect } from 'puppeteer-core';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Let Hyperbrowser handle the URL directly
    const profileData = await extractProfileWithHyperbrowser(url, apiKey);

    return NextResponse.json({ profileData });

  } catch (error) {
    console.error('Error extracting profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract profile data. Please check your API key and input.' },
      { status: 500 }
    );
  }
}





function extractProfileFromText(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract name (usually first line or after "Name:")
  let name = 'Name not found';
  const namePatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+)/,
    /Name[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /^([A-Z][A-Z\s]+)$/
  ];
  
  for (const line of lines.slice(0, 10)) {
    for (const pattern of namePatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[1].length < 50) {
        name = match[1].trim();
        break;
      }
    }
    if (name !== 'Name not found') break;
  }
  
  // Extract email and phone
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]{10,}/);
  
  // Extract location
  let location = 'Location not specified';
  const locationPatterns = [
    /(?:Address|Location)[:\s]+([^\n]+)/i,
    /([A-Z][a-z]+,\s*[A-Z]{2})/,
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      location = match[1].trim();
      break;
    }
  }
  
  // Extract skills
  const skillsSection = extractSection(text, ['skills', 'technical skills', 'technologies', 'expertise']);
  const skills = extractSkillsFromText(skillsSection || text);
  
  // Extract experience
  const experienceSection = extractSection(text, ['experience', 'work experience', 'employment', 'professional experience']);
  const experience = experienceSection || 'Experience details not available';
  
  // Extract education
  const educationSection = extractSection(text, ['education', 'academic background', 'qualifications']);
  const education = educationSection || 'Education not specified';
  
  // Extract summary/objective
  const summarySection = extractSection(text, ['summary', 'objective', 'profile', 'about']);
  const summary = summarySection || 'Summary not available';
  
  // Extract title from common patterns
  let title = 'Title not specified';
  const titlePatterns = [
    /(?:Position|Title|Role)[:\s]+([^\n]+)/i,
    /(Software Engineer|Developer|Designer|Manager|Analyst|Consultant|Director)/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      title = match[1].trim();
      break;
    }
  }
  
  return {
    name,
    title,
    location,
    skills,
    experience: experience.substring(0, 500),
    education: education.substring(0, 200),
    summary: summary.substring(0, 500)
  };
}

function extractSection(text: string, sectionNames: string[]): string | null {
  const lines = text.split('\n');
  
  for (const sectionName of sectionNames) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (line.includes(sectionName)) {
        // Found section header, extract content until next section
        const sectionContent = [];
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine.length === 0) continue;
          
          // Stop if we hit another section header
          const isNewSection = /^[A-Z\s]{3,}$/.test(nextLine) || 
                              nextLine.toLowerCase().includes('experience') ||
                              nextLine.toLowerCase().includes('education') ||
                              nextLine.toLowerCase().includes('skills');
          
          if (isNewSection && j > i + 3) break;
          
          sectionContent.push(nextLine);
          if (sectionContent.length > 10) break; // Limit section length
        }
        
        if (sectionContent.length > 0) {
          return sectionContent.join(' ');
        }
      }
    }
  }
  
  return null;
}

function extractSkillsFromText(text: string): string[] {
  const commonTechTerms = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'Swift', 'C++', 'C#',
    'React', 'Angular', 'Vue', 'Next.js', 'Nuxt.js', 'Svelte', 'Flutter', 'React Native',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'FastAPI', 'Laravel', 'Ruby on Rails',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
    'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'Figma', 'Photoshop', 'Sketch', 'Adobe Creative Suite'
  ];
  
  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // Find exact matches
  for (const term of commonTechTerms) {
    if (lowerText.includes(term.toLowerCase())) {
      foundSkills.add(term);
    }
  }
  
  // Extract skills from bullet points or comma-separated lists
  const skillPatterns = [
    /•\s*([A-Za-z\+\#\.\s]+)/g,
    /[-]\s*([A-Za-z\+\#\.\s]+)/g,
    /,\s*([A-Za-z\+\#\.]+)/g
  ];
  
  for (const pattern of skillPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const skill = match[1].trim();
      if (skill.length > 2 && skill.length < 30 && /^[A-Za-z\+\#\.\s]+$/.test(skill)) {
        foundSkills.add(skill);
      }
    }
  }
  
  return Array.from(foundSkills).slice(0, 15);
}

async function extractProfileWithHyperbrowser(url: string, apiKey: string) {
  const client = new Hyperbrowser({ apiKey });

  const result = await client.extract.startAndWait({
    urls: [url],
    prompt: "Extract the skills from this url. for a job profile",
  });

  console.log("result", JSON.stringify(result, null, 2));
  
  return sanitizeProfileData(result.data || {});
}

// Utility function to validate and sanitize extracted data
function sanitizeProfileData(data: any) {
  console.log('Raw data from Hyperbrowser:', JSON.stringify(data, null, 2));
  
  // Handle different possible structures from Hyperbrowser
  const jobProfile = data.jobProfile || data;
  
  const name = jobProfile.name || data.name || data.personalDetails?.name || 'Name not found';
  const title = jobProfile.title || data.title || 'Title not specified';
  const location = jobProfile.location || data.location || data.personalDetails?.address || 'Location not specified';
  
  // Extract skills from various possible structures
  let skills: string[] = [];
  
  // Check jobProfile.skills first
  if (Array.isArray(jobProfile.skills)) {
    skills = jobProfile.skills;
  } 
  // Check flat data.skills
  else if (Array.isArray(data.skills)) {
    skills = data.skills;
  }
  // Check nested skills object
  else if (data.skills && typeof data.skills === 'object') {
    const skillsObj = data.skills;
    skills = [
      ...(skillsObj.programmingLanguages || []),
      ...(skillsObj.technologies || []),
      ...(skillsObj.tools || []),
      ...(skillsObj.competencies || [])
    ];
  }
  
  const experience = jobProfile.experience || data.experience || 'Experience not specified';
  const education = jobProfile.education || data.education || 'Education not specified';
  const summary = jobProfile.summary || data.summary || 'Summary not available';

  return {
    name: typeof name === 'string' && name.length > 0 ? name.substring(0, 100) : 'Name not found',
    title: typeof title === 'string' && title.length > 0 ? title.substring(0, 100) : 'Title not specified',
    skills: skills.length > 0 ? skills.slice(0, 20) : ['Skills not found'],
    experience: typeof experience === 'string' && experience.length > 0 ? experience.substring(0, 1000) : 'Experience not specified',
    education: typeof education === 'string' && education.length > 0 ? education.substring(0, 200) : 'Education not specified',
    location: typeof location === 'string' && location.length > 0 ? location.substring(0, 100) : 'Location not specified',
    summary: typeof summary === 'string' && summary.length > 0 ? summary.substring(0, 500) : 'Summary not available'
  };
} 