'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { KPIModal } from '@/components/KPIModal';
import {
  TrendingUp,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Search,
  User,
  Loader2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

interface KPI {
  id: string;
  name: string;
  description?: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  frequency: string;
  category?: string;
  status: string;
  ownerId?: string;
  owner?: { id: string; name: string; email: string };
  createdBy: string;
  creator?: { id: string; name: string };
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function KPIsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  
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
      fetchKPIs();
      fetchMembers();
    }
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchKPIs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/kpis', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis || []);
      }
    } catch (err) {
      console.error('Failed to fetch KPIs');
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

  const handleAddKPI = async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/kpis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setKpis([result.kpi, ...kpis]);
  };

  const handleEditKPI = async (data: any) => {
    if (!editingKPI) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/kpis/${editingKPI.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setKpis(kpis.map(k => k.id === editingKPI.id ? result.kpi : k));
  };

  const handleDeleteKPI = async (kpiId: string) => {
    const confirmMsg = isRTL ? 'هل أنت متأكد من حذف هذا المؤشر؟' : 'Are you sure you want to delete this KPI?';
    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/kpis/${kpiId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setKpis(kpis.filter(k => k.id !== kpiId));
    } catch (err: any) {
      alert(err.message || (isRTL ? 'فشل في حذف المؤشر' : 'Failed to delete KPI'));
    }
  };

  const handleValueUpdate = async (kpiId: string, newValue: number) => {
    try {
      const kpi = kpis.find(k => k.id === kpiId);
      if (!kpi) return;

      // Auto-calculate status based on progress
      const progress = kpi.targetValue > 0 ? (newValue / kpi.targetValue) * 100 : 0;
      let newStatus = 'on_track';
      if (progress < 50) newStatus = 'off_track';
      else if (progress < 80) newStatus = 'at_risk';

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/kpis/${kpiId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentValue: newValue, status: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setKpis(kpis.map(k => k.id === kpiId ? result.kpi : k));
    } catch (err: any) {
      console.error('Failed to update value');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-700';
      case 'at_risk': return 'bg-amber-100 text-amber-700';
      case 'off_track': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 80) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (progress >= 50) return <Minus className="w-4 h-4 text-amber-500" />;
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'percentage') return `${value}%`;
    if (unit === 'currency') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const texts = {
    title: isRTL ? 'مؤشرات الأداء' : 'KPIs',
    addKPI: isRTL ? 'مؤشر جديد' : 'New KPI',
    search: isRTL ? 'بحث...' : 'Search...',
    all: isRTL ? 'الكل' : 'All',
    onTrack: isRTL ? 'على المسار' : 'On Track',
    atRisk: isRTL ? 'معرض للخطر' : 'At Risk',
    offTrack: isRTL ? 'خارج المسار' : 'Off Track',
    noKPIs: isRTL ? 'لا توجد مؤشرات' : 'No KPIs found',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    target: isRTL ? 'المستهدف' : 'Target',
    current: isRTL ? 'الحالي' : 'Current',
    progress: isRTL ? 'التقدم' : 'Progress',
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      on_track: texts.onTrack,
      at_risk: texts.atRisk,
      off_track: texts.offTrack,
    };
    return labels[status] || status;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      daily: { ar: 'يومي', en: 'Daily' },
      weekly: { ar: 'أسبوعي', en: 'Weekly' },
      monthly: { ar: 'شهري', en: 'Monthly' },
      quarterly: { ar: 'ربع سنوي', en: 'Quarterly' },
      yearly: { ar: 'سنوي', en: 'Yearly' },
    };
    return isRTL ? labels[frequency]?.ar : labels[frequency]?.en;
  };

  // Filter KPIs
  const filteredKPIs = kpis.filter(k => {
    const matchesSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || k.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Can manage (owner/manager)
  const canManage = user?.role === 'owner' || user?.role === 'manager';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{texts.title}</h1>
              </div>
            </div>

            {/* Add Button — owner/manager only */}
            {canManage && (
              <button
                onClick={() => {
                  setEditingKPI(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{texts.addKPI}</span>
              </button>
            )}
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

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'on_track', 'at_risk', 'off_track'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                           ${filterStatus === status
                             ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400'
                             : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}
              >
                {status === 'all' ? texts.all : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Grid */}
        {filteredKPIs.length === 0 ? (
          <div className="card text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{texts.noKPIs}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKPIs.map((kpi) => {
              const progress = kpi.targetValue > 0 
                ? Math.min(100, Math.round((kpi.currentValue / kpi.targetValue) * 100)) 
                : 0;

              return (
                <div key={kpi.id} className="card hover:shadow-md transition-shadow group cursor-pointer" onClick={() => { setEditingKPI(kpi); setIsModalOpen(true); }}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {kpi.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full text-xs">
                          {kpi.category}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                        {getStatusLabel(kpi.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    {canManage && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === kpi.id ? null : kpi.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 
                                     rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdown === kpi.id && (
                          <div className={`absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                                          border border-gray-200 dark:border-gray-700 py-1 min-w-[100px] z-10
                                          ${isRTL ? 'left-0' : 'right-0'}`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingKPI(kpi);
                                setIsModalOpen(true);
                              }}
                              className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 
                                         flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              {texts.edit}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteKPI(kpi.id); }}
                              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 
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

                  {/* Name & Description */}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{kpi.name}</h3>
                  {kpi.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{kpi.description}</p>
                  )}

                  {/* Values */}
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{texts.current}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatValue(kpi.currentValue, kpi.unit)}
                        </span>
                        {getProgressIcon(progress)}
                      </div>
                    </div>
                    <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{texts.target}</p>
                      <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                        {formatValue(kpi.targetValue, kpi.unit)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">{texts.progress}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {/* Frequency */}
                    <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                      {getFrequencyLabel(kpi.frequency)}
                    </span>

                    {/* Owner */}
                    {kpi.owner && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {kpi.owner.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* KPI Modal */}
      <KPIModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingKPI(null);
        }}
        onSave={editingKPI ? handleEditKPI : handleAddKPI}
        kpi={editingKPI}
        members={members}
      />
    </div>
  );
}
