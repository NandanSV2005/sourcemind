"use client";

import React, { useState } from 'react';
import { CreditCard, Sparkles, Loader2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface FlashcardsTabProps {
  notebookId: string;
  cards: Flashcard[];
  setCards: (cards: Flashcard[]) => void;
}

export default function FlashcardsTab({ notebookId, cards, setCards }: FlashcardsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [count, setCount] = useState(12);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: notebookId, count })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to generate flashcards');
      setCards(result);
      setCurrentIndex(0);
      setIsFlipped(false);
      toast.success('Study set ready!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-bg overflow-hidden">
      {cards.length > 0 && !isLoading ? (
        <div className="w-full max-w-2xl flex flex-col items-center gap-12">
          {/* Progress Header */}
          <div className="flex items-center justify-between w-full">
            <h3 className="text-2xl font-heading font-bold text-accent">Active Recall</h3>
            <div className="px-4 py-1.5 bg-surface-2 border border-border rounded-full text-xs font-bold tracking-widest text-text-secondary">
              CARD {currentIndex + 1} OF {cards.length}
            </div>
          </div>

          {/* 3D Card Container */}
          <div className="relative w-full aspect-[1.6/1] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative w-full h-full preserve-3d"
            >
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden bg-surface-2 border border-border rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                <span className={cn(
                  "absolute top-8 right-8 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  cards[currentIndex].difficulty === 'easy' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                  cards[currentIndex].difficulty === 'medium' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                  "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                  {cards[currentIndex].difficulty}
                </span>
                <p className="text-2xl font-heading leading-relaxed text-text-primary">
                  {cards[currentIndex].question}
                </p>
                <p className="mt-8 text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em] animate-pulse">Click to Reveal Answer</p>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden bg-accent border border-accent/20 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180">
                <p className="text-xl font-medium leading-relaxed text-black">
                  {cards[currentIndex].answer}
                </p>
                <p className="mt-8 text-[10px] text-black/50 font-bold uppercase tracking-[0.2em]">Click to view Question</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => { e.stopPropagation(); prevCard(); }}
              className="p-4 bg-surface-2 border border-border rounded-2xl hover:border-accent/50 hover:text-accent transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
              className="flex items-center gap-2 px-8 py-4 border border-border hover:bg-surface-2 rounded-2xl text-sm font-bold transition-all"
            >
              <RotateCcw size={18} />
              Regenerate Set
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextCard(); }}
              className="p-4 bg-surface-2 border border-border rounded-2xl hover:border-accent/50 hover:text-accent transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center max-w-md">
          {isLoading ? (
            <div className="space-y-6">
              <Loader2 size={48} className="text-accent animate-spin mx-auto" />
              <p className="text-lg font-heading italic text-text-secondary">Encoding your knowledge into flashcards...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="w-20 h-20 bg-surface-2 border border-border rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CreditCard size={40} className="text-text-secondary" />
              </div>
              <h2 className="text-4xl font-heading font-bold text-text-primary">Master Your Material</h2>
              <p className="text-text-secondary">Convert your research into a deck of high-intensity flashcards for active recall.</p>
              
              <div className="flex flex-col gap-4 items-center">
                <div className="flex items-center gap-4 bg-surface-2 p-2 rounded-2xl border border-border">
                  <span className="text-xs font-bold text-text-secondary px-3">COUNT:</span>
                  {[6, 12, 18, 24, 30].map(n => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        count === n ? "bg-accent text-black" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-8 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 active:scale-95 shadow-xl transition-all w-full"
                >
                  <Sparkles size={18} />
                  Generate Study Set
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Global CSS for 3D flip */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

