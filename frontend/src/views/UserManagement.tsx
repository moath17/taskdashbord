'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '../api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  AlertCircle,
  Loader,
  Search,
  Crown,
} from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const userToDelete = users.find((u) => u.id === id);
    if (userToDelete?.role === 'manager') {
      toast.error(isRTL ? 'لا يمكن حذف حساب المدير' : 'Cannot delete the manager account');
      return;
    }
    if (!window.confirm(t.users.confirmDeleteUser)) return;
    try {
      await usersApi.delete(id);
      toast.success(t.users.userDeleted);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const managerExists = users.some((u) => u.role === 'manager');

  if (currentUser?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? 'الوصول مرفوض' : 'Access Denied'}
          </h2>
          <p className="text-gray-600">
            {isRTL ? 'يمكن للمديرين فقط الوصول لإدارة المستخدمين.' : 'Only managers can access user management.'}
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">{t.users.title}</h1>
          <p className="text-gray-600 mt-1">{t.users.subtitle}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={`btn btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus className="w-5 h-5" />
          {t.users.addUser}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          placeholder={isRTL ? 'البحث بالاسم أو البريد...' : 'Search users by name or email...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`card p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-primary-100 rounded-lg">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-500">{isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</p>
          </div>
        </div>
        <div className={`card p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Crown className="w-6 h-6 text-yellow-600" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.role === 'manager').length}
            </p>
            <p className="text-sm text-gray-500">{t.auth.manager}</p>
          </div>
        </div>
        <div className={`card p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-blue-100 rounded-lg">
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.role === 'employee').length}
            </p>
            <p className="text-sm text-gray-500">{t.auth.employee}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.users.userName}
                </th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.users.role}
                </th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.users.createdAt}
                </th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                  {t.users.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          user.role === 'manager'
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className={`font-medium text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          {user.name}
                          {user.role === 'manager' && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </p>
                        <p className={`text-sm text-gray-500 flex items-center gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'manager'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      {user.role === 'manager' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <UserIcon className="w-3 h-3" />
                      )}
                      {user.role === 'manager' ? t.auth.manager : t.auth.employee}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      {user.createdAt
                        ? format(new Date(user.createdAt), 'MMM d, yyyy')
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowCreateModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title={t.app.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.role !== 'manager' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title={t.app.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t.users.noUsers}</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <UserModal
          t={t}
          isRTL={isRTL}
          onClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingUser(null);
            loadUsers();
          }}
          existingUser={editingUser}
          managerExists={managerExists}
        />
      )}
    </div>
  );
}

interface UserModalProps {
  t: any;
  isRTL: boolean;
  onClose: () => void;
  onSave: () => void;
  existingUser: User | null;
  managerExists: boolean;
}

function UserModal({ t, isRTL, onClose, onSave, existingUser, managerExists }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: existingUser?.name || '',
    email: existingUser?.email || '',
    password: '',
    role: existingUser?.role || 'employee',
  });
  const [saving, setSaving] = useState(false);

  const isEditing = !!existingUser;
  const canSelectManager = !managerExists || existingUser?.role === 'manager';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !formData.password) {
      toast.error(isRTL ? 'كلمة المرور مطلوبة للمستخدمين الجدد' : 'Password is required for new users');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
        };
        if (formData.role !== existingUser.role) {
          updateData.role = formData.role;
        }
        await usersApi.update(existingUser.id, updateData);
        toast.success(t.users.userUpdated);
      } else {
        await usersApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role as 'manager' | 'employee',
        });
        toast.success(t.users.userCreated);
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
        <div className={`flex items-center justify-between p-6 border-b ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? t.users.editUser : t.users.createUser}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.auth.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.auth.email}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
              dir="ltr"
            />
          </div>

          {!isEditing && (
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.auth.password}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                minLength={6}
                required
                dir="ltr"
              />
              <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? '6 أحرف كحد أدنى' : 'Minimum 6 characters'}
              </p>
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{t.auth.role}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'manager' | 'employee' })}
              className="input"
              disabled={existingUser?.role === 'manager'}
            >
              <option value="employee">{t.auth.employee}</option>
              <option value="manager" disabled={!canSelectManager}>
                {t.auth.manager} {!canSelectManager && (isRTL ? '(موجود بالفعل)' : '(Already exists)')}
              </option>
            </select>
            {existingUser?.role === 'manager' && (
              <p className={`text-xs text-yellow-600 mt-1 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'لا يمكن تغيير دور المدير' : 'Manager role cannot be changed'}
              </p>
            )}
          </div>

          <div className={`flex justify-end gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t.app.cancel}
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? t.app.loading : isEditing ? t.app.update : t.users.addUser}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
