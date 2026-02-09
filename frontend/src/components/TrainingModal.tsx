'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { GraduationCap, AlignLeft, Calendar, MapPin, Building2, Save, Plus, Loader2 } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Training {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  provider?: string;
  location?: string;
  participants?: { user?: { id: string } }[];
}

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  training?: Training | null;
  members: Member[];
}

export function TrainingModal({ isOpen, onClose, onSave, training, members }: TrainingModalProps) {
  const { isRTL } = useLanguage();
  const isEdit = !!training;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('course');
  const [status, setStatus] = useState('planned');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [provider, setProvider] = useState('');
  const [location, setLocation] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (training) {
        setTitle(training.title);
        setDescription(training.description || '');
        setType(training.type);
        setStatus(training.status);
        setStartDate(training.startDate || '');
        setEndDate(training.endDate || '');
        setProvider(training.provider || '');
        setLocation(training.location || '');
        setParticipantIds(training.participants?.map(p => p.user?.id).filter(Boolean) as string[] || []);
      } else {
        setTitle(''); setDescription(''); setType('course'); setStatus('planned');
        setStartDate(''); setEndDate(''); setProvider(''); setLocation(''); setParticipantIds([]);
      }
      setError('');
    }
  }, [isOpen, training]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError(isRTL ? 'عنوان التدريب مطلوب' : 'Training title is required');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        type, status,
        startDate: startDate || null,
        endDate: endDate || null,
        provider: provider.trim() || null,
        location: location.trim() || null,
        participantIds,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setParticipantIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const texts = {
    addTitle: isRTL ? 'إضافة تدريب جديد' : 'Add Training',
    editTitle: isRTL ? 'تعديل التدريب' : 'Edit Training',
    title: isRTL ? 'عنوان التدريب' : 'Training Title',
    titlePlaceholder: isRTL ? 'مثال: دورة القيادة المتقدمة' : 'e.g., Advanced Leadership Course',
    description: isRTL ? 'الوصف (اختياري)' : 'Description (optional)',
    type: isRTL ? 'النوع' : 'Type',
    status: isRTL ? 'الحالة' : 'Status',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    endDate: isRTL ? 'تاريخ النهاية' : 'End Date',
    provider: isRTL ? 'مقدم التدريب' : 'Provider',
    providerPlaceholder: isRTL ? 'مثال: أكاديمية التطوير' : 'e.g., Training Academy',
    location: isRTL ? 'الموقع' : 'Location',
    locationPlaceholder: isRTL ? 'مثال: قاعة المؤتمرات' : 'e.g., Conference Hall',
    participants: isRTL ? 'المشاركون' : 'Participants',
    save: isRTL ? 'حفظ' : 'Save',
    add: isRTL ? 'إضافة' : 'Add',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    course: isRTL ? 'دورة' : 'Course',
    workshop: isRTL ? 'ورشة عمل' : 'Workshop',
    certification: isRTL ? 'شهادة' : 'Certification',
    conference: isRTL ? 'مؤتمر' : 'Conference',
    other: isRTL ? 'أخرى' : 'Other',
    planned: isRTL ? 'مخطط' : 'Planned',
    inProgress: isRTL ? 'قيد التنفيذ' : 'In Progress',
    completed: isRTL ? 'مكتمل' : 'Completed',
    cancelled: isRTL ? 'ملغي' : 'Cancelled',
  };

  const typeOptions = [
    { value: 'course', label: texts.course },
    { value: 'workshop', label: texts.workshop },
    { value: 'certification', label: texts.certification },
    { value: 'conference', label: texts.conference },
    { value: 'other', label: texts.other },
  ];

  const statusOptions = [
    { value: 'planned', label: texts.planned },
    { value: 'in_progress', label: texts.inProgress },
    { value: 'completed', label: texts.completed },
    { value: 'cancelled', label: texts.cancelled },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? texts.editTitle : texts.addTitle} maxWidth="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="label">{texts.title}</label>
          <div className="relative">
            <GraduationCap className={`absolute top-3 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} placeholder={texts.titlePlaceholder} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">{texts.description}</label>
          <div className="relative">
            <AlignLeft className={`absolute top-3 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className={`input min-h-[70px] resize-none ${isRTL ? 'pr-11' : 'pl-11'}`} />
          </div>
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{texts.type}</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{texts.status}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Provider & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{texts.provider}</label>
            <div className="relative">
              <Building2 className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} placeholder={texts.providerPlaceholder} />
            </div>
          </div>
          <div>
            <label className="label">{texts.location}</label>
            <div className="relative">
              <MapPin className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} placeholder={texts.locationPlaceholder} />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{texts.startDate}</label>
            <div className="relative">
              <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} />
            </div>
          </div>
          <div>
            <label className="label">{texts.endDate}</label>
            <div className="relative">
              <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'}`} />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="label">{texts.participants}</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {members.map((m) => (
              <button key={m.id} type="button" onClick={() => toggleParticipant(m.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${participantIds.includes(m.id)
                    ? 'bg-sky-100 text-sky-700 border-2 border-sky-300'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'}`}>
                {m.name}
              </button>
            ))}
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
              <>{isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{isEdit ? texts.save : texts.add}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
