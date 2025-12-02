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
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into words while keeping punctuation
  useEffect(() => {
    // Split by non-word characters but keep them in the array
    // This regex matches sequences of word characters OR punctuation/spaces
    const splitText = content.split(/([^\wàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]+)/g).filter(Boolean);
    setWords(splitText);
  }, [content]);

  // Split content into paragraphs
  const paragraphs = content.split(/\n\n+/);

  const handleWordClick = async (word: string, e: React.MouseEvent) => {
    const cleanWord = word.trim();
    // Only process actual words (containing letters)
    if (!cleanWord || /^[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]+$/.test(cleanWord)) {
      return;
    }

    // Clear any existing close timer
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
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

    // Check cache first
    const normalizedWord = cleanWord.toLowerCase();
    if (translationCache[normalizedWord]) {
      setTranslation(translationCache[normalizedWord]);
      setLoading(false);
      // Auto-close after 1 second
      closeTimerRef.current = setTimeout(() => {
        closeTooltip();
      }, 1000);
      return;
    }

    // Fetch translation from API
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${cleanWord}&langpair=fr|uk`);
      const data = await res.json();
      
      if (data.responseStatus === 200) {
        const translatedText = data.responseData.translatedText;
        setTranslation(translatedText);
        // Add to cache
        setTranslationCache(prev => ({
          ...prev,
          [normalizedWord]: translatedText
        }));
        // Auto-close after 1 second
        closeTimerRef.current = setTimeout(() => {
          closeTooltip();
        }, 1000);
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
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative leading-loose text-2xl md:text-3xl font-serif text-gray-800 dark:text-gray-200">
      {paragraphs.map((paragraph, pIndex) => {
        const paragraphWords = paragraph.split(/([^\wàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]+)/g).filter(Boolean);
        
        return (
          <p key={pIndex} className="mb-6 text-justify indent-8">
            {paragraphWords.map((segment, wIndex) => {
              const isWord = /[a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(segment);
              return isWord ? (
                <span
                  key={`${pIndex}-${wIndex}`}
                  onClick={(e) => handleWordClick(segment, e)}
                  className={`word-interactive inline-block ${selectedWord === segment.trim() ? 'word-active' : ''}`}
                >
                  {segment}
                </span>
              ) : (
                <span key={`${pIndex}-${wIndex}`}>{segment}</span>
              );
            })}
          </p>
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
              transform: 'translateX(-50%)',
              zIndex: 9999
            }}
            className="tooltip-container pointer-events-none" // pointer-events-none for positioning wrapper
          >
             {/* Actual tooltip content with pointer events enabled */}
            <div 
              style={{
                backgroundColor: 'rgb(255, 255, 255)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
              }}
              className="pointer-events-auto dark:!bg-slate-900 rounded-lg border-4 border-danube-500 dark:border-danube-400 p-6 min-w-[280px] relative -translate-x-1/2"
            >
              <button 
                onClick={closeTooltip}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-full p-1"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b-2 border-gray-200 dark:border-slate-600 pb-2 mb-1">
                  <span className="font-bold text-danube-700 dark:text-danube-300 capitalize text-lg">{selectedWord}</span>
                  <button 
                    onClick={() => speak(selectedWord!)}
                    className="p-1.5 hover:bg-danube-100 dark:hover:bg-slate-600 rounded-full text-danube-600 dark:text-danube-400 transition-colors"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                
                <div style={{ backgroundColor: 'rgb(249, 250, 251)' }} className="dark:!bg-slate-950 p-4 rounded-md">
                  <div className="text-xl font-bold" style={{ color: 'rgb(17, 24, 39)' }}>
                    {loading ? (
                      <span className="animate-pulse" style={{ color: 'rgb(107, 114, 128)' }}>Translating...</span>
                    ) : (
                      <span className="dark:text-white">{translation || error || "No translation found"}</span>
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