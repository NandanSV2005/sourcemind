"use client";

import { Columns, Loader2, FileText, Check, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import HistoryModal from './HistoryModal';
import toast from 'react-hot-toast';

interface Source {
  id: string;
  title: string;
}

interface CompareTabProps {
  sources: Source[];
  history?: any[];
  notebookId?: string;
}

export default function CompareTab({ sources, history = [], notebookId }: CompareTabProps) {
  const [docA, setDocA] = useState('');
  const [docB, setDocB] = useState('');
  const [comparison, setComparison] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleCompare = async () => {
    if (!docA || !docB || docA === docB) return;
    setIsLoading(true);
    setComparison(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_id_a: docA, doc_id_b: docB })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to compare');

      setComparison(data.comparison);
      setScore(data.agreement_score);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold mb-2">Multi-Doc Comparator</h2>
          <p className="text-text-secondary text-sm">Analyze agreements and contradictions between two specific sources.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-surface-2 rounded-xl text-xs font-bold transition-all text-text-secondary hover:text-text-primary"
          >
            <Clock size={14} />
            Recent ({history.length})
          </button>
        )}
      </div>

      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Comparison History"
        items={history}
        onSelect={(item) => {
          setComparison(item.content);
          setScore(item.agreement_score);
          setDocA(item.doc_id_a);
          setDocB(item.doc_id_b);
          toast.success('Loaded saved comparison');
        }}
        renderItem={(item) => {
          const docAName = sources.find(s => s.id === item.doc_id_a)?.title || 'Source A';
          const docBName = sources.find(s => s.id === item.doc_id_b)?.title || 'Source B';
          return (
            <div className="space-y-1">
              <p className="text-sm font-bold truncate">
                {docAName} vs {docBName}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                <span className="text-accent font-bold">Score: {item.agreement_score}/10</span>
                <span>•</span>
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
            </div>
          );
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr,auto] items-end gap-4 mb-12">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Document A</label>
          <select
            value={docA}
            onChange={(e) => setDocA(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent appearance-none text-sm"
          >
            <option value="">Select a document</option>
            {sources.map(s => (
              <option key={s.id} value={s.id} disabled={s.id === docB}>{s.title}</option>
            ))}
          </select>
        </div>

        <div className="hidden md:flex items-center justify-center h-[46px] text-text-secondary">
          <ArrowRight size={18} />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase px-1">Document B</label>
          <select
            value={docB}
            onChange={(e) => setDocB(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent appearance-none text-sm"
          >
            <option value="">Select a document</option>
            {sources.map(s => (
              <option key={s.id} value={s.id} disabled={s.id === docA}>{s.title}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCompare}
          disabled={!docA || !docB || docA === docB || isLoading}
          className="h-[46px] px-8 bg-accent disabled:opacity-30 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Columns size={18} />}
          Compare
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 bg-surface-2/50 rounded-2xl border border-border h-48 animate-pulse" />
          ))}
        </div>
      )}

      {comparison && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Agreement Score */}
          <div className="bg-surface-2 border border-border rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Agreement Score</span>
              <span className="text-xl font-heading font-bold text-accent">{score}/10</span>
            </div>
            <div className="h-3 w-full bg-bg rounded-full overflow-hidden border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(score || 0) * 10}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-accent to-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => {
                  const title = String(props.children);
                  let borderClass = "border-blue-500";
                  let icon = <FileText size={16} />;
                  
                  if (title.toLowerCase().includes('agree')) {
                    borderClass = "border-success";
                    icon = <Check size={16} className="text-success" />;
                  } else if (title.toLowerCase().includes('contradict')) {
                    borderClass = "border-danger";
                    icon = <AlertTriangle size={16} className="text-danger" />;
                  }

                  return (
                    <div className={`col-span-1 p-6 bg-surface-2/30 border-l-4 ${borderClass} rounded-r-2xl mb-8`}>
                      <div className="flex items-center gap-2 mb-4">
                        {icon}
                        <h3 className="text-lg font-heading font-bold text-text-primary">{title}</h3>
                      </div>
                    </div>
                  );
                },
                li: ({ node, ...props }) => (
                  <li className="text-sm text-text-secondary leading-relaxed mb-3 list-disc ml-4">{props.children}</li>
                ),
                p: ({ node, ...props }) => (
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{props.children}</p>
                )
              }}
            >
              {comparison}
            </ReactMarkdown>
          </div>
        </motion.div>
      )}

      {!comparison && !isLoading && (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl opacity-50">
          <Columns size={48} className="mb-4 text-text-secondary" />
          <p className="text-sm font-medium">Select two documents to analyze their relationship</p>
        </div>
      )}
    </div>
  );
}
