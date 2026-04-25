"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Share2, 
  CreditCard, 
  ClipboardCheck, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  FileText,
  Upload,
  Globe,
  Youtube,
  MessageCircle,
  Layers,
  Settings,
  Shield,
  Activity,
  Cloud,
  Brain,
  Key,
  Terminal,
  Wifi,
  Code,
  Share2 as ShareIcon,
  PenTool,
  MousePointer2,
  Database,
  Cpu,
  BrainCircuit,
  ArrowRight,
  Github,
  CheckCircle2,
  Zap,
  Columns,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DemoShowcase = () => {
  const [activeTab, setActiveTab] = React.useState('chat');

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'mindmap', label: 'Mind Map', icon: Share2 },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
    { id: 'quiz', label: 'Quiz', icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap justify-center gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all border",
              activeTab === tab.id 
                ? "bg-accent text-black border-accent shadow-[0_0_20px_rgba(255,77,0,0.3)]" 
                : "bg-surface-2 text-text-secondary border-border hover:border-text-secondary"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-bg border border-border rounded-[40px] p-8 shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex gap-4 max-w-2xl">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary mt-1">
                  <span className="text-[10px] font-bold">YOU</span>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl rounded-tl-none text-sm text-text-primary border border-border">
                  Summarize the key findings from the 2024 Market Report.
                </div>
              </div>
              <div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse text-right">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent mt-1">
                  <Sparkles size={16} />
                </div>
                <div className="bg-transparent p-4 rounded-2xl rounded-tr-none text-sm text-text-primary border border-border">
                  The report highlights a 15% increase in sustainable energy adoption [SOURCE 1] and identifies AI-driven logistics as the primary cost-saving driver [SOURCE 2].
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 justify-end">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-surface-2 border border-border rounded-full text-[10px] font-bold text-text-secondary">
                    <ExternalLink size={10} /> SOURCE {i}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'mindmap' && (
            <motion.div
              key="mindmap"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-[16/9] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full" />
              <div className="relative flex flex-col items-center">
                <div className="px-6 py-3 bg-accent text-black rounded-xl font-bold mb-12 shadow-lg">2024 Market Trends</div>
                <div className="flex gap-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-px h-12 bg-accent/30" />
                    <div className="px-4 py-2 bg-surface-2 border border-border rounded-lg text-xs font-bold">Sustainable Energy</div>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-px h-12 bg-accent/30" />
                    <div className="px-4 py-2 bg-surface-2 border border-border rounded-lg text-xs font-bold">AI Logistics</div>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-px h-12 bg-accent/30" />
                    <div className="px-4 py-2 bg-surface-2 border border-border rounded-lg text-xs font-bold">Cost Reductions</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center"
            >
              <div className="w-64 h-96 bg-gradient-to-br from-surface-2 to-bg border border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl group cursor-pointer hover:border-accent/50 transition-colors">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent mb-6">
                  <CreditCard size={24} />
                </div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">Question</span>
                <p className="text-lg font-bold text-text-primary italic font-heading">"What is the projected ROI for AI logistics by 2026?"</p>
                <div className="mt-8 text-[10px] font-bold text-text-secondary uppercase">Click to Reveal</div>
              </div>
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Question 3 of 10</span>
                <h4 className="text-xl font-bold">Which source mentions context window efficiency?</h4>
              </div>
              <div className="space-y-3">
                {[
                  { label: "A. Whitepaper on RAG", correct: true },
                  { label: "B. 2024 Market Overview", correct: false },
                  { label: "C. Technical Documentation", correct: false },
                ].map((opt, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                    opt.correct ? "bg-accent/10 border-accent/50 text-accent" : "bg-surface-2 border-border hover:border-text-secondary"
                  )}>
                    {opt.label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const interactiveNode = (Icon: any, color: string, className: string, delay: number = 0) => {
    // Generate unique movement parameters for each node to prevent syncing and ensure motion is visible
    const moveX = 25 + Math.random() * 15;
    const moveY = 25 + Math.random() * 15;
    const duration = 8 + Math.random() * 6;

    return (
      <motion.div 
        animate={{ 
          x: [0, moveX, 0, -moveX, 0],
          y: [0, -moveY, -moveY/2, moveY, 0],
          rotate: [0, 5, -5, 0]
        }}
        whileHover={{ 
          scale: 1.3, 
          rotate: [0, -5, 5, 0],
          borderColor: "rgba(255, 77, 0, 0.5)",
          backgroundColor: "rgba(255, 77, 0, 0.1)",
          zIndex: 50,
          boxShadow: "0 0 40px rgba(255, 77, 0, 0.3)"
        }}
        transition={{ 
          duration: duration, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: delay
        }}
        className={cn(
          "absolute w-14 h-14 bg-surface-2 border border-border rounded-2xl flex items-center justify-center shadow-2xl z-10 cursor-pointer transition-all duration-300",
          className,
          color
        )}
      >
        <Icon className="w-6 h-6" />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary selection:bg-accent/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="SourceMind Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-heading font-bold tracking-tight">SourceMind</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Tech', 'Demo'].map((link) => (
              <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">{link}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              <Github size={18} />
              <span>GitHub</span>
            </a>
            <Link href="/app" className="px-5 py-2.5 bg-accent text-black text-sm font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,77,0,0.2)]">Launch App</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/20 rounded-full blur-[120px] -z-10 opacity-50" />
        <div className="absolute top-20 right-[10%] w-[300px] h-[300px] bg-info/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-[10px] font-bold uppercase tracking-widest text-accent mb-8">
              <Sparkles size={12} />
              <span>Next Generation Research Tool</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tight mb-8 bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">Upload Sources.<br /><span className="text-text-primary">Understand Everything.</span></h1>
            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 font-light leading-relaxed">AI-powered document intelligence built for research, learning, and deep analysis. Turn your PDFs, URLs, and texts into a private knowledge brain.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/app" className="group w-full sm:w-auto px-8 py-4 bg-accent text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,77,0,0.3)]">Get Started <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></Link>
              <a href="#demo" className="w-full sm:w-auto px-8 py-4 bg-surface-2 border border-border text-text-primary font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-border transition-all">View Demo</a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-accent/20 rounded-[40px] blur-3xl -z-10 translate-y-12 opacity-30" />
            <div className="bg-surface/50 backdrop-blur-2xl border border-border rounded-[40px] p-2 shadow-2xl overflow-hidden aspect-[16/9]">
              <img src="/hero-mockup.png" alt="SourceMind Interface" className="w-full h-full object-cover rounded-[32px]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8">Simple Workflow.<br />Powerful Results.</h2>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Upload Sources", desc: "Drag and drop PDFs or paste URLs. SourceMind handles the rest." },
                  { step: "02", title: "AI Processing", desc: "We chunk, embed, and index your content into a high-speed vector database." },
                  { step: "03", title: "Extract Insights", desc: "Chat, summarize, and compare. Get cited answers in seconds." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-2xl font-heading font-bold text-accent/40">{s.step}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                      <p className="text-text-secondary text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-[40px] blur-3xl -z-10 translate-x-12 opacity-20" />
              <div className="bg-surface border border-border rounded-[40px] p-8 aspect-square flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* Orbiting Rings */}
                  {[95, 80, 65, 50, 35].map((size, i) => (
                    <motion.div 
                      key={i}
                      animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                      transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "linear" }}
                      className={cn(
                        "absolute border border-border/10 rounded-full",
                        i === 0 && "border-accent/5",
                        i === 1 && "border-info/5",
                        i === 2 && "border-success/5"
                      )}
                      style={{ width: `${size}%`, height: `${size}%` }}
                    />
                  ))}

                  {/* Standardized & Distributed Nodes (20+ Items) */}
                  {/* Distributed across 3 concentric areas to ensure no collisions */}
                  {interactiveNode(FileText, "text-accent", "top-[5%] left-[20%]", 0)}
                  {interactiveNode(Globe, "text-info", "top-[5%] right-[20%]", 0.5)}
                  {interactiveNode(Youtube, "text-danger", "bottom-[5%] left-[20%]", 1)}
                  {interactiveNode(MessageCircle, "text-success", "bottom-[5%] right-[20%]", 1.5)}
                  {interactiveNode(Cloud, "text-info", "top-[45%] left-[2%]", 4.5)}
                  {interactiveNode(Code, "text-accent", "top-[45%] right-[2%]", 2.2)}

                  {interactiveNode(Brain, "text-accent", "top-[20%] left-[10%]", 0.2)}
                  {interactiveNode(Terminal, "text-success", "top-[20%] right-[10%]", 1.2)}
                  {interactiveNode(Database, "text-accent", "bottom-[20%] left-[10%]", 2.5)}
                  {interactiveNode(Shield, "text-info", "bottom-[20%] right-[10%]", 3.5)}
                  {interactiveNode(Search, "text-accent", "top-[4%] left-[48%]", 5)}
                  {interactiveNode(PenTool, "text-warning", "bottom-[4%] left-[48%]", 3.2)}

                  {interactiveNode(Layers, "text-warning", "top-[30%] left-[30%]", 2)}
                  {interactiveNode(Activity, "text-warning", "top-[30%] right-[30%]", 4)}
                  {interactiveNode(Key, "text-warning", "bottom-[30%] left-[30%]", 0.8)}
                  {interactiveNode(Settings, "text-secondary", "bottom-[30%] right-[30%]", 3)}
                  {interactiveNode(Wifi, "text-info", "top-[45%] left-[18%]", 1.8)}
                  {interactiveNode(Share2, "text-info", "top-[45%] right-[18%]", 2.8)}
                  {interactiveNode(Zap, "text-warning", "bottom-[42%] left-[18%]", 5.5)}
                  {interactiveNode(MousePointer2, "text-secondary", "bottom-[42%] right-[18%]", 3.8)}

                  {/* Central Core */}
                  <div className="relative z-20">
                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-accent rounded-full blur-2xl" />
                    <div className="w-28 h-28 bg-accent rounded-[32px] flex items-center justify-center text-black shadow-[0_0_60px_rgba(255,77,0,0.5)] relative">
                      <BrainCircuit size={56} />
                    </div>
                  </div>

                  {/* High Density Particles */}
                  {[...Array(30)].map((_, i) => (
                    <motion.div key={i} animate={{ scale: [0, 1, 0], x: [0, (Math.random() - 0.5) * 350], y: [0, (Math.random() - 0.5) * 350] }} transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, ease: "easeOut", delay: Math.random() * 5 }} className="absolute w-1 h-1 bg-accent/30 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-surface/30">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Five Pillars of Intelligence</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">Every feature you need to master your research, from ingestion to discovery.</p>
        </div>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <Upload className="text-accent" />, title: "Upload Pipeline", desc: "Ingest PDFs, URLs, and raw text seamlessly. We handle the chunking and vectorization." },
            { icon: <MessageSquare className="text-info" />, title: "Cited Chat", desc: "Ask questions and get answers with direct citations back to your source material." },
            { icon: <Sparkles className="text-warning" />, title: "Auto Summary", desc: "Instantly synthesize all your sources into a structured research briefing." },
            { icon: <Columns className="text-success" />, title: "Doc Comparator", desc: "Analyze agreements and contradictions between two documents side-by-side." },
            { icon: <Search className="text-danger" />, title: "Gap Finder", desc: "Identify blind spots, contradictions, and unanswered questions in your research." },
            { icon: <BrainCircuit className="text-accent" />, title: "Private RAG", desc: "Your data stays private. Our RAG engine only uses the documents you provide." },
          ].map((feature, i) => (
            <motion.div key={i} variants={item} className="group p-8 bg-surface-2 border border-border rounded-[32px] hover:border-accent/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-bg border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4">See it in action</h2>
          <p className="text-text-secondary">A simulated look at the SourceMind research experience.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <DemoShowcase />
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-heading font-bold mb-4">The Stack</h2>
          <p className="text-text-secondary">Built with modern industry-standard technologies.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { name: "Next.js 14", icon: <Zap size={20} /> },
            { name: "Express.js", icon: <ArrowRight size={20} /> },
            { name: "Supabase + pgvector", icon: <Database size={20} /> },
            { name: "Gemini 2.0 Flash", icon: <BrainCircuit size={20} /> },
            { name: "HuggingFace", icon: <Cpu size={20} /> },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4 bg-surface-2 border border-border rounded-2xl hover:border-accent/30 transition-colors">
              <div className="text-accent">{t.icon}</div>
              <span className="font-bold text-sm">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50"><img src="/favicon.png" alt="SourceMind Logo" className="w-6 h-6 rounded object-cover" /><span className="text-sm font-bold">SourceMind © 2026</span></div>
          <div className="flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#" className="hover:text-text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-text-primary transition-colors">Render</a>
            <a href="#" className="hover:text-text-primary transition-colors">Vercel</a>
          </div>
          <p className="text-xs text-text-secondary">Powered by Google DeepMind Agentic Coding.</p>
        </div>
      </footer>
    </div>
  );
}
