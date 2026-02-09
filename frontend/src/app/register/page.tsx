'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Building2, User, Mail, Lock, UserPlus, Globe } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError(t.auth.passwordMin);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      await register(orgName, name, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 py-8">
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
                          bg-sky-600 rounded-2xl mb-4 shadow-lg shadow-sky-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.registerOrg}</h1>
          <p className="text-gray-500 mt-2">{t.auth.registerSubtitle}</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="label">{t.auth.organizationName}</label>
              <div className="relative">
                <Building2 className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                       ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                  placeholder={isRTL ? 'شركة المستقبل' : 'Future Company'}
                  required
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">{t.auth.name}</label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                  placeholder={isRTL ? 'أحمد محمد' : 'John Doe'}
                  required
                />
              </div>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? '6 أحرف على الأقل' : 'At least 6 characters'}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">{t.auth.confirmPassword}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
              </div>
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
              className="btn btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.auth.registering}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t.auth.register}
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              {t.auth.hasAccount}{' '}
              <Link href="/login" className="link">
                {t.auth.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
