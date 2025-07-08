import { Hyperbrowser } from '@hyperbrowser/sdk';

export interface CrawlOptions {
  url: string;
  apiKey: string;
  onProgress?: (message: string) => void;
}

export interface CrawlResult {
  html: string;
  url: string;
  title: string;
  success: boolean;
  error?: string;
}

export async function crawlPage(options: CrawlOptions): Promise<CrawlResult> {
  const { url, apiKey, onProgress } = options;
  let session: any = null;
  let browser: any = null;
  
  try {
    onProgress?.('🚀 Launching browser session...');
    
    // Initialize Hyperbrowser with official SDK pattern
    const hb = new Hyperbrowser({
      apiKey,
    });

    // Create browser session using official SDK
    session = await hb.sessions.create({
      useStealth: true,
      useProxy: false  // Disable proxy to avoid tunnel errors
    });

    onProgress?.('🌐 Connecting to browser...');
    
    // Connect with Puppeteer using official pattern
    const { connect } = await import('puppeteer-core');
    browser = await connect({
      browserWSEndpoint: session.wsEndpoint,
      defaultViewport: null,
    });

    const [page] = await browser.pages();

    onProgress?.('📄 Navigating to target URL...');
    
    // Navigate to the URL with retry logic
    let retries = 2;
    while (retries > 0) {
      try {
        await page.goto(url, {
          waitUntil: 'networkidle0', // Wait for network to be idle
          timeout: 15000
        });
        break; // Success, exit retry loop
      } catch (navError) {
        retries--;
        if (retries === 0) {
          throw navError; // Re-throw if no retries left
        }
        onProgress?.(`⚠️ Navigation failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    onProgress?.('⏳ Waiting for page to load...');
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the fully rendered HTML including styles
    const html = await page.evaluate((pageUrl: string) => {
      // Function to convert relative URLs to absolute
      function toAbsoluteUrl(relativeUrl: string) {
        try {
          return new URL(relativeUrl, pageUrl).href;
        } catch {
          return relativeUrl;
        }
      }

      // Clone the document to modify it safely
      const clone = document.documentElement.cloneNode(true) as HTMLElement;
      
      // Convert all resource URLs to absolute
      // Handle <link> tags (CSS)
      clone.querySelectorAll('link[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href) link.setAttribute('href', toAbsoluteUrl(href));
      });

      // Handle <script> tags
      clone.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src) script.setAttribute('src', toAbsoluteUrl(src));
      });

      // Handle <img> tags
      clone.querySelectorAll('img[src]').forEach(img => {
        const src = img.getAttribute('src');
        if (src) img.setAttribute('src', toAbsoluteUrl(src));
      });

      // Handle <a> tags
      clone.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href) a.setAttribute('href', toAbsoluteUrl(href));
      });

      // Handle inline CSS with url()
      const styleSheets = document.styleSheets;
      const inlineStyles = document.createElement('style');
      Array.from(styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            let cssText = rule.cssText;
            // Convert url() paths to absolute
            cssText = cssText.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, p1) => {
              return `url("${toAbsoluteUrl(p1)}")`;
            });
            inlineStyles.appendChild(document.createTextNode(cssText + "\n"));
          });
        } catch (e) {
          // Handle CORS errors for external stylesheets
          if (sheet.href) {
            inlineStyles.appendChild(document.createTextNode(`@import url("${sheet.href}");\n`));
          }
        }
      });
      
      // Add the collected styles to the head
      clone.querySelector('head')?.appendChild(inlineStyles);

      // Capture computed styles for all elements
      document.querySelectorAll('*').forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        const styles = document.createElement('style');
        styles.textContent = `[data-styled="${index}"] { ${Array.from(computed).map(prop => 
          `${prop}: ${computed.getPropertyValue(prop)};`
        ).join(' ')} }`;
        clone.querySelector('head')?.appendChild(styles);
        (clone as any).querySelector(el.tagName.toLowerCase())?.setAttribute('data-styled', index.toString());
      });
      
      return clone.outerHTML;
    }, url);
    
    // Extract page title using Puppeteer
    const title = await page.title();
    
    onProgress?.('✅ Page scraped successfully!');
    
    return {
      html,
      url,
      title,
      success: true
    };
    
  } catch (error) {
    console.error('Crawl error:', error);
    return {
      html: '',
      url,
      title: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    try {
      if (browser) await browser.close();
      if (session?.destroy) await session.destroy();
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  }
}

// Clean HTML for preview (remove scripts, etc.)
export function cleanHtmlForPreview(html: string): string {
  // Remove script tags to prevent execution
  let cleanedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  cleanedHtml = cleanedHtml.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
  cleanedHtml = cleanedHtml.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');
  
  // Remove form actions and change method to prevent submission
  cleanedHtml = cleanedHtml.replace(/action\s*=\s*"[^"]*"/gi, 'action="#"');
  cleanedHtml = cleanedHtml.replace(/method\s*=\s*"[^"]*"/gi, 'method="get"');
  
  // Add base styles to prevent layout issues
  const baseStyles = `
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 16px; }
      img { max-width: 100%; height: auto; }
      iframe { display: none; }
      video { max-width: 100%; }
      a { color: inherit; text-decoration: none; }
      .selector-highlight { 
        outline: 2px solid #F0FF26 !important; 
        cursor: pointer !important;
      }
      .selector-selected {
        outline: 2px solid #00ff00 !important;
      }
    </style>
  `;
  
  // Insert styles after opening head tag or body tag
  if (cleanedHtml.includes('<head>')) {
    cleanedHtml = cleanedHtml.replace('<head>', '<head>' + baseStyles);
  } else if (cleanedHtml.includes('<body>')) {
    cleanedHtml = cleanedHtml.replace('<body>', '<body>' + baseStyles);
  } else {
    cleanedHtml = baseStyles + cleanedHtml;
  }
  
  return cleanedHtml;
}
