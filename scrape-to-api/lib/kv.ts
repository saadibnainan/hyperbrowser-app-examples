// Simple in-memory KV store for caching API responses
export interface CachedData {
  json: any;
  lastUpdated: number;
  url: string;
  slug: string;
}

class InMemoryKV {
  private store: Map<string, CachedData> = new Map();
  private readonly CACHE_FILE = '.cache.json';
  
  constructor() {
    // Try to load cached data from file system
    try {
      const fs = require('fs');
      if (fs.existsSync(this.CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(this.CACHE_FILE, 'utf8'));
        this.store = new Map(Object.entries(data));
      }
    } catch (e) {
      console.warn('Failed to load cache file:', e);
    }
  }

  private persistToFile(): void {
    try {
      const fs = require('fs');
      const data = Object.fromEntries(this.store);
      fs.writeFileSync(this.CACHE_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn('Failed to persist cache to file:', e);
    }
  }
  
  set(slug: string, data: any, url: string): void {
    this.store.set(slug, {
      json: data,
      lastUpdated: Date.now(),
      url,
      slug
    });
    this.persistToFile();
  }
  
  get(slug: string): CachedData | null {
    const data = this.store.get(slug);
    if (!data) return null;

    // Check if data is too old (7 days)
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    if (now - data.lastUpdated > maxAge) {
      this.delete(slug);
      return null;
    }

    return data;
  }
  
  has(slug: string): boolean {
    return this.store.has(slug);
  }
  
  delete(slug: string): boolean {
    const result = this.store.delete(slug);
    this.persistToFile();
    return result;
  }
  
  clear(): void {
    this.store.clear();
    this.persistToFile();
  }
  
  list(): CachedData[] {
    return Array.from(this.store.values());
  }
  
  size(): number {
    return this.store.size;
  }
  
  // Clean up old entries (older than 7 days)
  cleanup(): number {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    let cleaned = 0;
    
    for (const [slug, data] of this.store.entries()) {
      if (now - data.lastUpdated > maxAge) {
        this.store.delete(slug);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.persistToFile();
    }
    
    return cleaned;
  }
}

// Export singleton instance
export const kv = new InMemoryKV();

// Generate a unique slug for URLs
export function generateSlug(url: string): string {
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-');
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${cleanUrl.substring(0, 30)}-${timestamp}-${random}`;
}

// Auto-cleanup on module load
setInterval(() => {
  kv.cleanup();
}, 24 * 60 * 60 * 1000); // Run cleanup every 24 hours 