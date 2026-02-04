'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Target, 
  AlignLeft, 
  Calendar,
  User,
  Save,
  Plus,
  Loader2,
  TrendingUp
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
}

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
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  goal?: Goal | null;
  members: Member[];
}

export function GoalModal({ isOpen, onClose, onSave, goal, members }: GoalModalProps) {
  const { isRTL } = useLanguage();
  const isEdit = !!goal;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('quarterly');
  const [status, setStatus] = useState('not_started');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form
  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setType(goal.type);
        setStatus(goal.status);
        setProgress(goal.progress);
        setStartDate(goal.startDate || '');
        setEndDate(goal.endDate || '');
        setOwnerId(goal.ownerId || '');
      } else {
        setTitle('');
        setDescription('');
        setType('quarterly');
        setStatus('not_started');
        setProgress(0);
        setStartDate('');
        setEndDate('');
        setOwnerId('');
      }
      setError('');
    }
  }, [isOpen, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(isRTL ? 'عنوان الهدف مطلوب' : 'Goal title is required');
      return;
    }

    setLoading(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        type,
        status,
        progress,
        startDate: startDate || null,
        endDate: endDate || null,
        ownerId: ownerId || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    addTitle: isRTL ? 'إضافة هدف جديد' : 'Add New Goal',
    editTitle: isRTL ? 'تعديل الهدف' : 'Edit Goal',
    title: isRTL ? 'عنوان الهدف' : 'Goal Title',
    titlePlaceholder: isRTL ? 'مثال: زيادة المبيعات بنسبة 20%' : 'e.g., Increase sales by 20%',
    description: isRTL ? 'الوصف (اختياري)' : 'Description (optional)',
    descPlaceholder: isRTL ? 'تفاصيل إضافية عن الهدف...' : 'Additional details about the goal...',
    type: isRTL ? 'نوع الهدف' : 'Goal Type',
    status: isRTL ? 'الحالة' : 'Status',
    progress: isRTL ? 'نسبة الإنجاز' : 'Progress',
    owner: isRTL ? 'المسؤول' : 'Owner',
    selectOwner: isRTL ? 'اختر المسؤول' : 'Select Owner',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    endDate: isRTL ? 'تاريخ النهاية' : 'End Date',
    save: isRTL ? 'حفظ' : 'Save',
    add: isRTL ? 'إضافة' : 'Add',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    // Type options
    annual: isRTL ? 'سنوي' : 'Annual',
    quarterly: isRTL ? 'ربع سنوي' : 'Quarterly',
    monthly: isRTL ? 'شهري' : 'Monthly',
    // Status options
    notStarted: isRTL ? 'لم يبدأ' : 'Not Started',
    inProgress: isRTL ? 'قيد التنفيذ' : 'In Progress',
    completed: isRTL ? 'مكتمل' : 'Completed',
    cancelled: isRTL ? 'ملغي' : 'Cancelled',
  };

  const typeOptions = [
    { value: 'annual', label: texts.annual, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { value: 'quarterly', label: texts.quarterly, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'monthly', label: texts.monthly, color: 'bg-green-100 text-green-700 border-green-300' },
  ];

  const statusOptions = [
    { value: 'not_started', label: texts.notStarted },
    { value: 'in_progress', label: texts.inProgress },
    { value: 'completed', label: texts.completed },
    { value: 'cancelled', label: texts.cancelled },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? texts.editTitle : texts.addTitle}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="label">{texts.title}</label>
          <div className="relative">
            <Target className={`absolute top-3 w-5 h-5 text-gray-400
                               ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder={texts.titlePlaceholder}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">{texts.description}</label>
          <div className="relative">
            <AlignLeft className={`absolute top-3 w-5 h-5 text-gray-400
                                   ${isRTL ? 'right-3' : 'left-3'}`} />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`input min-h-[80px] resize-none ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder={texts.descPlaceholder}
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="label">{texts.type}</label>
          <div className="flex gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all
                           ${type === opt.value 
                             ? opt.color + ' border-current' 
                             : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status & Progress Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="label">{texts.status}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Progress */}
          <div>
            <label className="label">{texts.progress}: {progress}%</label>
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner */}
        <div>
          <label className="label">{texts.owner}</label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                              ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'} appearance-none`}
            >
              <option value="">{texts.selectOwner}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="label">{texts.startDate}</label>
            <div className="relative">
              <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                    ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="label">{texts.endDate}</label>
            <div className="relative">
              <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                    ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              />
            </div>
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
                <Loader2 className="w-4 h-4 animate-spin" />
                {texts.saving}
              </>
            ) : (
              <>
                {isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEdit ? texts.save : texts.add}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
