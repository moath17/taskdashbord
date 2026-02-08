'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, ShieldCheck, Globe, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 
                            bg-red-100 rounded-full mb-4 mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isRTL ? 'رابط غير صالح' : 'Invalid Link'}
            </h2>
            <p className="text-gray-500 mb-6">
              {isRTL 
                ? 'رابط إعادة تعيين كلمة المرور غير صالح أو مفقود.'
                : 'The password reset link is invalid or missing.'}
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/forgot-password" className="btn btn-primary w-full text-center">
                {isRTL ? 'طلب رابط جديد' : 'Request New Link'}
              </Link>
              <Link href="/login" className="btn btn-secondary w-full text-center">
                {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 
                            bg-green-100 rounded-full mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isRTL ? 'تم تغيير كلمة المرور!' : 'Password Changed!'}
            </h2>
            <p className="text-gray-500 mb-6">
              {isRTL 
                ? 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
                : 'Your password has been reset successfully. You can now log in with your new password.'}
            </p>
            <Link href="/login" className="btn btn-primary w-full text-center inline-flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {isRTL ? 'تسجيل الدخول' : 'Go to Login'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'أدخل كلمة المرور الجديدة'
              : 'Enter your new password'}
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="label">
                {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'}`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                              ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
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
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password match indicator */}
            {confirmPassword && (
              <div className={`flex items-center gap-2 text-sm ${
                password === confirmPassword ? 'text-green-600' : 'text-red-500'
              }`}>
                {password === confirmPassword ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {isRTL ? 'كلمات المرور متطابقة' : 'Passwords match'}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    {isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                  </>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRTL ? 'جاري التحديث...' : 'Updating...'}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  {isRTL ? 'تعيين كلمة المرور الجديدة' : 'Set New Password'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
