'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, CheckCircle, Languages } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { isRTL, language, toggleLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Translations
  const texts = {
    validating: isRTL ? 'جاري التحقق من الرابط...' : 'Validating link...',
    invalidLink: isRTL ? 'رابط غير صالح أو مفقود' : 'Invalid or missing link',
    goToLogin: isRTL ? 'الذهاب لتسجيل الدخول' : 'Go to login',
    successTitle: isRTL ? 'تم تعيين كلمة المرور بنجاح!' : 'Password set successfully!',
    redirecting: isRTL ? 'جاري التوجيه لصفحة الدخول...' : 'Redirecting to login...',
    title: isRTL ? 'تعيين كلمة المرور' : 'Set your password',
    subtitle: isRTL ? 'أنشئ كلمة مرور للوصول إلى حسابك' : 'Create a password to access your account',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    name: isRTL ? 'الاسم' : 'Name',
    newPassword: isRTL ? 'كلمة المرور الجديدة' : 'New password',
    confirmPassword: isRTL ? 'تأكيد كلمة المرور' : 'Confirm password',
    passwordPlaceholder: isRTL ? '6 أحرف على الأقل' : 'At least 6 characters',
    confirmPlaceholder: isRTL ? 'أكد كلمة المرور' : 'Confirm your password',
    passwordTooShort: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
    passwordMismatch: isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match',
    settingPassword: isRTL ? 'جاري تعيين كلمة المرور...' : 'Setting password...',
    setPassword: isRTL ? 'تعيين كلمة المرور' : 'Set password',
    backToLogin: isRTL ? 'العودة لتسجيل الدخول' : 'Back to login',
    failedToSet: isRTL ? 'فشل في تعيين كلمة المرور' : 'Failed to set password',
    failedToValidate: isRTL ? 'فشل في التحقق من الرابط' : 'Failed to validate link',
  };

  useEffect(() => {
    if (!token) {
      setError(texts.invalidLink);
      setLoading(false);
      return;
    }

    fetch(`/api/invite/validate?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setEmail(data.email);
          setName(data.name);
        }
      })
      .catch(() => setError(texts.failedToValidate))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(texts.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(texts.passwordMismatch);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/invite/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || texts.failedToSet);
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || texts.failedToSet);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-gray-600">{texts.validating}</div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700">{error}</p>
            <Link href="/login" className="mt-4 inline-block text-primary-600 hover:underline">
              {texts.goToLogin}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-800 mb-2">{texts.successTitle}</h2>
            <p className="text-green-700">{texts.redirecting}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-primary-600"
      >
        <Languages className="w-5 h-5" />
        <span className="font-medium">{language === 'en' ? 'عربي' : 'English'}</span>
      </button>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{texts.title}</h1>
            <p className="text-gray-600 mt-1">{texts.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.email}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={`w-full py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.name}</label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={name}
                  readOnly
                  className={`w-full py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.newPassword}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={texts.passwordPlaceholder}
                  minLength={6}
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.confirmPassword}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={texts.confirmPlaceholder}
                  minLength={6}
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
              disabled={saving}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? texts.settingPassword : texts.setPassword}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/login" className="text-primary-600 hover:underline">
              {texts.backToLogin}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
