'use client';

import { QAPair } from '@/lib/qa';
import { ExternalLink, MessageSquare, HelpCircle } from 'lucide-react';

interface TableProps {
  data: QAPair[];
  isVisible: boolean;
}

export default function Table({ data, isVisible }: TableProps) {
  if (!isVisible || data.length === 0) return null;
  
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full table-modern">
          <thead>
            <tr>
              <th scope="col" className="w-1/2">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Question</span>
                </div>
              </th>
              <th scope="col" className="w-1/2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span>Answer</span>
                </div>
              </th>
              <th scope="col" className="w-20">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                  <span>Source</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((pair, index) => (
              <tr key={index}>
                <td className="max-w-md">
                  <div className="text-sm font-medium text-gray-900 leading-relaxed">
                    {pair.question}
                  </div>
                </td>
                <td className="max-w-md">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {pair.answer}
                  </div>
                </td>
                <td>
                  <a
                    href={pair.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                    title={pair.source_url}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length > 10 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 text-center">
            Showing all {data.length} Q/A pairs • 
            <span className="font-medium"> Ready for training</span>
          </p>
        </div>
      )}
    </div>
  );
} 