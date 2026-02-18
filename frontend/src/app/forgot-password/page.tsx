'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
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
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-4 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isRTL ? 'نسيت كلمة المرور' : 'Forgot Password'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            {isRTL 
              ? 'الرجاء الرجوع إلى المدير (أو المالك) لتغيير كلمة المرور.'
              : 'Please contact the manager (or owner) to reset your password.'}
          </p>

          {/* Support contact */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {isRTL 
                ? 'إذا كنت مالك المنظمة، تواصل مع الدعم الفني:'
                : 'If you are the organization owner, contact support:'}
            </p>
            <a 
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}`}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 
                         font-medium text-sm transition-colors"
              dir="ltr"
            >
              <Mail className="w-4 h-4" />
              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}
            </a>
          </div>

          <Link href="/login" className="btn btn-primary w-full text-center inline-block">
            {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}
