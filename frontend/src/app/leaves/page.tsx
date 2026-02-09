'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LeaveModal } from '@/components/LeaveModal';
import {
  CalendarDays,
  Plus,
  ArrowLeft,
  ArrowRight,
  Search,
  Loader2,
  Trash2,
  Calendar,
  Clock,
  Check,
  X,
  Ban,
} from 'lucide-react';

interface Leave {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string; role: string };
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  reason?: string;
  reviewedBy?: string;
  reviewer?: { id: string; name: string };
  reviewedAt?: string;
  createdAt: string;
}

export default function LeavesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchLeaves();
  }, [isAuthenticated]);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaves', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    setLeaves([result.leave, ...leaves]);
  };

  const handleDelete = async (leaveId: string) => {
    const msg = isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?';
    if (!confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setLeaves(leaves.filter(l => l.id !== leaveId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getDaysDiff = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const texts = {
    title: isRTL ? 'الإجازات' : 'Leaves',
    addLeave: isRTL ? 'تسجيل إجازة' : 'Register Leave',
    search: isRTL ? 'بحث...' : 'Search...',
    pending: isRTL ? 'معلقة' : 'Pending',
    approved: isRTL ? 'مقبولة' : 'Approved',
    rejected: isRTL ? 'مرفوضة' : 'Rejected',
    cancelled: isRTL ? 'ملغاة' : 'Cancelled',
    noLeaves: isRTL ? 'لا توجد إجازات' : 'No leaves found',
    days: isRTL ? 'أيام' : 'days',
    day: isRTL ? 'يوم' : 'day',
    reviewedBy: isRTL ? 'بواسطة' : 'Reviewed by',
    annual: isRTL ? 'سنوية' : 'Annual',
    sick: isRTL ? 'مرضية' : 'Sick',
    personal: isRTL ? 'شخصية' : 'Personal',
    unpaid: isRTL ? 'بدون راتب' : 'Unpaid',
    other: isRTL ? 'أخرى' : 'Other',
  };

  const getTypeLabel = (type: string) => {
    const m: Record<string, string> = { annual: texts.annual, sick: texts.sick, personal: texts.personal, unpaid: texts.unpaid, other: texts.other };
    return m[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-700';
      case 'sick': return 'bg-red-100 text-red-700';
      case 'personal': return 'bg-purple-100 text-purple-700';
      case 'unpaid': return 'bg-gray-100 text-gray-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      case 'cancelled': return <Ban className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const m: Record<string, string> = { pending: texts.pending, approved: texts.approved, rejected: texts.rejected, cancelled: texts.cancelled };
    return m[status] || status;
  };

  const filteredLeaves = leaves.filter(l => {
    const matchSearch = !searchQuery.trim() ||
      l.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
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
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-amber-600" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">{texts.title}</h1>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{texts.addLeave}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={texts.search} className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} />
          </div>
        </div>

        {filteredLeaves.length === 0 ? (
          <div className="card text-center py-12">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{texts.noLeaves}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeaves.map((leave) => {
              const days = getDaysDiff(leave.startDate, leave.endDate);
              return (
                <div key={leave.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(leave.type)}`}>
                          {getTypeLabel(leave.type)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {days} {days === 1 ? texts.day : texts.days}
                        </span>
                      </div>

                      {/* User */}
                      {leave.user && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-sky-600">{leave.user.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{leave.user.name}</span>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(leave.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' - '}
                          {new Date(leave.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {leave.reason && (
                        <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                      )}

                      {leave.reviewer && (
                        <p className="text-xs text-gray-400 mt-1">
                          {texts.reviewedBy}: {leave.reviewer.name}
                        </p>
                      )}
                    </div>

                    {/* Actions: delete own or (manager) any pending */}
                    <div className="flex items-center gap-2">
                      {(leave.userId === user?.id || (user?.role === 'owner' || user?.role === 'manager')) && leave.status === 'pending' && (
                        <button onClick={() => handleDelete(leave.id)}
                          className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                          title={isRTL ? 'حذف' : 'Delete'}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <LeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddLeave} />
    </div>
  );
}
