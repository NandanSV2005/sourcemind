"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface SourceMetadata {
  id: string;
  document_id: string;
  content: string;
  index: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceMetadata[];
}

interface ChatTabProps {
  notebookId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatTab({ notebookId, messages, setMessages }: ChatTabProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebook_id: notebookId,
          question: input,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Chat failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Process chunk - in a real app you'd parse SSE data: format
        // For now, we'll just append the raw text if it's coming back that way, 
        // or parse it if it's structured.
        
        // Simple heuristic to extract content from data: chunks
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        if (lines.length > 0) {
          for (const line of lines) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              const delta = data.choices[0]?.delta?.content || '';
              fullContent += delta;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = fullContent;
                return newMessages;
              });
            } catch (e) {}
          }
        } else {
          // Fallback for non-SSE formatted chunks
          fullContent += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = fullContent;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
              <Bot size={32} />
            </div>
            <h3 className="text-xl font-heading mb-2">Ask anything about your sources</h3>
            <p className="max-w-xs text-sm">I&apos;ll analyze your documents and provide answers with citations.</p>
          </div>
        )}

        {messages.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-4xl mx-auto",
              message.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
              message.role === 'user' ? "bg-accent/20 text-accent" : "bg-surface-2 text-text-primary"
            )}>
              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={cn(
              "flex flex-col space-y-2",
              message.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === 'user' 
                  ? "bg-surface-2 text-text-primary rounded-tr-none" 
                  : "bg-transparent text-text-primary rounded-tl-none border border-border"
              )}>
                <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                  {message.content}
                </ReactMarkdown>
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.sources.map((source, si) => (
                    <CitationChip key={si} source={source} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center animate-pulse">
              <Bot size={16} />
            </div>
            <div className="flex space-x-1.5 items-center px-4 py-3 bg-surface-2 rounded-2xl rounded-tl-none">
              <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-surface/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about your documents..."
            className="w-full bg-surface-2 border border-border focus:border-accent/50 rounded-2xl px-6 py-4 pr-14 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-accent text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function CitationChip({ source }: { source: SourceMetadata }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1 bg-surface-2 hover:bg-border border border-border rounded-full text-[10px] font-bold text-text-secondary transition-colors"
      >
        <ExternalLink size={10} />
        SOURCE {source.index + 1}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 left-0 w-80 p-4 bg-surface-2 border border-accent/20 rounded-2xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-accent uppercase">Excerpt</span>
              <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary text-[10px]">Close</button>
            </div>
            <p className="text-xs text-text-primary leading-relaxed italic">
              &quot;...{source.content}...&quot;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { cn } from '@/lib/utils';
