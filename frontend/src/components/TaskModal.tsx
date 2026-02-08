'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { 
  FileText, 
  AlignLeft, 
  Flag, 
  User, 
  Calendar,
  Target,
  Save,
  Plus,
  Loader2
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Goal {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
  goalId?: string;
  goal?: Goal;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  task?: Task | null;
  members: Member[];
  goals: Goal[];
}

export function TaskModal({ isOpen, onClose, onSave, task, members, goals }: TaskModalProps) {
  const { isRTL } = useLanguage();
  const isEdit = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setStatus(task.status);
        setPriority(task.priority);
        setAssignedTo(task.assignedTo || '');
        setDueDate(task.dueDate || '');
        setGoalId(task.goalId || '');
      } else {
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('medium');
        setAssignedTo('');
        setDueDate('');
        setGoalId('');
      }
      setError('');
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(isRTL ? 'عنوان المهمة مطلوب' : 'Task title is required');
      return;
    }
    if (!goalId.trim()) {
      setError(isRTL ? 'الهدف مطلوب' : 'Goal is required');
      return;
    }

    setLoading(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
        goalId: goalId || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    addTitle: isRTL ? 'إضافة مهمة جديدة' : 'Add New Task',
    editTitle: isRTL ? 'تعديل المهمة' : 'Edit Task',
    title: isRTL ? 'عنوان المهمة' : 'Task Title',
    titlePlaceholder: isRTL ? 'مثال: إنهاء التقرير الشهري' : 'e.g., Complete monthly report',
    description: isRTL ? 'الوصف (اختياري)' : 'Description (optional)',
    descPlaceholder: isRTL ? 'تفاصيل إضافية عن المهمة...' : 'Additional details about the task...',
    status: isRTL ? 'الحالة' : 'Status',
    priority: isRTL ? 'الأولوية' : 'Priority',
    assignTo: isRTL ? 'تعيين إلى' : 'Assign to',
    unassigned: isRTL ? 'غير معين' : 'Unassigned',
    dueDate: isRTL ? 'تاريخ الاستحقاق' : 'Due Date',
    goal: isRTL ? 'الهدف' : 'Goal',
    goalRequired: isRTL ? 'اختر الهدف' : 'Select goal',
    save: isRTL ? 'حفظ' : 'Save',
    add: isRTL ? 'إضافة' : 'Add',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    // Status options
    todo: isRTL ? 'جديدة' : 'To Do',
    inProgress: isRTL ? 'قيد العمل' : 'In Progress',
    done: isRTL ? 'مكتملة' : 'Done',
    // Priority options
    low: isRTL ? 'منخفضة' : 'Low',
    medium: isRTL ? 'متوسطة' : 'Medium',
    high: isRTL ? 'عالية' : 'High',
  };

  const statusOptions = [
    { value: 'todo', label: texts.todo, color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'in_progress', label: texts.inProgress, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'done', label: texts.done, color: 'bg-green-100 text-green-700 border-green-300' },
  ];

  const priorityOptions = [
    { value: 'low', label: texts.low, color: 'bg-slate-100 text-slate-600 border-slate-300' },
    { value: 'medium', label: texts.medium, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: 'high', label: texts.high, color: 'bg-red-100 text-red-700 border-red-300' },
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
            <FileText className={`absolute top-3 w-5 h-5 text-gray-400
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
              className={`input min-h-[100px] resize-none ${isRTL ? 'pr-11' : 'pl-11'}`}
              placeholder={texts.descPlaceholder}
            />
          </div>
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="label">{texts.status}</label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all
                             ${status === opt.value 
                               ? opt.color + ' border-current' 
                               : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="label">{texts.priority}</label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all
                             ${priority === opt.value 
                               ? opt.color + ' border-current' 
                               : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal (required) */}
        <div>
          <label className="label">
            {texts.goal} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Target className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'} appearance-none`}
              required
            >
              <option value="">{texts.goalRequired}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assign & Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Assign To */}
          <div>
            <label className="label">{texts.assignTo}</label>
            <div className="relative">
              <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                ${isRTL ? 'right-3' : 'left-3'}`} />
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={`input ${isRTL ? 'pr-11' : 'pl-11'} appearance-none`}
              >
                <option value="">{texts.unassigned}</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="label">{texts.dueDate}</label>
            <div className="relative">
              <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                    ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
