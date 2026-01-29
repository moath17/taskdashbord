'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats, AnnualGoal, MBOGoal, KPI } from '../types';
import { CheckCircle, AlertCircle, Users, AlertTriangle, Calendar, BookOpen, ListTodo, Award, Target, Zap, BarChart3, Activity, Sparkles, Download, Flag, TrendingUp, Star, Rocket, Trophy, Heart } from 'lucide-react';
import dynamic from 'next/dynamic';
import { exportToExcel } from '../utils/exportToExcel';
import { tasksApi, plansApi, goalsApi, kpisApi } from '../api';
import toast from 'react-hot-toast';
import CalendarWidget from '../components/CalendarWidget';
import ProposalsWidget from '../components/ProposalsWidget';
import DailyQuote from '../components/DailyQuote';
import TechNewsWidget from '../components/TechNewsWidget';
import { useAuth } from '../context/AuthContext';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Personalized motivational messages based on performance (Arabic/English alternating)
const getPersonalizedMessage = (stats: DashboardStats, kpis: KPI[], userName: string): { message: string; icon: React.ReactNode; emoji: string; isArabic: boolean } => {
  const completionRate = stats.summary.completionRate;
  const completedTasks = stats.summary.completedTasks;
  const delayedTasks = stats.summary.delayedTasks;
  const totalTasks = stats.summary.totalTasks;
  const avgKpiAchievement = kpis.length > 0 
    ? kpis.reduce((sum, k) => sum + (k.achievementPercentage || 0), 0) / kpis.length 
    : 0;
  
  const dayOfWeek = new Date().getDay();
  const dayOfMonth = new Date().getDate();
  const hour = new Date().getHours();
  
  // Alternate between Arabic and English based on day (odd = Arabic, even = English)
  const isArabic = dayOfMonth % 2 === 1;
  
  // Greetings based on time
  let greetingEn = 'Good morning';
  let greetingAr = 'صباح الخير';
  if (hour >= 12 && hour < 17) {
    greetingEn = 'Good afternoon';
    greetingAr = 'مساء الخير';
  } else if (hour >= 17) {
    greetingEn = 'Good evening';
    greetingAr = 'مساء النور';
  }
  
  const firstName = userName.split(' ')[0];

  // Performance-based messages
  if (completionRate >= 90 && avgKpiAchievement >= 80) {
    return {
      message: isArabic 
        ? `${greetingAr} ${firstName}! 🎉 أداء استثنائي! أنت تتألق بنسبة إنجاز ${completionRate.toFixed(0)}٪. استمر في التميز!`
        : `${greetingEn}, ${firstName}! 🎉 Outstanding performance! You're crushing it with ${completionRate.toFixed(0)}% completion rate!`,
      icon: <Trophy className="w-6 h-6 text-yellow-300" />,
      emoji: '🏆',
      isArabic
    };
  }
  
  if (completionRate >= 75) {
    return {
      message: isArabic
        ? `${greetingAr} ${firstName}! 💪 تقدم رائع! أنجزت ${completedTasks} مهام. أنت على الطريق الصحيح!`
        : `${greetingEn}, ${firstName}! 💪 Great progress! ${completedTasks} tasks completed. You're on track!`,
      icon: <Star className="w-6 h-6 text-yellow-300" />,
      emoji: '⭐',
      isArabic
    };
  }
  
  if (delayedTasks > 0 && delayedTasks >= totalTasks * 0.3) {
    return {
      message: isArabic
        ? `${greetingAr} ${firstName}! 🎯 لديك ${delayedTasks} مهام تحتاج اهتمامك. ركز على الأولويات اليوم!`
        : `${greetingEn}, ${firstName}! 🎯 ${delayedTasks} tasks need attention. Focus on priorities today!`,
      icon: <Target className="w-6 h-6 text-orange-300" />,
      emoji: '💪',
      isArabic
    };
  }
  
  if (totalTasks === 0) {
    return {
      message: isArabic
        ? `${greetingAr} ${firstName}! 🚀 جاهز ليوم مثمر؟ لنضع أهدافاً ونصنع الإنجازات!`
        : `${greetingEn}, ${firstName}! 🚀 Ready for a productive day? Let's set goals and create impact!`,
      icon: <Rocket className="w-6 h-6 text-blue-300" />,
      emoji: '🌟',
      isArabic
    };
  }
  
  if (completionRate >= 50) {
    return {
      message: isArabic
        ? `${greetingAr} ${firstName}! 📈 تقدم ممتاز بنسبة ${completionRate.toFixed(0)}٪. كل خطوة تقربك من هدفك!`
        : `${greetingEn}, ${firstName}! 📈 Solid progress with ${completionRate.toFixed(0)}% completion!`,
      icon: <TrendingUp className="w-6 h-6 text-green-300" />,
      emoji: '📊',
      isArabic
    };
  }
  
  // Day-specific messages
  if (dayOfWeek === 0) {
    return {
      message: isArabic
        ? `${greetingAr} ${firstName}! 🌅 يوم الأحد للتخطيط! راجع أسبوعك وحدد أولوياتك.`
        : `${greetingEn}, ${firstName}! 🌅 Sunday planning time! Review your week and prioritize!`,
      icon: <Calendar className="w-6 h-6 text-purple-300" />,
      emoji: '📋',
      isArabic
    };
  }
  
  if (dayOfWeek === 4) {
    return {
      message: isArabic
        ? `${greetingAr} ${firstName}! 🎯 اقتربت نهاية الأسبوع! اختم بقوة ولديك ${totalTasks - completedTasks} مهام.`
        : `${greetingEn}, ${firstName}! 🎯 Almost weekend! Finish strong with ${totalTasks - completedTasks} tasks left!`,
      icon: <Zap className="w-6 h-6 text-yellow-300" />,
      emoji: '⚡',
      isArabic
    };
  }
  
  // Default encouraging message
  return {
    message: isArabic
      ? `${greetingAr} ${firstName}! 💼 تفانيك يصنع الفرق. لنجعل اليوم يوماً مميزاً!`
      : `${greetingEn}, ${firstName}! 💼 Your dedication makes a difference. Let's make today count!`,
    icon: <Heart className="w-6 h-6 text-red-300" />,
    emoji: '❤️',
    isArabic
  };
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([]);
  const [mboGoals, setMBOGoals] = useState<MBOGoal[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);
  
  // Get personalized message
  const personalizedMessage = useMemo(() => {
    if (!stats || !user) return null;
    return getPersonalizedMessage(stats, kpis, user.name);
  }, [stats, kpis, user]);

  const loadDashboard = async () => {
    try {
      const [data, goals, mbos, kpisData] = await Promise.all([
        dashboardApi.getStats(),
        goalsApi.getAllAnnualGoals(),
        goalsApi.getAllMBOGoals(),
        kpisApi.getAll(),
      ]);
      setStats(data);
      setAnnualGoals(goals);
      setMBOGoals(mbos);
      setKpis(kpisData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      // Fetch all data
      const [allTasks, allVacations, allTrainings] = await Promise.all([
        tasksApi.getAll(),
        plansApi.getVacations(),
        plansApi.getTrainings(),
      ]);

      // Export to Excel
      await exportToExcel({
        tasks: allTasks,
        vacations: allVacations,
        trainings: allTrainings,
      }, 'Task_Management_Year_End_Report');

      toast.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12">Failed to load dashboard</div>;
  }

  const taskStatusChart = {
    options: {
      chart: { type: 'donut' as const },
      labels: ['Completed', 'In Progress', 'New', 'Delayed'],
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      legend: { position: 'bottom' as const },
    },
    series: [
      stats.summary.completedTasks,
      stats.summary.inProgressTasks,
      stats.summary.newTasks,
      stats.summary.delayedTasks,
    ],
  };

  const priorityChart = {
    options: {
      chart: { type: 'bar' as const },
      xaxis: { categories: ['High', 'Medium', 'Low'] },
      colors: ['#ef4444', '#f59e0b', '#10b981'],
      plotOptions: {
        bar: { horizontal: true },
      },
    },
    series: [
      {
        name: 'Tasks',
        data: [stats.tasksByPriority.high, stats.tasksByPriority.medium, stats.tasksByPriority.low],
      },
    ],
  };

  const employeeProgressChart = {
    options: {
      chart: { type: 'bar' as const },
      xaxis: { categories: stats.tasksPerEmployee.map((e) => e.userName) },
      colors: ['#3b82f6'],
      plotOptions: {
        bar: { horizontal: true },
      },
      dataLabels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
    },
    series: [
      {
        name: 'Progress %',
        data: stats.tasksPerEmployee.map((e) => e.progressPercentage),
      },
    ],
  };

  const isArabicMessage = personalizedMessage?.isArabic || false;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Personalized Message */}
      <div className={`rounded-xl shadow-lg p-6 text-white ${
        isArabicMessage 
          ? 'bg-gradient-to-l from-emerald-600 to-teal-800' 
          : 'bg-gradient-to-r from-primary-600 to-primary-800'
      }`}>
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isArabicMessage ? 'lg:flex-row-reverse' : ''
        }`}>
          <div className={`flex-1 ${isArabicMessage ? 'text-right' : ''}`}>
            <div className={`flex items-center gap-3 mb-2 ${isArabicMessage ? 'flex-row-reverse justify-end' : ''}`}>
              {personalizedMessage?.icon || <Sparkles className="w-8 h-8" />}
              <h1 className="text-2xl lg:text-3xl font-bold">
                {isArabicMessage 
                  ? `!${user?.name?.split(' ')[0] || 'مدير'} أهلاً ${personalizedMessage?.emoji}`
                  : `${personalizedMessage?.emoji} Welcome, ${user?.name?.split(' ')[0] || 'Manager'}!`
                }
              </h1>
            </div>
            <p className={`text-sm lg:text-base leading-relaxed max-w-2xl ${
              isArabicMessage ? 'text-emerald-100' : 'text-primary-100'
            }`} style={isArabicMessage ? { fontFamily: 'Tahoma, Arial, sans-serif' } : {}}>
              {personalizedMessage?.message || "Here's your comprehensive overview"}
            </p>
          </div>
          <div className={`flex items-center gap-4 flex-shrink-0 ${isArabicMessage ? 'flex-row-reverse' : ''}`}>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className={`text-sm ${isArabicMessage ? 'text-emerald-100' : 'text-primary-100'}`}>
                  {isArabicMessage ? 'الأداء' : 'Performance'}
                </div>
                <div className="text-2xl font-bold">{stats.summary.completionRate.toFixed(1)}%</div>
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isArabicMessage 
                  ? 'bg-white text-emerald-600 hover:bg-emerald-50' 
                  : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Download className="w-5 h-5" />
              {exporting ? (isArabicMessage ? 'جاري...' : 'Exporting...') : (isArabicMessage ? 'تصدير' : 'Export')}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card hover:shadow-lg transition-all duration-300 border-l-4 border-primary-500 bg-gradient-to-br from-white to-primary-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.summary.totalTasks}</p>
              <p className="text-xs text-gray-500 mt-1">All assigned tasks</p>
            </div>
            <div className="bg-primary-100 rounded-full p-3">
              <ListTodo className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300 border-l-4 border-green-500 bg-gradient-to-br from-white to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.summary.completedTasks}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.summary.totalTasks > 0 
                  ? `${((stats.summary.completedTasks / stats.summary.totalTasks) * 100).toFixed(0)}% of total`
                  : '0%'}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.summary.inProgressTasks}</p>
              <p className="text-xs text-gray-500 mt-1">Active work</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300 border-l-4 border-red-500 bg-gradient-to-br from-white to-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Delayed</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.summary.delayedTasks}</p>
              <p className="text-xs text-gray-500 mt-1">Needs attention</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-300 border-l-4 border-purple-500 bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {stats.summary.completionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Team efficiency</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Title: Quick Overview */}
      <div className="flex items-center gap-2 text-gray-500">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-xs font-medium uppercase tracking-wider">Quick Overview</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">New Tasks</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.summary.newTasks}</p>
            </div>
            <Target className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Employees</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{stats.tasksPerEmployee.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-pink-50 to-rose-50 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Plans</p>
              <p className="text-2xl font-bold text-pink-700 mt-1">
                {stats.vacationPlans.filter(p => p.status === 'pending').length + 
                 stats.trainingPlans.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Section Title: Daily Inspiration & News */}
      <div className="flex items-center gap-2 text-gray-500 mt-2">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-xs font-medium uppercase tracking-wider">💡 Daily Inspiration & News</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Daily Quote & Tech News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyQuote />
        <TechNewsWidget compact />
      </div>

      {/* Section Title: Calendar & Suggestions */}
      <div className="flex items-center gap-2 text-gray-500 mt-2">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-xs font-medium uppercase tracking-wider">📅 Calendar & Suggestions</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Calendar and Proposals Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarWidget compact />
        <ProposalsWidget compact />
      </div>

      {/* Section Title: Goals & KPIs */}
      <div className="flex items-center gap-2 text-gray-500 mt-2">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-xs font-medium uppercase tracking-wider">🎯 Goals & Performance</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Goals & KPIs Summary */}
      {(annualGoals.length > 0 || kpis.length > 0) && (
        <div className="card bg-gradient-to-br from-white to-indigo-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 rounded-lg p-2">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Goals & KPIs Overview</h3>
                <p className="text-sm text-gray-500">Annual goals, MBO goals, and performance indicators</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Flag className="w-4 h-4 text-primary-600" />
                <span className="text-xs text-gray-500">Annual Goals</span>
              </div>
              <p className="text-2xl font-bold text-primary-600">{annualGoals.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">MBO Goals</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{mboGoals.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">KPIs</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{kpis.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Avg Achievement</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {kpis.length > 0 
                  ? Math.round(kpis.reduce((sum, k) => sum + (k.achievementPercentage || 0), 0) / kpis.length)
                  : 0}%
              </p>
            </div>
          </div>

          {/* KPIs Progress */}
          {kpis.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">KPIs Performance</h4>
              <div className="space-y-3">
                {kpis.slice(0, 5).map((kpi) => {
                  const percentage = kpi.achievementPercentage || 0;
                  const colorClass = percentage >= 100 ? 'bg-green-500' 
                    : percentage >= 75 ? 'bg-blue-500' 
                    : percentage >= 50 ? 'bg-yellow-500' 
                    : 'bg-red-500';
                  return (
                    <div key={kpi.id} className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{kpi.title}</p>
                          <p className="text-xs text-gray-500">{kpi.annualGoalTitle}</p>
                        </div>
                        <span className={`text-sm font-bold ${
                          percentage >= 100 ? 'text-green-600' 
                          : percentage >= 75 ? 'text-blue-600' 
                          : percentage >= 50 ? 'text-yellow-600' 
                          : 'text-red-600'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colorClass} transition-all duration-500`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Current: {kpi.currentValue} {kpi.unit}</span>
                        <span>Target: {kpi.targetValue} {kpi.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {kpis.length > 5 && (
                <Link href="/kpis" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3">
                  View all {kpis.length} KPIs →
                </Link>
              )}
            </div>
          )}

          {/* MBO Goals by Employee */}
          {mboGoals.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">MBO Goals by Employee</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MBO Goal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Annual Goal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mboGoals.slice(0, 10).map((mbo) => (
                      <tr key={mbo.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {mbo.userName || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{mbo.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{mbo.annualGoalTitle}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{mbo.targetValue || '-'}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">{mbo.currentValue || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mboGoals.length > 10 && (
                <Link href="/goals" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3">
                  View all {mboGoals.length} MBO Goals →
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section Title: Analytics & Charts */}
      <div className="flex items-center gap-2 text-gray-500 mt-2">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-xs font-medium uppercase tracking-wider">📊 Analytics & Charts</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tasks by Status</h3>
          </div>
          <Chart options={taskStatusChart.options} series={taskStatusChart.series} type="donut" height={300} />
        </div>

        <div className="card hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tasks by Priority</h3>
          </div>
          <Chart options={priorityChart.options} series={priorityChart.series} type="bar" height={300} />
        </div>
      </div>

      {/* Section Title: Team Performance */}
      {stats.tasksPerEmployee.length > 0 && (
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-xs font-medium uppercase tracking-wider">👥 Team Performance</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>
      )}

      {/* Employee Progress Chart */}
      {stats.tasksPerEmployee.length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 mr-2 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Employee Progress</h3>
          </div>
          <Chart
            options={employeeProgressChart.options}
            series={employeeProgressChart.series}
            type="bar"
            height={Math.max(300, stats.tasksPerEmployee.length * 60)}
          />
        </div>
      )}

      {/* Tasks Per Employee Table */}
      {stats.tasksPerEmployee.length > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <ListTodo className="w-5 h-5 mr-2 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tasks Per Employee</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delayed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.tasksPerEmployee.map((emp) => (
                  <tr key={emp.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.totalTasks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{emp.completedTasks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{emp.inProgressTasks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{emp.delayedTasks}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min(emp.progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{emp.progressPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section Title: Plans & Schedules */}
      {(stats.vacationPlans.length > 0 || stats.trainingPlans.length > 0) && (
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-xs font-medium uppercase tracking-wider">📋 Plans & Schedules</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>
      )}

      {/* Vacation Plans */}
      {stats.vacationPlans.length > 0 && (
        <div className="card hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-green-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2 mr-3">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vacation Plans</h3>
                <p className="text-sm text-gray-500">All employee vacation requests</p>
              </div>
            </div>
            <div className="hidden md:block text-sm text-gray-500">
              {stats.vacationPlans.length} total
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.vacationPlans.map((plan) => {
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    approved: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800',
                  };
                  return (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(plan as any).userName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(plan.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(plan.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{plan.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Training Plans */}
      {stats.trainingPlans.length > 0 && (
        <div className="card hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-2 mr-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Training Plans</h3>
                <p className="text-sm text-gray-500">Employee development courses</p>
              </div>
            </div>
            <div className="hidden md:block text-sm text-gray-500">
              {stats.trainingPlans.length} total
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.trainingPlans.map((plan) => {
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    approved: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800',
                  };
                  return (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(plan as any).userName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.courseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.platform}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                          {plan.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section Title: Recent Activity */}
      {stats.recentTasks.length > 0 && (
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-xs font-medium uppercase tracking-wider">⚡ Recent Activity</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>
      )}

      {/* Recent Tasks */}
      {stats.recentTasks.length > 0 && (
        <div className="card hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-lg p-2 mr-3">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500">Latest tasks updates</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(task as any).assignedUserName || task.assignedUser?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          task.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : task.status === 'Delayed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          task.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overlaps Section */}
      {stats.overlaps && stats.overlaps.length > 0 && (
        <div className="card hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-2 mr-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">⚠️ Schedule Conflicts</h3>
                <p className="text-sm text-gray-500">Vacation & training overlaps detected</p>
              </div>
            </div>
            <div className="bg-orange-100 rounded-full px-3 py-1">
              <span className="text-sm font-semibold text-orange-800">{stats.overlaps.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vacation Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vacation Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overlap Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overlap Days
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.overlaps.map((overlap, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {overlap.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {overlap.vacationType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(overlap.vacationStart).toLocaleDateString()} - {new Date(overlap.vacationEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {overlap.trainingName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {overlap.trainingPlatform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                      {new Date(overlap.overlapStart).toLocaleDateString()} - {new Date(overlap.overlapEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        {overlap.overlapDays} {overlap.overlapDays === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

