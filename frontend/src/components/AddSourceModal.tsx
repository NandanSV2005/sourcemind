"use client";

import React, { useState } from 'react';
import { X, Upload, Globe, Type, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  onSuccess: (source: any) => void;
}

type Tab = 'pdf' | 'url' | 'text';

export default function AddSourceModal({ isOpen, onClose, notebookId, onSuccess }: AddSourceModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form states
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(10);

    try {
      console.log(`[Upload Form] Attempting upload for Notebook: ${notebookId}`);
      const formData = new FormData();
      formData.append('notebook_id', notebookId);
      formData.append('type', activeTab);
      
      if (activeTab === 'pdf') {
        if (!file) throw new Error('Please select a PDF file');
        formData.append('file', file);
        formData.append('title', title || file.name);
      } else if (activeTab === 'url') {
        if (!url) throw new Error('Please enter a URL');
        formData.append('url', url);
        formData.append('title', title);
      } else {
        if (!text) throw new Error('Please enter some text');
        formData.append('content', text);
        formData.append('title', title || 'Untitled Text');
      }

      setProgress(40);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log(`[Upload Form] Server Response:`, data);
      
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setProgress(100);
      toast.success('Source added successfully');
      onSuccess(data);
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setUrl('');
    setText('');
    setTitle('');
    setFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Progress Bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 h-1 bg-accent transition-all duration-500 z-10" style={{ width: `${progress}%` }} />
        )}

        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-heading font-bold">Add Source</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-2">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border">
          {[
            { id: 'pdf', label: 'PDF Upload', icon: Upload },
            { id: 'url', label: 'Web URL', icon: Globe },
            { id: 'text', label: 'Paste Text', icon: Type },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === tab.id ? "text-accent bg-accent/5 border-b-2 border-accent" : "text-text-secondary hover:bg-surface-2"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Source Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your source a name"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent text-sm"
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'pdf' && (
              <motion.div
                key="pdf"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="relative border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center transition-colors hover:border-accent/50 group overflow-hidden">
                  <input
                    required
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      if (selectedFile && !title) setTitle(selectedFile.name.replace('.pdf', ''));
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                    <Upload size={24} className="text-text-secondary group-hover:text-accent" />
                  </div>
                  <p className="text-sm text-text-primary font-medium mb-1 relative z-10">
                    {file ? file.name : 'Select PDF file'}
                  </p>
                  <p className="text-[10px] text-text-secondary uppercase relative z-10">Max file size: 50MB</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'url' && (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase px-1">URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent text-sm"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Content</label>
                  <textarea
                    rows={8}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text research here..."
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent text-sm resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-accent text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing AI Embeddings...</span>
              </>
            ) : (
              <span>Add to Research Library</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

