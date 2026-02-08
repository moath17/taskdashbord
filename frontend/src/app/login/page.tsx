'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Lock, LogIn, Globe } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  
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

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 
                   bg-white rounded-lg shadow-sm border border-gray-200 
                   hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {language === 'ar' ? 'English' : 'عربي'}
        </span>
      </button>

      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.login}</h1>
          <p className="text-gray-500 mt-2">{t.auth.loginSubtitle}</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">{t.auth.email}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                  placeholder="email@example.com"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">{t.auth.password}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <Link 
                href="/forgot-password" 
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.auth.loggingIn}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t.auth.login}
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              {t.auth.noAccount}{' '}
              <Link href="/register" className="link">
                {t.auth.register}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
