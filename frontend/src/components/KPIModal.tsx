'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { 
  TrendingUp, 
  AlignLeft, 
  Calendar,
  User,
  Save,
  Plus,
  Loader2,
  Hash,
  Target,
  Folder
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface KPI {
  id: string;
  name: string;
  description?: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  frequency: string;
  category?: string;
  status: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
}

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  kpi?: KPI | null;
  members: Member[];
}

export function KPIModal({ isOpen, onClose, onSave, kpi, members }: KPIModalProps) {
  const { isRTL } = useLanguage();
  const isEdit = !!kpi;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('number');
  const [targetValue, setTargetValue] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [frequency, setFrequency] = useState('monthly');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('on_track');
  const [ownerId, setOwnerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form
  useEffect(() => {
    if (isOpen) {
      if (kpi) {
        setName(kpi.name);
        setDescription(kpi.description || '');
        setUnit(kpi.unit);
        setTargetValue(kpi.targetValue);
        setCurrentValue(kpi.currentValue);
        setFrequency(kpi.frequency);
        setCategory(kpi.category || '');
        setStatus(kpi.status);
        setOwnerId(kpi.ownerId || '');
        setStartDate(kpi.startDate || '');
        setEndDate(kpi.endDate || '');
      } else {
        setName('');
        setDescription('');
        setUnit('number');
        setTargetValue(0);
        setCurrentValue(0);
        setFrequency('monthly');
        setCategory('');
        setStatus('on_track');
        setOwnerId('');
        setStartDate('');
        setEndDate('');
      }
      setError('');
    }
  }, [isOpen, kpi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(isRTL ? 'اسم المؤشر مطلوب' : 'KPI name is required');
      return;
    }

    setLoading(true);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        unit,
        targetValue,
        currentValue,
        frequency,
        category: category.trim() || null,
        status,
        ownerId: ownerId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    addTitle: isRTL ? 'إضافة مؤشر أداء' : 'Add KPI',
    editTitle: isRTL ? 'تعديل مؤشر الأداء' : 'Edit KPI',
    name: isRTL ? 'اسم المؤشر' : 'KPI Name',
    namePlaceholder: isRTL ? 'مثال: معدل رضا العملاء' : 'e.g., Customer Satisfaction Rate',
    description: isRTL ? 'الوصف (اختياري)' : 'Description (optional)',
    descPlaceholder: isRTL ? 'تفاصيل عن المؤشر...' : 'Details about this KPI...',
    unit: isRTL ? 'وحدة القياس' : 'Unit',
    targetValue: isRTL ? 'القيمة المستهدفة' : 'Target Value',
    currentValue: isRTL ? 'القيمة الحالية' : 'Current Value',
    frequency: isRTL ? 'التكرار' : 'Frequency',
    category: isRTL ? 'التصنيف' : 'Category',
    categoryPlaceholder: isRTL ? 'مثال: المبيعات' : 'e.g., Sales',
    status: isRTL ? 'الحالة' : 'Status',
    owner: isRTL ? 'المسؤول' : 'Owner',
    selectOwner: isRTL ? 'اختر المسؤول' : 'Select Owner',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    endDate: isRTL ? 'تاريخ النهاية' : 'End Date',
    save: isRTL ? 'حفظ' : 'Save',
    add: isRTL ? 'إضافة' : 'Add',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    // Unit options
    number: isRTL ? 'رقم' : 'Number',
    percentage: isRTL ? 'نسبة %' : 'Percentage',
    currency: isRTL ? 'عملة' : 'Currency',
    // Frequency options
    daily: isRTL ? 'يومي' : 'Daily',
    weekly: isRTL ? 'أسبوعي' : 'Weekly',
    monthly: isRTL ? 'شهري' : 'Monthly',
    quarterly: isRTL ? 'ربع سنوي' : 'Quarterly',
    yearly: isRTL ? 'سنوي' : 'Yearly',
    // Status options
    onTrack: isRTL ? 'على المسار' : 'On Track',
    atRisk: isRTL ? 'معرض للخطر' : 'At Risk',
    offTrack: isRTL ? 'خارج المسار' : 'Off Track',
  };

  const unitOptions = [
    { value: 'number', label: texts.number },
    { value: 'percentage', label: texts.percentage },
    { value: 'currency', label: texts.currency },
  ];

  const frequencyOptions = [
    { value: 'daily', label: texts.daily },
    { value: 'weekly', label: texts.weekly },
    { value: 'monthly', label: texts.monthly },
    { value: 'quarterly', label: texts.quarterly },
    { value: 'yearly', label: texts.yearly },
  ];

  const statusOptions = [
    { value: 'on_track', label: texts.onTrack, color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'at_risk', label: texts.atRisk, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: 'off_track', label: texts.offTrack, color: 'bg-red-100 text-red-700 border-red-300' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? texts.editTitle : texts.addTitle}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="label">{texts.name}</label>
          <div className="relative">
            <TrendingUp className={`absolute top-3 w-5 h-5 text-gray-400
                                    ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder={texts.namePlaceholder}
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
              className={`input min-h-[70px] resize-none ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder={texts.descPlaceholder}
            />
          </div>
        </div>

        {/* Unit & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit */}
          <div>
            <label className="label">{texts.unit}</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input"
            >
              {unitOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="label">{texts.category}</label>
            <div className="relative">
              <Folder className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                placeholder={texts.categoryPlaceholder}
              />
            </div>
          </div>
        </div>

        {/* Target & Current Value Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target Value */}
          <div>
            <label className="label">{texts.targetValue}</label>
            <div className="relative">
              <Target className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                  ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                step="0.01"
              />
            </div>
          </div>

          {/* Current Value */}
          <div>
            <label className="label">{texts.currentValue}</label>
            <div className="relative">
              <Hash className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Frequency & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Frequency */}
          <div>
            <label className="label">{texts.frequency}</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="input"
            >
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="label">{texts.status}</label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all
                             ${status === opt.value 
                               ? opt.color + ' border-current' 
                               : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
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
