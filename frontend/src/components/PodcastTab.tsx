"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  Copy, 
  RefreshCw, 
  Clock, 
  ChevronRight,
  User,
  Radio,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface PodcastChapter {
  title: string;
  timestamp: string;
}

interface PodcastData {
  title: string;
  estimated_minutes: number;
  script: string;
  chapters: PodcastChapter[];
}

interface PodcastTabProps {
  notebookId: string;
}

export default function PodcastTab({ notebookId }: PodcastTabProps) {
  const [duration, setDuration] = useState('medium');
  const [tone, setTone] = useState('casual');
  const [isLoading, setIsLoading] = useState(false);
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!synth) return;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      // Default to a natural sounding English voice if possible
      const preferred = availableVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                        availableVoices.find(v => v.lang.startsWith('en')) || 
                        availableVoices[0];
      setCurrentVoice(preferred);
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setPodcast(null);
    if (synth) synth.cancel();
    setIsPlaying(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/podcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: notebookId, duration, tone })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate podcast');

      setPodcast(data);
      toast.success('Podcast generated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!synth || !podcast) return;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        const utterance = new SpeechSynthesisUtterance(podcast.script);
        if (currentVoice) utterance.voice = currentVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        utteranceRef.current = utterance;
        synth.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
    }
  };

  const copyScript = () => {
    if (podcast) {
      navigator.clipboard.writeText(podcast.script);
      toast.success('Script copied to clipboard');
    }
  };

  const parseScriptLines = (script: string) => {
    // Split by lines and look for HOST: or CO-HOST: prefixes
    return script.split('\n').filter(line => line.trim() !== '').map((line, i) => {
      const isHost = line.toUpperCase().startsWith('HOST:');
      const isCoHost = line.toUpperCase().startsWith('CO-HOST:');
      
      let text = line;
      if (isHost) text = line.replace(/^HOST:\s*/i, '');
      if (isCoHost) text = line.replace(/^CO-HOST:\s*/i, '');

      return {
        id: i,
        role: isHost ? 'HOST' : (isCoHost ? 'CO-HOST' : 'NARRATOR'),
        text
      };
    });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - Settings & Chapters */}
      <div className="w-80 border-r border-border bg-surface/10 p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Podcast Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-text-secondary ml-1">Duration</label>
              <div className="relative">
                <select 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                >
                  <option value="short">Short (3-5 min)</option>
                  <option value="medium">Medium (6-10 min)</option>
                  <option value="long">Long (12-18 min)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-secondary ml-1">Tone</label>
              <div className="relative">
                <select 
                  value={tone} 
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                >
                  <option value="casual">Casual & Fun</option>
                  <option value="professional">Professional</option>
                  <option value="funny">Entertaining / Funny</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
            {voices.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-text-secondary ml-1 flex items-center gap-1">
                  <Volume2 size={12} /> Playback Voice
                </label>
                <div className="relative">
                  <select 
                    value={currentVoice?.name || ''} 
                    onChange={(e) => {
                      const v = voices.find(v => v.name === e.target.value);
                      if (v) setCurrentVoice(v);
                    }}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    {voices.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all mt-2"
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Mic size={18} />}
              {podcast ? 'Regenerate' : 'Generate Podcast'}
            </button>
          </div>
        </div>

        {podcast && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Chapters</h3>
            <div className="space-y-2">
              {podcast.chapters.map((chapter, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-surface-2/50 border border-border rounded-xl hover:border-accent/50 transition-colors cursor-default group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-accent group-hover:bg-accent group-hover:text-black transition-colors">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-medium truncate w-40">{chapter.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary">{chapter.timestamp}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-bg">
        {isLoading ? (
          <div className="flex-1 p-12 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="space-y-4">
                <div className="h-10 w-2/3 bg-surface-2 rounded-xl animate-shimmer" />
                <div className="h-4 w-32 bg-surface-2 rounded-lg animate-shimmer" />
              </div>
              <div className="space-y-8">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={cn("flex gap-4", i % 2 === 0 ? "flex-row-reverse" : "")}>
                    <div className="w-10 h-10 rounded-full bg-surface-2 animate-shimmer shrink-0" />
                    <div className={cn("space-y-2 max-w-[80%]", i % 2 === 0 ? "items-end" : "")}>
                      <div className="h-4 w-24 bg-surface-2 rounded animate-shimmer" />
                      <div className="h-20 w-full bg-surface-2 rounded-2xl animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : podcast ? (
          <>
            {/* Podcast Header */}
            <div className="px-12 py-8 border-b border-border bg-surface/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent ring-1 ring-accent/30">
                  <Radio size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-1">{podcast.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {podcast.estimated_minutes} minutes</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="uppercase tracking-wider">{tone} tone</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={copyScript}
                  className="p-3 bg-surface-2 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
                  title="Copy Script"
                >
                  <Copy size={18} />
                </button>
                <div className="h-8 w-px bg-border mx-1" />
                <button 
                  onClick={stopPlayback}
                  className="p-3 bg-surface-2 border border-border rounded-xl text-text-secondary hover:text-red-500 hover:border-red-500/50 transition-all"
                  title="Stop"
                >
                  <Square size={18} fill="currentColor" />
                </button>
                <button 
                  onClick={togglePlayback}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all",
                    isPlaying 
                      ? "bg-surface-2 text-accent border border-accent/30" 
                      : "bg-accent text-black hover:scale-105 active:scale-95"
                  )}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  {isPlaying ? 'Pause Audio' : 'Listen Now'}
                </button>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto p-12">
              <div className="max-w-3xl mx-auto space-y-8">
                {parseScriptLines(podcast.script).map((line) => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: line.id * 0.05 }}
                    className={cn(
                      "flex gap-4 group",
                      line.role === 'CO-HOST' ? "flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1",
                      line.role === 'HOST' ? "bg-accent text-black" : 
                      line.role === 'CO-HOST' ? "bg-surface-2 text-text-primary border border-border" : 
                      "bg-surface-3 text-text-secondary"
                    )}>
                      {line.role === 'HOST' ? <User size={20} /> : 
                       line.role === 'CO-HOST' ? <User size={20} /> : <Radio size={18} />}
                    </div>
                    <div className={cn(
                      "flex flex-col gap-1.5 max-w-[85%]",
                      line.role === 'CO-HOST' ? "items-end text-right" : ""
                    )}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1">
                        {line.role}
                      </span>
                      <div className={cn(
                        "p-5 rounded-2xl text-sm leading-relaxed",
                        line.role === 'HOST' ? "bg-surface-2 border border-border text-text-primary" : 
                        line.role === 'CO-HOST' ? "bg-accent/5 border border-accent/20 text-text-primary" : 
                        "bg-surface/5 italic text-text-secondary"
                      )}>
                        {line.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
            <div className="w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center mb-6">
              <Mic size={40} className="text-text-secondary" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">SourceMind Studio</h2>
            <p className="max-w-md text-text-secondary text-sm">
              Generate an engaging podcast-style explanation of your research. 
              Our AI hosts will break down your documents into a conversational episode.
            </p>
            <button
              onClick={handleGenerate}
              className="mt-8 flex items-center gap-2 px-8 py-4 bg-surface-2 border border-border rounded-2xl hover:border-accent hover:text-accent transition-all font-bold"
            >
              <Mic size={18} />
              Start Studio Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
