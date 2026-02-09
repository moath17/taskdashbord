'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  LayoutDashboard, LogOut, Globe, Users, CheckSquare, Target, TrendingUp, TrendingDown,
  Building2, ChevronLeft, ChevronRight, CalendarDays, GraduationCap, Heart, Home,
  MoreHorizontal, ArrowUpRight, Flag, User, Loader2, Sparkles, Lightbulb,
  AlertTriangle, BarChart3, Moon, Sun, Zap, Award, Clock, ShieldCheck,
  Activity, Flame, ListChecks, CheckCircle2, AlertCircle, Download,
} from 'lucide-react';
import DailyQuote from '@/components/DailyQuote';

/* ── Types ── */
interface DashboardTask {
  id: string; title: string; status: string; priority?: string;
  dueDate?: string; assignedTo?: string; assignedUser?: { name: string }; goal?: { title: string };
}
interface DashboardGoal {
  id: string; title: string; type: string; status: string; progress: number;
  owner?: { name: string }; ownerId?: string;
}
interface DashboardLeave {
  id: string; type: string; status: string; startDate: string; endDate: string;
  user?: { name: string }; userId?: string;
}
interface DashboardTraining {
  id: string; title: string; type: string; status: string;
  startDate?: string; endDate?: string; provider?: string; creator?: { name: string };
  assignedTo?: string; participants?: string[];
}

/* ── Motivational phrases ── */
const PHRASES = [
  { ar: 'كل يوم فرصة جديدة للإنجاز', en: 'Every day is a new chance to achieve.' },
  { ar: 'استمر، أنت على الطريق الصحيح', en: "Keep going—you're on the right track." },
  { ar: 'إنجازك اليوم يبني نجاح غدك', en: "Today's progress builds tomorrow's success." },
  { ar: 'التميز يبدأ بخطوة واحدة', en: 'Excellence starts with one step.' },
  { ar: 'أنت قادر على أكثر مما تظن', en: "You're capable of more than you think." },
  { ar: 'اصنع فرصك بالإصرار', en: 'Create your opportunities with persistence.' },
  { ar: 'العمل الجيد يترك أثراً دائماً', en: 'Good work leaves a lasting impact.' },
];
function getPhrase(rtl: boolean) {
  const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);
  const p = PHRASES[d % PHRASES.length];
  return rtl ? p.ar : p.en;
}

/* ── Circular progress ── */
function Ring({ pct, size = 96, sw = 8, cls }: { pct: number; size?: number; sw?: number; cls: string }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-gray-100 dark:text-gray-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (pct/100)*c} className={`${cls} transition-all duration-700 ease-out`} />
    </svg>
  );
}

