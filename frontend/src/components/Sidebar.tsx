"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, FileText, Globe, Type, ChevronLeft, ChevronRight, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  title: string;
  source_type: 'pdf' | 'url' | 'text';
}

interface SidebarProps {
  notebookTitle: string;
  onUpdateNotebookTitle: (title: string) => void;
  sources: Source[];
  onAddSource: () => void;
  onDeleteSource: (id: string) => void;
  selectedSourceId?: string;
  onSelectSource: (id: string) => void;
  notebookId: string;
}

export default function Sidebar({
  notebookTitle,
  onUpdateNotebookTitle,
  sources,
  onAddSource,
  onDeleteSource,
  selectedSourceId,
  selectedSourceId,
  onSelectSource,
  notebookId
}: SidebarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(notebookTitle);

  const handleTitleSubmit = () => {
    onUpdateNotebookTitle(tempTitle);
    setIsEditingTitle(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={16} />;
      case 'url': return <Globe size={16} />;
      default: return <Type size={16} />;
    }
  };

  return (
    <div className="w-[280px] h-screen bg-surface border-r border-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 mb-6 group hover:opacity-80 transition-opacity">
          <img src="/favicon.png" alt="SourceMind Logo" className="w-8 h-8 rounded-lg object-cover group-hover:scale-105 transition-transform shadow-lg" />
          <h1 className="text-xl font-heading font-bold tracking-tight text-text-primary">SourceMind</h1>
        </Link>

        <div className="group relative">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="bg-surface-2 border border-accent/50 rounded px-2 py-1 text-sm w-full outline-none focus:border-accent"
              />
              <button onClick={handleTitleSubmit} className="text-accent">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <h2 className="text-sm font-medium text-text-secondary truncate pr-4">{notebookTitle}</h2>
              <button 
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-accent"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Sources</span>
          <span className="text-[10px] text-text-secondary">{sources.length} total</span>
        </div>

        <AnimatePresence initial={false}>
          {sources.map((source) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                selectedSourceId === source.id 
                  ? "bg-accent/10 border-accent/20 text-accent" 
                  : "hover:bg-surface-2 text-text-primary"
              )}
              onClick={() => onSelectSource(source.id)}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                selectedSourceId === source.id ? "bg-accent/20" : "bg-surface-2"
              )}>
                {getIcon(source.source_type)}
              </div>
              <span className="text-sm truncate pr-6">{source.title}</span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSource(source.id);
                }}
                className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {sources.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-text-secondary">
              <FileText size={20} />
            </div>
            <p className="text-xs text-text-secondary">No sources yet. Upload one to begin.</p>
          </div>
        )}
      </div>

      {/* Add Source Button */}
      <div className="p-4 space-y-2">
        <button
          onClick={onAddSource}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-black font-bold rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Add Source</span>
        </button>

        <button
          onClick={async () => {
            const { supabase } = await import('@/lib/supabase');
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
          className="w-full py-2 text-[10px] text-text-secondary hover:text-danger font-bold uppercase tracking-widest transition-colors"
        >
          Log Out
        </button>
        <div className="pt-2 text-[8px] text-text-secondary opacity-20 font-mono truncate text-center">
          NB: {notebookId}
        </div>
      </div>
    </div>
  );
}
