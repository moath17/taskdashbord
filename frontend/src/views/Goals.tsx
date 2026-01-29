'use client';

import { useState, useEffect } from 'react';
import { goalsApi, usersApi } from '../api';
import { AnnualGoal, MBOGoal, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Loader,
  Flag,
  ListChecks,
  User as UserIcon,
} from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([]);
  const [mboGoals, setMBOGoals] = useState<MBOGoal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);
  const [showAnnualModal, setShowAnnualModal] = useState(false);
  const [showMBOModal, setShowMBOModal] = useState(false);
  const [editingAnnualGoal, setEditingAnnualGoal] = useState<AnnualGoal | null>(null);
  const [editingMBOGoal, setEditingMBOGoal] = useState<MBOGoal | null>(null);
  const [selectedAnnualGoalId, setSelectedAnnualGoalId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const isManager = user?.role === 'manager';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [annualData, mboData, usersData] = await Promise.all([
        goalsApi.getAllAnnualGoals(),
        goalsApi.getAllMBOGoals(),
        isManager ? usersApi.getAll() : Promise.resolve([]),
      ]);
      setAnnualGoals(annualData);
      setMBOGoals(mboData);
      setUsers(usersData);
      setExpandedGoals(annualData.map(g => g.id));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (goalId: string) => {
    setExpandedGoals(prev =>
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    );
  };

  const getMBOGoalsForAnnual = (annualGoalId: string) => {
    return mboGoals.filter(m => m.annualGoalId === annualGoalId);
  };

  const handleDeleteAnnualGoal = async (id: string) => {
    if (!confirm(t.goals.confirmDeleteAnnual)) return;
    try {
      await goalsApi.deleteAnnualGoal(id);
      toast.success(t.goals.annualGoalDeleted);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const handleDeleteMBOGoal = async (id: string) => {
    if (!confirm(t.goals.confirmDeleteMbo)) return;
    try {
      await goalsApi.deleteMBOGoal(id);
      toast.success(t.goals.mboGoalDeleted);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const filteredAnnualGoals = annualGoals.filter(g => g.year === filterYear);

  const years = [...new Set(annualGoals.map(g => g.year))].sort((a, b) => b - a);
  if (!years.includes(new Date().getFullYear())) {
    years.unshift(new Date().getFullYear());
  }

  const totalMBOGoals = mboGoals.filter(m => 
    filteredAnnualGoals.some(a => a.id === m.annualGoalId)
  ).length;

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
            <Target className="w-8 h-8 text-primary-600" />
            {t.goals.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.goals.hierarchy}</p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnnualModal(true)}
              className={`btn btn-secondary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Flag className="w-5 h-5" />
              {t.goals.annualGoal}
            </button>
            <button
              onClick={() => {
                setSelectedAnnualGoalId(null);
                setEditingMBOGoal(null);
                setShowMBOModal(true);
              }}
              className={`btn btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Plus className="w-5 h-5" />
              {t.goals.addMbo}
            </button>
          </div>
        )}
      </div>

      {/* Stats & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Flag className="w-8 h-8 text-primary-600" />
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-2xl font-bold text-primary-800">{filteredAnnualGoals.length}</p>
              <p className="text-xs text-primary-600">{t.dashboard.annualGoals}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Target className="w-8 h-8 text-purple-600" />
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-2xl font-bold text-purple-800">{totalMBOGoals}</p>
              <p className="text-xs text-purple-600">{t.dashboard.mboGoals}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 md:col-span-2">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
            {t.goals.filterByYear}
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="input"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Goals Hierarchy */}
      <div className="space-y-4">
        {filteredAnnualGoals.length === 0 ? (
          <div className="card p-12 text-center">
            <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.goals.noAnnualGoals}</h3>
            <p className="text-gray-600 mb-6">{t.goals.createAnnualFirst}</p>
            {isManager && (
              <button
                onClick={() => setShowAnnualModal(true)}
                className={`btn btn-primary inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className="w-5 h-5" />
                {t.goals.createAnnualGoal}
              </button>
            )}
          </div>
        ) : (
          filteredAnnualGoals.map((goal) => {
            const mboList = getMBOGoalsForAnnual(goal.id);
            const isExpanded = expandedGoals.includes(goal.id);

            return (
              <div key={goal.id} className="card overflow-hidden">
                {/* Annual Goal Header */}
                <div
                  className={`p-4 bg-gradient-to-r ${isRTL ? 'from-primary-100 to-primary-50' : 'from-primary-50 to-primary-100'} border-b cursor-pointer`}
                  onClick={() => toggleExpanded(goal.id)}
                >
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button className="p-1">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary-600" />
                        ) : (
                          isRTL ? <ChevronRight className="w-5 h-5 text-primary-600 rotate-180" /> : <ChevronRight className="w-5 h-5 text-primary-600" />
                        )}
                      </button>
                      <div className={isRTL ? 'text-right' : ''}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Flag className="w-5 h-5 text-primary-600" />
                          <h3 className="font-bold text-gray-900">{goal.title}</h3>
                          <span className="text-xs px-2 py-0.5 bg-primary-200 text-primary-800 rounded-full">
                            {goal.year}
                          </span>
                        </div>
                        <p className={`text-sm text-gray-600 mt-1 flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <ListChecks className="w-4 h-4" />
                          {mboList.length} {t.dashboard.mboGoals}
                        </p>
                      </div>
                    </div>
                    {isManager && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedAnnualGoalId(goal.id);
                            setEditingMBOGoal(null);
                            setShowMBOModal(true);
                          }}
                          className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-700"
                          title={t.goals.addMboGoal}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingAnnualGoal(goal);
                            setShowAnnualModal(true);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                          title={t.app.edit}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnualGoal(goal.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title={t.app.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {goal.description && (
                    <p className={`text-sm text-gray-600 mt-2 ${isRTL ? 'mr-9 text-right' : 'ml-9'}`}>{goal.description}</p>
                  )}
                </div>

                {/* MBO Goals */}
                {isExpanded && (
                  <div className="divide-y">
                    {mboList.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 bg-gray-50">
                        <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm mb-2">{t.goals.noMboGoals}</p>
                        {isManager && (
                          <button
                            onClick={() => {
                              setSelectedAnnualGoalId(goal.id);
                              setEditingMBOGoal(null);
                              setShowMBOModal(true);
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            {t.goals.addMboGoal}
                          </button>
                        )}
                      </div>
                    ) : (
                      mboList.map((mbo) => (
                        <div key={mbo.id} className={`p-4 hover:bg-gray-50 ${isRTL ? 'pr-12' : 'pl-12'}`}>
                          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                              <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                <Target className="w-4 h-4 text-purple-600" />
                                <h4 className="font-medium text-gray-900">{mbo.title}</h4>
                                {mbo.userName && (
                                  <span className={`text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <UserIcon className="w-3 h-3" />
                                    {mbo.userName}
                                  </span>
                                )}
                              </div>
                              {mbo.description && (
                                <p className={`text-sm text-gray-600 mt-1 ${isRTL ? 'mr-6' : 'ml-6'}`}>{mbo.description}</p>
                              )}
                              {(mbo.targetValue || mbo.currentValue) && (
                                <div className={`flex items-center gap-4 mt-2 text-sm ${isRTL ? 'mr-6 flex-row-reverse justify-end' : 'ml-6'}`}>
                                  {mbo.targetValue && (
                                    <span className="text-gray-500">
                                      {t.goals.targetValue}: <span className="font-medium text-gray-700">{mbo.targetValue}</span>
                                    </span>
                                  )}
                                  {mbo.currentValue && (
                                    <span className="text-gray-500">
                                      {t.goals.currentValue}: <span className="font-medium text-green-600">{mbo.currentValue}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {isManager && (
                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <button
                                  onClick={() => {
                                    setEditingMBOGoal(mbo);
                                    setSelectedAnnualGoalId(goal.id);
                                    setShowMBOModal(true);
                                  }}
                                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMBOGoal(mbo.id)}
                                  className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Annual Goal Modal */}
      {showAnnualModal && (
        <AnnualGoalModal
          existingGoal={editingAnnualGoal}
          onClose={() => {
            setShowAnnualModal(false);
            setEditingAnnualGoal(null);
          }}
          onSave={() => {
            setShowAnnualModal(false);
            setEditingAnnualGoal(null);
            loadData();
          }}
        />
      )}

      {/* MBO Goal Modal */}
      {showMBOModal && (
        <MBOGoalModal
          annualGoals={annualGoals}
          users={users}
          preSelectedAnnualGoalId={selectedAnnualGoalId}
          existingGoal={editingMBOGoal}
          onClose={() => {
            setShowMBOModal(false);
            setEditingMBOGoal(null);
            setSelectedAnnualGoalId(null);
          }}
          onSave={() => {
            setShowMBOModal(false);
            setEditingMBOGoal(null);
            setSelectedAnnualGoalId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Annual Goal Modal
function AnnualGoalModal({
  existingGoal,
  onClose,
  onSave,
}: {
  existingGoal: AnnualGoal | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    title: existingGoal?.title || '',
    description: existingGoal?.description || '',
    year: existingGoal?.year || new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      if (existingGoal) {
        await goalsApi.updateAnnualGoal(existingGoal.id, {
          title: formData.title,
          description: formData.description,
          year: formData.year,
        });
        toast.success(t.goals.annualGoalUpdated);
      } else {
        await goalsApi.createAnnualGoal(formData);
        toast.success(t.goals.annualGoalCreated);
      }
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className={`flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className={`font-bold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Flag className="w-5 h-5" />
            {existingGoal ? t.goals.editAnnualGoal : t.goals.createAnnualGoal}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.goals.year}</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="input"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.goals.goalTitle}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder={isRTL ? 'مثال: زيادة الإيرادات' : 'e.g., Increase Revenue'}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.goals.descriptionOptional}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder={t.goals.describeGoal}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              {t.app.cancel}
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? t.app.loading : existingGoal ? t.app.update : t.app.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// MBO Goal Modal
function MBOGoalModal({
  annualGoals,
  users,
  preSelectedAnnualGoalId,
  existingGoal,
  onClose,
  onSave,
}: {
  annualGoals: AnnualGoal[];
  users: User[];
  preSelectedAnnualGoalId: string | null;
  existingGoal: MBOGoal | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    annualGoalId: existingGoal?.annualGoalId || preSelectedAnnualGoalId || '',
    userId: existingGoal?.userId || '',
    title: existingGoal?.title || '',
    description: existingGoal?.description || '',
    targetValue: existingGoal?.targetValue || '',
    currentValue: existingGoal?.currentValue || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.annualGoalId) {
      toast.error(t.goals.selectAnnualGoal);
      return;
    }

    setSaving(true);
    try {
      if (existingGoal) {
        await goalsApi.updateMBOGoal(existingGoal.id, {
          title: formData.title,
          description: formData.description,
          targetValue: formData.targetValue,
          currentValue: formData.currentValue,
        });
        toast.success(t.goals.mboGoalUpdated);
      } else {
        await goalsApi.createMBOGoal({
          annualGoalId: formData.annualGoalId,
          userId: formData.userId || undefined,
          title: formData.title,
          description: formData.description,
          targetValue: formData.targetValue,
          currentValue: formData.currentValue,
        });
        toast.success(t.goals.mboGoalCreated);
      }
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className={`flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className={`font-bold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Target className="w-5 h-5" />
            {existingGoal ? t.goals.editMboGoal : t.goals.createMboGoal}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.goals.annualGoal} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.annualGoalId}
              onChange={(e) => setFormData({ ...formData, annualGoalId: e.target.value })}
              className="input"
              required
              disabled={!!existingGoal}
            >
              <option value="">{t.goals.selectAnnualGoal}</option>
              {annualGoals.map(g => (
                <option key={g.id} value={g.id}>{g.title} ({g.year})</option>
              ))}
            </select>
            {annualGoals.length === 0 && (
              <p className={`text-xs text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{t.goals.noAnnualGoalsCreate}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.goals.employeeOptional}
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="input"
              disabled={!!existingGoal}
            >
              <option value="">{t.goals.noSpecificEmployee}</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.goals.mboTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder={isRTL ? 'مثال: تحسين تتبع المبيعات الشهرية' : 'e.g., Improve Monthly Sales Tracking'}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.goals.descriptionOptional}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder={t.goals.describeMboGoal}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.goals.targetValue}</label>
              <input
                type="text"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                className="input"
                placeholder={isRTL ? 'مثال: 100%' : 'e.g., 100%'}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.goals.currentValue}</label>
              <input
                type="text"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                className="input"
                placeholder={isRTL ? 'مثال: 50%' : 'e.g., 50%'}
              />
            </div>
          </div>
        </form>
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            {t.app.cancel}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving || annualGoals.length === 0} 
            className="btn btn-primary flex-1"
          >
            {saving ? t.app.loading : existingGoal ? t.app.update : t.app.create}
          </button>
        </div>
      </div>
    </div>
  );
}