/* ══════════════════════════════════════════════ */
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

  useEffect(() => { if (!loading && !isAuthenticated) router.replace('/login'); }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setTasks(d.tasks||[]); setGoals(d.goals||[]); setLeaves(d.leaves||[]); setTrainings(d.trainings||[]); })
      .catch(() => {})
      .finally(() => setDashboardLoading(false));
  }, [isAuthenticated]);

  /* ── Employee cards data (grouped by userId to avoid duplicates) ── */
  const employeeCards = useMemo(() => {
    if (!tasks.length && !goals.length && !leaves.length) return [];
    const map = new Map<string, { name: string; tasks: DashboardTask[]; goals: DashboardGoal[]; leaves: DashboardLeave[] }>();

    // Helper: get or create entry by userId first, fallback to name
    const getEntry = (id: string | undefined, name: string) => {
      if ((!id && !name) || name === '—') return null;
      const cleanName = name.trim();
      if (!cleanName && !id) return null;
      const key = id || cleanName.toLowerCase();
      if (!map.has(key)) map.set(key, { name: cleanName || key, tasks: [], goals: [], leaves: [] });
      // Update name if we got a better one
      const entry = map.get(key)!;
      if (cleanName && (!entry.name || entry.name === key)) entry.name = cleanName;
      return entry;
    };

    tasks.forEach(t => {
      const entry = getEntry(t.assignedTo, t.assignedUser?.name || '');
      if (entry) entry.tasks.push(t);
    });
    goals.forEach(g => {
      const entry = getEntry(g.ownerId, g.owner?.name || '');
      if (entry) entry.goals.push(g);
    });
    leaves.forEach(l => {
      const entry = getEntry(l.userId, l.user?.name || '');
      if (entry) entry.leaves.push(l);
    });

    return Array.from(map.entries()).map(([key, d]) => ({ id: key, ...d }));
  }, [tasks, goals, leaves]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-300">{t.app.loading}</span>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const canManage = user.role === 'owner' || user.role === 'manager';
  const today = new Date().toISOString().slice(0, 10);

  const navLinks = [
    { label: isRTL ? 'المهام' : 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: isRTL ? 'الأهداف' : 'Goals', href: '/goals', icon: Target },
    { label: isRTL ? 'مؤشرات الأداء' : 'KPIs', href: '/kpis', icon: TrendingUp },
    { label: isRTL ? 'الإجازات' : 'Leaves', href: '/leaves', icon: CalendarDays },
    { label: isRTL ? 'التدريب' : 'Training', href: '/trainings', icon: GraduationCap },
    { label: isRTL ? 'الفريق' : 'Team', href: '/team', icon: Users },
  ];
  const mobileMain = [
    { label: isRTL ? 'الرئيسية' : 'Home', href: '/dashboard', icon: Home },
    { label: isRTL ? 'المهام' : 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: isRTL ? 'الأهداف' : 'Goals', href: '/goals', icon: Target },
    { label: isRTL ? 'المؤشرات' : 'KPIs', href: '/kpis', icon: TrendingUp },
  ];
  const mobileMore = [
    { label: isRTL ? 'الإجازات' : 'Leaves', href: '/leaves', icon: CalendarDays },
    { label: isRTL ? 'التدريب' : 'Training', href: '/trainings', icon: GraduationCap },
    { label: isRTL ? 'الفريق' : 'Team', href: '/team', icon: Users },
  ];

  const stats = [
    { label: isRTL ? 'المهام' : 'Tasks', value: tasks.length, icon: CheckSquare, color: 'bg-teal-500', href: '/tasks' },
    { label: isRTL ? 'الأهداف' : 'Goals', value: goals.length, icon: Target, color: 'bg-emerald-500', href: '/goals' },
    { label: isRTL ? 'الإجازات' : 'Leaves', value: leaves.length, icon: CalendarDays, color: 'bg-amber-500', href: '/leaves' },
    { label: isRTL ? 'التدريب' : 'Training', value: trainings.length, icon: GraduationCap, color: 'bg-teal-500', href: '/trainings' },
  ];

  /* ── Calculations ── */
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done');
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const avgGoalProgress = goals.length ? Math.round(goals.reduce((a, g) => a + (g.progress ?? 0), 0) / goals.length) : 0;

  // Health
  const cRate = tasks.length ? (completedTasks / tasks.length) * 100 : 100;
  const oRate = tasks.length ? 100 - (overdueTasks.length / tasks.length) * 100 : 100;
  const health = Math.round(cRate * 0.4 + oRate * 0.35 + avgGoalProgress * 0.25);
  const hClr = health >= 75 ? 'text-emerald-500' : health >= 50 ? 'text-amber-500' : 'text-red-500';
  const hStroke = health >= 75 ? 'stroke-emerald-500' : health >= 50 ? 'stroke-amber-500' : 'stroke-red-500';
  const hLabel = health >= 75 ? (isRTL ? 'ممتاز' : 'Excellent') : health >= 50 ? (isRTL ? 'جيد' : 'Good') : (isRTL ? 'يحتاج تحسين' : 'Needs Work');

  // Priority
  const hp = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const mp = tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length;
  const lp = tasks.filter(t => (!t.priority || t.priority === 'low') && t.status !== 'done').length;
  const tp = hp + mp + lp || 1;

  // My tasks (employee)
  const myTasks = user ? tasks.filter(t => t.assignedTo === user.id) : [];
  const myDone = myTasks.filter(t => t.status === 'done').length;
  const myInProg = myTasks.filter(t => t.status === 'in_progress').length;
  const myPct = myTasks.length ? Math.round((myDone / myTasks.length) * 100) : 0;

  // Suggestions
  const suggestions: { text: string; type: 'alert' | 'tip' | 'ok' | 'info' }[] = [];
  if (overdueTasks.filter(t => t.priority === 'high').length > 0) suggestions.push({ text: isRTL ? `${overdueTasks.filter(t=>t.priority==='high').length} مهمة عالية الأولوية متأخرة` : `${overdueTasks.filter(t=>t.priority==='high').length} high-priority overdue`, type: 'alert' });
  if (overdueTasks.length > 0) suggestions.push({ text: isRTL ? `${overdueTasks.length} مهمة متأخرة — راجع المهام` : `${overdueTasks.length} overdue — review tasks`, type: 'alert' });
  if (goals.filter(g => (g.progress??0) === 0).length > 0) suggestions.push({ text: isRTL ? `${goals.filter(g=>(g.progress??0)===0).length} أهداف بدون تقدم` : `${goals.filter(g=>(g.progress??0)===0).length} goals with no progress`, type: 'tip' });
  if (pendingLeaves.length > 0) suggestions.push({ text: isRTL ? `${pendingLeaves.length} إجازة قيد المراجعة` : `${pendingLeaves.length} pending leave(s)`, type: 'info' });
  if (tasks.filter(t => !t.goal && t.status !== 'done').length > 0) suggestions.push({ text: isRTL ? `${tasks.filter(t=>!t.goal&&t.status!=='done').length} مهمة بدون هدف` : `${tasks.filter(t=>!t.goal&&t.status!=='done').length} task(s) not linked to goals`, type: 'tip' });
  if (completedTasks > 0 && overdueTasks.length === 0) suggestions.push({ text: isRTL ? 'لا مهام متأخرة — أداء ممتاز!' : 'No overdue tasks — great job!', type: 'ok' });

  const sStyle = {
    alert: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    tip: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    ok: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    info: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300',
  };
  const sDot = { alert: 'bg-red-500', tip: 'bg-amber-500', ok: 'bg-emerald-500', info: 'bg-teal-500' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">{t.app.name}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{user.organizationName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Globe className="w-4 h-4 inline-block" /> {language === 'ar' ? 'EN' : 'AR'}
              </button>
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.roles[user.role as keyof typeof t.roles] || user.role}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="sm:hidden flex items-center gap-2">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</p>
                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t.auth.logout}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <nav className="hidden md:flex -mb-px gap-1 overflow-x-auto pb-0">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg transition-colors whitespace-nowrap">
                <l.icon className="w-4 h-4" />{l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Welcome */}
        <section className="rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 dark:from-teal-800 dark:via-teal-700 dark:to-emerald-700 p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-lg shadow-teal-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
                ☀️ {t.dashboard.welcome}، {user.name}! 🔗
              </h2>
              <p className="mt-2 text-white/80 text-sm">
                {isRTL ? `مساء الخير ${user.name}! 🚀 جاهز ليوم متميز؟ لنصنع أهدافاً ونحقق الإنجازات` : `Good day ${user.name}! 🚀 Ready for a productive day? Let's set goals and achieve!`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                <p className="text-[10px] text-white/70 font-medium">{isRTL ? 'الأداء' : 'Performance'}</p>
                <p className="text-lg font-bold">{tasks.length ? ((completedTasks/tasks.length)*100).toFixed(1) : '0.0'}%</p>
              </div>
              <button className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isRTL ? 'تصدير' : 'Export'}
              </button>
            </div>
          </div>
          <p className="mt-3 text-white/70 text-sm italic">{getPhrase(isRTL)}</p>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: isRTL ? 'إجمالي المهام' : 'Total Tasks', value: dashboardLoading ? '...' : tasks.length, subtitle: isRTL ? 'جميع المهام المسندة' : 'All assigned tasks', icon: ListChecks, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
            { label: isRTL ? 'مكتملة' : 'Completed', value: dashboardLoading ? '...' : completedTasks, subtitle: tasks.length ? `${Math.round((completedTasks/tasks.length)*100)}%` : '0%', icon: CheckCircle2, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: isRTL ? 'قيد التنفيذ' : 'In Progress', value: dashboardLoading ? '...' : inProgressTasks, subtitle: isRTL ? 'عمل نشط' : 'Active work', icon: Zap, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
            { label: isRTL ? 'متأخرة' : 'Delayed', value: dashboardLoading ? '...' : overdueTasks.length, subtitle: isRTL ? 'تحتاج اهتمام' : 'Needs attention', icon: AlertCircle, iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
            { label: isRTL ? 'نسبة النجاح' : 'Success Rate', value: dashboardLoading ? '...' : `${tasks.length ? ((completedTasks/tasks.length)*100).toFixed(1) : '0.0'}%`, subtitle: isRTL ? 'كفاءة الفريق' : 'Team efficiency', icon: Award, iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600 dark:text-rose-400' },
          ].map((card, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{card.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.subtitle}</p>
            </div>
          ))}
        </section>

        {/* ── Quick Overview ── */}
        <div className="text-center mb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">── {isRTL ? 'نظرة سريعة' : 'QUICK OVERVIEW'} ──</p>
        </div>
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: isRTL ? 'مهام جديدة' : 'New Tasks', value: dashboardLoading ? '...' : tasks.filter(t => t.status !== 'done' && t.status !== 'in_progress').length, bg: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800', icon: Target, iconColor: 'text-emerald-500 dark:text-emerald-400' },
            { label: isRTL ? 'الموظفون النشطون' : 'Active Employees', value: dashboardLoading ? '...' : employeeCards.length, bg: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800', icon: Users, iconColor: 'text-blue-500 dark:text-blue-400' },
            { label: isRTL ? 'خطط معلقة' : 'Pending Plans', value: dashboardLoading ? '...' : goals.filter(g => g.status !== 'completed').length, bg: 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800', icon: TrendingUp, iconColor: 'text-rose-500 dark:text-rose-400' },
          ].map((card, i) => (
            <div key={i} className={`rounded-xl p-5 ${card.bg} transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">{card.value}</p>
                </div>
                <card.icon className={`w-8 h-8 ${card.iconColor} opacity-60`} />
              </div>
            </div>
          ))}
        </section>

        {/* ── Daily Inspiration & News ── */}
        <div className="text-center mb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">💡 {isRTL ? 'إلهام يومي وأخبار' : 'DAILY INSPIRATION & NEWS'}</p>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <DailyQuote />
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 overflow-hidden">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{isRTL ? '🚀 أخبار التقنية والذكاء الاصطناعي' : '🚀 Tech & AI News'}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{isRTL ? 'آخر التحديثات في عالم البيانات' : 'Latest updates in the data world'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className={`flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{isRTL ? 'كلود يقدم ميزة التفكير المعمق' : 'Claude introduces deep thinking'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isRTL ? 'أنثروبيك تطلق كلود بإمكانيات التفكير المعمق لحل المشاكل المعقدة' : 'Anthropic launches Claude with deep thinking capabilities'}</p>
                  <div className={`flex items-center gap-2 mt-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-gray-400">Anthropic</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Employee Cards (Manager/Owner only) ══ */}
        {canManage && employeeCards.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              {isRTL ? 'حالة الموظفين' : 'Team Overview'}
              <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full">{employeeCards.length}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {employeeCards.map(emp => {
                const empDone = emp.tasks.filter(t => t.status === 'done').length;
                const empOverdue = emp.tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length;
                const empPct = emp.tasks.length ? Math.round((empDone / emp.tasks.length) * 100) : 0;
                const empGoalAvg = emp.goals.length ? Math.round(emp.goals.reduce((a, g) => a + (g.progress ?? 0), 0) / emp.goals.length) : 0;
                const empPendingLeaves = emp.leaves.filter(l => l.status === 'pending').length;
                const empApprovedLeaves = emp.leaves.filter(l => l.status === 'approved').length;
                return (
                  <div key={emp.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all">
                    {/* Name + Avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">{emp.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{emp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {emp.tasks.length} {isRTL ? 'مهمة' : 'tasks'} · {emp.goals.length} {isRTL ? 'هدف' : 'goals'}
                        </p>
                      </div>
                      {/* Mini ring */}
                      <div className="relative shrink-0">
                        <Ring pct={empPct} size={44} sw={4} cls={empPct >= 75 ? 'stroke-emerald-500' : empPct >= 50 ? 'stroke-amber-500' : 'stroke-teal-500'} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">{empPct}%</span>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg py-2">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{empDone}</p>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">{isRTL ? 'مكتملة' : 'Done'}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg py-2">
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">{emp.tasks.filter(t => t.status === 'in_progress').length}</p>
                        <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60">{isRTL ? 'جارية' : 'Active'}</p>
                      </div>
                      <div className={`rounded-lg py-2 ${empOverdue > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <p className={`text-sm font-bold tabular-nums ${empOverdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{empOverdue}</p>
                        <p className={`text-[10px] ${empOverdue > 0 ? 'text-red-600/70 dark:text-red-400/60' : 'text-gray-500/70 dark:text-gray-400/60'}`}>{isRTL ? 'متأخرة' : 'Late'}</p>
                      </div>
                    </div>

                    {/* Goal progress */}
                    {emp.goals.length > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" />{isRTL ? 'الأهداف' : 'Goals'}</span>
                          <span className="font-medium tabular-nums">{empGoalAvg}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${empGoalAvg}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Leaves & badge */}
                    {emp.leaves.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                        {empApprovedLeaves > 0 && <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">{empApprovedLeaves} {isRTL ? 'معتمدة' : 'approved'}</span>}
                        {empPendingLeaves > 0 && <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">{empPendingLeaves} {isRTL ? 'معلقة' : 'pending'}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ Content Sections ══ */}
        <section className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Tasks */}
            <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center"><CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" /></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{isRTL ? 'المهام' : 'Tasks'}</h3>
                </div>
                <Link href="/tasks" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1">{isRTL ? 'الكل' : 'View all'}<ArrowUpRight className="w-4 h-4" /></Link>
              </div>
              <div className="p-4 min-h-[160px]">
                {dashboardLoading ? <div className="flex items-center justify-center h-32"><Loader2 className="w-7 h-7 animate-spin text-gray-300" /></div>
                : tasks.length === 0 ? <p className="text-sm text-gray-400 py-6 text-center">{isRTL ? 'لا توجد مهام' : 'No tasks yet'}</p>
                : <ul className="space-y-1.5">{tasks.slice(0, 5).map(task => (
                    <li key={task.id}><Link href="/tasks" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full ${task.status==='done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : task.status==='in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {task.status==='done' ? (isRTL?'مكتملة':'Done') : task.status==='in_progress' ? (isRTL?'قيد العمل':'In progress') : (isRTL?'جديدة':'To do')}
                        </span>
                        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString(isRTL?'ar-SA':'en-US')}</span>}
                        {task.goal?.title && <span className="flex items-center gap-0.5"><Target className="w-3 h-3" />{task.goal.title}</span>}
                      </div>
                    </Link></li>
                  ))}</ul>}
              </div>
            </article>

            {/* Goals */}
            <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Target className="w-4 h-4 text-emerald-600 dark:text-violet-400" /></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{isRTL ? 'الأهداف' : 'Goals'}</h3>
                </div>
                <Link href="/goals" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-violet-400 flex items-center gap-1">{isRTL ? 'الكل' : 'View all'}<ArrowUpRight className="w-4 h-4" /></Link>
              </div>
              <div className="p-4 min-h-[160px]">
                {dashboardLoading ? <div className="flex items-center justify-center h-32"><Loader2 className="w-7 h-7 animate-spin text-gray-300" /></div>
                : goals.length === 0 ? <p className="text-sm text-gray-400 py-6 text-center">{isRTL ? 'لا توجد أهداف' : 'No goals yet'}</p>
                : <ul className="space-y-1.5">{goals.slice(0, 5).map(goal => (
                    <li key={goal.id}><Link href="/goals" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-violet-400 truncate">{goal.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{ width: `${Math.min(goal.progress||0, 100)}%` }} /></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 tabular-nums">{goal.progress??0}%</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{goal.owner?.name} · {goal.type}</p>
                    </Link></li>
                  ))}</ul>}
              </div>
            </article>

            {/* Leaves */}
            <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{isRTL ? 'الإجازات' : 'Leaves'}</h3>
                </div>
                <Link href="/leaves" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1">{isRTL ? 'الكل' : 'View all'}<ArrowUpRight className="w-4 h-4" /></Link>
              </div>
              <div className="p-4 min-h-[160px]">
                {dashboardLoading ? <div className="flex items-center justify-center h-32"><Loader2 className="w-7 h-7 animate-spin text-gray-300" /></div>
                : leaves.length === 0 ? <p className="text-sm text-gray-400 py-6 text-center">{isRTL ? 'لا توجد إجازات' : 'No leaves yet'}</p>
                : <ul className="space-y-1.5">{leaves.slice(0, 5).map(leave => (
                    <li key={leave.id}><Link href="/leaves" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">{leave.user?.name ?? (isRTL?'إجازة':'Leave')} · {leave.type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(leave.startDate).toLocaleDateString(isRTL?'ar-SA':'en-US')} → {new Date(leave.endDate).toLocaleDateString(isRTL?'ar-SA':'en-US')}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${leave.status==='approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : leave.status==='rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                        {leave.status==='approved' ? (isRTL?'معتمدة':'Approved') : leave.status==='rejected' ? (isRTL?'مرفوضة':'Rejected') : (isRTL?'قيد المراجعة':'Pending')}
                      </span>
                    </Link></li>
                  ))}</ul>}
              </div>
            </article>

            {/* Training */}
            <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" /></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{isRTL ? 'التدريب' : 'Training'}</h3>
                </div>
                <Link href="/trainings" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1">{isRTL ? 'الكل' : 'View all'}<ArrowUpRight className="w-4 h-4" /></Link>
              </div>
              <div className="p-4 min-h-[160px]">
                {dashboardLoading ? <div className="flex items-center justify-center h-32"><Loader2 className="w-7 h-7 animate-spin text-gray-300" /></div>
                : trainings.length === 0 ? <p className="text-sm text-gray-400 py-6 text-center">{isRTL ? 'لا يوجد تدريب' : 'No trainings yet'}</p>
                : <ul className="space-y-1.5">{trainings.slice(0, 5).map(tr => (
                    <li key={tr.id}><Link href="/trainings" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">{tr.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tr.creator?.name ?? ''} {tr.type ? `· ${tr.type}` : ''}</p>
                      {(tr.startDate || tr.endDate) && <p className="text-xs text-gray-400 mt-0.5">{tr.startDate && new Date(tr.startDate).toLocaleDateString(isRTL?'ar-SA':'en-US')}{tr.startDate && tr.endDate ? ' → ' : ''}{tr.endDate && new Date(tr.endDate).toLocaleDateString(isRTL?'ar-SA':'en-US')}</p>}
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tr.status==='completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : tr.status==='cancelled' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'}`}>
                        {tr.status==='completed' ? (isRTL?'مكتمل':'Completed') : tr.status==='cancelled' ? (isRTL?'ملغى':'Cancelled') : (isRTL?'قادم':'Upcoming')}
                      </span>
                    </Link></li>
                  ))}</ul>}
              </div>
            </article>
          </div>
        </section>

        {/* ══ Quick Actions ══ */}
        <section className="mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { href: '/tasks', icon: CheckSquare, color: 'bg-teal-100 dark:bg-teal-900/30', iClr: 'text-teal-600 dark:text-teal-400', label: isRTL ? 'إدارة المهام' : 'Manage Tasks', desc: isRTL ? 'إنشاء وتتبع المهام' : 'Create and track tasks' },
              { href: '/goals', icon: Target, color: 'bg-emerald-100 dark:bg-emerald-900/30', iClr: 'text-emerald-600 dark:text-violet-400', label: isRTL ? 'إدارة الأهداف' : 'Manage Goals', desc: isRTL ? 'تتبع الأهداف' : 'Track goals' },
              { href: '/kpis', icon: TrendingUp, color: 'bg-teal-100 dark:bg-teal-900/30', iClr: 'text-teal-600 dark:text-teal-400', label: isRTL ? 'مؤشرات الأداء' : 'KPIs', desc: isRTL ? 'قياس الأداء' : 'Measure performance' },
              { href: '/leaves', icon: CalendarDays, color: 'bg-amber-100 dark:bg-amber-900/30', iClr: 'text-amber-600 dark:text-amber-400', label: isRTL ? 'الإجازات' : 'Leaves', desc: isRTL ? 'طلب وإدارة الإجازات' : 'Request and manage' },
              { href: '/trainings', icon: GraduationCap, color: 'bg-teal-100 dark:bg-teal-900/30', iClr: 'text-teal-600 dark:text-teal-400', label: isRTL ? 'التدريب' : 'Training', desc: isRTL ? 'الدورات والورش' : 'Courses & workshops' },
              ...(canManage ? [{ href: '/team', icon: Users, color: 'bg-teal-100 dark:bg-teal-900/30', iClr: 'text-teal-600 dark:text-teal-400', label: isRTL ? 'الفريق' : 'Team', desc: isRTL ? 'إدارة أعضاء الفريق' : 'Manage members' }] : []),
            ].map(a => (
              <Link key={a.href} href={a.href} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 p-4 hover:shadow-md transition-all group">
                <div className={`w-11 h-11 ${a.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}><a.icon className={`w-5 h-5 ${a.iClr}`} /></div>
                <div className="min-w-0"><p className="font-semibold text-gray-900 dark:text-white">{a.label}</p><p className="text-sm text-gray-500 dark:text-gray-400">{a.desc}</p></div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ Smart Analytics ══ */}
        <section className="mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
            {isRTL ? 'التحليل الذكي' : 'Smart Analytics'}
          </h3>

          {canManage ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Health */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col items-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 self-start"><Activity className="w-4 h-4 text-teal-500" />{isRTL ? 'صحة المشروع' : 'Project Health'}</h4>
                  <div className="relative"><Ring pct={health} size={110} sw={10} cls={hStroke} /><div className="absolute inset-0 flex flex-col items-center justify-center"><span className={`text-2xl font-bold ${hClr}`}>{health}</span><span className="text-[10px] text-gray-400">/100</span></div></div>
                  <p className={`text-sm font-medium mt-3 ${hClr}`}>{hLabel}</p>
                  <div className="mt-3 w-full space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between"><span>{isRTL ? 'الإنجاز' : 'Completion'}</span><span className="font-medium tabular-nums">{Math.round(cRate)}%</span></div>
                    <div className="flex justify-between"><span>{isRTL ? 'المواعيد' : 'On-time'}</span><span className="font-medium tabular-nums">{Math.round(oRate)}%</span></div>
                    <div className="flex justify-between"><span>{isRTL ? 'الأهداف' : 'Goals'}</span><span className="font-medium tabular-nums">{avgGoalProgress}%</span></div>
                  </div>
                </div>

                {/* Priority */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Flag className="w-4 h-4 text-teal-500" />{isRTL ? 'الأولويات' : 'Priorities'}</h4>
                  {[
                    { label: isRTL ? 'عالية' : 'High', count: hp, clr: 'bg-red-500', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
                    { label: isRTL ? 'متوسطة' : 'Medium', count: mp, clr: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
                    { label: isRTL ? 'منخفضة' : 'Low', count: lp, clr: 'bg-gray-400', dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400' },
                  ].map(p => (
                    <div key={p.label} className="mb-3 last:mb-0">
                      <div className="flex justify-between text-sm mb-1"><span className={`font-medium flex items-center gap-1.5 ${p.text}`}><span className={`w-2 h-2 rounded-full ${p.dot}`} />{p.label}</span><span className="text-gray-600 dark:text-gray-300 font-semibold tabular-nums">{p.count}</span></div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${p.clr} rounded-full transition-all duration-500`} style={{ width: `${(p.count/tp)*100}%` }} /></div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-teal-500" />{isRTL ? 'ملخص المهام' : 'Task Summary'}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center"><p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{completedTasks}</p><p className="text-[10px] text-emerald-600/70">{isRTL ? 'مكتملة' : 'Done'}</p></div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center"><p className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">{inProgressTasks}</p><p className="text-[10px] text-amber-600/70">{isRTL ? 'جارية' : 'Active'}</p></div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"><p className="text-xl font-bold text-gray-600 dark:text-gray-300 tabular-nums">{tasks.length - completedTasks - inProgressTasks}</p><p className="text-[10px] text-gray-500">{isRTL ? 'جديدة' : 'Todo'}</p></div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center"><p className="text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">{overdueTasks.length}</p><p className="text-[10px] text-red-600/70">{isRTL ? 'متأخرة' : 'Late'}</p></div>
                  </div>
                </div>
              </div>

              {/* Suggestions + Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" />{isRTL ? 'مقترحات' : 'Suggestions'}{suggestions.length > 0 && <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full">{suggestions.length}</span>}</h4>
                  {suggestions.length === 0 ? (
                    <div className="flex flex-col items-center py-4 text-center"><ShieldCheck className="w-10 h-10 text-emerald-400 mb-2" /><p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{isRTL ? 'كل شيء على ما يرام!' : 'All good!'}</p></div>
                  ) : (
                    <div className="space-y-2">{suggestions.slice(0, 6).map((s, i) => (
                      <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border ${sStyle[s.type]}`}><span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sDot[s.type]}`} /><p className="text-sm">{s.text}</p></div>
                    ))}</div>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />{isRTL ? 'تنبيهات' : 'Alerts'}{(overdueTasks.length > 0 || pendingLeaves.length > 0) && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}</h4>
                  {overdueTasks.length === 0 && pendingLeaves.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">{isRTL ? 'لا تنبيهات' : 'No alerts'}</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {overdueTasks.slice(0, 4).map(t => (<li key={t.id} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/15 rounded-lg"><Clock className="w-4 h-4 text-red-500 shrink-0" /><span className="text-red-700 dark:text-red-300 truncate">{t.title}</span>{t.priority==='high' && <span className="text-[10px] bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 px-1.5 py-0.5 rounded-full shrink-0">{isRTL?'عالية':'HIGH'}</span>}</li>))}
                      {pendingLeaves.length > 0 && <li className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/15 rounded-lg"><CalendarDays className="w-4 h-4 text-amber-500 shrink-0" /><span className="text-amber-700 dark:text-amber-300">{isRTL ? 'إجازات معلقة' : 'Pending leaves'}: {pendingLeaves.length}</span></li>}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Employee Analytics ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col items-center">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 self-start"><Award className="w-4 h-4 text-teal-500" />{isRTL ? 'أدائي' : 'My Performance'}</h4>
                <div className="relative"><Ring pct={myPct} size={100} sw={8} cls={myPct >= 75 ? 'stroke-emerald-500' : myPct >= 50 ? 'stroke-amber-500' : 'stroke-teal-500'} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold text-gray-800 dark:text-white">{myPct}%</span></div></div>
                <p className="text-sm text-gray-500 mt-3">{isRTL ? 'نسبة الإنجاز' : 'Completion rate'}</p>
                {myPct >= 80 && <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1"><Flame className="w-3 h-3" />{isRTL ? 'أداء رائع!' : 'Great work!'}</p>}
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><ListChecks className="w-4 h-4 text-teal-500" />{isRTL ? 'مهامي' : 'My Tasks'}</h4>
                {[
                  { label: isRTL?'مكتملة':'Done', count: myDone, clr: 'bg-emerald-500', bg: 'bg-emerald-500' },
                  { label: isRTL?'جارية':'Active', count: myInProg, clr: 'bg-amber-500', bg: 'bg-amber-500' },
                  { label: isRTL?'جديدة':'Todo', count: myTasks.length - myDone - myInProg, clr: 'bg-gray-400', bg: 'bg-gray-400' },
                ].map(r => (
                  <div key={r.label} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${r.bg}`} />{r.label}</span><span className="font-bold text-gray-800 dark:text-white tabular-nums">{r.count}</span></div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${r.clr} rounded-full transition-all`} style={{ width: `${myTasks.length ? (r.count/myTasks.length)*100 : 0}%` }} /></div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">{isRTL ? `الإجمالي: ${myTasks.length}` : `Total: ${myTasks.length}`}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />{isRTL ? 'نصائح' : 'Tips'}</h4>
                <div className="space-y-2">
                  {myTasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length > 0 && <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${sStyle.alert}`}><span className="w-2 h-2 rounded-full mt-1.5 bg-red-500 shrink-0" /><p className="text-sm">{isRTL ? `${myTasks.filter(t=>t.dueDate&&t.dueDate<today&&t.status!=='done').length} مهمة متأخرة` : `${myTasks.filter(t=>t.dueDate&&t.dueDate<today&&t.status!=='done').length} overdue`}</p></div>}
                  {myPct >= 80 && <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${sStyle.ok}`}><span className="w-2 h-2 rounded-full mt-1.5 bg-emerald-500 shrink-0" /><p className="text-sm">{isRTL ? 'أداء ممتاز — استمر!' : 'Excellent — keep it up!'}</p></div>}
                  {myPct < 50 && myTasks.length > 0 && <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${sStyle.tip}`}><span className="w-2 h-2 rounded-full mt-1.5 bg-amber-500 shrink-0" /><p className="text-sm">{isRTL ? 'أنجز مهمة يومياً لتحسين أدائك' : 'Complete one task daily to improve'}</p></div>}
                  {myTasks.length === 0 && <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${sStyle.info}`}><span className="w-2 h-2 rounded-full mt-1.5 bg-teal-500 shrink-0" /><p className="text-sm">{isRTL ? 'لا مهام حالياً' : 'No tasks assigned yet'}</p></div>}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center"><LayoutDashboard className="w-4 h-4 text-white" /></div>
              <div><p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.app.name}</p><p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p></div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/tasks" className="hover:text-teal-600 transition-colors">{isRTL ? 'المهام' : 'Tasks'}</Link>
              <Link href="/goals" className="hover:text-teal-600 transition-colors">{isRTL ? 'الأهداف' : 'Goals'}</Link>
              <Link href="/kpis" className="hover:text-teal-600 transition-colors">{isRTL ? 'المؤشرات' : 'KPIs'}</Link>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">{isRTL ? 'صنع بـ' : 'Made with'}<Heart className="w-3 h-3 text-red-400 fill-red-400" />{isRTL ? 'لإدارة أفضل' : 'for better management'}</p>
          </div>
        </div>
      </footer>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileMain.map(l => (
            <Link key={l.href} href={l.href} className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors ${l.href === '/dashboard' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'}`}>
              <l.icon className="w-5 h-5" /><span className="text-[10px] font-medium leading-none">{l.label}</span>
            </Link>
          ))}
          <div className="relative flex-1">
            <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} className={`flex flex-col items-center justify-center gap-1 w-full py-2 rounded-lg transition-colors ${moreMenuOpen ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'}`}>
              <MoreHorizontal className="w-5 h-5" /><span className="text-[10px] font-medium leading-none">{isRTL ? 'المزيد' : 'More'}</span>
            </button>
            {moreMenuOpen && (<><div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} /><div className={`absolute bottom-full mb-2 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 w-48 ${isRTL ? 'left-0' : 'right-0'}`}>
              {mobileMore.map(l => (<Link key={l.href} href={l.href} onClick={() => setMoreMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"><l.icon className="w-5 h-5" /><span className="font-medium">{l.label}</span></Link>))}
            </div></>)}
          </div>
        </div>
      </nav>
      <div className="md:hidden h-16" />
    </div>
  );
}
