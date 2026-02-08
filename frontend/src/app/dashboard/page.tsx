'use client';

import { useEffect, useState } from 'react';
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
  Heart,
  Home,
  MoreHorizontal,
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

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const canManageTeam = user?.role === 'owner' || user?.role === 'manager';

  const navLinks = [
    { label: isRTL ? 'المهام' : 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: isRTL ? 'الأهداف' : 'Goals', href: '/goals', icon: Target },
    { label: isRTL ? 'مؤشرات الأداء' : 'KPIs', href: '/kpis', icon: TrendingUp },
    { label: isRTL ? 'الإجازات' : 'Leaves', href: '/leaves', icon: CalendarDays },
    { label: isRTL ? 'التدريب' : 'Training', href: '/trainings', icon: GraduationCap },
    { label: isRTL ? 'الفريق' : 'Team', href: '/team', icon: Users },
  ];

  // Mobile bottom bar: show first 3 + Home + More
  const mobileMainLinks = [
    { label: isRTL ? 'الرئيسية' : 'Home', href: '/dashboard', icon: Home },
    { label: isRTL ? 'المهام' : 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: isRTL ? 'الأهداف' : 'Goals', href: '/goals', icon: Target },
    { label: isRTL ? 'المؤشرات' : 'KPIs', href: '/kpis', icon: TrendingUp },
  ];
  const mobileMoreLinks = [
    { label: isRTL ? 'الإجازات' : 'Leaves', href: '/leaves', icon: CalendarDays },
    { label: isRTL ? 'التدريب' : 'Training', href: '/trainings', icon: GraduationCap },
    { label: isRTL ? 'الفريق' : 'Team', href: '/team', icon: Users },
  ];

  const stats = [
    { label: isRTL ? 'المهام' : 'Tasks', value: '0', icon: CheckSquare, color: 'bg-blue-500', href: '/tasks' },
    { label: isRTL ? 'الأهداف' : 'Goals', value: '0', icon: Target, color: 'bg-green-500', href: '/goals' },
    { label: isRTL ? 'مؤشرات الأداء' : 'KPIs', value: '0', icon: TrendingUp, color: 'bg-purple-500', href: '/kpis' },
    { label: isRTL ? 'الفريق' : 'Team', value: '1', icon: Users, color: 'bg-orange-500', href: '/team' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
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
            <div className="flex items-center gap-2 sm:gap-3">
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
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
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

              {/* Mobile Avatar */}
              <div className="sm:hidden w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
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

          {/* Desktop Navigation Bar - hidden on mobile */}
          <nav className="hidden md:flex -mb-px gap-1 overflow-x-auto pb-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 
                           hover:text-indigo-600 hover:bg-indigo-50 rounded-t-lg transition-colors 
                           whitespace-nowrap"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
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
              {isRTL 
                ? <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                : <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
              }
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
      </main>

      {/* Footer - hidden on mobile (bottom nav takes its place) */}
      <footer className="hidden md:block bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Logo & Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{t.app.name}</p>
                <p className="text-xs text-gray-400">
                  &copy; {new Date().getFullYear()} {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
                </p>
              </div>
            </div>

            {/* Center: Links */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/tasks" className="hover:text-indigo-600 transition-colors">
                {isRTL ? 'المهام' : 'Tasks'}
              </Link>
              <Link href="/goals" className="hover:text-indigo-600 transition-colors">
                {isRTL ? 'الأهداف' : 'Goals'}
              </Link>
              <Link href="/kpis" className="hover:text-indigo-600 transition-colors">
                {isRTL ? 'المؤشرات' : 'KPIs'}
              </Link>
              <Link href="/team" className="hover:text-indigo-600 transition-colors">
                {isRTL ? 'الفريق' : 'Team'}
              </Link>
            </div>

            {/* Right: Made with */}
            <p className="text-xs text-gray-400 flex items-center gap-1">
              {isRTL ? 'صنع بـ' : 'Made with'} <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {isRTL ? 'لإدارة أفضل' : 'for better management'}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileMainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors
                ${link.href === '/dashboard' 
                  ? 'text-indigo-600' 
                  : 'text-gray-400 hover:text-indigo-600'
                }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{link.label}</span>
            </Link>
          ))}

          {/* More button */}
          <div className="relative flex-1">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex flex-col items-center justify-center gap-1 w-full py-2 rounded-lg transition-colors
                ${moreMenuOpen ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">
                {isRTL ? 'المزيد' : 'More'}
              </span>
            </button>

            {/* More dropdown - opens upward */}
            {moreMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMoreMenuOpen(false)} 
                />
                <div className={`absolute bottom-full mb-2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 
                                 py-2 w-48 ${isRTL ? 'left-0' : 'right-0'}`}>
                  {mobileMoreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 
                                 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16" />
    </div>
  );
}
