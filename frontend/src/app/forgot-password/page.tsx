'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, ArrowLeft, ArrowRight, KeyRound, Globe, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  // Success state
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 
                            bg-emerald-100 rounded-full mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isRTL ? 'تم إرسال الرابط!' : 'Reset Link Sent!'}
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              {isRTL 
                ? 'إذا كان البريد الإلكتروني مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور. يرجى التحقق من بريدك الإلكتروني.'
                : 'If this email is registered, you will receive a password reset link. Please check your inbox.'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {isRTL 
                ? 'لم تستلم الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam).'
                : "Didn't receive it? Check your spam folder."}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn btn-secondary w-full"
              >
                {isRTL ? 'إرسال رابط آخر' : 'Send Another Link'}
              </button>
              <Link href="/login" className="btn btn-primary w-full text-center">
                {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4">
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-teal-500/20">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'نسيت كلمة المرور' : 'Forgot Password'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
              : 'Enter your email and we\'ll send you a reset link'}
          </p>
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
                  {isRTL ? 'جاري الإرسال...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  {isRTL ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 
                         hover:text-teal-700 transition-colors"
            >
              {isRTL ? (
                <>
                  {t.auth.login}
                  <ArrowLeft className="w-4 h-4" />
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  {`Back to ${t.auth.login}`}
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
