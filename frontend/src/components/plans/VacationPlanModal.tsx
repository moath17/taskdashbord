'use client';

import { useState } from 'react';
import { VacationPlan } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';

interface VacationPlanModalProps {
  onClose: () => void;
  onSave: (plan: Omit<VacationPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
}

export default function VacationPlanModal({ onClose, onSave }: VacationPlanModalProps) {
  const { isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    type: 'Annual' as VacationPlan['type'],
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Translations
  const texts = {
    title: isRTL ? 'طلب إجازة جديد' : 'New Vacation Plan',
    type: isRTL ? 'النوع' : 'Type',
    typeAnnual: isRTL ? 'سنوية' : 'Annual',
    typeSick: isRTL ? 'مرضية' : 'Sick',
    typeOther: isRTL ? 'أخرى' : 'Other',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    endDate: isRTL ? 'تاريخ النهاية' : 'End Date',
    notes: isRTL ? 'ملاحظات' : 'Notes',
    notesPlaceholder: isRTL ? 'ملاحظات أو سبب اختياري...' : 'Optional notes or reason...',
    creating: isRTL ? 'جاري الإنشاء...' : 'Creating...',
    createPlan: isRTL ? 'إنشاء الطلب' : 'Create Plan',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSave(formData);
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
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.type}</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as VacationPlan['type'] })}
              className="input"
              required
            >
              <option value="Annual">{texts.typeAnnual}</option>
              <option value="Sick">{texts.typeSick}</option>
              <option value="Other">{texts.typeOther}</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.startDate}</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.endDate}</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input"
              required
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

