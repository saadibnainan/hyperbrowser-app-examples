// Client-safe utility functions (no server-only dependencies)

interface ValidationResult {
  valid: boolean;
  count: number;
  error?: string;
}

// Validate CSS selector against HTML content
export function validateSelector(selector: string, html: string): ValidationResult {
  try {
    // Create a temporary DOM element to test the selector
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to query the selector
    const elements = doc.querySelectorAll(selector);
    
    return {
      valid: elements.length > 0,
      count: elements.length
    };
  } catch (error) {
    return {
      valid: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Invalid selector'
    };
  }
}

// Generate CSS selector for a clicked element (simple client-safe version)
export function generateSelectorForElement(element: HTMLElement): string {
  try {
    // Priority: id > unique class > tag with nth-child
    
    // Check for ID
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Check for unique class
    const classes = element.className.split(' ').filter(cls => cls.trim());
    if (classes.length > 0) {
      for (const cls of classes) {
        const selector = `.${cls}`;
        const doc = element.ownerDocument;
        if (doc && doc.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }
    
    // Build a path from the element to the root
    const path = [];
    let current: HTMLElement | null = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();
      
      // Add index if there are siblings with the same tag
      if (current.parentNode) {
        const siblings = Array.from(current.parentNode.children);
        const sameTagSiblings = siblings.filter(sibling => 
          sibling.tagName.toLowerCase() === selector
        );
        
        if (sameTagSiblings.length > 1) {
          const index = sameTagSiblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
      
      // Don't go beyond body
      if (current && current.tagName.toLowerCase() === 'body') {
        break;
      }
    }
    
    return path.join(' > ');
  } catch (error) {
    console.error('Error generating selector:', error);
    // Fallback to a simple selector
    return element.tagName.toLowerCase() + (element.id ? `#${element.id}` : '');
  }
}

// Clean selector name for API field (client-safe version)
export function cleanSelectorName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50) || 'field';
}

// Get suggested name for a selector based on element content (client-safe version)
export function suggestSelectorName(selector: string, html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const element = doc.querySelector(selector);
    
    if (!element) return 'field';
    
    // Try to get a meaningful name from various attributes
    const id = element.getAttribute('id');
    const className = element.getAttribute('class');
    const text = element.textContent?.trim();
    const tagName = element.tagName?.toLowerCase();
    
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

// Clean HTML for preview (preserve styles and scripts while making them safe)
export function cleanHtmlForPreview(html: string): string {
  let cleanedHtml = html;
  
  // Only remove inline event handlers for security
  cleanedHtml = cleanedHtml.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
  cleanedHtml = cleanedHtml.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');
  
  // Make all form submissions safe
  cleanedHtml = cleanedHtml.replace(/action\s*=\s*"[^"]*"/gi, 'action="#"');
  cleanedHtml = cleanedHtml.replace(/method\s*=\s*"[^"]*"/gi, 'method="get"');
  
  // Make all links safe but preserve their original href in a data attribute
  cleanedHtml = cleanedHtml.replace(/href\s*=\s*"([^"]*)"/gi, 'href="#" data-original-href="$1"');
  
  // Add sandbox attributes to iframes
  cleanedHtml = cleanedHtml.replace(/<iframe/gi, '<iframe sandbox="allow-same-origin"');
  
  // Add our safety styles while preserving original styles
  const safetyStyles = `
    <style>
      /* Base safety styles */
      * { box-sizing: border-box; }
      
      /* Make sure images don't overflow */
      img { max-width: 100%; height: auto; }
      
      /* Ensure video elements are contained */
      video { max-width: 100%; }
      
      /* Style for highlighted elements */
      .element-highlight {
        outline: 2px solid #F0FF26 !important;
        outline-offset: 2px !important;
      }
      
      /* Hover effect for selectable elements */
      *:hover {
        cursor: pointer;
      }
    </style>
  `;
  
  // Insert safety styles after opening head tag or create head if it doesn't exist
  if (cleanedHtml.includes('<head>')) {
    cleanedHtml = cleanedHtml.replace('<head>', '<head>' + safetyStyles);
  } else if (cleanedHtml.includes('<body>')) {
    cleanedHtml = cleanedHtml.replace('<body>', '<head>' + safetyStyles + '</head><body>');
  } else {
    cleanedHtml = '<head>' + safetyStyles + '</head>' + cleanedHtml;
  }
  
  return cleanedHtml;
} 