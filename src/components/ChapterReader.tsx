"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChapterReaderProps {
  content: string;
}

export default function ChapterReader({ content }: ChapterReaderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  // Split text into words while keeping punctuation
  useEffect(() => {
    // Split by non-word characters but keep them in the array
    // This regex matches sequences of word characters OR punctuation/spaces
    const splitText = content.split(/([^\wàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]+)/g).filter(Boolean);
    setWords(splitText);
  }, [content]);

  const handleWordClick = async (word: string, e: React.MouseEvent) => {
    const cleanWord = word.trim();
    // Only process actual words (containing letters)
    if (!cleanWord || /^[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]+$/.test(cleanWord)) {
      return;
    }

    setSelectedWord(cleanWord);
    setTranslation(null);
    setError(null);
    setLoading(true);

    // Calculate position for tooltip
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setCoords({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY
    });

    // Pronounce immediately
    speak(cleanWord);

    // Fetch translation
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${cleanWord}&langpair=fr|uk`);
      const data = await res.json();
      
      if (data.responseStatus === 200) {
        setTranslation(data.responseData.translatedText);
      } else {
        setTranslation("Translation unavailable");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      
      // Try to find a high quality French voice
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find(v => v.lang.includes('fr') && v.name.includes('Google')) || 
                          voices.find(v => v.lang.includes('fr'));
      
      if (frenchVoice) utterance.voice = frenchVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const closeTooltip = () => {
    setSelectedWord(null);
    setTranslation(null);
  };

  // Close tooltip on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.tooltip-container') === null && 
          (e.target as HTMLElement).closest('.word-interactive') === null) {
        closeTooltip();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative leading-loose text-lg md:text-xl font-serif text-gray-800 dark:text-gray-200 text-justify">
      {words.map((segment, index) => {
        const isWord = /[a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(segment);
        return isWord ? (
          <span
            key={index}
            onClick={(e) => handleWordClick(segment, e)}
            className={`word-interactive inline-block ${selectedWord === segment.trim() ? 'word-active' : ''}`}
          >
            {segment}
          </span>
        ) : (
          <span key={index}>{segment}</span>
        );
      })}

      <AnimatePresence>
        {selectedWord && coords && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'absolute', 
              left: coords.x, 
              top: coords.y,
              transform: 'translateX(-50%)'
            }}
            className="tooltip-container z-50 pointer-events-none" // pointer-events-none for positioning wrapper
          >
             {/* Actual tooltip content with pointer events enabled */}
            <div className="pointer-events-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-danube-200 dark:border-slate-600 p-4 min-w-[200px] relative -translate-x-1/2">
              <button 
                onClick={closeTooltip}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-2 mb-1">
                  <span className="font-bold text-danube-700 dark:text-danube-400 capitalize">{selectedWord}</span>
                  <button 
                    onClick={() => speak(selectedWord!)}
                    className="p-1 hover:bg-danube-50 dark:hover:bg-slate-700 rounded-full text-danube-600 transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                
                <div className="text-sm">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Ukrainian</span>
                  <div className="text-lg font-medium text-gray-800 dark:text-gray-100 mt-1">
                    {loading ? (
                      <span className="animate-pulse text-gray-400">Translating...</span>
                    ) : (
                      translation || error || "No translation found"
                    )}
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-danube-200 dark:border-slate-600"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}