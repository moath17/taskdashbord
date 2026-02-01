'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const { isRTL, language } = useLanguage();

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
        throw new Error(data.error || 'Failed to send reset link');
      }

      setSent(true);
      if (data.resetLink) setResetLink(data.resetLink);
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </h1>
              <p className="text-gray-600 text-center mb-6">
                {language === 'ar'
                  ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط استرجاع كلمة المرور'
                  : 'Enter your email and we\'ll send you a link to reset your password'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
                      placeholder="email@example.com"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  {loading
                    ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                    : (language === 'ar' ? 'إرسال رابط الاسترجاع' : 'Send reset link')}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'ar' ? 'تم إرسال الرابط' : 'Check your email'}
              </h2>
              <p className="text-gray-600 mb-4">
                {resetLink
                  ? (language === 'ar' ? 'انسخ الرابط وأرسله للمستخدم:' : 'Copy this link (email not configured):')
                  : (language === 'ar' ? 'إذا كان لديك حساب بهذا البريد، ستتلقى رابط استرجاع كلمة المرور.' : 'If an account exists with this email, you will receive a reset link.')}
              </p>
              {resetLink && (
                <div className="p-3 bg-gray-100 rounded-lg text-sm break-all mb-4" dir="ltr">
                  {resetLink}
                </div>
              )}
            </div>
          )}

          <Link
            href="/login"
            className={`mt-6 flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to login'}
          </Link>
        </div>
      </div>
    </div>
  );
}
