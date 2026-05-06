"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: any[];
  onSelect: (item: any) => void;
  renderItem?: (item: any) => React.ReactNode;
}

export default function HistoryModal({ 
  isOpen, 
  onClose, 
  title, 
  items, 
  onSelect,
  renderItem
}: HistoryModalProps) {
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-2/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold">{title}</h3>
              <p className="text-xs text-text-secondary">Select a previous version to load</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-3 rounded-full text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-12 text-center text-text-secondary opacity-50">
              <Clock size={40} className="mx-auto mb-4" />
              <p>No history found yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group flex items-center justify-between p-4 bg-surface-2 border border-border rounded-2xl hover:border-accent/50 hover:bg-surface-3 transition-all text-left"
                >
                  <div className="flex-1 min-w-0">
                    {renderItem ? renderItem(item) : (
                      <>
                        <p className="text-sm font-bold text-text-primary mb-1 truncate">
                          {item.title || `Version ${items.length - idx}`}
                        </p>
                        <p className="text-[10px] text-text-secondary font-mono">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-text-secondary group-hover:text-accent transition-colors shrink-0 ml-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
