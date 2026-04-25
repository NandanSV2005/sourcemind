"use client";

import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, Loader2, CheckCircle2, XCircle, ChevronRight, RotateCcw, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Question {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizData {
  title: string;
  questions: Question[];
}

interface QuizTabProps {
  notebookId: string;
  quiz: QuizData | null;
  setQuiz: (quiz: QuizData | null) => void;
}

export default function QuizTab({ notebookId, quiz, setQuiz }: QuizTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState(10);
  
  // Game State
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setIsFinished(false);
    setCurrentStep(0);
    setScore(0);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: notebookId, difficulty, question_count: count })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to generate quiz');
      setQuiz({ title: result.title, questions: result.questions });
      toast.success('Quiz is ready! Good luck.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === quiz?.questions[currentStep].correct_index) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-bg overflow-hidden">
      {isLoading ? (
        <div className="text-center space-y-6">
          <Loader2 size={48} className="text-accent animate-spin mx-auto" />
          <p className="text-lg font-heading italic text-text-secondary">Drafting your examination paper...</p>
        </div>
      ) : isFinished && quiz ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-surface-2 border border-border rounded-[2.5rem] p-12 text-center shadow-2xl"
        >
          <BarChart3 size={64} className="mx-auto mb-6 text-accent" />
          <h2 className="text-4xl font-heading font-bold mb-2">Quiz Complete!</h2>
          <p className="text-text-secondary mb-12">{quiz.title}</p>
          
          <div className="flex items-center justify-center gap-12 mb-12">
            <div className="text-center">
              <p className="text-5xl font-bold text-accent mb-2">{score}</p>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Score</p>
            </div>
            <div className="w-px h-16 bg-border" />
            <div className="text-center">
              <p className="text-5xl font-bold text-text-primary mb-2">
                {Math.round((score / quiz.questions.length) * 100)}%
              </p>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Accuracy</p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 px-12 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 active:scale-95 shadow-xl transition-all w-full mb-4"
          >
            <RotateCcw size={18} />
            Try Another Quiz
          </button>
        </motion.div>
      ) : quiz ? (
        <div className="w-full max-w-3xl flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-1">{quiz.title}</h3>
              <p className="text-text-secondary text-xs">Question {currentStep + 1} of {quiz.questions.length}</p>
            </div>
            <div className="w-48 h-2 bg-surface-2 rounded-full overflow-hidden border border-border">
              <motion.div 
                animate={{ width: `${((currentStep + 1) / quiz.questions.length) * 100}%` }}
                className="h-full bg-accent"
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-2 border border-border rounded-[2rem] p-10 shadow-xl"
          >
            <h2 className="text-2xl font-heading font-medium mb-8 leading-relaxed">
              {quiz.questions[currentStep].question}
            </h2>

            <div className="space-y-4">
              {quiz.questions[currentStep].options.map((option, idx) => {
                const isCorrect = idx === quiz.questions[currentStep].correct_index;
                const isSelected = idx === selectedOption;
                
                let stateClass = "border-border hover:border-accent/30 text-text-primary";
                if (isSubmitted) {
                  if (isCorrect) stateClass = "border-green-500 bg-green-500/10 text-green-500";
                  else if (isSelected) stateClass = "border-red-500 bg-red-500/10 text-red-500";
                  else stateClass = "border-border opacity-40 text-text-secondary";
                } else if (isSelected) {
                  stateClass = "border-accent bg-accent/10 text-accent";
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 rounded-2xl border text-left text-sm transition-all group",
                      stateClass
                    )}
                  >
                    <span className="flex-1">{option}</span>
                    {isSubmitted && isCorrect && <CheckCircle2 size={20} className="text-green-500" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                    {!isSubmitted && (
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all",
                        isSelected ? "border-accent bg-accent" : "border-border group-hover:border-accent/30"
                      )}>
                        {isSelected && <div className="w-full h-full flex items-center justify-center text-[8px] text-black font-bold">✓</div>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation / Action */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 pt-8 border-t border-border"
                >
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Explanation</p>
                  <p className="text-sm text-text-primary/80 leading-relaxed italic">
                    {quiz.questions[currentStep].explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    className="mt-8 flex items-center justify-center gap-2 px-10 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 transition-all ml-auto"
                  >
                    {currentStep < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSubmitted && (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmit}
                className="mt-8 flex items-center justify-center gap-2 px-10 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all ml-auto"
              >
                Submit Answer
              </button>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-surface-2 border border-border rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck size={40} className="text-text-secondary" />
          </div>
          <h2 className="text-4xl font-heading font-bold text-text-primary">Knowledge Assessment</h2>
          <p className="text-text-secondary mb-8">Generate a custom quiz from your research to validate your mastery of the subject.</p>
          
          <div className="flex flex-col gap-6 items-center">
            <div className="w-full grid grid-cols-3 gap-3 bg-surface-2 p-2 rounded-2xl border border-border">
              {['easy', 'medium', 'hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d as any)}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                    difficulty === d ? "bg-accent text-black" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="w-full flex items-center gap-4 bg-surface-2 p-2 rounded-2xl border border-border overflow-x-auto scrollbar-hide">
              <span className="text-xs font-bold text-text-secondary px-3 shrink-0">QUESTIONS:</span>
              {[5, 10, 15, 20, 25].map(n => (
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
              className="flex items-center justify-center gap-2 px-8 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 active:scale-95 shadow-xl transition-all w-full"
            >
              <Sparkles size={18} />
              Generate Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

