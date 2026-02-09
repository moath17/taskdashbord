'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TrainingModal } from '@/components/TrainingModal';
import {
  GraduationCap,
  Plus,
  ArrowLeft,
  ArrowRight,
  Search,
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  Users,
} from 'lucide-react';

interface Training {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  provider?: string;
  location?: string;
  createdBy: string;
  creator?: { id: string; name: string };
  participants: { id: string; status: string; user?: { id: string; name: string; email: string } }[];
  createdAt: string;
}

interface Member { id: string; name: string; email: string; role: string; }

export default function TrainingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) { fetchTrainings(); fetchMembers(); }
  }, [isAuthenticated]);

  useEffect(() => {
    const h = () => setOpenDropdown(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/trainings', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setTrainings(data.trainings || []); }
    } catch { console.error('Failed to fetch trainings'); }
    finally { setLoading(false); }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/team', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setMembers(data.members || []); }
    } catch { console.error('Failed to fetch members'); }
  };

  const handleAdd = async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/trainings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    // Refetch to get participants
    fetchTrainings();
  };

  const handleEdit = async (data: any) => {
    if (!editingTraining) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/trainings/${editingTraining.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    fetchTrainings();
  };

  const handleDelete = async (id: string) => {
    const msg = isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?';
    if (!confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trainings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setTrainings(trainings.filter(t => t.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  const canManage = user?.role === 'owner' || user?.role === 'manager';

  const texts = {
    title: isRTL ? 'التدريب' : 'Training',
    addTraining: isRTL ? 'تدريب جديد' : 'New Training',
    search: isRTL ? 'بحث...' : 'Search...',
    all: isRTL ? 'الكل' : 'All',
    planned: isRTL ? 'مخطط' : 'Planned',
    inProgress: isRTL ? 'قيد التنفيذ' : 'In Progress',
    completed: isRTL ? 'مكتمل' : 'Completed',
    cancelled: isRTL ? 'ملغي' : 'Cancelled',
    noTrainings: isRTL ? 'لا توجد تدريبات' : 'No trainings found',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    participants: isRTL ? 'مشاركين' : 'participants',
    course: isRTL ? 'دورة' : 'Course',
    workshop: isRTL ? 'ورشة عمل' : 'Workshop',
    certification: isRTL ? 'شهادة' : 'Certification',
    conference: isRTL ? 'مؤتمر' : 'Conference',
    other: isRTL ? 'أخرى' : 'Other',
  };

  const getTypeLabel = (type: string) => {
    const m: Record<string, string> = { course: texts.course, workshop: texts.workshop, certification: texts.certification, conference: texts.conference, other: texts.other };
    return m[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-700';
      case 'workshop': return 'bg-purple-100 text-purple-700';
      case 'certification': return 'bg-green-100 text-green-700';
      case 'conference': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-600';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    const m: Record<string, string> = { planned: texts.planned, in_progress: texts.inProgress, completed: texts.completed, cancelled: texts.cancelled };
    return m[status] || status;
  };

  const filteredTrainings = trainings.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">{texts.title}</h1>
              </div>
            </div>
            {canManage && (
              <button onClick={() => { setEditingTraining(null); setIsModalOpen(true); }}
                className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{texts.addTraining}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={texts.search} className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'planned', 'in_progress', 'completed', 'cancelled'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${filterStatus === s ? 'bg-teal-100 text-teal-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {s === 'all' ? texts.all : getStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {filteredTrainings.length === 0 ? (
          <div className="card text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{texts.noTrainings}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrainings.map((t) => (
              <div key={t.id} className="card hover:shadow-md transition-shadow group">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(t.type)}`}>
                      {getTypeLabel(t.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                      {getStatusLabel(t.status)}
                    </span>
                  </div>
                  {canManage && (
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === t.id ? null : t.id); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openDropdown === t.id && (
                        <div className={`absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10 ${isRTL ? 'left-0' : 'right-0'}`}>
                          <button onClick={() => { setEditingTraining(t); setIsModalOpen(true); }}
                            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Edit2 className="w-3.5 h-3.5" /> {texts.edit}
                          </button>
                          <button onClick={() => handleDelete(t.id)}
                            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> {texts.delete}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
                {t.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{t.description}</p>}

                {/* Meta */}
                <div className="space-y-2 text-sm text-gray-500 pt-3 border-t border-gray-100">
                  {t.provider && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> {t.provider}
                    </div>
                  )}
                  {t.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {t.location}
                    </div>
                  )}
                  {(t.startDate || t.endDate) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t.startDate && new Date(t.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                      {t.startDate && t.endDate && ' - '}
                      {t.endDate && new Date(t.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  {t.participants.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t.participants.length} {texts.participants}
                    </div>
                  )}
                </div>

                {/* Participant Avatars */}
                {t.participants.length > 0 && (
                  <div className="flex -space-x-2 mt-3 rtl:space-x-reverse">
                    {t.participants.slice(0, 5).map((p, i) => (
                      <div key={i} className="w-7 h-7 bg-teal-100 border-2 border-white rounded-full flex items-center justify-center"
                        title={p.user?.name}>
                        <span className="text-xs font-semibold text-teal-600">{p.user?.name?.charAt(0)}</span>
                      </div>
                    ))}
                    {t.participants.length > 5 && (
                      <div className="w-7 h-7 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">+{t.participants.length - 5}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTraining(null); }}
        onSave={editingTraining ? handleEdit : handleAdd}
        training={editingTraining}
        members={members}
      />
    </div>
  );
}
