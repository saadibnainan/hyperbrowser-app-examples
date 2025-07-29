import * as cheerio from 'cheerio';
import { getHB, shutdownHB } from './hb';

interface ScrapedChunk {
  text: string;
  sourceUrl: string;
}

export async function scrapeAndChunk(url: string, progressCallback?: (message: string) => void): Promise<ScrapedChunk[]> {
  const hb = getHB();
  
  try {
    progressCallback?.('[SCRAPE] Starting scrape...');
    
    // Use the correct Hyperbrowser scrape API
    const result = await hb.scrape.startAndWait({
      url,
      scrapeOptions: { 
        formats: ['html', 'markdown'] 
      }
    });
    
    progressCallback?.(`[SCRAPE] Scrape completed, processing results...`);
    
    // Check if result and data exist
    if (!result || !result.data) {
      progressCallback?.('[ERROR] No data returned from scrape operation');
      return [];
    }
    
    const { data } = result;
    progressCallback?.(`[SCRAPE] Processing scraped content from ${url}`);
    
    const chunks: ScrapedChunk[] = [];
    
    // Try HTML extraction first
    if (data.html) {
      const $ = cheerio.load(data.html);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .navigation, .menu, .sidebar').remove();
      
      // Extract meaningful content
      const contentElements = $('h1, h2, h3, h4, h5, h6, p, li, div, article, section, main, blockquote, pre, code');
      
      contentElements.each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length >= 100) { // Increased minimum size
          chunks.push({ text, sourceUrl: url });
        }
      });
      
      progressCallback?.(`[SCRAPE] Extracted ${chunks.length} chunks from HTML`);
    }
    
    // If HTML didn't yield enough content, try markdown
    if (chunks.length < 10 && data.markdown) { // Only if we got very few chunks
      progressCallback?.('[SCRAPE] HTML yielded few results, trying markdown...');
      
      const lines = data.markdown.split('\n');
      let currentChunk = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          currentChunk += trimmedLine + ' ';
          
          // Create larger chunks (500+ characters)
          if (currentChunk.length >= 500) {
            chunks.push({ text: currentChunk.trim(), sourceUrl: url });
            currentChunk = '';
          }
        }
      }
      
      // Add final chunk if it exists and is substantial
      if (currentChunk.trim().length >= 200) {
        chunks.push({ text: currentChunk.trim(), sourceUrl: url });
      }
      
      progressCallback?.(`[SCRAPE] Extracted ${chunks.length} chunks from markdown`);
    }
    
    // Combine small chunks to reduce total count
    const combinedChunks: ScrapedChunk[] = [];
    let currentCombined = '';
    
    for (const chunk of chunks) {
      if (currentCombined.length + chunk.text.length < 1500) { // Combine up to 1500 chars
        currentCombined += chunk.text + '\n\n';
      } else {
        if (currentCombined.trim()) {
          combinedChunks.push({ text: currentCombined.trim(), sourceUrl: url });
        }
        currentCombined = chunk.text + '\n\n';
      }
    }
    
    // Add final combined chunk
    if (currentCombined.trim()) {
      combinedChunks.push({ text: currentCombined.trim(), sourceUrl: url });
    }
    
    progressCallback?.(`[SCRAPE] Combined into ${combinedChunks.length} optimized chunks`);
    progressCallback?.(`[SCRAPE] Completed with ${combinedChunks.length} total chunks`);
    
    return combinedChunks;
    
  } catch (error) {
    progressCallback?.(`[ERROR] Scraping failed: ${error}`);
    return [];
  } finally {
    progressCallback?.('[SCRAPE] Shutting down Hyperbrowser');
    await shutdownHB();
  }
} 