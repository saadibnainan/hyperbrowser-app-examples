"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ShotCarousel({ shots }: { shots: string[] }) {
  const [idx, setIdx] = useState(0);

  // always jump to newest shot
  useEffect(() => {
    if (shots.length) setIdx(shots.length - 1);
  }, [shots]);

  if (!shots.length) {
    return (
      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-700 rounded-lg mb-3 mx-auto flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-600 rounded"></div>
          </div>
          <p className="text-sm">Waiting for screenshots</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.img
          key={shots[idx]}
          src={shots[idx]}
          alt=""
          className="w-full aspect-video object-cover bg-gray-800 rounded-lg border border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const currentSrc = target.src;
            if (currentSrc.includes('.png')) {
              const svgSrc = currentSrc.replace('.png', '.svg');
              target.src = svgSrc;
            }
          }}
        />
      </AnimatePresence>
      
      {shots.length > 1 && (
        <div className="flex justify-center space-x-2">
          {shots.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === idx ? 'bg-gray-400' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
      
      {shots[idx] && (
        <div className="text-center">
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            {shots[idx].split('/').pop()}
          </span>
        </div>
      )}
    </div>
  );
}