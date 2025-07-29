import { Hyperbrowser } from '@hyperbrowser/sdk';

let hyperbrowserInstance: Hyperbrowser | null = null;

export const getHB = (): Hyperbrowser => {
  if (!hyperbrowserInstance) {
    const apiKey = process.env.HYPERBROWSER_API_KEY;
    
    if (!apiKey) {
      throw new Error('HYPERBROWSER_API_KEY is not defined in environment variables');
    }
    
    hyperbrowserInstance = new Hyperbrowser({
      apiKey,
    });
  }
  
  return hyperbrowserInstance;
};

export const shutdownHB = async (): Promise<void> => {
  // For scrape operations, there's no need to explicitly shutdown the client
  // Sessions are managed automatically by the scrape.startAndWait method
  hyperbrowserInstance = null;
}; 