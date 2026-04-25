"use client";

import React, { useState } from 'react';
import { Share2, Sparkles, Loader2, Minus, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface MindNode {
  title: string;
  children: MindNode[];
}

interface MindMapData {
  root: string;
  nodes: MindNode[];
}

interface MindMapTabProps {
  notebookId: string;
  data: MindMapData | null;
  setData: (data: MindMapData | null) => void;
}

export default function MindMapTab({ notebookId, data, setData }: MindMapTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mindmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: notebookId })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to generate mind map');
      setData(result.data);
      toast.success('Mind map generated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full bg-bg overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

      {/* Controls */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-4">
        <div className="bg-surface/50 backdrop-blur-xl border border-border p-1.5 rounded-2xl flex flex-col gap-1 shadow-2xl">
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            className="p-2 hover:bg-surface-2 rounded-xl text-text-secondary hover:text-accent transition-all active:scale-90"
          >
            <Plus size={18} />
          </button>
          <div className="h-px bg-border mx-2" />
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
            className="p-2 hover:bg-surface-2 rounded-xl text-text-secondary hover:text-accent transition-all active:scale-90"
          >
            <Minus size={18} />
          </button>
        </div>
        
        {!data && !isLoading && (
          <button
            onClick={handleGenerate}
            className="group/btn flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold rounded-xl hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,77,0,0.3)] transition-all"
          >
            <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" />
            Generate Map
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className="h-full w-full overflow-auto p-40 flex">
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="m-auto min-w-max flex flex-col items-center origin-center"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-6 mt-20">
              <div className="relative">
                <div className="absolute inset-0 bg-accent rounded-full blur-2xl opacity-20 animate-pulse" />
                <Loader2 size={48} className="text-accent animate-spin relative z-10" />
              </div>
              <p className="text-text-secondary text-sm font-bold uppercase tracking-widest animate-pulse">Synthesizing Logic...</p>
            </div>
          ) : data ? (
            <div className="relative">
              <TreeNode node={{ title: data.root, children: data.nodes }} isRoot level={0} />
            </div>
          ) : (
            <div className="text-center opacity-40 max-w-sm">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl" />
                <Share2 size={64} className="relative z-10 text-text-secondary animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3 text-text-primary">Knowledge Web</h3>
              <p className="text-sm leading-relaxed">Let AI map out your research. See connections, discover hierarchies, and visualize the big picture.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function TreeNode({ node, isRoot = false, level = 0 }: { node: MindNode; isRoot?: boolean; level: number }) {
  const [isExpanded, setIsExpanded] = useState(isRoot);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <motion.div layout className="flex items-center">
      {/* Node Box + Expand Button */}
      <motion.div layout className="flex items-center relative z-10">
        <motion.div
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "px-4 py-2.5 rounded-lg border border-white/5 shadow-md whitespace-nowrap transition-colors",
            isRoot 
              ? "bg-[#45475a] text-white font-medium" 
              : "bg-[#3b3d54] text-gray-200 text-sm hover:bg-[#434560]"
          )}
        >
          {node.title}
        </motion.div>
        
        {hasChildren && (
          <motion.button 
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 w-6 h-6 rounded-full bg-[#3b3d54] border border-white/5 flex items-center justify-center text-[10px] text-gray-300 hover:bg-[#4a4d6a] hover:text-white transition-colors z-20"
          >
            {isExpanded ? '<' : '>'}
          </motion.button>
        )}
      </motion.div>

      {/* Children Container */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            layout
            initial={{ opacity: 0, scaleX: 0, originX: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scaleX: 1, originX: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scaleX: 0, originX: 0, filter: 'blur(4px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col justify-center ml-8 relative py-2 gap-4"
          >
            {/* The main horizontal line coming out of the parent's button */}
            <div className="absolute -left-8 top-1/2 w-4 border-t-2 border-[#8b8df1]/70" />

            {node.children.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === node.children.length - 1;
              const isOnly = node.children.length === 1;

              return (
                <motion.div layout key={idx} className="relative flex items-center">
                  {/* Connectors to children */}
                  {!isOnly && (
                    <div 
                      className={cn(
                        "absolute -left-4 w-4 border-[#8b8df1]/70 z-0",
                        isFirst ? "top-1/2 bottom-[-16px] border-l-2 border-t-2 rounded-tl-xl" :
                        isLast ? "top-[-16px] bottom-1/2 border-l-2 border-b-2 rounded-bl-xl" :
                        "top-[-16px] bottom-[-16px] border-l-2",
                        !isFirst && !isLast && "after:content-[''] after:absolute after:top-1/2 after:left-0 after:w-full after:border-t-2 after:border-[#8b8df1]/70"
                      )} 
                    />
                  )}
                  {isOnly && (
                    <div className="absolute -left-4 w-4 border-t-2 border-[#8b8df1]/70 z-0" />
                  )}

                  <TreeNode node={child} level={level + 1} />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

