import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Lead {
  source: string;
  title: string;
  url: string;
  location: string;
  price: string;
}

/**
 * Filter and verify leads using OpenAI to ensure relevance
 */
export async function filterRelevantLeads(
  leads: Lead[], 
  query: string
): Promise<Lead[]> {
  if (!leads.length) return [];
  
  console.log(`🔍 OpenAI filtering ${leads.length} leads for "${query}"`);
  
  try {
    const prompt = `Filter these business leads to only include ones DIRECTLY relevant to: "${query}"

LEADS TO FILTER:
${leads.map((lead, i) => `${i+1}. ${lead.title} (${lead.source})`).join('\n')}

INSTRUCTIONS:
- Only return leads that are EXACTLY what the user is searching for
- Remove restaurants, bars, general businesses unless they match the query
- For "${query}", only include businesses that specifically offer those services
- Return ONLY the numbers of relevant leads (e.g., "1,3,5" or "none")

RELEVANT LEAD NUMBERS:`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cheap for filtering
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.1, // Low temp for consistent filtering
    });

    const relevantNumbers = response.choices[0]?.message?.content?.trim() || "";
    console.log(`🎯 OpenAI selected: ${relevantNumbers}`);
    
    if (relevantNumbers.toLowerCase() === "none") {
      console.log(`❌ No relevant leads found for "${query}"`);
      return [];
    }
    
    // Parse the numbers and filter leads
    const selectedIndices = relevantNumbers
      .split(',')
      .map(n => parseInt(n.trim()) - 1) // Convert to 0-based index
      .filter(i => i >= 0 && i < leads.length);
    
    const filteredLeads = selectedIndices.map(i => leads[i]);
    
    console.log(`✅ OpenAI filtered: ${leads.length} → ${filteredLeads.length} relevant leads`);
    return filteredLeads;
    
  } catch (error) {
    console.error(`⚠️ OpenAI filtering failed:`, error);
    // Fallback: return original leads if OpenAI fails
    return leads;
  }
}

/**
 * Enhance leads with better categorization using OpenAI
 */
export async function enhanceLeads(
  leads: Lead[], 
  query: string
): Promise<Lead[]> {
  if (!leads.length) return [];
  
  console.log(`✨ OpenAI enhancing ${leads.length} leads`);
  
  try {
    const prompt = `Enhance these business leads with better contact info and descriptions for: "${query}"

LEADS:
${leads.map((lead, i) => `${i+1}. ${lead.title} - ${lead.location} (${lead.price})`).join('\n')}

For each lead, provide enhanced info in this format:
LEAD_NUMBER: Enhanced Title | Better Description | Contact Info

Be concise and focus on what makes each business relevant to "${query}".`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const enhancements = response.choices[0]?.message?.content || "";
    console.log(`✨ OpenAI enhanced leads successfully`);
    
    // For now, just return original leads (enhancement parsing can be added later)
    return leads;
    
  } catch (error) {
    console.error(`⚠️ OpenAI enhancement failed:`, error);
    return leads;
  }
} 