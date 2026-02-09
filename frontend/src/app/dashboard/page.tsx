'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  LayoutDashboard, 
  LogOut, 
  Globe, 
  Users, 
  CheckSquare, 
  Target, 
  TrendingUp,
  TrendingDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  GraduationCap,
  Heart,
  Home,
  MoreHorizontal,
  ArrowUpRight,
  Flag,
  User,
  Loader2,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Moon,
  Sun,
  Zap,
  Award,
  Clock,
  ShieldCheck,
  Activity,
  Flame,
  ListChecks,
} from 'lucide-react';

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  assignedUser?: { name: string };
  goal?: { title: string };
}

interface DashboardGoal {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  owner?: { name: string };
}

interface DashboardLeave {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  user?: { name: string };
}

interface DashboardTraining {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  provider?: string;
  creator?: { name: string };
}

const MOTIVATIONAL_PHRASES = [
  { ar: 'كل يوم فرصة جديدة للإنجاز', en: 'Every day is a new chance to achieve.' },
  { ar: 'استمر، أنت على الطريق الصحيح', en: 'Keep going—you\'re on the right track.' },
  { ar: 'إنجازك اليوم يبني نجاح غدك', en: 'Today\'s progress builds tomorrow\'s success.' },
  { ar: 'التميز يبدأ بخطوة واحدة', en: 'Excellence starts with one step.' },
  { ar: 'أنت قادر على أكثر مما تظن', en: 'You\'re capable of more than you think.' },
  { ar: 'اصنع فرصك بالإصرار', en: 'Create your opportunities with persistence.' },
  { ar: 'العمل الجيد يترك أثراً دائماً', en: 'Good work leaves a lasting impact.' },
];

