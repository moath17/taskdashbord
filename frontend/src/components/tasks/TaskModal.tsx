'use client';

import { useState, useEffect } from 'react';
import { Task, User, Comment, AnnualGoal, MBOGoal } from '../../types';
import { tasksApi, goalsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { X, Send, Trash2, Target, Flag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type SaveHandler = 
  | ((taskId: string, updates: Partial<Task>) => Promise<void>)
  | ((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>);

interface TaskModalProps {
  task: Task | null;
  users: User[];
  onClose: () => void;
  onSave: SaveHandler;
  onDelete?: (taskId: string) => void;
  canCreate: boolean;
}

export default function TaskModal({ task, users, onClose, onSave, onDelete, canCreate }: TaskModalProps) {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    annualGoalId: '',
    mboGoalId: '',
    startDate: '',
    dueDate: '',
    status: 'New' as Task['status'],
    priority: 'Medium' as Task['priority'],
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Goals state
  const [allMboGoals, setAllMboGoals] = useState<MBOGoal[]>([]);
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [selectedAnnualGoal, setSelectedAnnualGoal] = useState<AnnualGoal | null>(null);

  useEffect(() => {
    loadAllGoals();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        annualGoalId: task.annualGoalId || '',
        mboGoalId: task.mboGoalId || '',
        startDate: task.startDate.split('T')[0],
        dueDate: task.dueDate.split('T')[0],
        status: task.status,
        priority: task.priority,
      });
      loadComments();
    }
  }, [task]);

  // Auto-fill Annual Goal when MBO is selected
  useEffect(() => {
    if (formData.mboGoalId && allMboGoals.length > 0) {
      const selectedMbo = allMboGoals.find(m => m.id === formData.mboGoalId);
      if (selectedMbo) {
        setFormData(prev => ({ ...prev, annualGoalId: selectedMbo.annualGoalId }));
        const annualGoal = annualGoals.find(a => a.id === selectedMbo.annualGoalId);
        setSelectedAnnualGoal(annualGoal || null);
      }
    } else {
      setSelectedAnnualGoal(null);
    }
  }, [formData.mboGoalId, allMboGoals, annualGoals]);

  const loadAllGoals = async () => {
    setLoadingGoals(true);
    try {
      const [mboData, annualData] = await Promise.all([
        goalsApi.getAllMBOGoals(),
        goalsApi.getAllAnnualGoals(),
      ]);
      setAllMboGoals(mboData);
      setAnnualGoals(annualData);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoadingGoals(false);
    }
  };

  const loadComments = async () => {
    if (!task) return;
    try {
      const taskData = await tasksApi.getById(task.id);
      setComments(taskData.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate MBO goal is selected (Annual goal will be auto-filled)
    if (!task && !formData.mboGoalId) {
      toast.error('Please select an MBO Goal');
      return;
    }

    setLoading(true);

    try {
      if (task) {
        await (onSave as (taskId: string, updates: Partial<Task>) => Promise<void>)(task.id, formData);
      } else {
        await (onSave as unknown as (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>)(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    setCommentLoading(true);

    try {
      const comment = await tasksApi.addComment(task.id, newComment);
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const canEdit = task
    ? user?.role !== 'employee' || task.assignedTo === user?.id
    : canCreate;

  // Get MBO goal display name with employee
  const getMBODisplayName = (mbo: MBOGoal) => {
    const employeeName = mbo.userName ? ` (${mbo.userName})` : '';
    return `${mbo.title}${employeeName}`;
  };

  // Translations
  const texts = {
    newTask: isRTL ? 'مهمة جديدة' : 'New Task',
    editTask: isRTL ? 'تعديل المهمة' : 'Edit Task',
    title: isRTL ? 'العنوان' : 'Title',
    description: isRTL ? 'الوصف' : 'Description',
    assignTo: isRTL ? 'إسناد إلى' : 'Assign To',
    selectEmployee: isRTL ? 'اختر موظف' : 'Select employee',
    linkToGoal: isRTL ? 'ربط بهدف' : 'Link to Goal',
    required: isRTL ? 'مطلوب' : 'Required',
    loadingGoals: isRTL ? 'جاري تحميل الأهداف...' : 'Loading goals...',
    noMboGoals: isRTL ? 'لا توجد أهداف MBO. يرجى إنشاء أهداف MBO أولاً.' : 'No MBO goals found. Please create MBO goals first.',
    mboGoal: isRTL ? 'هدف MBO' : 'MBO Goal',
    selectMboGoal: isRTL ? 'اختر هدف MBO' : 'Select MBO Goal',
    annualGoal: isRTL ? 'الهدف السنوي' : 'Annual Goal',
    autoFilled: isRTL ? 'يتم ملؤه تلقائياً' : 'Auto-filled',
    willBeLinked: isRTL ? 'سيتم ربط الهدف السنوي تلقائياً' : 'Annual goal will be linked automatically',
    status: isRTL ? 'الحالة' : 'Status',
    priority: isRTL ? 'الأولوية' : 'Priority',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    dueDate: isRTL ? 'تاريخ الاستحقاق' : 'Due Date',
    saveTask: isRTL ? 'حفظ المهمة' : 'Save Task',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    delete: isRTL ? 'حذف' : 'Delete',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    comments: isRTL ? 'التعليقات' : 'Comments',
    noComments: isRTL ? 'لا توجد تعليقات بعد' : 'No comments yet',
    addComment: isRTL ? 'أضف تعليقاً...' : 'Add a comment...',
    send: isRTL ? 'إرسال' : 'Send',
    linkedGoals: isRTL ? 'الأهداف المرتبطة' : 'Linked Goals',
    assignedTo: isRTL ? 'مسند إلى' : 'Assigned To',
    confirmDelete: isRTL ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?',
    selectMboError: isRTL ? 'يرجى اختيار هدف MBO' : 'Please select an MBO Goal',
    statusNew: isRTL ? 'جديدة' : 'New',
    statusInProgress: isRTL ? 'قيد التنفيذ' : 'In Progress',
    statusCompleted: isRTL ? 'مكتملة' : 'Completed',
    statusDelayed: isRTL ? 'متأخرة' : 'Delayed',
    priorityLow: isRTL ? 'منخفضة' : 'Low',
    priorityMedium: isRTL ? 'متوسطة' : 'Medium',
    priorityHigh: isRTL ? 'عالية' : 'High',
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-2xl font-bold text-gray-900">
            {task ? texts.editTask : texts.newTask}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {canEdit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.title}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.description}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[100px]"
                  required
                />
              </div>

              {/* Employee Selection */}
              {canCreate && (
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.assignTo}</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">{texts.selectEmployee}</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Goals Section - MBO First, then Auto-fill Annual */}
              {(canCreate || task) && (
                <div className="bg-gradient-to-r from-purple-50 to-primary-50 p-4 rounded-lg border border-purple-200">
                  <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Target className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">{texts.linkToGoal}</h4>
                    {!task && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{texts.required}</span>
                    )}
                  </div>
                  
                  {loadingGoals ? (
                    <div className="text-sm text-gray-500">{texts.loadingGoals}</div>
                  ) : allMboGoals.length === 0 ? (
                    <div className={`flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <AlertCircle className="w-4 h-4" />
                      <span>{texts.noMboGoals}</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* MBO Goal Dropdown - Primary Selection */}
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <Target className="w-4 h-4 text-purple-600" />
                          {texts.mboGoal} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.mboGoalId}
                          onChange={(e) => setFormData({ ...formData, mboGoalId: e.target.value })}
                          className="input"
                          required={!task}
                        >
                          <option value="">{texts.selectMboGoal}</option>
                          {allMboGoals.map((mbo) => (
                            <option key={mbo.id} value={mbo.id}>
                              {getMBODisplayName(mbo)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Annual Goal - Auto-filled, Read-only Display */}
                      {selectedAnnualGoal && (
                        <div className="bg-white p-3 rounded-lg border border-primary-200">
                          <label className={`block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                            <Flag className="w-3 h-3 text-primary-600" />
                            {texts.annualGoal} ({texts.autoFilled})
                          </label>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Flag className="w-4 h-4 text-primary-600" />
                            <span className="font-medium text-gray-900">{selectedAnnualGoal.title}</span>
                            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                              {selectedAnnualGoal.year}
                            </span>
                          </div>
                        </div>
                      )}

                      {formData.mboGoalId && !selectedAnnualGoal && (
                        <div className={`text-xs text-gray-500 ${isRTL ? 'text-right' : ''}`}>
                          {texts.willBeLinked}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.status}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                    className="input"
                  >
                    <option value="New">{texts.statusNew}</option>
                    <option value="In Progress">{texts.statusInProgress}</option>
                    <option value="Completed">{texts.statusCompleted}</option>
                    <option value="Delayed">{texts.statusDelayed}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.priority}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className="input"
                  >
                    <option value="Low">{texts.priorityLow}</option>
                    <option value="Medium">{texts.priorityMedium}</option>
                    <option value="High">{texts.priorityHigh}</option>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>{texts.dueDate}</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className={`flex items-center gap-4 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? texts.saving : texts.saveTask}
                </button>
                {task && onDelete && canCreate && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(texts.confirmDelete)) {
                        onDelete(task.id);
                        onClose();
                      }
                    }}
                    className={`btn btn-danger flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Trash2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {texts.delete}
                  </button>
                )}
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  {texts.cancel}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{task?.title}</h3>
                <p className="text-gray-600 mt-2">{task?.description}</p>
              </div>
              
              {/* Show goals info for view-only mode */}
              {(task?.annualGoal || task?.mboGoal) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Linked Goals
                  </h4>
                  <div className="space-y-1 text-sm">
                    {task.mboGoal && (
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-purple-600" />
                        <span className="text-gray-600">MBO: {task.mboGoal.title}</span>
                      </div>
                    )}
                    {task.annualGoal && (
                      <div className="flex items-center gap-2">
                        <Flag className="w-3 h-3 text-primary-600" />
                        <span className="text-gray-600">Annual: {task.annualGoal.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Assigned To:</span>{' '}
                  <span className="text-gray-600">{task?.assignedUser?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>{' '}
                  <span className="text-gray-600">{task?.status}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>{' '}
                  <span className="text-gray-600">{task?.priority}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Due Date:</span>{' '}
                  <span className="text-gray-600">
                    {task && format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {task && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>

              <div className="space-y-4 mb-4">
                {comments.length === 0 && (
                  <p className="text-sm text-gray-500">No comments yet</p>
                )}
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.user?.name || 'Unknown'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder="Add a comment..."
                  className="input flex-1"
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                  className="btn btn-primary flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
