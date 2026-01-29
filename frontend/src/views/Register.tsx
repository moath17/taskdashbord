'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Languages, Building2, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    organizationName: '',
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(
        formData.organizationName,
        formData.email,
        formData.password,
        formData.name
      );
      toast.success(t.auth.registerSuccess);
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t.auth.registerFailed;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-primary-600"
      >
        <Languages className="w-5 h-5" />
        <span className="font-medium">{language === 'en' ? 'عربي' : 'English'}</span>
      </button>

      <div className="max-w-md w-full">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isRTL ? 'تسجيل مؤسستك' : 'Register Your Organization'}
            </h2>
            <p className="text-gray-600 mt-2 text-sm">
              {isRTL 
                ? 'أنشئ حساب مؤسستك وكن المالك'
                : 'Create your organization account and become the owner'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name */}
            <div>
              <label htmlFor="organizationName" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {isRTL ? 'اسم المؤسسة' : 'Organization Name'}
                </span>
              </label>
              <input
                id="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="input"
                placeholder={isRTL ? 'مثال: شركة التقنية' : 'e.g., Tech Company Inc.'}
                required
              />
            </div>

            {/* Owner Name */}
            <div>
              <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <User className="w-4 h-4 text-gray-400" />
                  {isRTL ? 'اسمك (المالك)' : 'Your Name (Owner)'}
                </span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="w-4 h-4 text-gray-400" />
                  {t.auth.email}
                </span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="email@example.com"
                required
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Lock className="w-4 h-4 text-gray-400" />
                  {t.auth.password}
                </span>
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder={isRTL ? '6 أحرف على الأقل' : 'At least 6 characters'}
                required
                minLength={6}
                dir="ltr"
              />
            </div>

            {/* Info Box */}
            <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm text-blue-800">
                {isRTL 
                  ? '✨ بعد التسجيل، ستصبح مالك المؤسسة ويمكنك إضافة أعضاء فريقك من لوحة التحكم.'
                  : '✨ After registering, you\'ll be the organization owner and can add team members from the dashboard.'
                }
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading 
                ? (isRTL ? 'جاري التسجيل...' : 'Registering...') 
                : (isRTL ? 'تسجيل المؤسسة' : 'Register Organization')
              }
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            {t.auth.hasAccount}{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              {t.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
