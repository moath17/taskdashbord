'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { GoalModal } from '@/components/GoalModal';
import {
  Target,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Search,
  Calendar,
  User,
  TrendingUp,
  Loader2,
  Filter,
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  owner?: { id: string; name: string; email: string };
  createdBy: string;
  creator?: { id: string; name: string };
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function GoalsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
      fetchMembers();
    }
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch members');
    }
  };

  const handleAddGoal = async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setGoals([result.goal, ...goals]);
  };

  const handleEditGoal = async (data: any) => {
    if (!editingGoal) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/goals/${editingGoal.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setGoals(goals.map(g => g.id === editingGoal.id ? result.goal : g));
  };

  const handleDeleteGoal = async (goalId: string) => {
    const confirmMsg = isRTL ? 'هل أنت متأكد من حذف هذا الهدف؟' : 'Are you sure you want to delete this goal?';
    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setGoals(goals.filter(g => g.id !== goalId));
    } catch (err: any) {
      alert(err.message || (isRTL ? 'فشل في حذف الهدف' : 'Failed to delete goal'));
    }
  };

  const handleProgressChange = async (goalId: string, newProgress: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started'
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setGoals(goals.map(g => g.id === goalId ? result.goal : g));
    } catch (err: any) {
      console.error('Failed to update progress');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-purple-100 text-purple-700';
      case 'quarterly': return 'bg-blue-100 text-blue-700';
      case 'monthly': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-600';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-amber-500';
    return 'bg-gray-300';
  };

  const texts = {
    title: isRTL ? 'الأهداف' : 'Goals',
    addGoal: isRTL ? 'هدف جديد' : 'New Goal',
    search: isRTL ? 'بحث...' : 'Search...',
    all: isRTL ? 'الكل' : 'All',
    annual: isRTL ? 'سنوي' : 'Annual',
    quarterly: isRTL ? 'ربع سنوي' : 'Quarterly',
    monthly: isRTL ? 'شهري' : 'Monthly',
    noGoals: isRTL ? 'لا توجد أهداف' : 'No goals found',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    notStarted: isRTL ? 'لم يبدأ' : 'Not Started',
    inProgress: isRTL ? 'قيد التنفيذ' : 'In Progress',
    completed: isRTL ? 'مكتمل' : 'Completed',
    cancelled: isRTL ? 'ملغي' : 'Cancelled',
    progress: isRTL ? 'الإنجاز' : 'Progress',
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual: texts.annual,
      quarterly: texts.quarterly,
      monthly: texts.monthly,
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      not_started: texts.notStarted,
      in_progress: texts.inProgress,
      completed: texts.completed,
      cancelled: texts.cancelled,
    };
    return labels[status] || status;
  };

  // Filter goals
  const filteredGoals = goals.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || g.type === filterType;
    return matchesSearch && matchesType;
  });

  // Can manage (owner/manager)
  const canManage = user?.role === 'owner' || user?.role === 'manager';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">{texts.title}</h1>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{texts.addGoal}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={texts.search}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'annual', 'quarterly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                           ${filterType === type
                             ? 'bg-green-100 text-green-700'
                             : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {type === 'all' ? texts.all : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="card text-center py-12">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{texts.noGoals}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isRTL={isRTL}
                canManage={canManage}
                onEdit={() => {
                  setEditingGoal(goal);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDeleteGoal(goal.id)}
                onProgressChange={handleProgressChange}
                getTypeColor={getTypeColor}
                getStatusColor={getStatusColor}
                getProgressColor={getProgressColor}
                getTypeLabel={getTypeLabel}
                getStatusLabel={getStatusLabel}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                texts={texts}
              />
            ))}
          </div>
        )}
      </main>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={editingGoal ? handleEditGoal : handleAddGoal}
        goal={editingGoal}
        members={members}
      />
    </div>
  );
}

// Goal Card Component
function GoalCard({
  goal,
  isRTL,
  canManage,
  onEdit,
  onDelete,
  onProgressChange,
  getTypeColor,
  getStatusColor,
  getProgressColor,
  getTypeLabel,
  getStatusLabel,
  openDropdown,
  setOpenDropdown,
  texts,
}: {
  goal: Goal;
  isRTL: boolean;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onProgressChange: (goalId: string, progress: number) => void;
  getTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
  getProgressColor: (progress: number) => string;
  getTypeLabel: (type: string) => string;
  getStatusLabel: (status: string) => string;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  texts: any;
}) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(goal.type)}`}>
            {getTypeLabel(goal.type)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
            {getStatusLabel(goal.status)}
          </span>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === goal.id ? null : goal.id);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                         rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {openDropdown === goal.id && (
              <div className={`absolute top-full mt-1 bg-white rounded-lg shadow-lg 
                              border border-gray-200 py-1 min-w-[100px] z-10
                              ${isRTL ? 'left-0' : 'right-0'}`}>
                <button
                  onClick={onEdit}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 
                             flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {texts.edit}
                </button>
                <button
                  onClick={onDelete}
                  className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 
                             flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {texts.delete}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
      {goal.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{goal.description}</p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">{texts.progress}</span>
          <span className="font-medium text-gray-700">{goal.progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        {/* Quick progress buttons */}
        <div className="flex gap-1 mt-2">
          {[0, 25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => onProgressChange(goal.id, p)}
              className={`flex-1 py-1 text-xs rounded transition-colors
                         ${goal.progress === p 
                           ? 'bg-green-100 text-green-700 font-medium' 
                           : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
        {/* Owner */}
        {goal.owner && (
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {goal.owner.name}
          </span>
        )}

        {/* Dates */}
        {(goal.startDate || goal.endDate) && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {goal.startDate && new Date(goal.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
            {goal.startDate && goal.endDate && ' - '}
            {goal.endDate && new Date(goal.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
