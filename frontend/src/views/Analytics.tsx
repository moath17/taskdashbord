'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users,
  Zap,
  Shield,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Activity,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  getAnalyticsDashboard,
  getWorkloadAnalysis,
  getAnalyticsStatus,
  AnalyticsDashboard,
  GoalRiskAnalysis,
  UserWorkloadAnalysis,
  AnalyticsStatus
} from '../api/analytics';
import toast from 'react-hot-toast';

// Risk Level Colors
const getRiskColor = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
  switch (level) {
    case 'LOW': return { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'MEDIUM': return { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50', border: 'border-amber-200' };
    case 'HIGH': return { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-50', border: 'border-red-200' };
  }
};

// Animated Risk Gauge Component
const RiskGauge = ({ score, size = 'large' }: { score: number; size?: 'large' | 'small' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = size === 'large' ? 80 : 40;
  const strokeWidth = size === 'large' ? 12 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference * 0.75;
  
  const getGaugeColor = () => {
    if (animatedScore <= 39) return '#10b981';
    if (animatedScore <= 69) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg 
        className="transform -rotate-[135deg]" 
        width={radius * 2 + strokeWidth * 2} 
        height={radius * 2 + strokeWidth * 2}
      >
        {/* Background arc */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
        />
        {/* Animated arc */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke={getGaugeColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`${size === 'large' ? 'text-4xl' : 'text-xl'} font-bold`} style={{ color: getGaugeColor() }}>
          {Math.round(animatedScore)}
        </span>
        <span className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-slate-500`}>/ 100</span>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, color, label }: { value: number; color: string; label: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium">{Math.round(value)}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-700 ease-out rounded-full`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default function Analytics() {
  const { t, isRTL } = useLanguage();
  const [status, setStatus] = useState<AnalyticsStatus | null>(null);
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [workload, setWorkload] = useState<UserWorkloadAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<GoalRiskAnalysis | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Check status first
      const statusData = await getAnalyticsStatus();
      setStatus(statusData);

      if (!statusData.enabled) {
        setLoading(false);
        return;
      }

      // Load all analytics data in parallel
      const [dashboardData, workloadData] = await Promise.all([
        getAnalyticsDashboard(),
        getWorkloadAnalysis().catch(() => []) // May fail for non-managers
      ]);

      setDashboard(dashboardData);
      setWorkload(workloadData);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      if (error.response?.status !== 403) {
        toast.error(t.common.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600" />
            <Brain className="w-8 h-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-500">{t.analytics?.loading || 'Analyzing data...'}</p>
        </div>
      </div>
    );
  }

  if (status && !status.enabled) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 max-w-md">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            {t.analytics?.disabled || 'Analytics Module Disabled'}
          </h2>
          <p className="text-slate-500">
            {t.analytics?.enableHint || 'Contact your administrator to enable Smart Analytics.'}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const healthColors = getRiskColor(dashboard.summary.overallHealthStatus);
  const velocityIcon = {
    increasing: <TrendingUp className="w-5 h-5 text-emerald-500" />,
    stable: <Minus className="w-5 h-5 text-slate-500" />,
    decreasing: <TrendingDown className="w-5 h-5 text-red-500" />
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t.analytics?.title || 'Smart Analytics'}
            </h1>
            <p className="text-slate-500 text-sm">
              {t.analytics?.subtitle || 'AI-powered risk analysis & predictions'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-full text-violet-600 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {t.analytics?.readOnly || 'Read-Only Analytics'}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Health */}
        <div className={`p-6 rounded-2xl border ${healthColors.light} ${healthColors.border}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">
              {t.analytics?.overallHealth || 'Overall Health'}
            </span>
            <Activity className={`w-5 h-5 ${healthColors.text}`} />
          </div>
          <RiskGauge score={dashboard.summary.averageRiskScore} />
          <p className={`text-center mt-2 font-semibold ${healthColors.text}`}>
            {dashboard.summary.overallHealthStatus === 'LOW' ? (t.analytics?.healthy || 'Healthy') :
             dashboard.summary.overallHealthStatus === 'MEDIUM' ? (t.analytics?.caution || 'Caution') :
             (t.analytics?.critical || 'Critical')}
          </p>
        </div>

        {/* Total Goals */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">
              {t.analytics?.totalGoals || 'Total Goals'}
            </span>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-4xl font-bold text-slate-800">{dashboard.summary.totalGoals}</div>
          <p className="text-sm text-slate-500 mt-2">
            {t.analytics?.beingTracked || 'Being tracked'}
          </p>
        </div>

        {/* Goals at Risk */}
        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">
              {t.analytics?.goalsAtRisk || 'Goals at Risk'}
            </span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-4xl font-bold text-red-600">{dashboard.summary.goalsAtRisk}</div>
          <p className="text-sm text-red-500 mt-2">
            {t.analytics?.needAttention || 'Need immediate attention'}
          </p>
        </div>

        {/* Velocity */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">
              {t.analytics?.taskVelocity || 'Task Velocity'}
            </span>
            {velocityIcon[dashboard.velocityMetrics.velocityTrend]}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-800">
              {dashboard.velocityMetrics.tasksCompletedThisWeek}
            </span>
            <span className="text-sm text-slate-500">/ {t.analytics?.week || 'week'}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-slate-500">{t.analytics?.lastWeek || 'Last week'}:</span>
            <span className="font-medium">{dashboard.velocityMetrics.tasksCompletedLastWeek}</span>
          </div>
        </div>
      </div>

      {/* Risk Distribution & Top Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-violet-500" />
            <h2 className="font-semibold text-slate-800">
              {t.analytics?.riskDistribution || 'Risk Distribution'}
            </h2>
          </div>
          
          <div className="space-y-4">
            <ProgressBar 
              value={dashboard.summary.totalGoals > 0 ? (dashboard.riskDistribution.low / dashboard.summary.totalGoals) * 100 : 0} 
              color="bg-emerald-500" 
              label={`🟢 ${t.analytics?.lowRisk || 'Low Risk'} (${dashboard.riskDistribution.low})`} 
            />
            <ProgressBar 
              value={dashboard.summary.totalGoals > 0 ? (dashboard.riskDistribution.medium / dashboard.summary.totalGoals) * 100 : 0} 
              color="bg-amber-500" 
              label={`🟡 ${t.analytics?.mediumRisk || 'Medium Risk'} (${dashboard.riskDistribution.medium})`} 
            />
            <ProgressBar 
              value={dashboard.summary.totalGoals > 0 ? (dashboard.riskDistribution.high / dashboard.summary.totalGoals) * 100 : 0} 
              color="bg-red-500" 
              label={`🔴 ${t.analytics?.highRisk || 'High Risk'} (${dashboard.riskDistribution.high})`} 
            />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t.analytics?.avgCompletionTime || 'Avg. Completion Time'}</span>
              <span className="font-semibold text-slate-700">
                {dashboard.velocityMetrics.averageTaskCompletionTime} {t.analytics?.days || 'days'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Risks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-slate-800">
                {t.analytics?.topRisks || 'Top Risks'}
              </h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {t.analytics?.top5 || 'Top 5'}
            </span>
          </div>

          {dashboard.topRisks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <p className="text-slate-600 font-medium">{t.analytics?.noRisks || 'No high risks detected!'}</p>
              <p className="text-sm text-slate-400">{t.analytics?.allGood || 'All goals are on track'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.topRisks.map((risk, index) => {
                const colors = getRiskColor(risk.riskLevel);
                return (
                  <div 
                    key={risk.goalId}
                    onClick={() => setSelectedGoal(risk)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${colors.light} ${colors.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} text-white flex items-center justify-center font-bold`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{risk.goalTitle}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className={`px-2 py-0.5 rounded-full ${colors.light} ${colors.text} font-medium`}>
                              {risk.goalType === 'annual' ? (t.analytics?.annual || 'Annual') : (t.analytics?.mbo || 'MBO')}
                            </span>
                            <span>•</span>
                            <span>{risk.tasksAnalysis.completed}/{risk.tasksAnalysis.total} {t.analytics?.tasks || 'tasks'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${colors.text}`}>{risk.riskScore}</div>
                          <div className="text-xs text-slate-500">{t.analytics?.riskScore || 'Risk Score'}</div>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${colors.text}`} />
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">{t.analytics?.completion || 'Completion'}</span>
                        <span className={`font-medium ${colors.text}`}>{risk.prediction.completionProbability}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors.bg} transition-all duration-500`}
                          style={{ width: `${risk.prediction.completionProbability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {dashboard.upcomingDeadlines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-slate-800">
              {t.analytics?.upcomingDeadlines || 'Upcoming Deadlines'} 
              <span className="text-sm text-slate-400 font-normal ms-2">({t.analytics?.next14Days || 'Next 14 days'})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.upcomingDeadlines.map((deadline) => {
              const colors = getRiskColor(deadline.riskLevel);
              return (
                <div 
                  key={deadline.goalId}
                  className={`p-4 rounded-xl border ${colors.light} ${colors.border}`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-slate-800 text-sm line-clamp-2">{deadline.goalTitle}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} text-white`}>
                      {deadline.daysRemaining}d
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {new Date(deadline.dueDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Workload Analysis (Managers Only) */}
      {workload.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800">
              {t.analytics?.teamWorkload || 'Team Workload Analysis'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workload.map((user) => {
              const statusColors = {
                underloaded: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', label: t.analytics?.underloaded || 'Underloaded' },
                optimal: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', label: t.analytics?.optimal || 'Optimal' },
                overloaded: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', label: t.analytics?.overloaded || 'Overloaded' }
              };
              const colors = statusColors[user.workloadStatus];

              return (
                <div 
                  key={user.userId}
                  className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-800">{user.userName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.text} ${colors.bg}`}>
                      {colors.label}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t.analytics?.workloadScore || 'Workload Score'}</span>
                      <span className={`font-bold ${colors.text}`}>{user.workloadScore}%</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          user.workloadStatus === 'underloaded' ? 'bg-blue-500' :
                          user.workloadStatus === 'optimal' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${user.workloadScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 pt-2">
                      <span>{t.analytics?.tasks || 'Tasks'}: {user.totalAssignedTasks}</span>
                      <span>{t.analytics?.completed || 'Completed'}: {user.completedTasks}</span>
                      {user.overdueTasks > 0 && (
                        <span className="text-red-500">{t.analytics?.overdue || 'Overdue'}: {user.overdueTasks}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goal Details Modal */}
      {selectedGoal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGoal(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-6 border-b ${getRiskColor(selectedGoal.riskLevel).light}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(selectedGoal.riskLevel).bg} text-white`}>
                      {selectedGoal.riskLevel} RISK
                    </span>
                    <span className="text-xs text-slate-500">
                      {selectedGoal.goalType === 'annual' ? 'Annual Goal' : 'MBO Goal'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedGoal.goalTitle}</h2>
                </div>
                <button 
                  onClick={() => setSelectedGoal(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Risk Score & Prediction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <RiskGauge score={selectedGoal.riskScore} size="small" />
                  <p className="text-sm text-slate-500 mt-2">{t.analytics?.riskScore || 'Risk Score'}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className={`text-3xl font-bold ${selectedGoal.prediction.isOnTrack ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedGoal.prediction.completionProbability}%
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{t.analytics?.completionProb || 'Completion Probability'}</p>
                </div>
              </div>

              {/* Risk Reasons */}
              {selectedGoal.reasons.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {t.analytics?.riskReasons || 'Risk Factors'}
                  </h3>
                  <ul className="space-y-2">
                    {selectedGoal.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-red-500 mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-500" />
                  {t.analytics?.recommendations || 'Recommendations'}
                </h3>
                <ul className="space-y-2">
                  {selectedGoal.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Task Analysis */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  {t.analytics?.taskAnalysis || 'Task Analysis'}
                </h3>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-xl font-bold text-slate-800">{selectedGoal.tasksAnalysis.total}</div>
                    <div className="text-xs text-slate-500">{t.analytics?.total || 'Total'}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <div className="text-xl font-bold text-emerald-600">{selectedGoal.tasksAnalysis.completed}</div>
                    <div className="text-xs text-emerald-600">{t.analytics?.completed || 'Done'}</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="text-xl font-bold text-blue-600">{selectedGoal.tasksAnalysis.inProgress}</div>
                    <div className="text-xs text-blue-600">{t.analytics?.inProgress || 'Active'}</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <div className="text-xl font-bold text-amber-600">{selectedGoal.tasksAnalysis.delayed}</div>
                    <div className="text-xs text-amber-600">{t.analytics?.delayed || 'Delayed'}</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl">
                    <div className="text-xl font-bold text-red-600">{selectedGoal.tasksAnalysis.overdue}</div>
                    <div className="text-xs text-red-600">{t.analytics?.overdue || 'Overdue'}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {selectedGoal.timeline.startDate && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {t.analytics?.timeline || 'Timeline'}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                    <div>
                      <div className="text-xs text-slate-400">{t.analytics?.start || 'Start'}</div>
                      <div className="font-medium">{selectedGoal.timeline.startDate}</div>
                    </div>
                    <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500"
                        style={{ width: `${(selectedGoal.timeline.daysPassed / selectedGoal.timeline.totalDays) * 100}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{t.analytics?.end || 'End'}</div>
                      <div className="font-medium">{selectedGoal.timeline.endDate}</div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>{selectedGoal.timeline.daysPassed} {t.analytics?.daysElapsed || 'days elapsed'}</span>
                    <span>{selectedGoal.timeline.daysRemaining} {t.analytics?.daysRemaining || 'days remaining'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

