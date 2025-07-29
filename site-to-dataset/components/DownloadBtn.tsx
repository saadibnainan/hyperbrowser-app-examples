'use client';

import { Download, FileText } from 'lucide-react';
import { toJSONL } from '@/lib/jsonl';
import { QAPair } from '@/lib/qa';

interface DownloadBtnProps {
  data: QAPair[];
  isVisible: boolean;
}

export default function DownloadBtn({ data, isVisible }: DownloadBtnProps) {
  if (!isVisible || data.length === 0) return null;
  
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSONL = () => {
    const jsonl = toJSONL(data);
    downloadFile(jsonl, 'dataset.jsonl', 'application/octet-stream');
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, 'dataset.json', 'application/json');
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto mt-6 mb-12 flex gap-4 justify-end">
      <button
        onClick={handleDownloadJSONL}
        className="download-btn flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download JSONL (recommended)
      </button>
      
      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-2 px-4 py-2 border border-black text-black rounded-md hover:bg-gray-100 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Download JSON
      </button>
    </div>
  );
} 