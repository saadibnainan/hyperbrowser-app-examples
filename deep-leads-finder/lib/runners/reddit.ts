import { Hyperbrowser } from "@hyperbrowser/sdk";
import * as cheerio from "cheerio";

export async function redditLeads(hb: Hyperbrowser, query: string) {
  const url = `https://www.reddit.com/search?q=${encodeURIComponent(query)}&sort=new`;
  console.log('Reddit: Scraping URL:', url);
  
  const result = await hb.scrape.startAndWait({
    url,
    scrapeOptions: { formats: ["html"] }
  });

  console.log('Reddit: HTML length:', result.data?.html?.length || 0);
  console.log('Reddit: Has error:', !!result.error);
  
  const $ = cheerio.load(result.data?.html || "");
  
  // Debug: Check what we actually got
  console.log('Reddit: Sample HTML snippet:', result.data?.html?.substring(0, 500));
  
  // Check for common Reddit selectors
  console.log('Reddit selector counts:', {
    'a elements': $("a").length,
    'divs': $("div").length,
    'spans': $("span").length,
    'h3': $("h3").length,
    'data-testid': $("[data-testid]").length
  });
  
  // Try multiple selectors for Reddit posts
  let elements = $(".SearchResult__header a");
  console.log('Reddit: .SearchResult__header a =', elements.length);
  
  if (elements.length === 0) {
    elements = $("a[data-click-id='body']"); // New Reddit structure
    console.log('Reddit: a[data-click-id="body"] =', elements.length);
  }
  if (elements.length === 0) {
    elements = $("h3 a, [data-testid='post-content'] a").filter((_, el) => {
      const href = $(el).attr('href');
      return href ? href.includes('/r/') : false;
    });
    console.log('Reddit: h3 a, [data-testid="post-content"] a =', elements.length);
  }
  if (elements.length === 0) {
    elements = $("a").filter((_, el) => {
      const href = $(el).attr('href');
      return href ? href.includes('/comments/') : false;
    });
    console.log('Reddit: a[href*="/comments/"] =', elements.length);
  }
  if (elements.length === 0) {
    // Last resort - try to find any post-like content
    elements = $("a").filter((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      return text.length > 10 && (href.includes('/r/') || href.includes('reddit.com'));
    });
    console.log('Reddit: Generic post links =', elements.length);
  }
  
  console.log('Reddit: Found elements:', elements.length);
  
  const leads = elements
    .slice(0, 20)
    .map((_, el) => ({
      source: "Reddit",
      title: $(el).text().trim() || $(el).find('*').text().trim() || 'No title',
      url: $(el).attr("href")?.startsWith('http') ? $(el).attr("href") : "https://reddit.com" + $(el).attr("href"),
      location: "",
      price: ""
    }))
    .get()
    .filter(lead => lead.title && lead.title !== 'No title');
    
  console.log('Reddit: Final leads:', leads.length);
  return leads;
} 