'use client';

import { useState, useMemo } from 'react';
import { TrainingPlan } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';

interface TrainingPlanModalProps {
  onClose: () => void;
  onSave: (plan: Omit<TrainingPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
}

export default function TrainingPlanModal({ onClose, onSave }: TrainingPlanModalProps) {
  const { isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    courseName: '',
    platform: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Translations
  const texts = {
    title: isRTL ? 'خطة تدريب جديدة' : 'New Training Plan',
    courseName: isRTL ? 'اسم الدورة' : 'Course Name',
    platform: isRTL ? 'المنصة / المؤسسة' : 'Platform / Institution',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    endDate: isRTL ? 'تاريخ النهاية' : 'End Date',
    duration: isRTL ? 'المدة (محسوبة تلقائياً)' : 'Duration (Auto-calculated)',
    durationPlaceholder: isRTL ? 'سيتم حسابها تلقائياً بعد إدخال التواريخ' : 'Will be calculated automatically after entering dates',
    notes: isRTL ? 'ملاحظات / التوقعات' : 'Notes / Expectations',
    notesPlaceholder: isRTL ? 'ملاحظات أو توقعات اختيارية...' : 'Optional notes or expectations...',
    creating: isRTL ? 'جاري الإنشاء...' : 'Creating...',
    createPlan: isRTL ? 'إنشاء الخطة' : 'Create Plan',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    enterDates: isRTL ? 'يرجى إدخال تاريخ البداية والنهاية' : 'Please enter start and end dates',
    endDateError: isRTL ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' : 'End date must be after start date',
    day: isRTL ? 'يوم' : 'day',
    days: isRTL ? 'أيام' : 'days',
    week: isRTL ? 'أسبوع' : 'week',
    weeks: isRTL ? 'أسابيع' : 'weeks',
    month: isRTL ? 'شهر' : 'month',
    months: isRTL ? 'أشهر' : 'months',
  };

  // Calculate duration automatically from start and end dates
  const calculatedDuration = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return '';
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      return '';
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays === 1) {
      return `1 ${texts.day}`;
    } else if (diffDays < 7) {
      return `${diffDays} ${texts.days}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      if (remainingDays === 0) {
        return weeks === 1 ? `1 ${texts.week}` : `${weeks} ${texts.weeks}`;
      } else {
        return `${weeks} ${weeks > 1 ? texts.weeks : texts.week} ${remainingDays} ${remainingDays > 1 ? texts.days : texts.day}`;
      }
    } else {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      if (remainingDays === 0) {
        return months === 1 ? `1 ${texts.month}` : `${months} ${texts.months}`;
      } else {
        return `${months} ${months > 1 ? texts.months : texts.month} ${remainingDays} ${remainingDays > 1 ? texts.days : texts.day}`;
      }
    }
  }, [formData.startDate, formData.endDate, isRTL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      alert(texts.enterDates);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      alert(texts.endDateError);
      return;
    }

    setLoading(true);
    onSave({
      ...formData,
      duration: calculatedDuration,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-bold text-gray-900">{texts.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.courseName}</label>
            <input
              type="text"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.platform}</label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.startDate} *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.endDate} *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
                required
                min={formData.startDate}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.duration}</label>
            <input
              type="text"
              value={calculatedDuration || texts.durationPlaceholder}
              className="input bg-gray-50"
              readOnly
              disabled
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.notes}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input min-h-[80px]"
              placeholder={texts.notesPlaceholder}
            />
          </div>

          <div className={`flex items-center gap-4 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? texts.creating : texts.createPlan}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {texts.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

