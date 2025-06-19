import { CompanyActivity, WeeklyDigest } from '@/types/company';
import { generateWeeklyDigest as generateDigestWithAI } from './openai';

export async function generateWeeklyDigest(activities: CompanyActivity[]): Promise<WeeklyDigest> {
  // Use the AI function from OpenAI lib
  return await generateDigestWithAI(activities);
}

export function groupActivitiesByCompany(activities: CompanyActivity[]): Record<string, CompanyActivity[]> {
  return activities.reduce((acc, activity) => {
    if (!acc[activity.companyName]) {
      acc[activity.companyName] = [];
    }
    acc[activity.companyName].push(activity);
    return acc;
  }, {} as Record<string, CompanyActivity[]>);
}

export function groupActivitiesBySource(activities: CompanyActivity[]): Record<string, CompanyActivity[]> {
  return activities.reduce((acc, activity) => {
    if (!acc[activity.type]) {
      acc[activity.type] = [];
    }
    acc[activity.type].push(activity);
    return acc;
  }, {} as Record<string, CompanyActivity[]>);
}

export function getTopActivitiesByEngagement(activities: CompanyActivity[], limit: number = 10): CompanyActivity[] {
  return activities
    .sort((a, b) => (b.metadata?.engagement || 0) - (a.metadata?.engagement || 0))
    .slice(0, limit);
}

export function getRecentActivities(activities: CompanyActivity[], days: number = 7): CompanyActivity[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    return activityDate >= cutoffDate;
  });
}

export function getActivityStats(activities: CompanyActivity[]) {
  const byType = groupActivitiesBySource(activities);
  const byCompany = groupActivitiesByCompany(activities);
  
  return {
    total: activities.length,
    byType: Object.entries(byType).map(([type, acts]) => ({
      type,
      count: acts.length,
      percentage: Math.round((acts.length / activities.length) * 100)
    })),
    topCompanies: Object.entries(byCompany)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 10)
      .map(([name, acts]) => ({
        name,
        count: acts.length
      })),
    averageEngagement: Math.round(
      activities.reduce((sum, act) => sum + (act.metadata?.engagement || 0), 0) / activities.length
    ) || 0,
  };
} 