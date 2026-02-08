'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  LayoutDashboard, 
  LogOut, 
  Globe, 
  Users, 
  CheckSquare, 
  Target, 
  TrendingUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">{t.app.loading}</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const getRoleLabel = (role: string) => {
    return t.roles[role as keyof typeof t.roles] || role;
  };

  const canManageTeam = user?.role === 'owner' || user?.role === 'manager';

  const stats = [
    { label: isRTL ? 'المهام' : 'Tasks', value: '0', icon: CheckSquare, color: 'bg-blue-500', href: '/tasks' },
    { label: isRTL ? 'الأهداف' : 'Goals', value: '0', icon: Target, color: 'bg-green-500', href: '/goals' },
    { label: isRTL ? 'مؤشرات الأداء' : 'KPIs', value: '0', icon: TrendingUp, color: 'bg-purple-500', href: '/kpis' },
    { label: isRTL ? 'الفريق' : 'Team', value: '1', icon: Users, color: 'bg-orange-500', href: '/team' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{t.app.name}</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {user.organizationName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 
                           hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'EN' : 'AR'}
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                </div>
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 
                           rounded-lg transition-colors"
                title={t.auth.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t.dashboard.welcome}، {user.name} 👋
          </h2>
          <p className="text-gray-500 mt-1">{t.dashboard.overview}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="card flex items-center gap-4 hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center 
                              group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
              {stat.href !== '#' && (
                isRTL 
                  ? <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                  : <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/tasks"
              className="card flex items-center gap-4 hover:shadow-md hover:border-blue-200 
                         transition-all group border-2 border-transparent"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center 
                              group-hover:bg-blue-200 transition-colors">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {isRTL ? 'إدارة المهام' : 'Manage Tasks'}
                </p>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'إنشاء وتتبع المهام' : 'Create and track tasks'}
                </p>
              </div>
            </Link>

            <Link
              href="/goals"
              className="card flex items-center gap-4 hover:shadow-md hover:border-green-200 
                         transition-all group border-2 border-transparent"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center 
                              group-hover:bg-green-200 transition-colors">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {isRTL ? 'إدارة الأهداف' : 'Manage Goals'}
                </p>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'تتبع الأهداف السنوية والربعية' : 'Track annual and quarterly goals'}
                </p>
              </div>
            </Link>

            <Link
              href="/kpis"
              className="card flex items-center gap-4 hover:shadow-md hover:border-purple-200 
                         transition-all group border-2 border-transparent"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center 
                              group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {isRTL ? 'مؤشرات الأداء' : 'KPIs'}
                </p>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'تتبع وقياس الأداء' : 'Track and measure performance'}
                </p>
              </div>
            </Link>

            <Link
              href="/leaves"
              className="card flex items-center gap-4 hover:shadow-md hover:border-amber-200 
                         transition-all group border-2 border-transparent"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center 
                              group-hover:bg-amber-200 transition-colors">
                <CalendarDays className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {isRTL ? 'الإجازات' : 'Leaves'}
                </p>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'طلب وإدارة الإجازات' : 'Request and manage leaves'}
                </p>
              </div>
            </Link>

            <Link
              href="/trainings"
              className="card flex items-center gap-4 hover:shadow-md hover:border-teal-200 
                         transition-all group border-2 border-transparent"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center 
                              group-hover:bg-teal-200 transition-colors">
                <GraduationCap className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {isRTL ? 'التدريب' : 'Training'}
                </p>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'الدورات والورش التدريبية' : 'Courses and workshops'}
                </p>
              </div>
            </Link>

            {canManageTeam && (
              <Link
                href="/team"
                className="card flex items-center gap-4 hover:shadow-md hover:border-indigo-200 
                           transition-all group border-2 border-transparent"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center 
                                group-hover:bg-indigo-200 transition-colors">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isRTL ? 'إدارة الفريق' : 'Manage Team'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'إضافة وإدارة أعضاء الفريق' : 'Add and manage team members'}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="card bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {isRTL ? 'النظام مكتمل!' : 'System Complete!'}
              </h3>
              <p className="text-sm text-gray-600">
                {isRTL 
                  ? 'تم إضافة جميع الميزات: المهام، الأهداف، مؤشرات الأداء، الإجازات والتدريب.'
                  : 'All features added: Tasks, Goals, KPIs, Leaves & Training.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