function getMotivationalPhrase(isRTL: boolean): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000));
  const p = MOTIVATIONAL_PHRASES[dayOfYear % MOTIVATIONAL_PHRASES.length];
  return isRTL ? p.ar : p.en;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [goals, setGoals] = useState<DashboardGoal[]>([]);
  const [leaves, setLeaves] = useState<DashboardLeave[]>([]);
  const [trainings, setTrainings] = useState<DashboardTraining[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        setTasks(data.tasks || []);
        setGoals(data.goals || []);
        setLeaves(data.leaves || []);
        setTrainings(data.trainings || []);
      })
      .catch(() => {})
      .finally(() => setDashboardLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-green-700 dark:text-green-300">{t.app.loading}</span>
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

  const navLinks = [
    { label: isRTL ? 'المهام' : 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: isRTL ? 'الأهداف' : 'Goals', href: '/goals', icon: Target },
    { label: isRTL ? 'مؤشرات الأداء' : 'KPIs', href: '/kpis', icon: TrendingUp },
    { label: isRTL ? 'الإجازات' : 'Leaves', href: '/leaves', icon: CalendarDays },
    { label: isRTL ? 'التدريب' : 'Training', href: '/trainings', icon: GraduationCap },
    { label: isRTL ? 'الفريق' : 'Team', href: '/team', icon: Users },
  ];

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
    { label: isRTL ? 'المهام' : 'Tasks', value: String(tasks.length), icon: CheckSquare, color: 'bg-blue-600', href: '/tasks' },
    { label: isRTL ? 'الأهداف' : 'Goals', value: String(goals.length), icon: Target, color: 'bg-blue-500', href: '/goals' },
    { label: isRTL ? 'الإجازات' : 'Leaves', value: String(leaves.length), icon: CalendarDays, color: 'bg-amber-500', href: '/leaves' },
    { label: isRTL ? 'التدريب' : 'Training', value: String(trainings.length), icon: GraduationCap, color: 'bg-indigo-500', href: '/trainings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 dark:shadow-blue-900/30">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">{t.app.name}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {user.organizationName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 
                           hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={theme === 'dark' ? (isRTL ? 'الوضع الفاتح' : 'Light mode') : (isRTL ? 'الوضع الداكن' : 'Dark mode')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 
                           hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'EN' : 'AR'}
              </button>

              {/* User Menu */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-blue-100 dark:border-gray-700">
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{getRoleLabel(user.role)}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Mobile: name + avatar */}
              <div className="sm:hidden flex items-center gap-2">
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                           rounded-lg transition-colors"
                title={t.auth.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Bar */}
          <nav className="hidden md:flex -mb-px gap-1 overflow-x-auto pb-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 
                           hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-lg transition-colors 
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome banner */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-lg shadow-blue-500/20/50 dark:shadow-blue-900/20">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t.dashboard.welcome}، {user.name} 👋
          </h2>
          <p className="mt-1 text-blue-100">{t.dashboard.overview}</p>
          <p className="mt-2 text-white/90 text-sm sm:text-base italic">{getMotivationalPhrase(isRTL)}</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8" aria-label={isRTL ? 'إحصائيات' : 'Statistics'}>
          {stats.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-slate-600 flex items-center gap-3 sm:gap-4 p-4 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{dashboardLoading ? '...' : stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{stat.label}</p>
              </div>
              {isRTL ? <ChevronLeft className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />}
            </Link>
          ))}
        </section>

        {/* Content sections */}
        <section className="mb-6 sm:mb-8" aria-label={isRTL ? 'المهام والأهداف والإجازات والتدريب' : 'Tasks, Goals, Leaves, Training'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Tasks */}
            <article className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'المهام' : 'Tasks'}</h3>
                </div>
                <Link href="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-slate-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">{isRTL ? 'لا توجد مهام' : 'No tasks yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <li key={task.id}>
                      <Link href="/tasks" className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                        <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className={`px-2 py-0.5 rounded-full ${task.status === 'done' ? 'bg-blue-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : task.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                            {task.status === 'done' ? (isRTL ? 'مكتملة' : 'Done') : task.status === 'in_progress' ? (isRTL ? 'قيد العمل' : 'In progress') : (isRTL ? 'جديدة' : 'To do')}
                          </span>
                          {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>}
                          {task.goal?.title && <span className="flex items-center gap-0.5"><Target className="w-3 h-3" /> {task.goal.title}</span>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          {/* Goals */}
          <article className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'الأهداف' : 'Goals'}</h3>
              </div>
              <Link href="/goals" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-slate-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : goals.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">{isRTL ? 'لا توجد أهداف' : 'No goals yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {goals.slice(0, 5).map((goal) => (
                    <li key={goal.id}>
                      <Link href="/goals" className="block p-3 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors group">
                        <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{goal.title}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-500 rounded-full transition-all" style={{ width: `${Math.min(goal.progress || 0, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums">{goal.progress ?? 0}%</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{goal.owner?.name} · {goal.type}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          {/* Leaves */}
          <article className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'الإجازات' : 'Leaves'}</h3>
              </div>
              <Link href="/leaves" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-slate-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : leaves.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">{isRTL ? 'لا توجد إجازات' : 'No leaves yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {leaves.slice(0, 5).map((leave) => (
                    <li key={leave.id}>
                      <Link href="/leaves" className="block p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors group">
                        <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {leave.user?.name ?? (isRTL ? 'إجازة' : 'Leave')} · {leave.type}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(leave.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')} → {new Date(leave.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${leave.status === 'approved' ? 'bg-blue-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : leave.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                          {leave.status === 'approved' ? (isRTL ? 'معتمدة' : 'Approved') : leave.status === 'rejected' ? (isRTL ? 'مرفوضة' : 'Rejected') : (isRTL ? 'قيد المراجعة' : 'Pending')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          {/* Training */}
          <article className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'التدريب' : 'Training'}</h3>
              </div>
              <Link href="/trainings" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-slate-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : trainings.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">{isRTL ? 'لا يوجد تدريب' : 'No trainings yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {trainings.slice(0, 5).map((training) => (
                    <li key={training.id}>
                      <Link href="/trainings" className="block p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors group">
                        <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">{training.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {training.creator?.name ?? ''} {training.type ? `· ${training.type}` : ''}
                        </p>
                        {(training.startDate || training.endDate) && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {training.startDate && new Date(training.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                            {training.startDate && training.endDate ? ' → ' : ''}
                            {training.endDate && new Date(training.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </p>
                        )}
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${training.status === 'completed' ? 'bg-blue-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : training.status === 'cancelled' ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
                          {training.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') : training.status === 'cancelled' ? (isRTL ? 'ملغى' : 'Cancelled') : (isRTL ? 'قادم' : 'Upcoming')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/tasks" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-slate-600 transition-all group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'إدارة المهام' : 'Manage Tasks'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'إنشاء وتتبع المهام' : 'Create and track tasks'}</p>
              </div>
            </Link>

            <Link href="/goals" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-slate-600 transition-all group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'إدارة الأهداف' : 'Manage Goals'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'تتبع الأهداف السنوية والربعية' : 'Track annual and quarterly goals'}</p>
              </div>
            </Link>

            <Link href="/kpis" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-slate-600 transition-all group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'مؤشرات الأداء' : 'KPIs'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'تتبع وقياس الأداء' : 'Track and measure performance'}</p>
              </div>
            </Link>

            <Link href="/leaves" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 p-4 hover:shadow-md hover:border-amber-200 dark:hover:border-slate-600 transition-all group">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarDays className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'الإجازات' : 'Leaves'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'طلب وإدارة الإجازات' : 'Request and manage leaves'}</p>
              </div>
            </Link>

            <Link href="/trainings" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-600 transition-all group">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'التدريب' : 'Training'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'الدورات والورش التدريبية' : 'Courses and workshops'}</p>
              </div>
            </Link>

            {canManageTeam && (
              <Link href="/team" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-slate-600 transition-all group">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{isRTL ? 'إدارة الفريق' : 'Manage Team'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'إضافة وإدارة أعضاء الفريق' : 'Add and manage team members'}</p>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* AI Analysis - Enhanced */}
        {(() => {
          const isOwnerOrManager = user?.role === 'owner' || user?.role === 'manager';
          const today = new Date().toISOString().slice(0, 10);
          const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done');
          const pendingLeaves = leaves.filter((l) => l.status === 'pending');
          const completedTasks = tasks.filter((t) => t.status === 'done').length;
          const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
          const todoTasks = tasks.length - completedTasks - inProgressTasks;
          const avgGoalProgress = goals.length ? Math.round(goals.reduce((a, g) => a + (g.progress ?? 0), 0) / goals.length) : 0;
          const goalsWithNoProgress = goals.filter((g) => (g.progress ?? 0) === 0).length;
          const myTasks = user ? tasks.filter((t) => t.assignedTo === user.id) : [];
          const myCompleted = myTasks.filter((t) => t.status === 'done').length;
          const myInProgress = myTasks.filter((t) => t.status === 'in_progress').length;
          const myTodo = myTasks.length - myCompleted - myInProgress;
          const myPerformancePercent = myTasks.length ? Math.round((myCompleted / myTasks.length) * 100) : 0;

          // Priority distribution
          const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;
          const medPriority = tasks.filter((t) => t.priority === 'medium' && t.status !== 'done').length;
          const lowPriority = tasks.filter((t) => (!t.priority || t.priority === 'low') && t.status !== 'done').length;
          const totalActivePriority = highPriority + medPriority + lowPriority || 1;

          // High priority overdue
          const highPriorityOverdue = overdueTasks.filter((t) => t.priority === 'high').length;

          // Tasks without goals
          const tasksWithoutGoal = tasks.filter((t) => !t.goal && t.status !== 'done').length;

          // Completed trainings
          const completedTrainings = trainings.filter((t) => t.status === 'completed').length;
          const upcomingTrainings = trainings.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;

          // Project Health Score (0-100)
          const completionRate = tasks.length ? (completedTasks / tasks.length) * 100 : 100;
          const overdueRate = tasks.length ? 100 - (overdueTasks.length / tasks.length) * 100 : 100;
          const goalRate = avgGoalProgress;
          const healthScore = Math.round((completionRate * 0.4 + overdueRate * 0.35 + goalRate * 0.25));
          const healthColor = healthScore >= 75 ? 'text-green-500' : healthScore >= 50 ? 'text-amber-500' : 'text-red-500';
          const healthBg = healthScore >= 75 ? 'stroke-green-500' : healthScore >= 50 ? 'stroke-amber-500' : 'stroke-red-500';
          const healthLabel = healthScore >= 75
            ? (isRTL ? 'ممتاز' : 'Excellent')
            : healthScore >= 50
            ? (isRTL ? 'جيد' : 'Good')
            : (isRTL ? 'يحتاج تحسين' : 'Needs Improvement');

          // Smart suggestions with icons and colors
          const suggestions: { text: string; icon: 'alert' | 'tip' | 'success' | 'info' }[] = [];
          if (highPriorityOverdue > 0) suggestions.push({ text: isRTL ? `${highPriorityOverdue} مهمة عالية الأولوية متأخرة — تحتاج اهتمام فوري` : `${highPriorityOverdue} high-priority task(s) overdue — needs immediate attention`, icon: 'alert' });
          if (overdueTasks.length > 0) suggestions.push({ text: isRTL ? `${overdueTasks.length} مهمة متأخرة — راجع قائمة المهام` : `${overdueTasks.length} overdue task(s) — review your task list`, icon: 'alert' });
          if (goalsWithNoProgress > 0) suggestions.push({ text: isRTL ? `${goalsWithNoProgress} أهداف بدون تقدم — حدّث التقدم` : `${goalsWithNoProgress} goal(s) with no progress — update them`, icon: 'tip' });
          if (pendingLeaves.length > 0) suggestions.push({ text: isRTL ? `${pendingLeaves.length} إجازة قيد المراجعة — بانتظار القرار` : `${pendingLeaves.length} leave(s) pending review`, icon: 'info' });
          if (tasksWithoutGoal > 0) suggestions.push({ text: isRTL ? `${tasksWithoutGoal} مهمة غير مرتبطة بهدف — اربطها لتتبع أفضل` : `${tasksWithoutGoal} task(s) not linked to goals — link them for better tracking`, icon: 'tip' });
          if (inProgressTasks > 5) suggestions.push({ text: isRTL ? `${inProgressTasks} مهمة قيد العمل — ركّز على إنهاء المهام الحالية` : `${inProgressTasks} tasks in progress — focus on completing current work`, icon: 'tip' });
          if (upcomingTrainings > 0) suggestions.push({ text: isRTL ? `${upcomingTrainings} دورة تدريبية قادمة — جهّز فريقك` : `${upcomingTrainings} upcoming training(s) — prepare your team`, icon: 'info' });
          if (completedTasks > 0 && overdueTasks.length === 0) suggestions.push({ text: isRTL ? 'لا توجد مهام متأخرة — أداء ممتاز!' : 'No overdue tasks — excellent performance!', icon: 'success' });
          if (avgGoalProgress >= 80) suggestions.push({ text: isRTL ? `متوسط تقدم الأهداف ${avgGoalProgress}% — اقتربت من الإنجاز!` : `Goal progress at ${avgGoalProgress}% — almost there!`, icon: 'success' });

          const suggestionStyles = {
            alert: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
            tip: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
            success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
            info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
          };

          // Circular progress helper
          const CircularProgress = ({ percent, size = 100, strokeWidth = 8, color }: { percent: number; size?: number; strokeWidth?: number; color: string }) => {
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percent / 100) * circumference;
            return (
              <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-100 dark:text-slate-700" />
                <circle cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={`${color} transition-all duration-1000 ease-out`} />
              </svg>
            );
          };

          return (
            <section className="mb-6 sm:mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                {isRTL ? 'التحليل الذكي' : 'Smart Analytics'}
              </h3>

              {isOwnerOrManager ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Row 1: Health Score + Priority Distribution + Overview Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Project Health Score */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col items-center">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 self-start">
                        <Activity className="w-4 h-4 text-blue-500" />
                        {isRTL ? 'مؤشر صحة المشروع' : 'Project Health'}
                      </h4>
                      <div className="relative">
                        <CircularProgress percent={healthScore} size={120} strokeWidth={10} color={healthBg} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold tabular-nums ${healthColor}`}>{healthScore}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">/100</span>
                        </div>
                      </div>
                      <p className={`text-sm font-medium mt-3 ${healthColor}`}>{healthLabel}</p>
                      <div className="mt-3 w-full space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between"><span>{isRTL ? 'معدل الإنجاز' : 'Completion'}</span><span className="font-medium tabular-nums">{Math.round(completionRate)}%</span></div>
                        <div className="flex justify-between"><span>{isRTL ? 'الالتزام بالمواعيد' : 'On-time'}</span><span className="font-medium tabular-nums">{Math.round(overdueRate)}%</span></div>
                        <div className="flex justify-between"><span>{isRTL ? 'تقدم الأهداف' : 'Goals'}</span><span className="font-medium tabular-nums">{goalRate}%</span></div>
                      </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Flag className="w-4 h-4 text-blue-500" />
                        {isRTL ? 'توزيع الأولويات' : 'Priority Distribution'}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                              {isRTL ? 'عالية' : 'High'}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 font-semibold tabular-nums">{highPriority}</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500" style={{ width: `${(highPriority/totalActivePriority)*100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                              {isRTL ? 'متوسطة' : 'Medium'}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 font-semibold tabular-nums">{medPriority}</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${(medPriority/totalActivePriority)*100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                              {isRTL ? 'منخفضة' : 'Low'}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 font-semibold tabular-nums">{lowPriority}</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${(lowPriority/totalActivePriority)*100}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 dark:text-slate-500">{isRTL ? `إجمالي المهام النشطة: ${totalActivePriority}` : `Total active tasks: ${totalActivePriority}`}</p>
                      </div>
                    </div>

                    {/* Overview Stats - Visual cards */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        {isRTL ? 'ملخص الأداء' : 'Performance Summary'}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">{completedTasks}</p>
                          <p className="text-[11px] text-green-600/70 dark:text-green-400/70 mt-0.5">{isRTL ? 'مكتملة' : 'Completed'}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{inProgressTasks}</p>
                          <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">{isRTL ? 'قيد العمل' : 'In Progress'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 tabular-nums">{todoTasks}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{isRTL ? 'جديدة' : 'To Do'}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">{overdueTasks.length}</p>
                          <p className="text-[11px] text-red-600/70 dark:text-red-400/70 mt-0.5">{isRTL ? 'متأخرة' : 'Overdue'}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{isRTL ? 'متوسط تقدم الأهداف' : 'Avg goal progress'}: <strong className="tabular-nums">{avgGoalProgress}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Smart Suggestions + Alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Smart Suggestions */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        {isRTL ? 'مقترحات ذكية' : 'Smart Suggestions'}
                        {suggestions.length > 0 && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">{suggestions.length}</span>
                        )}
                      </h4>
                      {suggestions.length === 0 ? (
                        <div className="flex flex-col items-center py-6 text-center">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                            <ShieldCheck className="w-6 h-6 text-green-500" />
                          </div>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">{isRTL ? 'كل شيء على ما يرام!' : 'Everything looks great!'}</p>
                          <p className="text-xs text-slate-400 mt-1">{isRTL ? 'لا توجد توصيات حالياً' : 'No recommendations at the moment'}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {suggestions.slice(0, 6).map((s, i) => (
                            <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border ${suggestionStyles[s.icon].bg} ${suggestionStyles[s.icon].border}`}>
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${suggestionStyles[s.icon].dot}`} />
                              <p className={`text-sm ${suggestionStyles[s.icon].text}`}>{s.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Alerts + Training summary */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Alerts */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          {isRTL ? 'تنبيهات إدارية' : 'Alerts'}
                          {(overdueTasks.length > 0 || pendingLeaves.length > 0) && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </h4>
                        {overdueTasks.length === 0 && pendingLeaves.length === 0 ? (
                          <p className="text-sm text-slate-400 py-2">{isRTL ? 'لا توجد تنبيهات — ممتاز!' : 'No alerts — excellent!'}</p>
                        ) : (
                          <ul className="space-y-2 text-sm">
                            {overdueTasks.slice(0, 4).map((t) => (
                              <li key={t.id} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/15 rounded-lg">
                                <Clock className="w-4 h-4 text-red-500 shrink-0" />
                                <span className="text-red-700 dark:text-red-300 truncate">{isRTL ? 'متأخرة' : 'Overdue'}: {t.title}</span>
                                {t.priority === 'high' && <span className="text-[10px] bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 px-1.5 py-0.5 rounded-full shrink-0">{isRTL ? 'عالية' : 'HIGH'}</span>}
                              </li>
                            ))}
                            {pendingLeaves.length > 0 && (
                              <li className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/15 rounded-lg">
                                <CalendarDays className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="text-blue-700 dark:text-blue-300">{isRTL ? 'إجازات قيد المراجعة' : 'Pending leaves'}: {pendingLeaves.length}</span>
                              </li>
                            )}
                          </ul>
                        )}
                      </div>

                      {/* Training Summary */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-indigo-500" />
                          {isRTL ? 'ملخص التدريب' : 'Training Summary'}
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 text-center">
                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{completedTrainings}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{isRTL ? 'مكتملة' : 'Done'}</p>
                          </div>
                          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                          <div className="flex-1 text-center">
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{upcomingTrainings}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{isRTL ? 'قادمة' : 'Upcoming'}</p>
                          </div>
                          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                          <div className="flex-1 text-center">
                            <p className="text-xl font-bold text-slate-600 dark:text-slate-300 tabular-nums">{trainings.length}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{isRTL ? 'الإجمالي' : 'Total'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ===== Employee View ===== */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* My Performance - Circular */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col items-center">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 self-start">
                      <Award className="w-4 h-4 text-blue-500" />
                      {isRTL ? 'أدائي' : 'My Performance'}
                    </h4>
                    <div className="relative">
                      <CircularProgress
                        percent={myPerformancePercent}
                        size={110}
                        strokeWidth={10}
                        color={myPerformancePercent >= 75 ? 'stroke-green-500' : myPerformancePercent >= 50 ? 'stroke-amber-500' : 'stroke-blue-500'}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{myPerformancePercent}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{isRTL ? 'نسبة إنجاز المهام' : 'Task completion rate'}</p>
                    {myPerformancePercent >= 80 && (
                      <div className="flex items-center gap-1.5 mt-2 text-green-600 dark:text-green-400 text-xs font-medium">
                        <Flame className="w-3.5 h-3.5" />
                        {isRTL ? 'أداء رائع!' : 'Great work!'}
                      </div>
                    )}
                  </div>

                  {/* My Tasks Breakdown */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-blue-500" />
                      {isRTL ? 'مهامي' : 'My Tasks'}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                          {isRTL ? 'مكتملة' : 'Completed'}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">{myCompleted}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500" style={{ width: `${myTasks.length ? (myCompleted/myTasks.length)*100 : 0}%` }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                          {isRTL ? 'قيد العمل' : 'In Progress'}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">{myInProgress}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${myTasks.length ? (myInProgress/myTasks.length)*100 : 0}%` }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
                          {isRTL ? 'جديدة' : 'To Do'}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">{myTodo}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-slate-400 to-slate-300 rounded-full transition-all duration-500" style={{ width: `${myTasks.length ? (myTodo/myTasks.length)*100 : 0}%` }} />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400">{isRTL ? `الإجمالي: ${myTasks.length} مهمة` : `Total: ${myTasks.length} tasks`}</p>
                    </div>
                  </div>

                  {/* Employee tips */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {isRTL ? 'نصائح لك' : 'Tips for You'}
                    </h4>
                    <div className="space-y-2">
                      {myTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length > 0 && (
                        <div className="flex items-start gap-3 p-2.5 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-red-500" />
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {isRTL ? `لديك ${myTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length} مهمة متأخرة` : `You have ${myTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length} overdue task(s)`}
                          </p>
                        </div>
                      )}
                      {myInProgress > 3 && (
                        <div className="flex items-start gap-3 p-2.5 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500" />
                          <p className="text-sm text-amber-700 dark:text-amber-300">{isRTL ? 'ركّز على إنهاء المهام الحالية أولاً' : 'Focus on finishing current tasks first'}</p>
                        </div>
                      )}
                      {myPerformancePercent >= 80 && (
                        <div className="flex items-start gap-3 p-2.5 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-green-500" />
                          <p className="text-sm text-green-700 dark:text-green-300">{isRTL ? 'أداؤك ممتاز — استمر!' : 'Excellent performance — keep it up!'}</p>
                        </div>
                      )}
                      {myTasks.length === 0 && (
                        <div className="flex items-start gap-3 p-2.5 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-blue-500" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">{isRTL ? 'لا توجد مهام مسندة إليك حالياً' : 'No tasks assigned to you yet'}</p>
                        </div>
                      )}
                      {myPerformancePercent < 50 && myTasks.length > 0 && (
                        <div className="flex items-start gap-3 p-2.5 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-amber-500" />
                          <p className="text-sm text-amber-700 dark:text-amber-300">{isRTL ? 'حاول إنجاز مهمة واحدة يومياً لتحسين أدائك' : 'Try completing one task daily to improve'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })()}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.app.name}</p>
                <p className="text-xs text-slate-400">
                  &copy; {new Date().getFullYear()} {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/tasks" className="hover:text-blue-600 transition-colors">{isRTL ? 'المهام' : 'Tasks'}</Link>
              <Link href="/goals" className="hover:text-blue-600 transition-colors">{isRTL ? 'الأهداف' : 'Goals'}</Link>
              <Link href="/kpis" className="hover:text-blue-600 transition-colors">{isRTL ? 'المؤشرات' : 'KPIs'}</Link>
              <Link href="/team" className="hover:text-blue-600 transition-colors">{isRTL ? 'الفريق' : 'Team'}</Link>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1">
              {isRTL ? 'صنع بـ' : 'Made with'} <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {isRTL ? 'لإدارة أفضل' : 'for better management'}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileMainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors
                ${link.href === '/dashboard' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{link.label}</span>
            </Link>
          ))}

          <div className="relative flex-1">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex flex-col items-center justify-center gap-1 w-full py-2 rounded-lg transition-colors
                ${moreMenuOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{isRTL ? 'المزيد' : 'More'}</span>
            </button>

            {moreMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />
                <div className={`absolute bottom-full mb-2 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700
                                 py-2 w-48 ${isRTL ? 'left-0' : 'right-0'}`}>
                  {mobileMoreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 
                                 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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

      <div className="md:hidden h-16" />
    </div>
  );
}
