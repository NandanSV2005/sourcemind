"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, FileText, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface SummaryTabProps {
  notebookId: string;
  summary: string | null;
  setSummary: (val: string | null) => void;
  docsIncluded: { id: string, title: string }[];
  setDocsIncluded: (val: { id: string, title: string }[]) => void;
}

export default function SummaryTab({ 
  notebookId, 
  summary, 
  setSummary, 
  docsIncluded, 
  setDocsIncluded 
}: SummaryTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setSummary(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: notebookId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate summary');

      setSummary(data.summary);
      setDocsIncluded(data.documents_included);
      toast.success('Summary generated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold mb-2">Auto Summary</h2>
          <p className="text-text-secondary text-sm">Synthesize all your sources into a structured research briefing.</p>
        </div>
        {!summary && !isLoading && (
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles size={18} />
            Generate Summary
          </button>
        )}
        {summary && !isLoading && (
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw size={14} />
            Regenerate
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-48 bg-surface-2 rounded-lg animate-shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-surface-2 rounded animate-shimmer" />
                <div className="h-4 w-full bg-surface-2 rounded animate-shimmer" />
                <div className="h-4 w-2/3 bg-surface-2 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/30 border border-border rounded-3xl p-8 backdrop-blur-sm"
        >
          <div className="prose prose-invert prose-headings:font-heading prose-headings:text-accent prose-h2:text-2xl prose-h2:mb-4 prose-p:text-text-primary/90 max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">Sources Included</h4>
            <div className="flex flex-wrap gap-2">
              {docsIncluded.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs">
                  <FileText size={12} className="text-accent" />
                  {doc.title}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!summary && !isLoading && (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl opacity-50">
          <Sparkles size={48} className="mb-4 text-text-secondary" />
          <p className="text-sm font-medium">Click generate to analyze your research library</p>
        </div>
      )}
    </div>
  );
}
