'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mic, Play, Pause, Download, Globe, Headphones } from 'lucide-react';
import BgGradient from './components/BgGradient';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

interface PodcastData {
  title: string;
  content: string;
  extractedText: string;
  audioUrl?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Audio player state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // API Key State - Only Hyperbrowser
  const [apiKey, setApiKey] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('hyperbrowser_api_key') || '';
    setApiKey(savedApiKey);
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('hyperbrowser_api_key', key);
  };

  // Audio event handlers
  const setupAudioListeners = (audio: HTMLAudioElement) => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Cleanup function
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  };

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    
    audioElement.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    if (!apiKey.trim()) {
      alert('Please enter your Hyperbrowser API key in the sidebar');
      setShowSidebar(true);
      return;
    }

    // Normalize URL - add https:// if no protocol is provided
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setIsLoading(true);
    setPodcastData(null);
    
    try {
      // Step 1: Extract content using Hyperbrowser
      setCurrentStep('Extracting content from the website...');
      const extractResponse = await fetch('/api/extract-content', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract content');
      }

      const extractedData = await extractResponse.json();
      
      // Step 2: Generate podcast script
      setCurrentStep('Creating podcast script...');
      const scriptResponse = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: extractedData.title,
          content: extractedData.content 
        }),
      });

      if (!scriptResponse.ok) {
        const errorData = await scriptResponse.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const scriptData = await scriptResponse.json();

      // Step 3: Generate audio using ElevenLabs
      setCurrentStep('Generating podcast audio...');
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ script: scriptData.script }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioData = await audioResponse.json();

      setPodcastData({
        title: extractedData.title,
        content: scriptData.script,
        extractedText: extractedData.content,
        audioUrl: audioData.audioUrl
      });

    } catch (error) {
      console.error('Error generating podcast:', error);
      alert(`Failed to generate podcast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const togglePlayback = () => {
    if (!podcastData?.audioUrl) return;

    if (!audioElement) {
      const audio = new Audio(podcastData.audioUrl);
      setupAudioListeners(audio);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadAudio = () => {
    if (!podcastData?.audioUrl) return;
    
    const link = document.createElement('a');
    link.href = podcastData.audioUrl;
    link.download = `podcast-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Background Gradient Component */}
      <BgGradient />
      
      {/* Navbar */}
      <Navbar 
        apiKey={apiKey} 
        onOpenSidebar={() => setShowSidebar(true)} 
      />

      {/* Sidebar */}
      <Sidebar 
        showSidebar={showSidebar}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        onClose={() => setShowSidebar(false)}
      />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Headphones className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0 drop-shadow-lg" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent leading-tight drop-shadow-lg">
              AI Podcast Generator
            </h1>
          </div>
          <p className="text-gray-200 dark:text-gray-300 text-sm sm:text-base lg:text-lg max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto px-4 sm:px-0 leading-relaxed drop-shadow-md">
            Transform any website content into an engaging podcast. Just paste a URL and let AI create a professional podcast episode for you.
          </p>
        </div>

        {/* URL Input Section */}
        <div className="max-w-xs sm:max-w-md lg:max-w-2xl xl:max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
              <label htmlFor="url" className="text-xs sm:text-sm font-medium text-gray-200 dark:text-gray-300">
                Website URL
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news-article"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-white/20 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white/10 dark:bg-gray-700/50 text-white placeholder-gray-300 backdrop-blur transition-all text-sm sm:text-base"
                disabled={isLoading}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !url.trim()}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base min-w-fit shadow-lg hover:shadow-green-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Generate</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Generate Podcast</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-xs sm:max-w-md lg:max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-green-400 flex-shrink-0" />
                <span className="font-medium text-gray-200 dark:text-gray-300 text-sm sm:text-base">Processing...</span>
              </div>
              <p className="text-gray-300 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 break-words">{currentStep}</p>
              <div className="w-full bg-white/20 dark:bg-gray-700/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Podcast Result */}
        {podcastData && (
          <div className="max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur p-4 sm:p-6 lg:p-8 text-white">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 sm:mb-2 leading-tight break-words">
                  {podcastData.title}
                </h2>
                <p className="opacity-90 text-sm sm:text-base">AI-Generated Podcast Episode</p>
              </div>

              {/* Audio Player */}
              {podcastData.audioUrl && (
                <div className="p-4 sm:p-6 border-b border-white/20 dark:border-gray-700/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <button
                      onClick={togglePlayback}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0 mx-auto sm:mx-0 shadow-lg hover:shadow-green-500/25"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <span className="text-xs sm:text-sm font-medium text-gray-200 dark:text-gray-300 text-center sm:text-left">
                          {isPlaying ? 'Playing...' : 'Ready to play'}
                        </span>
                        <button
                          onClick={downloadAudio}
                          className="flex items-center justify-center sm:justify-start gap-2 px-3 py-1 text-xs sm:text-sm text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          Download
                        </button>
                      </div>
                      
                      {/* Progress Bar */}
                      <div 
                        className="w-full bg-white/20 dark:bg-gray-700/50 rounded-full h-2 cursor-pointer hover:h-3 transition-all group"
                        onClick={handleSeek}
                      >
                        <div 
                          className="bg-green-400 h-full rounded-full transition-all group-hover:bg-green-300" 
                          style={{width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`}}
                        ></div>
                      </div>
                      
                      {/* Time Display */}
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Script Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-gray-200 dark:text-gray-200">
                  Generated Script
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="bg-black/20 backdrop-blur rounded-lg p-3 sm:p-4 lg:p-6 whitespace-pre-wrap text-xs sm:text-sm lg:text-base leading-relaxed overflow-x-auto text-gray-200">
                    {podcastData.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto mt-8 sm:mt-12 lg:mt-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 text-gray-200 dark:text-gray-200">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 backdrop-blur rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto lg:mx-0">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-200 dark:text-gray-200 text-sm sm:text-base text-center lg:text-left">
                1. Extract Content
              </h3>
              <p className="text-gray-300 dark:text-gray-400 text-xs sm:text-sm leading-relaxed text-center lg:text-left">
                Hyperbrowser intelligently scrapes and extracts key information from any website or news article.
              </p>
            </div>
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 backdrop-blur rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto lg:mx-0">
                <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-200 dark:text-gray-200 text-sm sm:text-base text-center lg:text-left">
                2. Generate Script
              </h3>
              <p className="text-gray-300 dark:text-gray-400 text-xs sm:text-sm leading-relaxed text-center lg:text-left">
                AI transforms the content into an engaging podcast script with natural conversation flow.
              </p>
            </div>
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-xl border border-white/20 dark:border-gray-700/50 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 backdrop-blur rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto lg:mx-0">
                <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-200 dark:text-gray-200 text-sm sm:text-base text-center lg:text-left">
                3. Create Audio
              </h3>
              <p className="text-gray-300 dark:text-gray-400 text-xs sm:text-sm leading-relaxed text-center lg:text-left">
                ElevenLabs generates high-quality, realistic voice audio for your podcast episode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
