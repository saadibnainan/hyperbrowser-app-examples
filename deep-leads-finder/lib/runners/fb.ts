import { Hyperbrowser } from "@hyperbrowser/sdk";
import * as cheerio from "cheerio";


export async function fbLeads(
  hb: Hyperbrowser,
  query: string,
  city: string
) {
  try {
    const url =
      `https://www.facebook.com/marketplace/` +
      `${encodeURIComponent(city.toLowerCase().replace(/\s+/g, "-"))}` +
      `/search/?query=${encodeURIComponent(query)}`;

    // Official scrape helper
    const result = await hb.scrape.startAndWait({
      url,
      scrapeOptions: { formats: ["html"] }
    });

    const $ = cheerio.load(result.data?.html || "");
    console.log('Facebook: HTML length:', result.data?.html?.length || 0);
    console.log('Facebook: Sample HTML:', result.data?.html?.substring(0, 300));
    
    // Check for Facebook-specific elements
    console.log('Facebook selector counts:', {
      'a elements': $("a").length,
      'marketplace mentions': result.data?.html?.match(/marketplace/gi)?.length || 0,
      'item mentions': result.data?.html?.match(/item/gi)?.length || 0
    });
    
    // Try multiple selectors for Facebook Marketplace
    let elements = $("a[href*='/marketplace/item/']");
    console.log('Facebook: a[href*="/marketplace/item/"] =', elements.length);
    
    if (elements.length === 0) {
      elements = $("a").filter((_, el) => {
        const href = $(el).attr('href');
        return href ? href.includes('marketplace') && href.includes('item') : false;
      });
      console.log('Facebook: marketplace + item filter =', elements.length);
    }
    
    if (elements.length === 0) {
      // Try broader Facebook marketplace selectors
      elements = $("a").filter((_, el) => {
        const href = $(el).attr('href') || '';
        return href.includes('marketplace') || href.includes('item');
      });
      console.log('Facebook: broader marketplace filter =', elements.length);
    }
    
    console.log('Facebook: Found elements:', elements.length);
    return elements
      .slice(0, 20)
      .map((_, el) => {
        const title = $(el).find("span").first().text();
        const priceMatch = title.match(/\$\d[\d,]*/);
        return {
          source: "FB Marketplace",
          title,
          url: "https://facebook.com" + $(el).attr("href"),
          location: $(el).find("span:contains('·')").last().text(),
          price: priceMatch ? priceMatch[0] : ""
        };
      })
      .get();
  } catch {
    return [];
  }
}