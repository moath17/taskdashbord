'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { teamApi } from '../api/users';
import { User } from '../types';
import { NEWS_CATEGORIES, NewsCategory, getNewsPreferences, saveNewsPreferences } from '../lib/news-preferences';
import toast from 'react-hot-toast';
import {
  Building2,
  Users,
  Plus,
  Shield,
  User as UserIcon,
  LogOut,
  Globe,
  Crown,
  Mail,
  Edit2,
  Trash2,
  X,
  Newspaper,
  Settings,
  GripVertical,
  Check,
} from 'lucide-react';

export default function OwnerScreen() {
  const { user, logout } = useAuth();
  const { t, isRTL, language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showNewsSettings, setShowNewsSettings] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await teamApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    if (language === 'ar') {
      if (role === 'owner') return 'المالك';
      if (role === 'manager') return 'مدير';
      return 'موظف';
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Simple Top Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{t.app.name}</h1>
                <p className="text-xs text-gray-500">{t.owner.userManagementOnly}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">{t.auth.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Platform Info Card */}
        <div className="card mb-6">
          <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-3 bg-primary-100 rounded-xl">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <h2 className="text-lg font-bold text-gray-900">{t.owner.platformInfo}</h2>
              <p className="text-gray-600 mt-1 text-sm">{t.owner.platformInfoDesc}</p>
            </div>
          </div>
        </div>

        {/* News Settings Card */}
        <div className="card mb-6">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Newspaper className="w-8 h-8 text-indigo-600" />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <h2 className="text-lg font-bold text-gray-900">
                  {isRTL ? 'إعدادات الأخبار' : 'News Settings'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isRTL ? 'اختر نوع الأخبار التي تريد عرضها' : 'Choose the news categories you want to see'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewsSettings(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              {isRTL ? 'تخصيص' : 'Customize'}
            </button>
          </div>
          
          {/* Preview of enabled categories */}
          <div className={`mt-4 flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {getNewsPreferences().filter(c => c.enabled).slice(0, 6).map(cat => (
              <span 
                key={cat.id}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-1"
              >
                <span>{cat.emoji}</span>
                <span>{isRTL ? cat.nameAr : cat.nameEn}</span>
              </span>
            ))}
            {getNewsPreferences().filter(c => c.enabled).length > 6 && (
              <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-500">
                +{getNewsPreferences().filter(c => c.enabled).length - 6}
              </span>
            )}
          </div>
        </div>

        {/* Create Users Section */}
        <div className="card">
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary-600" />
                {t.owner.userManagement}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{t.owner.createUsersDesc}</p>
            </div>
            <button
              onClick={() => { setShowModal(true); setEditingUser(null); }}
              className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              {t.owner.addUser}
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">{t.app.loading}</div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      u.role === 'owner' ? 'bg-purple-600' : u.role === 'manager' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {u.name}
                        {u.role === 'owner' && <Crown className="w-4 h-4 text-amber-500" />}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'manager' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getRoleLabel(u.role)}
                    </span>
                    {u.role !== 'owner' && u.id !== user?.id && (
                      <>
                        <button
                          onClick={() => { setEditingUser(u); setShowModal(true); }}
                          className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(t.users.confirmDeleteUser)) return;
                            try {
                              await teamApi.delete(u.id);
                              toast.success(t.users.userDeleted);
                              loadUsers();
                            } catch (e: any) {
                              toast.error(e.response?.data?.error || t.messages.failed);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t.owner.noUsersYet}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <OwnerUserModal
          isRTL={isRTL}
          t={t}
          existingUser={editingUser}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSave={() => { setShowModal(false); setEditingUser(null); loadUsers(); }}
        />
      )}

      {showNewsSettings && (
        <NewsSettingsModal
          isRTL={isRTL}
          onClose={() => setShowNewsSettings(false)}
        />
      )}
    </div>
  );
}

function OwnerUserModal({
  isRTL,
  t,
  existingUser,
  onClose,
  onSave,
}: {
  isRTL: boolean;
  t: any;
  existingUser: User | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: existingUser?.name || '',
    email: existingUser?.email || '',
    role: (existingUser?.role === 'owner' ? 'manager' : existingUser?.role) || 'employee',
  });
  const [saving, setSaving] = useState(false);

  const isEditing = !!existingUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await teamApi.update(existingUser.id, { name: formData.name, email: formData.email });
        toast.success(t.users.userUpdated);
      } else {
        const result = await teamApi.create({
          name: formData.name,
          email: formData.email,
          role: formData.role as 'manager' | 'employee',
        });
        toast.success(t.users.userCreated);
        if ((result as any).inviteLink) {
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText((result as any).inviteLink);
            toast(t.owner.inviteLinkCopied || 'Invite link copied to clipboard. Send it to the user.', { duration: 5000 });
          } else {
            toast((result as any).inviteLink, { duration: 20000, icon: '📧' });
          }
        }
      }
      onSave();
    } catch (e: any) {
      toast.error(e.response?.data?.error || t.messages.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-xl max-w-md w-full ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="font-bold text-gray-900">
            {isEditing ? t.users.editUser : t.owner.addAdminOrEmployee}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.auth.name}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.auth.email}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              dir="ltr"
              required
              disabled={!!existingUser}
            />
            {!isEditing && (
              <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
                {t.owner.inviteEmailNote}
              </p>
            )}
          </div>
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.auth.role}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input"
              disabled={!!existingUser && existingUser.role === 'owner'}
            >
              <option value="manager">{t.owner.admin} ({t.auth.manager})</option>
              <option value="employee">{t.auth.employee}</option>
            </select>
          </div>
          <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              {t.app.cancel}
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? t.app.loading : isEditing ? t.app.update : t.owner.addUser}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// News Settings Modal
function NewsSettingsModal({
  isRTL,
  onClose,
}: {
  isRTL: boolean;
  onClose: () => void;
}) {
  const [categories, setCategories] = useState<NewsCategory[]>(getNewsPreferences());
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (categoryId: string) => {
    setCategories(prev =>
      prev.map(c =>
        c.id === categoryId ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const handleSave = () => {
    saveNewsPreferences(categories);
    toast.success(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved');
    onClose();
  };

  const handleSelectAll = () => {
    setCategories(prev => prev.map(c => ({ ...c, enabled: true })));
  };

  const handleDeselectAll = () => {
    setCategories(prev => prev.map(c => ({ ...c, enabled: false })));
  };

  const filteredCategories = searchTerm
    ? categories.filter(c =>
        c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nameAr.includes(searchTerm)
      )
    : categories;

  // Group categories by type
  const categoryGroups = [
    { key: 'tech', labelEn: 'Technology', labelAr: 'التقنية', ids: ['tech', 'ai', 'data'] },
    { key: 'business', labelEn: 'Business', labelAr: 'الأعمال', ids: ['business', 'finance', 'entrepreneurship'] },
    { key: 'agriculture', labelEn: 'Agriculture', labelAr: 'الزراعة', ids: ['agriculture', 'agritech', 'livestock'] },
    { key: 'engineering', labelEn: 'Engineering', labelAr: 'الهندسة', ids: ['architecture', 'construction', 'realestate'] },
    { key: 'health', labelEn: 'Health', labelAr: 'الصحة', ids: ['healthcare', 'pharma'] },
    { key: 'education', labelEn: 'Education', labelAr: 'التعليم', ids: ['education', 'edtech'] },
    { key: 'energy', labelEn: 'Energy & Environment', labelAr: 'الطاقة والبيئة', ids: ['energy', 'environment'] },
    { key: 'lifestyle', labelEn: 'Lifestyle', labelAr: 'نمط الحياة', ids: ['entertainment', 'sports', 'tourism', 'ecommerce'] },
    { key: 'regional', labelEn: 'Regional', labelAr: 'إقليمي', ids: ['saudi'] },
  ];

  const enabledCount = categories.filter(c => c.enabled).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Newspaper className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">
                {isRTL ? 'تخصيص الأخبار' : 'Customize News Feed'}
              </h3>
              <p className="text-white/80 text-sm">
                {isRTL ? 'اختر الفئات التي تهمك' : 'Select categories that interest you'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-4 border-b bg-gray-50">
          <div className={`flex flex-col sm:flex-row gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <input
              type="text"
              placeholder={isRTL ? 'بحث...' : 'Search categories...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input flex-1"
            />
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                {isRTL ? 'تحديد الكل' : 'Select All'}
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                {isRTL ? 'إلغاء الكل' : 'Deselect All'}
              </button>
            </div>
          </div>
          <p className={`text-sm text-gray-500 mt-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? `${enabledCount} فئة مختارة` : `${enabledCount} categories selected`}
          </p>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categoryGroups.map(group => {
            const groupCategories = filteredCategories.filter(c => group.ids.includes(c.id));
            if (groupCategories.length === 0) return null;

            return (
              <div key={group.key}>
                <h4 className={`text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? group.labelAr : group.labelEn}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {groupCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleToggle(category.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isRTL ? 'flex-row-reverse text-right' : ''} ${
                        category.enabled
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{category.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${category.enabled ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {isRTL ? category.nameAr : category.nameEn}
                        </p>
                      </div>
                      {category.enabled && (
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-4 border-t bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button onClick={onClose} className="btn btn-secondary flex-1">
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={handleSave} className="btn btn-primary flex-1">
            {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
