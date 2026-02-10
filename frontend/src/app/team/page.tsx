'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MemberModal } from '@/components/MemberModal';
import {
  Users,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  User,
  ArrowLeft,
  ArrowRight,
  Search,
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActivity?: string;
  createdAt: string;
}

export default function TeamPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  

  // Check auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch members
  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated]);

  

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/team', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      setError(isRTL ? 'فشل في تحميل الفريق' : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (data: { name: string; email: string; password?: string; role: string }) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setMembers([...members, result.member]);
  };

  const handleEditMember = async (data: { name: string; email: string; password?: string; role: string }) => {
    if (!editingMember) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/team/${editingMember.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setMembers(members.map(m => m.id === editingMember.id ? result.member : m));
  };

  const handleDeleteMember = async (memberId: string) => {
    const confirmMsg = isRTL ? 'هل أنت متأكد من حذف هذا العضو؟' : 'Are you sure you want to delete this member?';
    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setMembers(members.filter(m => m.id !== memberId));
    } catch (err: any) {
      alert(err.message || (isRTL ? 'فشل في حذف العضو' : 'Failed to delete member'));
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const canManageTeam = user?.role === 'owner' || user?.role === 'manager';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'manager': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-amber-100 text-amber-700';
      case 'manager': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      owner: { ar: 'مالك', en: 'Owner' },
      manager: { ar: 'مدير', en: 'Manager' },
      employee: { ar: 'موظف', en: 'Employee' },
    };
    return isRTL ? labels[role]?.ar : labels[role]?.en;
  };

  // Filter members by search
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const texts = {
    title: isRTL ? 'إدارة الفريق' : 'Team Management',
    addMember: isRTL ? 'إضافة عضو' : 'Add Member',
    search: isRTL ? 'بحث...' : 'Search...',
    noMembers: isRTL ? 'لا يوجد أعضاء' : 'No members found',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    you: isRTL ? '(أنت)' : '(You)',
    back: isRTL ? 'رجوع' : 'Back',
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <h1 className="text-lg font-bold text-gray-900">{texts.title}</h1>
              </div>
            </div>

            {/* Add Button */}
            {canManageTeam && (
              <button
                onClick={openAddModal}
                className="btn btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">{texts.addMember}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
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
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{texts.noMembers}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              const isCurrentUser = member.id === user?.id;
              const canEdit = canManageTeam && member.role !== 'owner' && !isCurrentUser;

              return (
                <div
                  key={member.id}
                  onClick={() => canEdit && openEditModal(member)}
                  className={`card hover:shadow-md transition-shadow relative
                              ${canEdit ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                >
                  {/* Delete button — always visible for eligible members */}
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(member.id);
                      }}
                      className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 text-gray-400 
                                 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
                      title={texts.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 
                                    rounded-full flex items-center justify-center text-white 
                                    text-xl font-bold shadow-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {member.name}
                        {isCurrentUser && (
                          <span className="text-teal-600 text-sm font-normal mr-1">
                            {texts.you}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 truncate" dir="ltr">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge + Edit hint */}
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                                    ${getRoleColor(member.role)}`}>
                      <RoleIcon className="w-4 h-4" />
                      {getRoleLabel(member.role)}
                    </div>
                    {canEdit && (
                      <span className="text-xs text-gray-400">
                        {isRTL ? 'اضغط للتعديل' : 'Tap to edit'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Member Modal */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        onSave={editingMember ? handleEditMember : handleAddMember}
        member={editingMember}
      />
    </div>
  );
}
