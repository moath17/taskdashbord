'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(isRTL ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' : 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(isRTL ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      if (err.message.includes('incorrect') || err.message.includes('Unauthorized')) {
        setError(isRTL ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    title: isRTL ? 'تغيير كلمة المرور' : 'Change Password',
    subtitle: isRTL ? 'أدخل كلمة المرور الحالية ثم الجديدة' : 'Enter your current password and a new one',
    currentPassword: isRTL ? 'كلمة المرور الحالية' : 'Current Password',
    newPassword: isRTL ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: isRTL ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password',
    save: isRTL ? 'تغيير كلمة المرور' : 'Change Password',
    saving: isRTL ? 'جاري التغيير...' : 'Changing...',
    back: isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard',
    successTitle: isRTL ? 'تم تغيير كلمة المرور بنجاح!' : 'Password Changed Successfully!',
    successMsg: isRTL ? 'يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.' : 'You can now use your new password to log in.',
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 
                            bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {texts.successTitle}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {texts.successMsg}
            </p>
            <Link href="/dashboard" className="btn btn-primary w-full text-center inline-block">
              {texts.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="max-w-md mx-auto pt-8 sm:pt-16">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 
                     hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                     mb-6 transition-colors"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {texts.back}
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl mb-4 
                          shadow-lg shadow-teal-500/20">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{texts.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{texts.subtitle}</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Current Password */}
            <div>
              <label className="label">{texts.currentPassword}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'}`}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                              ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="label">{texts.newPassword}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'}`}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                              ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? '6 أحرف على الأقل' : 'At least 6 characters'}
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="label">{texts.confirmPassword}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {texts.saving}
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  {texts.save}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
