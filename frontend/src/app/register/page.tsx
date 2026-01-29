'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { usersApi } from '@/api';
import { Languages } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const [managerExists, setManagerExists] = useState(false);
  const [checkingManager, setCheckingManager] = useState(true);
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    checkManagerExists();
  }, []);

  const checkManagerExists = async () => {
    try {
      const exists = await usersApi.checkManagerExists();
      setManagerExists(exists);
    } catch (error) {
      console.error('Failed to check for existing manager:', error);
      setManagerExists(false);
    } finally {
      setCheckingManager(false);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === 'manager' && managerExists) {
      toast.error(language === 'ar' 
        ? 'يوجد مدير بالفعل. مسموح بمدير واحد فقط.'
        : 'A manager is already registered. Only one manager is allowed.'
      );
      setFormData({ ...formData, role: 'employee' });
      return;
    }
    setFormData({ ...formData, role: newRole });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.role === 'manager' && managerExists) {
      toast.error(language === 'ar' 
        ? 'يوجد مدير بالفعل. مسموح بمدير واحد فقط.'
        : 'A manager is already registered. Only one manager is allowed.'
      );
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      toast.success(t.auth.registerSuccess);
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t.auth.registerFailed;
      toast.error(errorMessage);
      if (errorMessage.includes('manager already exists')) {
        setManagerExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.auth.register}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.name}
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.password}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                required
                minLength={6}
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="role" className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.role}
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={handleRoleChange}
                className="input"
                required
                disabled={checkingManager}
              >
                <option value="employee">{t.auth.employee}</option>
                <option value="manager" disabled={managerExists}>
                  {t.auth.manager} {managerExists ? (language === 'ar' ? '(موجود بالفعل)' : '(Already exists)') : ''}
                </option>
              </select>
              {managerExists && (
                <p className={`mt-1 text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' 
                    ? 'يوجد مدير بالفعل. مسموح بمدير واحد فقط.'
                    : 'A manager is already registered. Only one manager is allowed.'
                  }
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? t.auth.registering : t.auth.register}
            </button>
          </form>
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
