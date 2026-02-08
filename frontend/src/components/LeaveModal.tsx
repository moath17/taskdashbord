'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, AlignLeft, Save, Plus, Loader2 } from 'lucide-react';

interface Leave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  leave?: Leave | null;
}

export function LeaveModal({ isOpen, onClose, onSave, leave }: LeaveModalProps) {
  const { isRTL } = useLanguage();
  const isEdit = !!leave;

  const [type, setType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (leave) {
        setType(leave.type);
        setStartDate(leave.startDate);
        setEndDate(leave.endDate);
        setReason(leave.reason || '');
      } else {
        setType('annual');
        setStartDate('');
        setEndDate('');
        setReason('');
      }
      setError('');
    }
  }, [isOpen, leave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError(isRTL ? 'تاريخ البداية والنهاية مطلوبان' : 'Start and end dates are required');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError(isRTL ? 'تاريخ النهاية يجب أن يكون بعد البداية' : 'End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      await onSave({ type, startDate, endDate, reason: reason.trim() || null });
      onClose();
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    addTitle: isRTL ? 'تسجيل إجازة جديدة' : 'Register New Leave',
    editTitle: isRTL ? 'تعديل تسجيل الإجازة' : 'Edit Leave',
    type: isRTL ? 'نوع الإجازة' : 'Leave Type',
    startDate: isRTL ? 'من تاريخ' : 'From Date',
    endDate: isRTL ? 'إلى تاريخ' : 'To Date',
    reason: isRTL ? 'السبب (اختياري)' : 'Reason (optional)',
    reasonPlaceholder: isRTL ? 'سبب الإجازة...' : 'Reason for leave...',
    save: isRTL ? 'حفظ' : 'Save',
    submit: isRTL ? 'تسجيل الإجازة' : 'Register Leave',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    annual: isRTL ? 'سنوية' : 'Annual',
    sick: isRTL ? 'مرضية' : 'Sick',
    personal: isRTL ? 'شخصية' : 'Personal',
    unpaid: isRTL ? 'بدون راتب' : 'Unpaid',
    other: isRTL ? 'أخرى' : 'Other',
  };

  const typeOptions = [
    { value: 'annual', label: texts.annual, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'sick', label: texts.sick, color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'personal', label: texts.personal, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { value: 'unpaid', label: texts.unpaid, color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'other', label: texts.other, color: 'bg-amber-100 text-amber-700 border-amber-300' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? texts.editTitle : texts.addTitle} maxWidth="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Type */}
        <div>
          <label className="label">{texts.type}</label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all
                           ${type === opt.value
                             ? opt.color + ' border-current'
                             : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{texts.startDate}</label>
            <div className="relative">
              <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              />
            </div>
          </div>
          <div>
            <label className="label">{texts.endDate}</label>
            <div className="relative">
              <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="label">{texts.reason}</label>
          <div className="relative">
            <AlignLeft className={`absolute top-3 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`input min-h-[80px] resize-none ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder={texts.reasonPlaceholder}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">{texts.cancel}</button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{texts.saving}</>
            ) : (
              <>{isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{isEdit ? texts.save : texts.submit}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
