'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { teamApi } from '../api/users';
import { User } from '../types';
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
} from 'lucide-react';

export default function OwnerScreen() {
  const { user, logout } = useAuth();
  const { t, isRTL, language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
        <div className="card mb-8">
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
    password: '',
    role: (existingUser?.role === 'owner' ? 'manager' : existingUser?.role) || 'employee',
  });
  const [saving, setSaving] = useState(false);

  const isEditing = !!existingUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && !formData.password) {
      toast.error(t.owner.passwordRequired);
      return;
    }
    if (!isEditing && formData.password.length < 6) {
      toast.error(t.owner.passwordMinLength);
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await teamApi.update(existingUser.id, { name: formData.name, email: formData.email });
        toast.success(t.users.userUpdated);
      } else {
        await teamApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role as 'manager' | 'employee',
        });
        toast.success(t.users.userCreated);
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
          </div>
          {!isEditing && (
            <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {t.auth.password}
            </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                dir="ltr"
                minLength={6}
                required
              />
            </div>
          )}
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
