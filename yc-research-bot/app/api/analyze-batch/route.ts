import { NextRequest, NextResponse } from 'next/server';
import { CompanyWithSummary, BatchAnalysis, CompetitiveMatrix } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const { companies, batchName } = await request.json();
    
    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Companies array is required for batch analysis',
      }, { status: 400 });
    }
    
    console.log(`Analyzing batch: ${batchName || 'Mixed'} with ${companies.length} companies`);
    
    const analysis: BatchAnalysis = {
      batchName: batchName || 'Mixed Batches',
      totalCompanies: companies.length,
      industryBreakdown: analyzeIndustries(companies),
      locationBreakdown: analyzeLocations(companies),
      averageTeamSize: calculateAverageTeamSize(companies),
      fundingStats: analyzeFundingPatterns(companies),
      topPerformers: identifyTopPerformers(companies),
      trends: identifyTrends(companies),
      competitiveMatrix: buildCompetitiveMatrix(companies),
    };
    
    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in batch analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform batch analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function analyzeIndustries(companies: CompanyWithSummary[]): Record<string, number> {
  const industries: Record<string, number> = {};
  
  companies.forEach(company => {
    const description = company.description?.toLowerCase() || '';
    
    // Enhanced industry detection
    const industryKeywords = {
      'AI/ML': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'computer vision', 'nlp', 'natural language'],
      'Fintech': ['fintech', 'finance', 'financial', 'payment', 'banking', 'lending', 'crypto', 'blockchain', 'trading', 'investment'],
      'Healthcare': ['health', 'medical', 'healthcare', 'biotech', 'pharma', 'telemedicine', 'wellness', 'therapy', 'diagnosis'],
      'Developer Tools': ['developer', 'api', 'infrastructure', 'devops', 'cloud', 'database', 'sdk', 'framework', 'platform'],
      'E-commerce': ['ecommerce', 'e-commerce', 'marketplace', 'retail', 'shopping', 'commerce', 'store'],
      'Education': ['education', 'edtech', 'learning', 'teaching', 'course', 'training', 'school', 'university'],
      'Enterprise/B2B': ['enterprise', 'b2b', 'business', 'corporate', 'workflow', 'productivity', 'collaboration', 'crm', 'erp'],
      'Consumer/B2C': ['consumer', 'b2c', 'social', 'mobile app', 'lifestyle', 'entertainment', 'gaming', 'media'],
      'Climate/Sustainability': ['climate', 'sustainability', 'renewable', 'green', 'carbon', 'environment', 'clean energy'],
      'Real Estate': ['real estate', 'property', 'housing', 'rental', 'proptech'],
      'Transportation': ['transportation', 'mobility', 'logistics', 'delivery', 'shipping', 'autonomous', 'rideshare'],
      'Food & Agriculture': ['food', 'agriculture', 'farming', 'restaurant', 'delivery', 'nutrition', 'agtech'],
    };
    
    let categorized = false;
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        industries[industry] = (industries[industry] || 0) + 1;
        categorized = true;
        break; // Only categorize into the first matching industry
      }
    }
    
    if (!categorized) {
      industries['Other'] = (industries['Other'] || 0) + 1;
    }
  });
  
  return industries;
}

function analyzeLocations(companies: CompanyWithSummary[]): Record<string, number> {
  const locations: Record<string, number> = {};
  
  companies.forEach(company => {
    if (company.location) {
      // Normalize location names
      let location = company.location.trim();
      
      // Group similar locations
      if (location.includes('San Francisco') || location.includes('SF') || location.includes('Bay Area')) {
        location = 'San Francisco Bay Area';
      } else if (location.includes('New York') || location.includes('NYC')) {
        location = 'New York';
      } else if (location.includes('Los Angeles') || location.includes('LA')) {
        location = 'Los Angeles';
      } else if (location.includes('London')) {
        location = 'London';
      } else if (location.includes('Remote')) {
        location = 'Remote';
      }
      
      locations[location] = (locations[location] || 0) + 1;
    } else {
      locations['Not Specified'] = (locations['Not Specified'] || 0) + 1;
    }
  });
  
  return locations;
}

function calculateAverageTeamSize(companies: CompanyWithSummary[]): number | undefined {
  const teamSizes = companies
    .map(company => {
      if (company.teamSize) {
        // Extract number from team size string (e.g., "5-10" -> 7.5, "15" -> 15)
        const match = company.teamSize.match(/(\d+)(?:-(\d+))?/);
        if (match) {
          const min = parseInt(match[1]);
          const max = match[2] ? parseInt(match[2]) : min;
          return (min + max) / 2;
        }
      }
      return null;
    })
    .filter((size): size is number => size !== null);
  
  if (teamSizes.length === 0) return undefined;
  
  return Math.round(teamSizes.reduce((sum, size) => sum + size, 0) / teamSizes.length);
}

