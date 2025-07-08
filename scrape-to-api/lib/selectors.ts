import * as cheerio from 'cheerio';
import { getCssSelector } from 'css-selector-generator';

export interface SelectorConfig {
  id: string;
  selector: string;
  name: string;
  attribute?: string; // 'text', 'href', 'src', or any attribute name
  multiple?: boolean; // if true, returns array
}

export interface ExtractedData {
  [key: string]: any;
}

// Extract data from HTML using selectors
export function extractDataFromHtml(html: string, selectors: SelectorConfig[]): ExtractedData {
  const $ = cheerio.load(html);
  const result: ExtractedData = {};
  
  for (const config of selectors) {
    try {
      const elements = $(config.selector);
      
      if (elements.length === 0) {
        result[config.name] = config.multiple ? [] : null;
        continue;
      }
      
      const values: any[] = [];
      
      elements.each((_, element) => {
        const $el = $(element);
        let value: any;
        
        if (!config.attribute || config.attribute === 'text') {
          value = $el.text().trim();
        } else if (config.attribute === 'html') {
          value = $el.html();
        } else {
          value = $el.attr(config.attribute);
        }
        
        if (value !== undefined && value !== null && value !== '') {
          values.push(value);
        }
      });
      
      if (config.multiple) {
        result[config.name] = values;
      } else {
        result[config.name] = values.length > 0 ? values[0] : null;
      }
      
    } catch (error) {
      console.error(`Error extracting data for selector ${config.selector}:`, error);
      result[config.name] = config.multiple ? [] : null;
    }
  }
  
  return result;
}

// Generate CSS selector for a clicked element
export function generateSelectorForElement(element: HTMLElement, html: string): string {
  try {
    // Use css-selector-generator to create a unique selector
    const selector = getCssSelector(element, {
      selectors: ['id', 'class', 'tag', 'attribute'],
      includeTag: true,
      whitelist: [],
      blacklist: [],
      combineWithinSelector: true,
      combineBetweenSelectors: true,
      root: null,
      maxCombinations: 50,
      maxCandidates: 100
    });
    
    return selector;
  } catch (error) {
    console.error('Error generating selector:', error);
    // Fallback to a simple selector
    return element.tagName.toLowerCase() + (element.id ? `#${element.id}` : '');
  }
}

// Validate selector by testing it against HTML
export function validateSelector(selector: string, html: string): { valid: boolean; count: number; sample?: string } {
  try {
    const $ = cheerio.load(html);
    const elements = $(selector);
    
    return {
      valid: elements.length > 0,
      count: elements.length,
      sample: elements.length > 0 ? elements.first().text().trim().substring(0, 100) : undefined
    };
  } catch (error) {
    return {
      valid: false,
      count: 0
    };
  }
}

// Clean selector name for API field
export function cleanSelectorName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50) || 'field';
}

// Get suggested name for a selector based on element content
export function suggestSelectorName(selector: string, html: string): string {
  try {
    const $ = cheerio.load(html);
    const element = $(selector).first();
    
    if (element.length === 0) return 'field';
    
    // Try to get a meaningful name from various attributes
    const id = element.attr('id');
    const className = element.attr('class');
    const text = element.text().trim();
    const tagName = element.prop('tagName')?.toLowerCase();
    
    // Priority: id > meaningful class > text content > tag name
    if (id && id.length < 30) {
      return cleanSelectorName(id);
    }
    
    if (className) {
      const classes = className.split(' ').filter(cls => 
        cls.length > 2 && cls.length < 20 && !cls.match(/^(btn|button|text|item|content|wrapper|container)$/i)
      );
      if (classes.length > 0) {
        return cleanSelectorName(classes[0]);
      }
    }
    
    if (text && text.length > 0 && text.length < 50) {
      return cleanSelectorName(text);
    }
    
    return tagName || 'field';
  } catch (error) {
    return 'field';
  }
} 