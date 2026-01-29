'use client';

import { useState, useEffect } from 'react';
import { teamApi } from '../api/users';
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
  Building2,
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

  const isOwnerOrManager = currentUser?.role === 'owner' || currentUser?.role === 'manager';

  useEffect(() => {
    if (isOwnerOrManager) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isOwnerOrManager]);

  const loadUsers = async () => {
    try {
      const data = await teamApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const userToDelete = users.find((u) => u.id === id);
    
    // Cannot delete owner
    if (userToDelete?.role === 'owner') {
      toast.error(isRTL ? 'لا يمكن حذف حساب المالك' : 'Cannot delete the owner account');
      return;
    }
    
    // Cannot delete yourself
    if (userToDelete?.id === currentUser?.id) {
      toast.error(isRTL ? 'لا يمكنك حذف حسابك الخاص' : 'Cannot delete your own account');
      return;
    }

    if (!window.confirm(t.users.confirmDeleteUser)) return;
    
    try {
      await teamApi.delete(id);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3" />;
      case 'manager':
        return <Shield className="w-3 h-3" />;
      default:
        return <UserIcon className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleLabel = (role: string) => {
    if (isRTL) {
      switch (role) {
        case 'owner': return 'المالك';
        case 'manager': return 'مدير';
        default: return 'موظف';
      }
    }
    switch (role) {
      case 'owner': return 'Owner';
      case 'manager': return 'Manager';
      default: return 'Employee';
    }
  };

  // Access denied for non-owners/managers
  if (!isOwnerOrManager) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? 'الوصول مرفوض' : 'Access Denied'}
          </h2>
          <p className="text-gray-600">
            {isRTL 
              ? 'يمكن للمالك والمديرين فقط الوصول لإدارة الفريق.' 
              : 'Only owners and managers can access team management.'}
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'إدارة الفريق' : 'Team Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isRTL ? 'إدارة أعضاء فريق مؤسستك' : 'Manage your organization team members'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={`btn btn-primary flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus className="w-5 h-5" />
          {isRTL ? 'إضافة عضو' : 'Add Member'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          placeholder={isRTL ? 'البحث بالاسم أو البريد...' : 'Search by name or email...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`card p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-primary-100 rounded-lg">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-500">{isRTL ? 'إجمالي الأعضاء' : 'Total Members'}</p>
          </div>
        </div>
        <div className={`card p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.role === 'owner').length}
            </p>
            <p className="text-sm text-gray-500">{isRTL ? 'مالك' : 'Owner'}</p>
          </div>
        </div>
        <div className={`card p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Shield className="w-6 h-6 text-yellow-600" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter((u) => u.role === 'manager').length}
            </p>
            <p className="text-sm text-gray-500">{isRTL ? 'مدراء' : 'Managers'}</p>
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
            <p className="text-sm text-gray-500">{isRTL ? 'موظفين' : 'Employees'}</p>
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
                  {isRTL ? 'العضو' : 'Member'}
                </th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الدور' : 'Role'}
                </th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'تاريخ الإضافة' : 'Joined'}
                </th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>
                  {isRTL ? 'إجراءات' : 'Actions'}
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
                          user.role === 'owner'
                            ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                            : user.role === 'manager'
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className={`font-medium text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          {user.name}
                          {user.role === 'owner' && (
                            <Crown className="w-4 h-4 text-purple-500" />
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
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
                      {/* Can't edit owner (unless you are the owner editing yourself) */}
                      {(user.role !== 'owner' || user.id === currentUser?.id) && (
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowCreateModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {/* Can't delete owner or yourself */}
                      {user.role !== 'owner' && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title={isRTL ? 'حذف' : 'Delete'}
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
            <p className="text-gray-500">{isRTL ? 'لا يوجد أعضاء' : 'No team members found'}</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TeamMemberModal
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
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

interface TeamMemberModalProps {
  isRTL: boolean;
  onClose: () => void;
  onSave: () => void;
  existingUser: User | null;
  currentUser: User | null;
}

function TeamMemberModal({ isRTL, onClose, onSave, existingUser, currentUser }: TeamMemberModalProps) {
  const [formData, setFormData] = useState({
    name: existingUser?.name || '',
    email: existingUser?.email || '',
    password: '',
    role: existingUser?.role || 'employee',
  });
  const [saving, setSaving] = useState(false);

  const isEditing = !!existingUser;
  const isEditingOwner = existingUser?.role === 'owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !formData.password) {
      toast.error(isRTL ? 'كلمة المرور مطلوبة للأعضاء الجدد' : 'Password is required for new members');
      return;
    }

    if (!isEditing && formData.password.length < 6) {
      toast.error(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
        };
        // Only include role if it changed and user is not owner
        if (formData.role !== existingUser.role && existingUser.role !== 'owner') {
          updateData.role = formData.role;
        }
        await teamApi.update(existingUser.id, updateData);
        toast.success(isRTL ? 'تم تحديث العضو' : 'Member updated successfully');
      } else {
        await teamApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role as 'manager' | 'employee',
        });
        toast.success(isRTL ? 'تم إضافة العضو' : 'Member added successfully');
      }
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.error || (isRTL ? 'فشلت العملية' : 'Operation failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing 
              ? (isRTL ? 'تعديل العضو' : 'Edit Member') 
              : (isRTL ? 'إضافة عضو جديد' : 'Add New Member')
            }
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الاسم' : 'Name'}
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
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
            </label>
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
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
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
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الدور' : 'Role'}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'owner' | 'manager' | 'employee' })}
              className="input"
              disabled={isEditingOwner}
            >
              <option value="employee">{isRTL ? 'موظف' : 'Employee'}</option>
              <option value="manager">{isRTL ? 'مدير' : 'Manager'}</option>
              {isEditingOwner && (
                <option value="owner">{isRTL ? 'مالك' : 'Owner'}</option>
              )}
            </select>
            {isEditingOwner && (
              <p className={`text-xs text-purple-600 mt-1 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'لا يمكن تغيير دور المالك' : 'Owner role cannot be changed'}
              </p>
            )}
          </div>

          <div className={`flex justify-end gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : isEditing 
                ? (isRTL ? 'تحديث' : 'Update') 
                : (isRTL ? 'إضافة' : 'Add Member')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
