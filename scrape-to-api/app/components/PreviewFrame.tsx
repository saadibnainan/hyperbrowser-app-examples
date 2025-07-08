'use client';

import React, { useRef, useEffect, useState } from 'react';
import { generateSelectorForElement, suggestSelectorName } from '../../lib/client-utils';

interface PreviewFrameProps {
  html: string;
  onElementSelect: (selector: string, name: string) => void;
  selectedSelectors: string[];
}

export default function PreviewFrame({ html, onElementSelect, selectedSelectors }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!html || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) return;

    // Write HTML to iframe
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Add click handlers to all elements
    const addClickHandlers = () => {
      const elements = iframeDoc.body.querySelectorAll('*');
      
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        
        // Skip non-visible elements
        if (['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'HEAD'].includes(htmlElement.tagName)) {
          return;
        }

        // Skip elements with no content and no attributes
        if (!htmlElement.textContent?.trim() && htmlElement.attributes.length === 0) {
          return;
        }

        htmlElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Remove previous highlights
          const highlighted = iframeDoc.querySelectorAll('.element-highlight');
          highlighted.forEach(el => el.classList.remove('element-highlight'));
          
          // Generate selector and name
          const selector = generateSelectorForElement(htmlElement);
          const name = suggestSelectorName(selector, html);

          // Add highlight class
          htmlElement.classList.add('element-highlight');

          onElementSelect(selector, name);
        });

        // Add hover effects
        htmlElement.addEventListener('mouseenter', () => {
          htmlElement.style.outline = '1px solid rgba(240, 255, 38, 0.5)';
          htmlElement.style.cursor = 'pointer';
        });

        htmlElement.addEventListener('mouseleave', () => {
          if (!htmlElement.classList.contains('element-highlight')) {
            htmlElement.style.outline = '';
          }
          htmlElement.style.cursor = 'default';
        });
      });
    };

    // Wait for iframe to load
    iframe.onload = () => {
      setIsLoading(false);
      addClickHandlers();
    };

    // If already loaded, add handlers immediately
    if (iframeDoc.readyState === 'complete') {
      setIsLoading(false);
      addClickHandlers();
    }

  }, [html, onElementSelect]);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 glass-card flex items-center justify-center">
          <div className="loading-spinner w-8 h-8 mr-3"></div>
          <span className="terminal-text">Loading preview...</span>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className="w-full h-full preview-frame rounded-lg"
        sandbox="allow-same-origin allow-scripts"
        title="Page Preview"
        style={{ 
          display: isLoading ? 'none' : 'block',
          minHeight: '600px'
        }}
      />
      
      {selectedSelectors.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-gray-600">
          <div className="text-xs text-accent font-mono">
            {selectedSelectors.length} element{selectedSelectors.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      )}
    </div>
  );
} 