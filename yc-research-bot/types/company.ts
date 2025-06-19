export interface YCCompany {
  id: string;
  name: string;
  batch: string;
  website?: string;
  description: string;
  logo?: string;
  founded?: string;
  teamSize?: string;
  location?: string;
  tags?: string[];
}

export interface CompanyWithSummary extends YCCompany {
  aiSummary?: string;
  websiteContent?: string;
  founderEmail?: string;
  generatedEmail?: string;
  tweet?: string;
  deepResearch?: CompanyDeepResearch;
}

// New enhanced company data structure
export interface CompanyDeepResearch extends CompanyWithSummary {
  deepAnalysis?: {
    websiteAnalysis?: {
      lastUpdated?: string;
      techStack?: string[];
      features?: string[];
      pricing?: PricingInfo[];
      teamMembers?: TeamMember[];
      jobOpenings?: JobOpening[];
      blogPosts?: BlogPost[];
      customerTestimonials?: string[];
    };
    socialPresence?: {
      twitterHandle?: string;
      twitterFollowers?: number;
      linkedinUrl?: string;
      githubUrl?: string;
      lastSocialActivity?: string;
      socialEngagement?: number;
    };
    competitiveIntel?: {
      directCompetitors?: string[];
      marketPosition?: string;
      uniqueAdvantages?: string[];
      potentialWeaknesses?: string[];
      fundingStage?: string;
      estimatedRevenue?: string;
    };
    founderIntel?: {
      founders?: FounderInfo[];
      previousExperience?: string[];
      education?: string[];
      networkConnections?: string[];
    };
  };
}

export interface PricingInfo {
  plan: string;
  price: string;
  features: string[];
  target: string;
}

export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
  background?: string;
}

export interface JobOpening {
  title: string;
  department: string;
  location: string;
  salary?: string;
  postedDate?: string;
  requirements?: string[];
}

export interface BlogPost {
  title: string;
  url: string;
  publishedDate: string;
  summary?: string;
  topics?: string[];
}

export interface FounderInfo {
  name: string;
  role: string;
  linkedin?: string;
  twitter?: string;
  previousCompanies?: string[];
  education?: string;
  expertise?: string[];
}

export interface SearchFilters {
  batch?: string | string[];
  keyword?: string;
  limit?: number;
}



export interface EmailTemplate {
  subject: string;
  body: string;
  founderName?: string;
}

export interface SlackMessage {
  text: string;
  blocks?: any[];
}

// New types for activity tracking and chat
export interface CompanyActivity {
  id: string;
  companyId: string;
  companyName: string;
  type: 'twitter' | 'product_hunt' | 'blog' | 'news';
  title: string;
  summary: string;
  url: string;
  timestamp: string;
  source: string;
  metadata?: {
    engagement?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
    keywords?: string[];
  };
}

export interface WeeklyDigest {
  id: string;
  weekOf: string;
  totalActivities: number;
  topCompanies: string[];
  summary: string;
  highlights: CompanyActivity[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  context?: {
    companiesFound?: number;
    filters?: any;
    searchQuery?: string;
  };
}

export interface StoredCompanyData {
  companies: CompanyWithSummary[];
  lastUpdated: string;
  batchFilters: string[];
  totalCount: number;
}

// Batch Analysis types
export interface BatchAnalysis {
  batchName: string;
  totalCompanies: number;
  industryBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  averageTeamSize?: number;
  fundingStats?: {
    companiesWithFunding: number;
    averageRound?: string;
    totalEstimatedFunding?: string;
  };
  topPerformers: CompanyWithSummary[];
  trends: string[];
  competitiveMatrix: CompetitiveMatrix[];
}

export interface CompetitiveMatrix {
  industry: string;
  companies: string[];
  marketLeader?: string;
  emergingPlayers: string[];
  opportunities: string[];
} 