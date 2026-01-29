'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  ChevronLeft,
  ChevronRight,
  Brain
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';
  const isOwnerOrManager = isOwner || isManager;

  // Get role display label
  const getRoleLabel = () => {
    if (isOwner) return { emoji: '👑', label: 'Owner' };
    if (isManager) return { emoji: '🛡️', label: t.auth.manager };
    return { emoji: '👤', label: t.auth.employee };
  };
  const roleInfo = getRoleLabel();

  const navItems = useMemo(() => {
    const items = [
      { path: '/dashboard', label: t.nav.dashboard, icon: Home, color: 'from-violet-500 to-purple-500' },
      { path: '/goals', label: t.nav.goals, icon: Target, color: 'from-amber-500 to-orange-500' },
      { path: '/kpis', label: t.nav.kpis, icon: BarChart3, color: 'from-emerald-500 to-teal-500' },
      { path: '/tasks', label: t.nav.tasks, icon: CheckSquare, color: 'from-blue-500 to-cyan-500' },
      { path: '/plans', label: t.nav.plans, icon: Calendar, color: 'from-pink-500 to-rose-500' },
    ];

    // Owners and managers can see weekly updates and users management
    if (isOwnerOrManager) {
      items.push(
        { path: '/weekly-updates', label: t.nav.weeklyUpdates, icon: FileText, color: 'from-indigo-500 to-blue-500' },
        { path: '/users', label: t.nav.users, icon: Users, color: 'from-fuchsia-500 to-pink-500' }
      );
    }

    // Analytics available for all users
    items.push(
      { path: '/analytics', label: t.nav.analytics, icon: Brain, color: 'from-violet-600 to-indigo-600' }
    );

    return items;
  }, [isOwnerOrManager, t]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Floating Show Sidebar Button - appears when sidebar is hidden */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className={`fixed top-24 ${isRTL ? 'right-0 rounded-l-2xl' : 'left-0 rounded-r-2xl'} z-[60] px-3 py-4 bg-gradient-to-b from-violet-500 to-indigo-600 text-white shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 transition-all duration-300 hover:px-4 group hidden lg:flex flex-col items-center gap-2`}
        >
          {isRTL ? <ChevronLeft className="w-5 h-5 animate-pulse" /> : <ChevronRight className="w-5 h-5 animate-pulse" />}
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar - Desktop */}
      <aside 
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full bg-white/80 backdrop-blur-xl border-${isRTL ? 'l' : 'r'} border-slate-200/50 shadow-2xl shadow-slate-200/50 z-50 transition-all duration-500 ease-out hidden lg:flex flex-col ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-100">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 transform hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            {sidebarOpen && (
              <div className={`overflow-hidden transition-all duration-300 ${isRTL ? 'text-right' : ''}`}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  {t.app.name}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {roleInfo.emoji} {roleInfo.label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group relative flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''} ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-slate-600 hover:bg-slate-100/80'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className={`absolute ${isRTL ? '-left-4' : '-right-4'} top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b ${item.color} rounded-full shadow-lg`}></div>
                )}
                
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-br ${item.color} bg-opacity-10 group-hover:bg-opacity-20`
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-white' : `text-transparent bg-gradient-to-r ${item.color} bg-clip-text`
                  }`} style={{ stroke: isActive ? 'white' : undefined }} />
                  {!isActive && <Icon className={`w-5 h-5 absolute opacity-100`} style={{ stroke: `url(#gradient-${index})` }} />}
                </div>
                
                {sidebarOpen && (
                  <span className={`font-medium transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {item.label}
                  </span>
                )}

                {/* Hover Effect */}
                {!isActive && sidebarOpen && (
                  <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    {isRTL ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 transition-all duration-300 group ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all duration-300">
              <Globe className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-medium text-slate-700">{language === 'en' ? 'العربية 🇸🇦' : 'English 🇺🇸'}</span>
            )}
          </button>

          {/* User Profile */}
          {sidebarOpen && (
            <div className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all duration-300 group ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-10 h-10 bg-slate-100 group-hover:bg-red-100 rounded-xl flex items-center justify-center transition-all duration-300">
              <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors duration-300" />
            </div>
            {sidebarOpen && (
              <span className="font-medium">{t.auth.logout}</span>
            )}
          </button>
        </div>

        {/* Collapse Button - Big & Clear */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-1/2 ${isRTL ? '-left-5' : '-right-5'} transform -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full shadow-xl shadow-violet-500/30 flex items-center justify-center hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-110 group`}
        >
          {sidebarOpen ? (
            isRTL ? <ChevronRight className="w-5 h-5 text-white group-hover:animate-pulse" /> : <ChevronLeft className="w-5 h-5 text-white group-hover:animate-pulse" />
          ) : (
            isRTL ? <ChevronLeft className="w-5 h-5 text-white group-hover:animate-pulse" /> : <ChevronRight className="w-5 h-5 text-white group-hover:animate-pulse" />
          )}
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm z-50">
        <div className={`flex items-center justify-between h-full px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">{t.app.name}</span>
          </div>
          
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"
            >
              <Globe className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className={`absolute top-16 ${isRTL ? 'left-0' : 'right-0'} w-80 max-w-[85vw] h-[calc(100vh-4rem)] bg-white shadow-2xl overflow-y-auto`}>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''} ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile User & Logout */}
            <div className="p-4 border-t border-slate-100 space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-2xl bg-violet-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t.auth.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`transition-all duration-500 ease-out ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} ${isRTL && sidebarOpen ? 'lg:mr-72 lg:ml-0' : ''} ${isRTL && !sidebarOpen ? 'lg:mr-20 lg:ml-0' : ''} pt-16 lg:pt-0`}>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          {/* Decorative Elements */}
          <div className="fixed top-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
