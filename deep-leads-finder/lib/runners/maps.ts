import { Hyperbrowser } from "@hyperbrowser/sdk";
import * as cheerio from "cheerio";

/**
 * Very lightweight Google Maps HTML scrape (no API key).
 * Returns top businesses matching query near city.
 */
export async function mapsLeads(
  hb: Hyperbrowser,
  query: string,
  city: string
) {
  try {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(
      `${query} near ${city}`
    )}`;

    const result = await hb.scrape.startAndWait({
      url,
      scrapeOptions: { formats: ["html"] }
    });

    const $ = cheerio.load(result.data?.html || "");
    console.log('Maps: HTML length:', result.data?.html?.length || 0);
    
    // Try multiple selectors for Google Maps
    let elements = $("a[href^='/maps/place']");
    if (elements.length === 0) {
      elements = $("a").filter((_, el) => {
        const href = $(el).attr('href');
        return href ? href.includes('/maps/place') : false;
      });
    }
    if (elements.length === 0) {
      elements = $("[data-value]").find("a"); // Business listings
    }
    
    console.log('Maps: Found elements:', elements.length);
    
    const leads = elements
      .slice(0, 20)
      .map((_, el) => {
        const $el = $(el);
        const href = $el.attr("href") || "";
        const text = $el.text().trim();
        const ariaLabel = $el.attr("aria-label") || "";
        const parentText = $el.parent().text().trim();
        
        // Debug first few elements
        if (_ < 3) {
          console.log(`Maps element ${_}:`, {
            href: href.substring(0, 100),
            text: text.substring(0, 100),
            ariaLabel: ariaLabel.substring(0, 100),
            parentText: parentText.substring(0, 100)
          });
        }
        
        return {
          source: "Google Maps",
          title: ariaLabel || text || parentText || "Business listing",
          url: href.startsWith('http') ? href : "https://www.google.com" + href,
          location: "", // Maps doesn't easily provide separate location
          price: ""
        };
      })
      .get()
      .filter(lead => lead.title && lead.title !== "Business listing");
      
    console.log('Maps: Final leads with titles:', leads.length);
    return leads;
  } catch {
    return [];
  }
} 