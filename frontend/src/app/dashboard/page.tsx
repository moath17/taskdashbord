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
      <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-sky-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sky-700 dark:text-sky-200">{t.app.loading}</span>
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
    { label: isRTL ? 'المهام' : 'Tasks', value: String(tasks.length), icon: CheckSquare, color: 'bg-sky-400', href: '/tasks' },
    { label: isRTL ? 'الأهداف' : 'Goals', value: String(goals.length), icon: Target, color: 'bg-sky-500', href: '/goals' },
    { label: isRTL ? 'الإجازات' : 'Leaves', value: String(leaves.length), icon: CalendarDays, color: 'bg-sky-300', href: '/leaves' },
    { label: isRTL ? 'التدريب' : 'Training', value: String(trainings.length), icon: GraduationCap, color: 'bg-sky-600', href: '/trainings' },
  ];

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-sky-950 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-sky-900/80 backdrop-blur-md border-b border-sky-100 dark:border-sky-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-md shadow-sky-200 dark:shadow-sky-900">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sky-900 dark:text-sky-100">{t.app.name}</h1>
                <p className="text-xs text-sky-500 dark:text-sky-400 flex items-center gap-1">
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
                className="flex items-center gap-2 px-3 py-2 text-sm text-sky-600 dark:text-sky-300 
                           hover:bg-sky-100 dark:hover:bg-sky-800 rounded-lg transition-colors"
                title={theme === 'dark' ? (isRTL ? 'الوضع الفاتح' : 'Light mode') : (isRTL ? 'الوضع الداكن' : 'Dark mode')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm text-sky-600 dark:text-sky-300 
                           hover:bg-sky-100 dark:hover:bg-sky-800 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'EN' : 'AR'}
              </button>

              {/* User Menu */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-sky-50 dark:bg-sky-800 rounded-lg border border-sky-100 dark:border-sky-700">
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-medium text-sky-900 dark:text-sky-100">{user.name}</p>
                  <p className="text-xs text-sky-500 dark:text-sky-400">{getRoleLabel(user.role)}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-sky-300 to-sky-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Mobile: name + avatar */}
              <div className="sm:hidden flex items-center gap-2">
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-medium text-sky-900 dark:text-sky-100">{user.name}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-sky-300 to-sky-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-sky-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30
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
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-sky-500 dark:text-sky-400 
                           hover:text-sky-700 dark:hover:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-800 rounded-t-lg transition-colors 
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
        <section className="rounded-2xl bg-gradient-to-br from-sky-300 via-sky-400 to-sky-500 dark:from-sky-700 dark:via-sky-800 dark:to-sky-900 p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-lg shadow-sky-200 dark:shadow-sky-900/50">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t.dashboard.welcome}، {user.name} 👋
          </h2>
          <p className="mt-1 text-sky-100">{t.dashboard.overview}</p>
          <p className="mt-2 text-white/90 text-sm sm:text-base italic">{getMotivationalPhrase(isRTL)}</p>
        </section>

        {/* Stats - 4 cards in a row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8" aria-label={isRTL ? 'إحصائيات' : 'Statistics'}>
          {stats.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 flex items-center gap-3 sm:gap-4 p-4 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-sky-900 dark:text-sky-100 tabular-nums">{dashboardLoading ? '...' : stat.value}</p>
                <p className="text-sm text-sky-500 dark:text-sky-400 truncate">{stat.label}</p>
              </div>
              {isRTL ? <ChevronLeft className="w-5 h-5 text-sky-300 shrink-0" /> : <ChevronRight className="w-5 h-5 text-sky-300 shrink-0" />}
            </Link>
          ))}
        </section>

        {/* Content sections: Tasks, Goals, Leaves, Training */}
        <section className="mb-6 sm:mb-8" aria-label={isRTL ? 'المهام والأهداف والإجازات والتدريب' : 'Tasks, Goals, Leaves, Training'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Tasks */}
            <article className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-sky-50 dark:border-sky-800 flex items-center justify-between bg-sky-50/50 dark:bg-sky-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-sky-500 dark:text-sky-300" />
                  </div>
                  <h3 className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'المهام' : 'Tasks'}</h3>
                </div>
                <Link href="/tasks" className="text-sm font-medium text-sky-500 hover:text-sky-600 dark:text-sky-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-sky-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-sky-400 dark:text-sky-500 py-6 text-center">{isRTL ? 'لا توجد مهام' : 'No tasks yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <li key={task.id}>
                      <Link href="/tasks" className="block p-3 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-800/50 transition-colors group">
                        <p className="font-medium text-sky-900 dark:text-sky-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 truncate">{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-sky-500 dark:text-sky-400">
                          <span className={`px-2 py-0.5 rounded-full ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : task.status === 'in_progress' ? 'bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-300' : 'bg-sky-50 text-sky-600 dark:bg-sky-800 dark:text-sky-400'}`}>
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
          <article className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-sky-50 dark:border-sky-800 flex items-center justify-between bg-sky-50/50 dark:bg-sky-900/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                  <Target className="w-5 h-5 text-sky-500 dark:text-sky-300" />
                </div>
                <h3 className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'الأهداف' : 'Goals'}</h3>
              </div>
              <Link href="/goals" className="text-sm font-medium text-sky-500 hover:text-sky-600 dark:text-sky-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-sky-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : goals.length === 0 ? (
                <p className="text-sm text-sky-400 dark:text-sky-500 py-6 text-center">{isRTL ? 'لا توجد أهداف' : 'No goals yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {goals.slice(0, 5).map((goal) => (
                    <li key={goal.id}>
                      <Link href="/goals" className="block p-3 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-800/50 transition-colors group">
                        <p className="font-medium text-sky-900 dark:text-sky-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 truncate">{goal.title}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-sky-100 dark:bg-sky-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${Math.min(goal.progress || 0, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-sky-600 dark:text-sky-400 tabular-nums">{goal.progress ?? 0}%</span>
                        </div>
                        <p className="text-xs text-sky-500 dark:text-sky-400 mt-1">{goal.owner?.name} · {goal.type}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          {/* Leaves */}
          <article className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-sky-50 dark:border-sky-800 flex items-center justify-between bg-sky-50/50 dark:bg-sky-900/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-sky-500 dark:text-sky-300" />
                </div>
                <h3 className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'الإجازات' : 'Leaves'}</h3>
              </div>
              <Link href="/leaves" className="text-sm font-medium text-sky-500 hover:text-sky-600 dark:text-sky-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-sky-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : leaves.length === 0 ? (
                <p className="text-sm text-sky-400 dark:text-sky-500 py-6 text-center">{isRTL ? 'لا توجد إجازات' : 'No leaves yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {leaves.slice(0, 5).map((leave) => (
                    <li key={leave.id}>
                      <Link href="/leaves" className="block p-3 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-800/50 transition-colors group">
                        <p className="font-medium text-sky-900 dark:text-sky-100 group-hover:text-sky-600 dark:group-hover:text-sky-300">
                          {leave.user?.name ?? (isRTL ? 'إجازة' : 'Leave')} · {leave.type}
                        </p>
                        <p className="text-xs text-sky-500 dark:text-sky-400 mt-1">
                          {new Date(leave.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')} → {new Date(leave.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : leave.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300' : 'bg-sky-100 text-sky-600 dark:bg-sky-800 dark:text-sky-300'}`}>
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
          <article className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-sky-50 dark:border-sky-800 flex items-center justify-between bg-sky-50/50 dark:bg-sky-900/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-sky-500 dark:text-sky-300" />
                </div>
                <h3 className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'التدريب' : 'Training'}</h3>
              </div>
              <Link href="/trainings" className="text-sm font-medium text-sky-500 hover:text-sky-600 dark:text-sky-400 flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 min-h-[180px]">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-36 text-sky-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : trainings.length === 0 ? (
                <p className="text-sm text-sky-400 dark:text-sky-500 py-6 text-center">{isRTL ? 'لا يوجد تدريب' : 'No trainings yet'}</p>
              ) : (
                <ul className="space-y-2">
                  {trainings.slice(0, 5).map((training) => (
                    <li key={training.id}>
                      <Link href="/trainings" className="block p-3 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-800/50 transition-colors group">
                        <p className="font-medium text-sky-900 dark:text-sky-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 truncate">{training.title}</p>
                        <p className="text-xs text-sky-500 dark:text-sky-400 mt-1">
                          {training.creator?.name ?? ''} {training.type ? `· ${training.type}` : ''}
                        </p>
                        {(training.startDate || training.endDate) && (
                          <p className="text-xs text-sky-400 dark:text-sky-500 mt-0.5">
                            {training.startDate && new Date(training.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                            {training.startDate && training.endDate ? ' → ' : ''}
                            {training.endDate && new Date(training.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </p>
                        )}
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${training.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : training.status === 'cancelled' ? 'bg-sky-50 text-sky-500 dark:bg-sky-800 dark:text-sky-400' : 'bg-sky-100 text-sky-600 dark:bg-sky-800 dark:text-sky-300'}`}>
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
          <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-100 mb-3 sm:mb-4">
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/tasks"
              className="bg-white dark:bg-sky-900 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-4 p-4 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
            >
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckSquare className="w-6 h-6 text-sky-500 dark:text-sky-300" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'إدارة المهام' : 'Manage Tasks'}</p>
                <p className="text-sm text-sky-500 dark:text-sky-400">{isRTL ? 'إنشاء وتتبع المهام' : 'Create and track tasks'}</p>
              </div>
            </Link>

            <Link
              href="/goals"
              className="bg-white dark:bg-sky-900 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-4 p-4 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
            >
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6 text-sky-500 dark:text-sky-300" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'إدارة الأهداف' : 'Manage Goals'}</p>
                <p className="text-sm text-sky-500 dark:text-sky-400">{isRTL ? 'تتبع الأهداف السنوية والربعية' : 'Track annual and quarterly goals'}</p>
              </div>
            </Link>

            <Link
              href="/kpis"
              className="bg-white dark:bg-sky-900 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-4 p-4 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
            >
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-sky-500 dark:text-sky-300" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'مؤشرات الأداء' : 'KPIs'}</p>
                <p className="text-sm text-sky-500 dark:text-sky-400">{isRTL ? 'تتبع وقياس الأداء' : 'Track and measure performance'}</p>
              </div>
            </Link>

            <Link
              href="/leaves"
              className="bg-white dark:bg-sky-900 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-4 p-4 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
            >
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarDays className="w-6 h-6 text-sky-500 dark:text-sky-300" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'الإجازات' : 'Leaves'}</p>
                <p className="text-sm text-sky-500 dark:text-sky-400">{isRTL ? 'طلب وإدارة الإجازات' : 'Request and manage leaves'}</p>
              </div>
            </Link>

            <Link
              href="/trainings"
              className="bg-white dark:bg-sky-900 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-4 p-4 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
            >
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-sky-500 dark:text-sky-300" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'التدريب' : 'Training'}</p>
                <p className="text-sm text-sky-500 dark:text-sky-400">{isRTL ? 'الدورات والورش التدريبية' : 'Courses and workshops'}</p>
              </div>
            </Link>

            {canManageTeam && (
              <Link
                href="/team"
                className="bg-white dark:bg-sky-900 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-4 p-4 hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
              >
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-sky-500 dark:text-sky-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sky-900 dark:text-sky-100">{isRTL ? 'إدارة الفريق' : 'Manage Team'}</p>
                  <p className="text-sm text-sky-500 dark:text-sky-400">{isRTL ? 'إضافة وإدارة أعضاء الفريق' : 'Add and manage team members'}</p>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* AI Analysis */}
        {(() => {
          const isOwnerOrManager = user?.role === 'owner' || user?.role === 'manager';
          const today = new Date().toISOString().slice(0, 10);
          const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done');
          const pendingLeaves = leaves.filter((l) => l.status === 'pending');
          const completedTasks = tasks.filter((t) => t.status === 'done').length;
          const avgGoalProgress = goals.length ? Math.round(goals.reduce((a, g) => a + (g.progress ?? 0), 0) / goals.length) : 0;
          const goalsWithNoProgress = goals.filter((g) => (g.progress ?? 0) === 0).length;
          const myTasks = user ? tasks.filter((t) => t.assignedTo === user.id) : [];
          const myCompleted = myTasks.filter((t) => t.status === 'done').length;
          const myPerformancePercent = myTasks.length ? Math.round((myCompleted / myTasks.length) * 100) : 0;
          const suggestions: string[] = [];
          if (overdueTasks.length > 0) suggestions.push(isRTL ? `لديك ${overdueTasks.length} مهمة متأخرة — راجع قائمة المهام` : `${overdueTasks.length} overdue task(s) — review tasks`);
          if (goalsWithNoProgress > 0) suggestions.push(isRTL ? `${goalsWithNoProgress} أهداف دون تقدم — حدّث التقدم` : `${goalsWithNoProgress} goal(s) with no progress — update progress`);
          if (pendingLeaves.length > 0) suggestions.push(isRTL ? `${pendingLeaves.length} إجازة قيد المراجعة` : `${pendingLeaves.length} leave(s) pending review`);

          return (
            <section className="mb-6 sm:mb-8">
              <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-100 mb-3 sm:mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                {isRTL ? 'تحليل ذكي' : 'AI Analysis'}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {isOwnerOrManager ? (
                  <>
                    <div className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm p-4 sm:p-5">
                      <h4 className="font-semibold text-sky-700 dark:text-sky-200 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {isRTL ? 'تحليل عام' : 'Overview'}
                      </h4>
                      <ul className="space-y-2 text-sm text-sky-700 dark:text-sky-300">
                        <li>{isRTL ? 'المهام' : 'Tasks'}: {tasks.length} ({completedTasks} {isRTL ? 'مكتملة' : 'completed'})</li>
                        <li>{isRTL ? 'الأهداف' : 'Goals'}: {goals.length} ({isRTL ? 'متوسط التقدم' : 'avg progress'} {avgGoalProgress}%)</li>
                        <li>{isRTL ? 'الإجازات المعلقة' : 'Pending leaves'}: {pendingLeaves.length}</li>
                        <li className={overdueTasks.length > 0 ? 'text-amber-500 font-medium' : ''}>{isRTL ? 'مهام متأخرة' : 'Overdue tasks'}: {overdueTasks.length}</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm p-4 sm:p-5">
                      <h4 className="font-semibold text-sky-700 dark:text-sky-200 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        {isRTL ? 'مقترحات ذكية' : 'Suggestions'}
                      </h4>
                      {suggestions.length === 0 ? (
                        <p className="text-sm text-sky-400">{isRTL ? 'لا توجد توصيات حالياً' : 'No recommendations at the moment.'}</p>
                      ) : (
                        <ul className="space-y-2 text-sm text-sky-700 dark:text-sky-300">
                          {suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-sky-400 mt-0.5">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="lg:col-span-2 bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm p-4 sm:p-5">
                      <h4 className="font-semibold text-red-500 dark:text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {isRTL ? 'تنبيهات إدارية' : 'Alerts'}
                      </h4>
                      {overdueTasks.length === 0 && pendingLeaves.length === 0 ? (
                        <p className="text-sm text-sky-400">{isRTL ? 'لا توجد تنبيهات' : 'No alerts.'}</p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {overdueTasks.slice(0, 5).map((t) => (
                            <li key={t.id} className="text-amber-600 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              {isRTL ? 'مهمة متأخرة' : 'Overdue'}: {t.title}
                            </li>
                          ))}
                          {pendingLeaves.length > 0 && (
                            <li className="text-sky-600 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              {isRTL ? 'إجازات قيد المراجعة' : 'Leaves pending review'}: {pendingLeaves.length}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm p-4 sm:p-5">
                      <h4 className="font-semibold text-sky-700 dark:text-sky-200 mb-3 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        {isRTL ? 'حالة المهام' : 'My Tasks'}
                      </h4>
                      <ul className="space-y-2 text-sm text-sky-700 dark:text-sky-300">
                        <li>{isRTL ? 'الإجمالي' : 'Total'}: {myTasks.length}</li>
                        <li>{isRTL ? 'مكتملة' : 'Done'}: {myCompleted}</li>
                        <li>{isRTL ? 'قيد العمل' : 'In progress'}: {myTasks.filter((t) => t.status === 'in_progress').length}</li>
                        <li>{isRTL ? 'جديدة' : 'To do'}: {myTasks.length - myCompleted - myTasks.filter((t) => t.status === 'in_progress').length}</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-sky-900 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-800 shadow-sm p-4 sm:p-5">
                      <h4 className="font-semibold text-sky-700 dark:text-sky-200 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {isRTL ? 'الأداء' : 'Performance'}
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-sky-100 dark:bg-sky-800 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${myPerformancePercent}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-sky-700 dark:text-sky-200 tabular-nums">{myPerformancePercent}%</span>
                      </div>
                      <p className="text-xs text-sky-500 mt-2">{isRTL ? 'نسبة إنجاز المهام' : 'Task completion rate'}</p>
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })()}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white/80 dark:bg-sky-900/80 backdrop-blur-md border-t border-sky-100 dark:border-sky-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">{t.app.name}</p>
                <p className="text-xs text-sky-400">
                  &copy; {new Date().getFullYear()} {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-sky-500">
              <Link href="/tasks" className="hover:text-sky-700 transition-colors">
                {isRTL ? 'المهام' : 'Tasks'}
              </Link>
              <Link href="/goals" className="hover:text-sky-700 transition-colors">
                {isRTL ? 'الأهداف' : 'Goals'}
              </Link>
              <Link href="/kpis" className="hover:text-sky-700 transition-colors">
                {isRTL ? 'المؤشرات' : 'KPIs'}
              </Link>
              <Link href="/team" className="hover:text-sky-700 transition-colors">
                {isRTL ? 'الفريق' : 'Team'}
              </Link>
            </div>

            <p className="text-xs text-sky-400 flex items-center gap-1">
              {isRTL ? 'صنع بـ' : 'Made with'} <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {isRTL ? 'لإدارة أفضل' : 'for better management'}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-sky-900/90 backdrop-blur-md border-t border-sky-100 dark:border-sky-800 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileMainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors
                ${link.href === '/dashboard' 
                  ? 'text-sky-500 dark:text-sky-300' 
                  : 'text-sky-300 dark:text-sky-600 hover:text-sky-500 dark:hover:text-sky-400'
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
                ${moreMenuOpen ? 'text-sky-500 dark:text-sky-300' : 'text-sky-300 dark:text-sky-600 hover:text-sky-500 dark:hover:text-sky-400'}`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">
                {isRTL ? 'المزيد' : 'More'}
              </span>
            </button>

            {moreMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMoreMenuOpen(false)} 
                />
                <div className={`absolute bottom-full mb-2 z-50 bg-white dark:bg-sky-900 rounded-xl shadow-xl border border-sky-100 dark:border-sky-800
                                 py-2 w-48 ${isRTL ? 'left-0' : 'right-0'}`}>
                  {mobileMoreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-sky-700 dark:text-sky-200 
                                 hover:bg-sky-50 dark:hover:bg-sky-800 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
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
