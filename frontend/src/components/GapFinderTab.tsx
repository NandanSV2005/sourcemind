"use client";

import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GapResult {
  well_covered: { topic: string; confidence: string; evidence: string }[];
  contradictions: { topic: string; doc_a_claim: string; doc_b_claim: string; severity: string }[];
  unanswered_questions: { question: string; why_it_matters: string; suggested_sources: string }[];
  research_verdict: string;
}

interface GapFinderTabProps {
  notebookId: string;
}

export default function GapFinderTab({ notebookId }: GapFinderTabProps) {
  const [result, setResult] = useState<GapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindGaps = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: notebookId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to find gaps');

      setResult(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold mb-2">Gap Finder</h2>
          <p className="text-text-secondary text-sm">Identify blind spots, contradictions, and unanswered questions in your research.</p>
        </div>
        {!isLoading && (
          <button
            onClick={handleFindGaps}
            className="group relative flex items-center gap-2 px-8 py-3 bg-accent text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Search size={18} className="relative z-10" />
            <span className="relative z-10">Find Gaps</span>
            <div className="absolute inset-0 animate-pulse bg-accent/30 rounded-xl" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-32 bg-surface-2 rounded animate-pulse" />
              <div className="h-48 bg-surface-2 rounded-3xl animate-shimmer" />
              <div className="h-48 bg-surface-2 rounded-3xl animate-shimmer" />
            </div>
          ))}
        </div>
      )}

      {result && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Well Covered */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-success px-2">
                <CheckCircle2 size={18} />
                <h3 className="font-bold text-xs uppercase tracking-widest">Well Covered</h3>
              </div>
              <div className="space-y-4">
                {result.well_covered.map((wc, i) => (
                  <motion.div key={i} variants={item} className="p-5 bg-surface-2 border border-border rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-text-primary">{wc.topic}</h4>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase",
                        wc.confidence === 'high' ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                      )}>
                        {wc.confidence}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{wc.evidence}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contradictions */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-danger px-2">
                <AlertCircle size={18} />
                <h3 className="font-bold text-xs uppercase tracking-widest">Contradictions</h3>
              </div>
              <div className="space-y-4">
                {result.contradictions.length > 0 ? result.contradictions.map((c, i) => (
                  <motion.div key={i} variants={item} className="p-5 bg-surface-2 border border-border rounded-2xl border-l-4 border-l-danger">
                    <h4 className="font-bold text-sm text-text-primary mb-3">{c.topic}</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="text-[10px] p-2 bg-bg rounded-lg border border-border">
                        <span className="text-text-secondary block mb-1">Source A Claims:</span>
                        {c.doc_a_claim}
                      </div>
                      <div className="text-[10px] p-2 bg-bg rounded-lg border border-border">
                        <span className="text-text-secondary block mb-1">Source B Claims:</span>
                        {c.doc_b_claim}
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-8 border-2 border-dashed border-border rounded-2xl text-center opacity-40">
                    <CheckCircle2 size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-medium">No contradictions detected ✓</p>
                  </div>
                )}
              </div>
            </div>

            {/* Unanswered */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-info px-2">
                <HelpCircle size={18} />
                <h3 className="font-bold text-xs uppercase tracking-widest">Unanswered Questions</h3>
              </div>
              <div className="space-y-4">
                {result.unanswered_questions.map((q, i) => (
                  <motion.div key={i} variants={item} className="p-5 bg-surface-2 border border-border rounded-2xl">
                    <h4 className="font-bold text-sm text-text-primary mb-2 italic">"{q.question}"</h4>
                    <p className="text-xs text-text-secondary mb-3">{q.why_it_matters}</p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border mt-3">
                      <div className="w-6 h-6 rounded bg-info/10 flex items-center justify-center text-info">
                        <Search size={12} />
                      </div>
                      <span className="text-[10px] text-info font-bold uppercase">{q.suggested_sources}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div variants={item} className="p-8 bg-gradient-to-br from-surface to-surface-2 border border-accent/20 rounded-3xl">
            <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <ArrowRight className="text-accent" />
              Research Verdict
            </h3>
            <p className="text-text-primary leading-relaxed">{result.research_verdict}</p>
          </motion.div>
        </motion.div>
      )}

      {!result && !isLoading && (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl opacity-50">
          <Search size={48} className="mb-4 text-text-secondary" />
          <p className="text-sm font-medium">Click Find Gaps to analyze your research completeness</p>
        </div>
      )}
    </div>
  );
}

import { cn } from '@/lib/utils';
