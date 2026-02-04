'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { User, Mail, Lock, Shield, Save, UserPlus } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; password?: string; role: string }) => Promise<void>;
  member?: Member | null;
}

export function MemberModal({ isOpen, onClose, onSave, member }: MemberModalProps) {
  const { isRTL } = useLanguage();
  const isEdit = !!member;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'employee'>('employee');
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or member changes
  useEffect(() => {
    if (isOpen) {
      if (member) {
        setName(member.name);
        setEmail(member.email);
        setRole(member.role as 'manager' | 'employee');
        setPassword('');
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setRole('employee');
      }
      setError('');
    }
  }, [isOpen, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }

    if (!email.trim()) {
      setError(isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }

    if (!isEdit && !password) {
      setError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
      return;
    }

    if (password && password.length < 6) {
      setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const data: any = { name: name.trim(), email: email.trim(), role };
      if (password) data.password = password;
      
      await onSave(data);
      onClose();
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const texts = {
    addTitle: isRTL ? 'إضافة عضو جديد' : 'Add New Member',
    editTitle: isRTL ? 'تعديل العضو' : 'Edit Member',
    name: isRTL ? 'الاسم' : 'Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    password: isRTL ? 'كلمة المرور' : 'Password',
    passwordHint: isRTL ? 'اتركها فارغة للإبقاء على كلمة المرور الحالية' : 'Leave empty to keep current password',
    role: isRTL ? 'الدور' : 'Role',
    manager: isRTL ? 'مدير' : 'Manager',
    employee: isRTL ? 'موظف' : 'Employee',
    managerDesc: isRTL ? 'يمكنه إضافة أعضاء وإدارة المهام' : 'Can add members and manage tasks',
    employeeDesc: isRTL ? 'يمكنه إدارة المهام فقط' : 'Can manage tasks only',
    save: isRTL ? 'حفظ' : 'Save',
    add: isRTL ? 'إضافة' : 'Add',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? texts.editTitle : texts.addTitle}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="label">{texts.name}</label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                              ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder={isRTL ? 'أحمد محمد' : 'John Doe'}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="label">{texts.email}</label>
          <div className="relative">
            <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                              ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="label">{texts.password}</label>
          <div className="relative">
            <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                              ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">{texts.passwordHint}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="label">{texts.role}</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Manager Option */}
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={`p-4 rounded-xl border-2 transition-all text-center
                         ${role === 'manager'
                           ? 'border-indigo-500 bg-indigo-50'
                           : 'border-gray-200 hover:border-gray-300'}`}
            >
              <Shield className={`w-6 h-6 mx-auto mb-2 
                                  ${role === 'manager' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <p className={`font-medium ${role === 'manager' ? 'text-indigo-900' : 'text-gray-700'}`}>
                {texts.manager}
              </p>
              <p className="text-xs text-gray-500 mt-1">{texts.managerDesc}</p>
            </button>

            {/* Employee Option */}
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`p-4 rounded-xl border-2 transition-all text-center
                         ${role === 'employee'
                           ? 'border-indigo-500 bg-indigo-50'
                           : 'border-gray-200 hover:border-gray-300'}`}
            >
              <User className={`w-6 h-6 mx-auto mb-2 
                                ${role === 'employee' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <p className={`font-medium ${role === 'employee' ? 'text-indigo-900' : 'text-gray-700'}`}>
                {texts.employee}
              </p>
              <p className="text-xs text-gray-500 mt-1">{texts.employeeDesc}</p>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            {texts.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {texts.saving}
              </>
            ) : (
              <>
                {isEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isEdit ? texts.save : texts.add}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
