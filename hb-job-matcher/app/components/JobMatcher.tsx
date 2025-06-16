'use client';

import { useState } from 'react';

interface JobSource {
  name: string;
  url: string;
  searchParam: string;
  enabled: boolean;
}

interface JobMatcherProps {
  apiKey: string;
  jobSources: JobSource[];
}

interface ExtractedProfile {
  name: string;
  title: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  description: string;
  requirements: string[];
  url: string;
}

export default function JobMatcher({ apiKey, jobSources }: JobMatcherProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url) return;
    
    setLoading(true);
    setExtractedProfile(null);
    setJobMatches([]);
    setError('');

    try {
      // Handle URL (including Google Drive URLs)
      const response = await fetch('/api/extract-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract profile');
      }

      const data = await response.json();
      const profile = data.profileData;

      setExtractedProfile(profile);
      const matches = await findMatchingJobs(profile);
      setJobMatches(matches);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract profile');
    } finally {
      setLoading(false);
    }
  };



  const findMatchingJobs = async (profile: ExtractedProfile): Promise<JobMatch[]> => {
    // Use default job sources if none are configured
    const defaultJobSources = [
      {
        name: 'YC Work at a Startup',
        url: 'https://www.workatastartup.com/job_list',
        searchParam: 'search',
        enabled: true
      },
      {
        name: 'AngelList/Wellfound',
        url: 'https://wellfound.com/jobs',
        searchParam: 'q',
        enabled: true
      },
      {
        name: 'RemoteOK',
        url: 'https://remoteok.io',
        searchParam: 'q',
        enabled: true
      },
      {
        name: 'Indeed',
        url: 'https://www.indeed.com/jobs',
        searchParam: 'q',
        enabled: true
      }
    ];

    const sourcesToUse = jobSources && jobSources.length > 0 
      ? jobSources.filter(source => source.enabled)
      : defaultJobSources;

    // Use the API route for job matching
    const response = await fetch('/api/find-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        profile, 
        apiKey,
        jobSources: sourcesToUse
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to find matching jobs');
    }

    const { jobMatches } = await response.json();
    return jobMatches;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              HB Job Matcher
            </h1>
            <div className="w-16 h-0.5 bg-[#FFFD39] mx-auto mb-6"></div>
          </div>
          
          <p className="text-lg text-gray-300 mb-12 leading-relaxed">
            Extract your skills from your portfolio or resume and find matching jobs using{' '}
            <span className="text-[#FFFD39] font-medium">Hyperbrowser AI</span>
          </p>

          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400">
                  Supports portfolio websites, Google Drive resumes, and Google Docs
                </p>
              </div>

              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter portfolio, resume, or Google Drive URL"
                className="w-full modern-input px-6 py-4 rounded-xl text-white text-base"
              />

              <button
                onClick={handleAnalyze}
                disabled={loading || !url || !apiKey}
                className={`w-full px-8 py-4 rounded-xl font-medium text-base ${
                  loading || !url || !apiKey
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'btn-primary text-black hover:scale-[1.02]'
                } transition-all duration-200`}
              >
                {loading ? 'Analyzing...' : 'Analyze & Find Jobs'}
              </button>
              {!apiKey && (
                <p className="text-sm text-red-400">
                  Please set up your Hyperbrowser API key first
                </p>
              )}
              {error && (
                <p className="text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="glass-card inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-[#FFFD39] rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {extractedProfile ? 'Finding perfect job matches...' : 'Analyzing your portfolio...'}
          </h3>
          <p className="text-gray-400">
            Our AI is working its magic ✨
          </p>
        </div>
      )}

      {/* Extracted Skills */}
      {extractedProfile && (
        <div className="mb-16">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <h2 className="text-2xl font-medium text-white">Extracted Skills</h2>
            </div>
            
            <div className="bg-white-5 rounded-xl p-6">
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-6 block">Core Skills</span>
              <div className="flex flex-wrap gap-3">
                {extractedProfile.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg text-sm font-medium border border-gray-600 hover:bg-gray-600 transition-colors duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Matches */}
      {jobMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <h2 className="text-2xl font-medium text-white">Matching Jobs</h2>
          </div>
          
          <div className="space-y-6">
            {jobMatches.map((job) => (
              <div 
                key={job.id}
                className="glass-card rounded-2xl p-8 hover:bg-white-10 transition-colors duration-300"
              >
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-gray-300">
                      <span>{job.company}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="px-4 py-2 bg-accent-10 border border-accent-20 rounded-lg">
                      <span className="text-[#FFFD39] font-medium">{job.matchScore}% Match</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 line-clamp-3">{job.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-300 mb-3">Key Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 bg-gray-800-50 text-gray-300 rounded-lg text-sm font-medium border border-gray-700"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white-5 hover:bg-white-10 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 group/link"
                >
                  <span>Apply Now</span>
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-16 pt-8">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <span>Powered by</span>
          <a
            href="https://www.hyperbrowser.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFFD39] font-medium hover:text-yellow-300 transition-colors"
          >
            Hyperbrowser AI
          </a>
          <div className="w-1.5 h-1.5 bg-[#FFFD39] rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 