function analyzeFundingPatterns(companies: CompanyWithSummary[]): BatchAnalysis['fundingStats'] {
  // This is a simplified analysis - in a real implementation, you'd scrape funding data
  const fundingIndicators = companies.filter(company => {
    const description = company.description?.toLowerCase() || '';
    return description.includes('funded') || 
           description.includes('raised') || 
           description.includes('series') ||
           description.includes('investment');
  });
  
  return {
    companiesWithFunding: fundingIndicators.length,
    averageRound: 'Seed/Series A', // Placeholder - would need real data
    totalEstimatedFunding: `$${(fundingIndicators.length * 2.5).toFixed(1)}M+`, // Rough estimate
  };
}

function identifyTopPerformers(companies: CompanyWithSummary[]): CompanyWithSummary[] {
  // Score companies based on various factors
  const scoredCompanies = companies.map(company => {
    let score = 0;
    
    // Factors that might indicate success
    const description = company.description?.toLowerCase() || '';
    
    // Has a clear value proposition
    if (description.length > 100 && description.length < 300) score += 2;
    
    // Mentions specific metrics or achievements
    if (description.includes('million') || description.includes('thousand') || description.includes('%')) score += 3;
    
    // Has enterprise/B2B focus (often more fundable)
    if (description.includes('enterprise') || description.includes('b2b') || description.includes('business')) score += 2;
    
    // In hot sectors
    if (description.includes('ai') || description.includes('fintech') || description.includes('health')) score += 1;
    
    // Has website (shows more development)
    if (company.website) score += 1;
    
    // Has team size info (shows organization)
    if (company.teamSize) score += 1;
    
    // Has location (shows establishment)
    if (company.location) score += 1;
    
    return { ...company, score };
  });
  
  return scoredCompanies
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ score, ...company }) => company);
}

function identifyTrends(companies: CompanyWithSummary[]): string[] {
  const trends: string[] = [];
  const industries = analyzeIndustries(companies);
  const totalCompanies = companies.length;
  
  // Identify dominant industries
  const sortedIndustries = Object.entries(industries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  sortedIndustries.forEach(([industry, count]) => {
    const percentage = Math.round((count / totalCompanies) * 100);
    if (percentage >= 15) {
      trends.push(`${industry} dominance: ${percentage}% of companies`);
    }
  });
  
  // Analyze common keywords
  const allDescriptions = companies.map(c => c.description?.toLowerCase() || '').join(' ');
  const commonTerms = [
    'automation', 'platform', 'analytics', 'optimization', 'integration',
    'scalable', 'real-time', 'data-driven', 'personalized', 'efficient'
  ];
  
  commonTerms.forEach(term => {
    const count = (allDescriptions.match(new RegExp(term, 'g')) || []).length;
    if (count >= Math.max(3, totalCompanies * 0.1)) {
      trends.push(`Focus on ${term}: mentioned by ${count} companies`);
    }
  });
  
  // Geographic trends
  const locations = analyzeLocations(companies);
  const topLocation = Object.entries(locations).sort(([,a], [,b]) => b - a)[0];
  if (topLocation && topLocation[1] >= totalCompanies * 0.3) {
    trends.push(`Geographic concentration: ${Math.round((topLocation[1] / totalCompanies) * 100)}% in ${topLocation[0]}`);
  }
  
  return trends.slice(0, 5);
}

function buildCompetitiveMatrix(companies: CompanyWithSummary[]): CompetitiveMatrix[] {
  const industries = analyzeIndustries(companies);
  const matrices: CompetitiveMatrix[] = [];
  
  // Create competitive matrix for top 3 industries
  const topIndustries = Object.entries(industries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  topIndustries.forEach(([industry, count]) => {
    if (count >= 3) { // Only create matrix if there are enough companies
      const industryCompanies = companies.filter(company => {
        const description = company.description?.toLowerCase() || '';
        // Match industry keywords (simplified)
        switch (industry) {
          case 'AI/ML':
            return description.includes('ai') || description.includes('artificial intelligence');
          case 'Fintech':
            return description.includes('fintech') || description.includes('finance');
          case 'Healthcare':
            return description.includes('health') || description.includes('medical');
          default:
            return false;
        }
      });
      
      const companyNames = industryCompanies.map(c => c.name);
      
      matrices.push({
        industry,
        companies: companyNames,
        marketLeader: companyNames[0], // Simplified - would need real analysis
        emergingPlayers: companyNames.slice(1, 4),
        opportunities: [
          `${count} companies competing in ${industry}`,
          'Potential for partnerships or acquisitions',
          'Market validation for the sector'
        ],
      });
    }
  });
  
  return matrices;
} 