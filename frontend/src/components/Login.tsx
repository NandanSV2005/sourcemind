"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`
          }
        });
        if (error) throw error;
        toast.success('Verification email sent! Check your inbox.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg p-4 relative overflow-hidden">
      {/* Background blobs for aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-info/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center font-bold text-3xl text-black italic mx-auto mb-6 shadow-[0_0_30px_rgba(255,77,0,0.3)]"
          >
            S
          </motion.div>
          <h1 className="text-4xl font-heading font-bold text-text-primary mb-2">SourceMind</h1>
          <p className="text-text-secondary text-sm">Your research, intelligentized.</p>
        </div>

        <div className="bg-surface/50 backdrop-blur-2xl border border-border rounded-[32px] p-8 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1 tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-surface-2 border border-border focus:border-accent/50 rounded-xl px-12 py-3.5 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase px-1 tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-border focus:border-accent/50 rounded-xl px-12 py-3.5 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full py-4 bg-accent text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,0,0.2)] disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-text-secondary hover:text-accent transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors mt-2"
            >
              <ChevronLeft size={14} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
