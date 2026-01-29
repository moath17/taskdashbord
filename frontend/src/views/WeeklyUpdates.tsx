'use client';

import { useState, useEffect } from 'react';
import { tasksApi } from '../api';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  FileText,
  AlertCircle,
  Loader,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface WeekTask {
  taskId: string;
  weekType: 'last' | 'current';
  notes: string;
}

export default function WeeklyUpdates() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<WeekTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWeekType, setSelectedWeekType] = useState<'last' | 'current'>('current');

  const dateLocale = language === 'ar' ? arSA : enUS;
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 0 });
  const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tasksData = await tasksApi.getAll();
      setTasks(tasksData);
      
      const saved = localStorage.getItem('weeklyUpdates');
      if (saved) {
        setWeekTasks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const saveWeekTasks = (newWeekTasks: WeekTask[]) => {
    setWeekTasks(newWeekTasks);
    localStorage.setItem('weeklyUpdates', JSON.stringify(newWeekTasks));
  };

  const addTaskToWeek = (taskId: string, weekType: 'last' | 'current', notes: string = '') => {
    const exists = weekTasks.find(wt => wt.taskId === taskId && wt.weekType === weekType);
    if (exists) {
      toast.error(isRTL ? 'المهمة مضافة بالفعل لهذا الأسبوع' : 'Task already added to this week');
      return;
    }
    const newWeekTasks = [...weekTasks, { taskId, weekType, notes }];
    saveWeekTasks(newWeekTasks);
    toast.success(isRTL 
      ? `تمت إضافة المهمة إلى ${weekType === 'last' ? 'الأسبوع الماضي' : 'الأسبوع الحالي'}`
      : `Task added to ${weekType === 'last' ? 'Last' : 'Current'} Week`
    );
  };

  const removeTaskFromWeek = (taskId: string, weekType: 'last' | 'current') => {
    const newWeekTasks = weekTasks.filter(wt => !(wt.taskId === taskId && wt.weekType === weekType));
    saveWeekTasks(newWeekTasks);
    toast.success(isRTL ? 'تمت إزالة المهمة' : 'Task removed');
  };

  const updateTaskNotes = (taskId: string, weekType: 'last' | 'current', notes: string) => {
    const newWeekTasks = weekTasks.map(wt => 
      wt.taskId === taskId && wt.weekType === weekType ? { ...wt, notes } : wt
    );
    saveWeekTasks(newWeekTasks);
  };

  const getTasksForWeek = (weekType: 'last' | 'current') => {
    return weekTasks
      .filter(wt => wt.weekType === weekType)
      .map(wt => ({
        ...wt,
        task: tasks.find(t => t.id === wt.taskId),
      }))
      .filter(wt => wt.task);
  };

  const lastWeekTasks = getTasksForWeek('last');
  const currentWeekTasks = getTasksForWeek('current');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (!isRTL) return status;
    switch (status) {
      case 'Completed': return 'مكتملة';
      case 'In Progress': return 'قيد التنفيذ';
      case 'Delayed': return 'متأخرة';
      case 'New': return 'جديدة';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  if (user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-96 px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? 'الوصول مرفوض' : 'Access Denied'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {isRTL ? 'يمكن للمديرين فقط الوصول لهذه الصفحة.' : 'Only managers can access this page.'}
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
    <div className={`space-y-4 sm:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.weeklyUpdates.title}</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            {isRTL ? 'تتبع تقدم المهام - الأسبوع الماضي مقابل الأسبوع الحالي' : 'Track tasks progress - Last Week vs Current Week'}
          </p>
        </div>
      </div>

      {/* Week Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
          <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isRTL ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
            <span className="font-semibold text-gray-700">{isRTL ? 'الأسبوع الماضي' : 'Last Week'}</span>
          </div>
          <p className="text-xs text-gray-500">
            {format(lastWeekStart, 'MMM d', { locale: dateLocale })} - {format(lastWeekEnd, 'MMM d', { locale: dateLocale })}
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{lastWeekTasks.length}</p>
          <p className="text-xs text-gray-500">{isRTL ? 'مهام' : 'tasks'}</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isRTL ? <ChevronLeft className="w-5 h-5 text-primary-600" /> : <ChevronRight className="w-5 h-5 text-primary-600" />}
            <span className="font-semibold text-primary-700">{isRTL ? 'الأسبوع الحالي' : 'Current Week'}</span>
          </div>
          <p className="text-xs text-primary-500">
            {format(currentWeekStart, 'MMM d', { locale: dateLocale })} - {format(currentWeekEnd, 'MMM d', { locale: dateLocale })}
          </p>
          <p className="text-2xl font-bold text-primary-800 mt-2">{currentWeekTasks.length}</p>
          <p className="text-xs text-primary-500">{isRTL ? 'مهام' : 'tasks'}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Last Week Column */}
        <div className="card overflow-hidden">
          <div className={`p-4 bg-gray-100 border-b flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? <ChevronRight className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="font-bold text-gray-800">{isRTL ? 'الأسبوع الماضي' : 'Last Week'}</h3>
                <p className="text-xs text-gray-500">
                  {format(lastWeekStart, 'MMM d', { locale: dateLocale })} - {format(lastWeekEnd, 'MMM d, yyyy', { locale: dateLocale })}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedWeekType('last');
                setShowAddModal(true);
              }}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {lastWeekTasks.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{isRTL ? 'لا توجد مهام للأسبوع الماضي' : 'No tasks for last week'}</p>
                <button
                  onClick={() => {
                    setSelectedWeekType('last');
                    setShowAddModal(true);
                  }}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isRTL ? '+ إضافة مهمة' : '+ Add Task'}
                </button>
              </div>
            ) : (
              lastWeekTasks.map(({ task, notes, taskId }) => (
                <TaskCard
                  key={taskId}
                  task={task!}
                  notes={notes}
                  isRTL={isRTL}
                  onRemove={() => removeTaskFromWeek(taskId, 'last')}
                  onUpdateNotes={(newNotes) => updateTaskNotes(taskId, 'last', newNotes)}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getPriorityColor={getPriorityColor}
                />
              ))
            )}
          </div>
        </div>

        {/* Current Week Column */}
        <div className="card overflow-hidden">
          <div className={`p-4 bg-primary-100 border-b flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? <ChevronLeft className="w-5 h-5 text-primary-600" /> : <ChevronRight className="w-5 h-5 text-primary-600" />}
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="font-bold text-primary-800">{isRTL ? 'الأسبوع الحالي' : 'Current Week'}</h3>
                <p className="text-xs text-primary-500">
                  {format(currentWeekStart, 'MMM d', { locale: dateLocale })} - {format(currentWeekEnd, 'MMM d, yyyy', { locale: dateLocale })}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedWeekType('current');
                setShowAddModal(true);
              }}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
            >
              <Plus className="w-5 h-5 text-primary-600" />
            </button>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {currentWeekTasks.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{isRTL ? 'لا توجد مهام للأسبوع الحالي' : 'No tasks for current week'}</p>
                <button
                  onClick={() => {
                    setSelectedWeekType('current');
                    setShowAddModal(true);
                  }}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isRTL ? '+ إضافة مهمة' : '+ Add Task'}
                </button>
              </div>
            ) : (
              currentWeekTasks.map(({ task, notes, taskId }) => (
                <TaskCard
                  key={taskId}
                  task={task!}
                  notes={notes}
                  isRTL={isRTL}
                  onRemove={() => removeTaskFromWeek(taskId, 'current')}
                  onUpdateNotes={(newNotes) => updateTaskNotes(taskId, 'current', newNotes)}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getPriorityColor={getPriorityColor}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          tasks={tasks}
          weekType={selectedWeekType}
          isRTL={isRTL}
          existingTaskIds={weekTasks.filter(wt => wt.weekType === selectedWeekType).map(wt => wt.taskId)}
          onClose={() => setShowAddModal(false)}
          onAdd={(taskId, notes) => {
            addTaskToWeek(taskId, selectedWeekType, notes);
            setShowAddModal(false);
          }}
          weekDates={
            selectedWeekType === 'last'
              ? { start: lastWeekStart, end: lastWeekEnd }
              : { start: currentWeekStart, end: currentWeekEnd }
          }
        />
      )}
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: Task;
  notes: string;
  isRTL: boolean;
  onRemove: () => void;
  onUpdateNotes: (notes: string) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

function TaskCard({ task, notes, isRTL, onRemove, onUpdateNotes, getStatusColor, getStatusLabel, getPriorityColor }: TaskCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState(notes);

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className={`flex items-start justify-between gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">{task.title}</h4>
          <div className={`flex items-center gap-2 mt-1 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 flex-shrink-0"
          title={isRTL ? 'إزالة من الأسبوع' : 'Remove from week'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm">
            {format(new Date(task.startDate), 'MMM d')}
            <ArrowRight className="w-3 h-3 inline mx-1" />
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </span>
        </div>

        {task.assignedUser && (
          <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{task.assignedUser.name}</span>
          </div>
        )}

        <div className="mt-2">
          {notes || showNotes ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <div className={`flex items-start justify-between gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-xs font-medium text-yellow-700">
                  {isRTL ? 'ملاحظات:' : 'Notes:'}
                </span>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-xs text-yellow-600 hover:text-yellow-700"
                >
                  {notes ? (isRTL ? 'تعديل' : 'Edit') : (isRTL ? 'إلغاء' : 'Cancel')}
                </button>
              </div>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                onBlur={() => onUpdateNotes(editingNotes)}
                className={`w-full text-xs bg-white border border-yellow-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-yellow-400 ${isRTL ? 'text-right' : ''}`}
                rows={2}
                placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowNotes(true)}
              className={`text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText className="w-3 h-3" />
              {isRTL ? 'إضافة ملاحظات' : 'Add Notes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Task Modal
interface AddTaskModalProps {
  tasks: Task[];
  weekType: 'last' | 'current';
  isRTL: boolean;
  existingTaskIds: string[];
  onClose: () => void;
  onAdd: (taskId: string, notes: string) => void;
  weekDates: { start: Date; end: Date };
}

function AddTaskModal({ tasks, weekType, isRTL, existingTaskIds, onClose, onAdd, weekDates }: AddTaskModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const availableTasks = tasks.filter(task => !existingTaskIds.includes(task.id));
  
  const filteredTasks = availableTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignedUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!selectedTaskId) {
      toast.error(isRTL ? 'يرجى اختيار مهمة' : 'Please select a task');
      return;
    }
    onAdd(selectedTaskId, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className={`bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${weekType === 'current' ? 'bg-primary-100' : 'bg-gray-100'}`}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className={`font-bold ${weekType === 'current' ? 'text-primary-800' : 'text-gray-800'}`}>
                {isRTL 
                  ? `إضافة مهمة إلى ${weekType === 'last' ? 'الأسبوع الماضي' : 'الأسبوع الحالي'}`
                  : `Add Task to ${weekType === 'last' ? 'Last' : 'Current'} Week`
                }
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {format(weekDates.start, 'MMM d')} - {format(weekDates.end, 'MMM d, yyyy')}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={isRTL ? 'البحث في المهام أو الموظفين...' : 'Search tasks or employees...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
            />
            <svg
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Tasks List */}
          <div className="border rounded-lg max-h-60 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                {availableTasks.length === 0 
                  ? (isRTL ? 'جميع المهام مضافة بالفعل' : 'All tasks already added')
                  : (isRTL ? 'لا توجد مهام' : 'No tasks found')
                }
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                    selectedTaskId === task.id
                      ? `bg-primary-50 ${isRTL ? 'border-r-4 border-r-primary-500' : 'border-l-4 border-l-primary-500'}`
                      : `hover:bg-gray-50 ${isRTL ? 'border-r-4 border-r-transparent' : 'border-l-4 border-l-transparent'}`
                  }`}
                >
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="radio"
                      checked={selectedTaskId === task.id}
                      onChange={() => setSelectedTaskId(task.id)}
                      className="mt-1"
                    />
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                      <p className="font-medium text-sm text-gray-900">{task.title}</p>
                      <div className={`flex flex-wrap items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        {task.assignedUser && (
                          <span className={`text-xs text-gray-500 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <User className="w-3 h-3" />
                            {task.assignedUser.name}
                          </span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notes */}
          {selectedTaskId && (
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`input text-sm ${isRTL ? 'text-right' : ''}`}
                rows={2}
                placeholder={isRTL ? 'أضف أي ملاحظات لهذه المهمة...' : 'Add any notes for this task...'}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedTaskId}
            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL 
              ? `إضافة إلى ${weekType === 'last' ? 'الأسبوع الماضي' : 'الأسبوع الحالي'}`
              : `Add to ${weekType === 'last' ? 'Last' : 'Current'} Week`
            }
          </button>
        </div>
      </div>
    </div>
  );
}
