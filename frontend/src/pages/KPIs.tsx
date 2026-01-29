'use client';

import { useState, useEffect } from 'react';
import { kpisApi, goalsApi } from '../api';
import { KPI, AnnualGoal, MBOGoal, KPIFrequency } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  X,
  Target,
  TrendingUp,
  Loader,
  Calculator,
  Calendar,
} from 'lucide-react';

export default function KPIs() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [filterGoalId, setFilterGoalId] = useState<string>('all');

  const isManager = user?.role === 'manager';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [kpisData, goalsData] = await Promise.all([
        kpisApi.getAll(),
        goalsApi.getAllAnnualGoals(),
      ]);
      setKpis(kpisData);
      setAnnualGoals(goalsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.kpis.confirmDeleteKpi)) return;
    try {
      await kpisApi.delete(id);
      toast.success(t.kpis.kpiDeleted);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const handleUpdateValue = async (kpi: KPI, newValue: number) => {
    try {
      await kpisApi.updateValue(kpi.id, newValue);
      toast.success(t.messages.updated);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const filteredKPIs = filterGoalId === 'all' 
    ? kpis 
    : kpis.filter(k => k.annualGoalId === filterGoalId);

  const overallAchievement = filteredKPIs.length > 0
    ? Math.round(filteredKPIs.reduce((sum, k) => sum + (k.achievementPercentage || 0), 0) / filteredKPIs.length)
    : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const frequencyLabels: Record<KPIFrequency, string> = {
    daily: language === 'ar' ? 'يومي' : 'Daily',
    weekly: language === 'ar' ? 'أسبوعي' : 'Weekly',
    monthly: language === 'ar' ? 'شهري' : 'Monthly',
    quarterly: language === 'ar' ? 'ربع سنوي' : 'Quarterly',
    yearly: language === 'ar' ? 'سنوي' : 'Yearly',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BarChart3 className="w-8 h-8 text-primary-600" />
            {t.kpis.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.kpis.subtitle}</p>
        </div>
        {isManager && (
          <button
            onClick={() => {
              setEditingKPI(null);
              setShowModal(true);
            }}
            className={`btn btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className="w-5 h-5" />
            {t.kpis.addKpi}
          </button>
        )}
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-primary-600 font-medium">{t.kpis.totalKpis}</p>
              <p className="text-3xl font-bold text-primary-800">{filteredKPIs.length}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-primary-400" />
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-green-600 font-medium">{t.kpis.onTrack} (≥100%)</p>
              <p className="text-3xl font-bold text-green-800">
                {filteredKPIs.filter(k => (k.achievementPercentage || 0) >= 100).length}
              </p>
            </div>
            <Target className="w-12 h-12 text-green-400" />
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-blue-600 font-medium">{t.kpis.avgAchievement}</p>
              <p className={`text-3xl font-bold ${getProgressTextColor(overallAchievement)}`}>
                {overallAchievement}%
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <label className="text-sm font-medium text-gray-700">{t.app.filter}:</label>
          <select
            value={filterGoalId}
            onChange={(e) => setFilterGoalId(e.target.value)}
            className="input w-64"
          >
            <option value="all">{t.app.all}</option>
            {annualGoals.map(g => (
              <option key={g.id} value={g.id}>{g.title} ({g.year})</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs Grid */}
      {filteredKPIs.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.kpis.noKpis}</h3>
          <p className="text-gray-600 mb-6">{t.kpis.createFirstKpi}</p>
          {isManager && (
            <button
              onClick={() => setShowModal(true)}
              className={`btn btn-primary inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Plus className="w-5 h-5" />
              {t.kpis.createKpi}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKPIs.map((kpi) => (
            <KPICard
              key={kpi.id}
              kpi={kpi}
              isManager={isManager}
              isRTL={isRTL}
              t={t}
              onEdit={() => {
                setEditingKPI(kpi);
                setShowModal(true);
              }}
              onDelete={() => handleDelete(kpi.id)}
              onUpdateValue={(value) => handleUpdateValue(kpi, value)}
              getProgressColor={getProgressColor}
              getProgressTextColor={getProgressTextColor}
              frequencyLabels={frequencyLabels}
            />
          ))}
        </div>
      )}

      {/* KPI Modal */}
      {showModal && (
        <KPIModal
          existingKPI={editingKPI}
          annualGoals={annualGoals}
          t={t}
          isRTL={isRTL}
          onClose={() => {
            setShowModal(false);
            setEditingKPI(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingKPI(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  kpi: KPI;
  isManager: boolean;
  isRTL: boolean;
  t: any;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateValue: (value: number) => void;
  getProgressColor: (p: number) => string;
  getProgressTextColor: (p: number) => string;
  frequencyLabels: Record<KPIFrequency, string>;
}

function KPICard({ kpi, isManager, isRTL, t, onEdit, onDelete, onUpdateValue, getProgressColor, getProgressTextColor, frequencyLabels }: KPICardProps) {
  const [editValue, setEditValue] = useState(false);
  const [newValue, setNewValue] = useState(kpi.currentValue.toString());
  const percentage = kpi.achievementPercentage || 0;

  const handleSaveValue = () => {
    const value = parseFloat(newValue);
    if (!isNaN(value) && value >= 0) {
      onUpdateValue(value);
      setEditValue(false);
    }
  };

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${isRTL ? 'from-gray-100 to-gray-50' : 'from-gray-50 to-gray-100'} border-b`}>
        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
            <h3 className="font-bold text-gray-900">{kpi.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{kpi.annualGoalTitle}</p>
            {kpi.mboGoalTitle && (
              <p className="text-xs text-purple-600">→ {kpi.mboGoalTitle}</p>
            )}
          </div>
          {isManager && (
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={onEdit} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={onDelete} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Circle */}
      <div className="p-6 flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(percentage, 100) * 3.52} 352`}
              className={getProgressTextColor(percentage)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getProgressTextColor(percentage)}`}>
              {percentage}%
            </span>
            <span className="text-xs text-gray-500">{t.kpis.achievement}</span>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="px-4 pb-4">
        <div className="mb-4">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className={`flex items-center justify-center gap-1 text-xs text-blue-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calculator className="w-3 h-3" />
              {t.kpis.currentValue}
            </div>
            {editValue ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full text-center text-sm border rounded px-2 py-1"
                  autoFocus
                />
                <button onClick={handleSaveValue} className="text-green-600 text-xs">✓</button>
                <button onClick={() => setEditValue(false)} className="text-red-600 text-xs">✕</button>
              </div>
            ) : (
              <p 
                className="text-xl font-bold text-blue-800 cursor-pointer hover:underline"
                onClick={() => isManager && setEditValue(true)}
                title={isManager ? t.app.edit : ""}
              >
                {kpi.currentValue} {kpi.unit}
              </p>
            )}
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className={`flex items-center justify-center gap-1 text-xs text-green-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Target className="w-3 h-3" />
              {t.kpis.targetValue}
            </div>
            <p className="text-xl font-bold text-green-800">{kpi.targetValue} {kpi.unit}</p>
          </div>
        </div>

        <div className={`flex items-center justify-between text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {kpi.formula && (
            <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calculator className="w-3 h-3" />
              {kpi.formula}
            </span>
          )}
          <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse mr-auto' : 'ml-auto'}`}>
            <Calendar className="w-3 h-3" />
            {frequencyLabels[kpi.frequency]}
          </span>
        </div>
      </div>
    </div>
  );
}

// KPI Modal Component
interface KPIModalProps {
  existingKPI: KPI | null;
  annualGoals: AnnualGoal[];
  t: any;
  isRTL: boolean;
  onClose: () => void;
  onSave: () => void;
}

function KPIModal({ existingKPI, annualGoals, t, isRTL, onClose, onSave }: KPIModalProps) {
  const [formData, setFormData] = useState({
    title: existingKPI?.title || '',
    description: existingKPI?.description || '',
    annualGoalId: existingKPI?.annualGoalId || '',
    mboGoalId: existingKPI?.mboGoalId || '',
    unit: existingKPI?.unit || '%',
    targetValue: existingKPI?.targetValue?.toString() || '',
    currentValue: existingKPI?.currentValue?.toString() || '0',
    formula: existingKPI?.formula || '',
    frequency: existingKPI?.frequency || 'monthly' as KPIFrequency,
  });
  const [mboGoals, setMboGoals] = useState<MBOGoal[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (formData.annualGoalId) {
      goalsApi.getMBOGoalsByAnnualGoal(formData.annualGoalId).then(setMboGoals);
    } else {
      setMboGoals([]);
    }
  }, [formData.annualGoalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.annualGoalId) {
      toast.error(t.goals.selectAnnualGoal);
      return;
    }
    if (!formData.targetValue || parseFloat(formData.targetValue) <= 0) {
      toast.error(isRTL ? 'القيمة المستهدفة يجب أن تكون أكبر من 0' : 'Target value must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        targetValue: parseFloat(formData.targetValue),
        currentValue: parseFloat(formData.currentValue) || 0,
      };

      if (existingKPI) {
        await kpisApi.update(existingKPI.id, data);
        toast.success(t.kpis.kpiUpdated);
      } else {
        await kpisApi.create(data);
        toast.success(t.kpis.kpiCreated);
      }
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    } finally {
      setSaving(false);
    }
  };

  const commonUnits = ['%', 'Count', 'SAR', 'USD', 'Hours', 'Days', 'Units'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className={`flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className={`font-bold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BarChart3 className="w-5 h-5" />
            {existingKPI ? t.kpis.editKpi : t.kpis.createKpi}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.kpis.annualGoal} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.annualGoalId}
              onChange={(e) => setFormData({ ...formData, annualGoalId: e.target.value, mboGoalId: '' })}
              className="input"
              required
              disabled={!!existingKPI}
            >
              <option value="">{t.kpis.selectAnnualGoal}</option>
              {annualGoals.map(g => (
                <option key={g.id} value={g.id}>{g.title} ({g.year})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'هدف MBO (اختياري)' : 'MBO Goal (Optional)'}
            </label>
            <select
              value={formData.mboGoalId}
              onChange={(e) => setFormData({ ...formData, mboGoalId: e.target.value })}
              className="input"
              disabled={!formData.annualGoalId || !!existingKPI}
            >
              <option value="">{isRTL ? 'بدون MBO محدد' : 'No specific MBO'}</option>
              {mboGoals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.kpis.kpiTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder={isRTL ? 'مثال: معدل نمو المبيعات' : 'e.g., Sales Growth Rate'}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.kpis.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={2}
              placeholder={isRTL ? 'وصف المؤشر...' : 'Describe this KPI...'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                {t.kpis.unit} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input"
              >
                {commonUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'التكرار' : 'Frequency'} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as KPIFrequency })}
                className="input"
              >
                <option value="daily">{isRTL ? 'يومي' : 'Daily'}</option>
                <option value="weekly">{isRTL ? 'أسبوعي' : 'Weekly'}</option>
                <option value="monthly">{isRTL ? 'شهري' : 'Monthly'}</option>
                <option value="quarterly">{isRTL ? 'ربع سنوي' : 'Quarterly'}</option>
                <option value="yearly">{isRTL ? 'سنوي' : 'Yearly'}</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className={`text-sm font-medium text-gray-700 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calculator className="w-4 h-4" />
              {isRTL ? 'قيم القياس' : 'Measurement Values'}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium text-green-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t.kpis.targetValue} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  className="input"
                  placeholder="100"
                  min="0"
                  step="any"
                  required
                />
              </div>
              <div>
                <label className={`block text-xs font-medium text-blue-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t.kpis.currentValue}
                </label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  className="input"
                  placeholder="50"
                  min="0"
                  step="any"
                />
              </div>
            </div>
          </div>

          {formData.targetValue && parseFloat(formData.targetValue) > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className={`text-sm text-blue-800 font-medium ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'معاينة:' : 'Preview:'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((parseFloat(formData.currentValue || '0') / parseFloat(formData.targetValue)) * 100)}%
              </p>
            </div>
          )}
        </form>

        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            {t.app.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving ? t.app.loading : existingKPI ? t.app.update : t.app.create}
          </button>
        </div>
      </div>
    </div>
  );
}

