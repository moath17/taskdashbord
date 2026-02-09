'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Mail, Lock, LogIn, Globe, Moon, Sun } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || t.auth.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      {/* Top controls */}
      <div className={`absolute top-4 flex items-center gap-2 ${isRTL ? 'left-4' : 'right-4'}`}>
        <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
        </button>
        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </div>

      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.auth.login}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t.auth.loginSubtitle}</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">{t.auth.email}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} placeholder="email@example.com" required dir="ltr" />
              </div>
            </div>
            <div>
              <label className="label">{t.auth.password}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} placeholder="••••••••" required dir="ltr" />
              </div>
            </div>
            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition-colors">{t.auth.forgotPassword}</Link>
            </div>
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.auth.loggingIn}</>) : (<><LogIn className="w-5 h-5" />{t.auth.login}</>)}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400">{t.auth.noAccount}{' '}<Link href="/register" className="link">{t.auth.register}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
