'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';
import {
  Home,
  CheckSquare,
  Calendar,
  LogOut,
  Menu,
  X,
  FileText,
  Users,
  Target,
  BarChart3,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isManager = user?.role === 'manager';
  const isOwnerOrManager = user?.role === 'owner' || isManager;

  const getRoleLabel = () => {
    if (user?.role === 'owner') return { emoji: '👑', label: 'Owner' };
    if (isManager) return { emoji: '🛡️', label: t.auth.manager };
    return { emoji: '👤', label: t.auth.employee };
  };
  const roleInfo = getRoleLabel();

  const navItems = useMemo(() => {
    const items = [
      { path: '/dashboard', label: t.nav.dashboard, icon: Home },
      { path: '/goals', label: t.nav.goals, icon: Target },
      { path: '/kpis', label: t.nav.kpis, icon: BarChart3 },
      { path: '/tasks', label: t.nav.tasks, icon: CheckSquare },
      { path: '/plans', label: t.nav.plans, icon: Calendar },
    ];
    if (isOwnerOrManager) {
      items.push(
        { path: '/weekly-updates', label: t.nav.weeklyUpdates, icon: FileText },
        { path: '/users', label: t.nav.users, icon: Users }
      );
    }
    items.push({ path: '/analytics', label: t.nav.analytics, icon: Sparkles });
    return items;
  }, [isOwnerOrManager, t]);

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation Bar - Simple & Responsive */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between h-14 sm:h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Logo */}
            <Link href="/dashboard" className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900">{t.app.name}</span>
                <span className="text-xs text-gray-500 sm:ml-2">{roleInfo.emoji} {roleInfo.label}</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <NotificationBell />
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                title={language === 'en' ? 'العربية' : 'English'}
              >
                <Globe className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">{t.auth.logout}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${
                      isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    } ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-100">
                <div className={`flex items-center gap-3 px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
