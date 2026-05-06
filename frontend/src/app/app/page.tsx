"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatTab from '@/components/ChatTab';
import SummaryTab from '@/components/SummaryTab';
import CompareTab from '@/components/CompareTab';
import GapFinderTab from '@/components/GapFinderTab';
import MindMapTab from '@/components/MindMapTab';
import FlashcardsTab from '@/components/FlashcardsTab';
import QuizTab from '@/components/QuizTab';
import PodcastTab from '@/components/PodcastTab';
import AddSourceModal from '@/components/AddSourceModal';
import Login from '@/components/Login';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { MessageSquare, FileText, Columns, Search, Loader2, Share2, CreditCard, ClipboardCheck, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'chat' | 'summary' | 'compare' | 'gaps' | 'mindmap' | 'flashcards' | 'quiz' | 'podcast';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [notebook, setNotebook] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to store the active ID to avoid closures issues
  const notebookIdRef = useRef<string | null>(null);

  // Catch global errors
  useEffect(() => {
    const handleError = (e: ErrorEvent) => setError(e.message);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Persistent State for Tabs
  const [messages, setMessages] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [docsIncluded, setDocsIncluded] = useState<any[]>([]);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  
  // Memory History State
  const [summariesHistory, setSummariesHistory] = useState<any[]>([]);
  const [comparisonsHistory, setComparisonsHistory] = useState<any[]>([]);
  const [gapsHistory, setGapsHistory] = useState<any[]>([]);
  const [podcastsHistory, setPodcastsHistory] = useState<any[]>([]);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);

  // For this version, we'll use a fixed notebook ID or create one if none exists
  // In a real app, this would come from a URL param or list
  const NOTEBOOK_ID = '00000000-0000-0000-0000-000000000000'; // Placeholder or initial

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchNotebook();
      else setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchNotebook();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotebook = async () => {
    try {
      console.log('[Notebook] Initializing Cloud Memory...');
      
      // 1. Get user metadata
      const { data: { user } } = await supabase.auth.getUser();
      let savedId = user?.user_metadata?.notebook_id || localStorage.getItem('sourcemind_notebook_id');
      let response;

      if (savedId) {
        console.log(`[Notebook] Found ID in Profile: ${savedId}`);
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notebooks/${savedId}`);
      }

      if (!savedId || !response?.ok) {
        console.log('[Notebook] Creating a new Cloud Notebook...');
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notebooks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'My Research Notebook' })
        });
        
        const data = await response.json();
        
        // Save to Cloud Profile
        await supabase.auth.updateUser({
          data: { notebook_id: data.id }
        });
        
        localStorage.setItem('sourcemind_notebook_id', data.id);
        notebookIdRef.current = data.id;
        setNotebook(data);
        fetchSources(data.id);
      } else {
        const data = await response.json();
        
        // Ensure it's saved in metadata if it was only in localStorage
        if (!user?.user_metadata?.notebook_id) {
          await supabase.auth.updateUser({
            data: { notebook_id: data.id }
          });
        }

        console.log(`[Notebook] Cloud Notebook Loaded: ${data.id}`);
        notebookIdRef.current = data.id;
        setNotebook(data);
        fetchSources(data.id);
      }
    } catch (error) {
      console.error('[Notebook Error]:', error);
      toast.error('Failed to load your research');
    } finally {
      setIsLoading(false);
      if (notebookIdRef.current) fetchMemory(notebookIdRef.current);
    }
  };

  const fetchMemory = async (nbId: string) => {
    setIsMemoryLoading(true);
    try {
      const [memoryRes, summariesRes, gapsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memory/${nbId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memory/${nbId}/summaries`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memory/${nbId}/gaps`)
      ]);

      if (!memoryRes.ok) throw new Error('Failed to fetch memory');
      
      const memoryData = await memoryRes.json();
      const summariesData = await summariesRes.json();
      const gapsData = await gapsRes.json();

      // Update current states with latest memory
      setMessages(memoryData.chat || []);
      setSummary(memoryData.latest_summary?.content || null);
      
      // Update history states
      setSummariesHistory(summariesData || []);
      setComparisonsHistory(memoryData.comparisons || []);
      setPodcastsHistory(memoryData.podcasts || []);
      setGapsHistory(gapsData || []);

      console.log('🧠 [Memory] Persistent workspace loaded');
    } catch (error) {
      console.error('[Memory Error]:', error);
    } finally {
      setIsMemoryLoading(false);
    }
  };

  // Simplified source fetching to prevent clearing on tab switch
  const fetchSources = async (nbId?: string) => {
    const id = nbId || notebookIdRef.current;
    if (!id) {
      console.log('[Sources] No notebook ID found, skipping fetch');
      return;
    }
    
    console.log('🔍 [Sources Radar] Querying documents for Notebook ID:', id);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('notebook_id', id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[Sources Error]:', error);
        toast.error(`Database Error: ${error.message}`);
        return;
      }

      if (data) {
        console.log(`[Sources] Found ${data.length} documents`);
        setSources(data);
      }
    } catch (error: any) {
      console.error('Failed to fetch sources:', error);
      toast.error('Could not connect to database');
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSources(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete source:', error);
    }
  };

  const handleUpdateTitle = async (title: string) => {
    // Note: API for title update not explicitly requested but good for UX
    setNotebook((prev: any) => ({ ...prev, title }));
  };

  if (!session) {
    return <Login />;
  }

  return (
    <main className="flex h-screen bg-bg text-text-primary overflow-hidden">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' }
      }} />
      <Sidebar
        notebookTitle={notebook?.title || 'My Notebook'}
        onUpdateNotebookTitle={handleUpdateTitle}
        sources={sources}
        onAddSource={() => setIsModalOpen(true)}
        onDeleteSource={handleDeleteSource}
        onSelectSource={() => {}} 
        notebookId={notebook?.id || notebookIdRef.current || 'loading...'}
      />

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-bg gap-4">
          <Loader2 size={40} className="text-accent animate-spin" />
          <p className="text-text-secondary font-heading italic">Loading Notebook...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center gap-8 px-8 border-b border-border bg-surface/30 backdrop-blur-md">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'summary', label: 'Summary', icon: FileText },
              { id: 'compare', label: 'Compare', icon: Columns },
              { id: 'gaps', label: 'Gap Finder', icon: Search },
              { id: 'mindmap', label: 'Mind Map', icon: Share2 },
              { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
              { id: 'quiz', label: 'Quiz', icon: ClipboardCheck },
              { id: 'podcast', label: 'Podcast', icon: Mic },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "relative py-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "text-accent" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'chat' && (
                  <ChatTab 
                    notebookId={notebook?.id || ''} 
                    messages={messages} 
                    setMessages={setMessages} 
                  />
                )}
                {activeTab === 'summary' && (
                  <SummaryTab 
                    notebookId={notebook?.id || ''} 
                    summary={summary} 
                    setSummary={setSummary} 
                    docsIncluded={docsIncluded} 
                    setDocsIncluded={setDocsIncluded} 
                    history={summariesHistory}
                    onLoadFromHistory={(item) => setSummary(item.content)}
                  />
                )}
                {activeTab === 'compare' && (
                  <CompareTab 
                    sources={sources} 
                    history={comparisonsHistory} 
                    notebookId={notebook?.id || ''}
                  />
                )}
                {activeTab === 'gaps' && (
                  <GapFinderTab 
                    notebookId={notebook?.id || ''} 
                    history={gapsHistory}
                  />
                )}
                {activeTab === 'mindmap' && (
                  <MindMapTab 
                    notebookId={notebook?.id || ''} 
                    data={mindMapData} 
                    setData={setMindMapData} 
                  />
                )}
                {activeTab === 'flashcards' && (
                  <FlashcardsTab 
                    notebookId={notebook?.id || ''} 
                    cards={flashcards} 
                    setCards={setFlashcards} 
                  />
                )}
                {activeTab === 'quiz' && (
                  <QuizTab 
                    notebookId={notebook?.id || ''} 
                    quiz={quiz} 
                    setQuiz={setQuiz} 
                  />
                )}
                {activeTab === 'podcast' && (
                  <PodcastTab 
                    notebookId={notebook?.id || ''} 
                    history={podcastsHistory}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <AddSourceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            notebookId={notebook?.id || notebookIdRef.current}
            onSuccess={(newDoc) => {
              setSources(prev => [newDoc, ...prev]);
              // Also trigger a background fetch to be safe
              fetchSources(notebook?.id || notebookIdRef.current);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

