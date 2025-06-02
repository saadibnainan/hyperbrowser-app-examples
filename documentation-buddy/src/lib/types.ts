export interface CrawledPage {
  url: string;
  title?: string;
  content: string;
  status: 'completed' | 'failed';
  error?: string;
}

export interface DocumentationData {
  id: string;
  url: string;
  originalUrl?: string;
  pages: CrawledPage[];
  crawledAt: Date;
  totalPages: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DocumentationSession {
  id: string;
  name: string;
  url: string;
  status: 'crawling' | 'ready' | 'error';
  progress?: number;
  error?: string;
  createdAt: Date;
} 