'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TaskModal } from '@/components/TaskModal';
import { useTheme } from '@/context/ThemeContext';
import {
  CheckSquare,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Search,
  Clock,
  User,
  Flag,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  Target,
  Moon,
  Sun,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  assignedUser?: { id: string; name: string; email: string };
  createdBy: string;
  creator?: { id: string; name: string };
  dueDate?: string;
  goalId?: string;
  goal?: { id: string; title: string };
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TasksPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchMembers();
      fetchGoals();
    }
  }, [isAuthenticated]);

  // Close dropdown only when clicking outside the dropdown (ignore clicks inside menu/button)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-dropdown="task-menu"]')) return;
      setOpenDropdown(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch members');
    }
  };

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGoals((data.goals || []).map((g: { id: string; title: string }) => ({ id: g.id, title: g.title })));
      }
    } catch (err) {
      console.error('Failed to fetch goals');
    }
  };

  const handleAddTask = async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setTasks([result.task, ...tasks]);
  };

  const handleEditTask = async (data: any) => {
    if (!editingTask) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/tasks/${editingTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);

    setTasks(tasks.map(t => t.id === editingTask.id ? result.task : t));
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmMsg = isRTL ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?';
    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || (isRTL ? 'فشل في حذف المهمة' : 'Failed to delete task'));
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setTasks(tasks.map(t => t.id === taskId ? result.task : t));
    } catch (err: any) {
      console.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'done': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return Circle;
      case 'in_progress': return Clock;
      case 'done': return CheckCircle2;
      default: return Circle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-slate-500';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      todo: { ar: 'جديدة', en: 'To Do' },
      in_progress: { ar: 'قيد العمل', en: 'In Progress' },
      done: { ar: 'مكتملة', en: 'Done' },
    };
    return isRTL ? labels[status]?.ar : labels[status]?.en;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group by status
  const groupedTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  const texts = {
    title: isRTL ? 'المهام' : 'Tasks',
    addTask: isRTL ? 'مهمة جديدة' : 'New Task',
    search: isRTL ? 'بحث...' : 'Search...',
    all: isRTL ? 'الكل' : 'All',
    todo: isRTL ? 'جديدة' : 'To Do',
    inProgress: isRTL ? 'قيد العمل' : 'In Progress',
    done: isRTL ? 'مكتملة' : 'Done',
    noTasks: isRTL ? 'لا توجد مهام' : 'No tasks found',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    unassigned: isRTL ? 'غير معين' : 'Unassigned',
  };

  const openEditModal = (task: Task) => {
    setOpenDropdown(null);
    setEditingTask(task);
    setIsModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{texts.title}</h1>
              </div>
            </div>

            {/* Theme toggle + Add Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={theme === 'dark' ? (isRTL ? 'الوضع الفاتح' : 'Light') : (isRTL ? 'الوضع الداكن' : 'Dark')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
              onClick={() => {
                setOpenDropdown(null);
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{texts.addTask}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400
                                ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={texts.search}
              className={`input ${isRTL ? 'pr-11' : 'pl-11'}`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'todo', 'in_progress', 'done'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                           ${filterStatus === status
                             ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
                             : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {status === 'all' ? texts.all : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Kanban View - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {(['todo', 'in_progress', 'done'] as const).map((status) => (
            <div key={status} className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'todo' ? 'bg-gray-400' :
                  status === 'in_progress' ? 'bg-sky-500' : 'bg-green-500'
                }`} />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">{getStatusLabel(status)}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">({groupedTasks[status].length})</span>
              </div>

              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isRTL={isRTL}
                    onEdit={() => openEditModal(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onStatusChange={handleStatusChange}
                    getPriorityColor={getPriorityColor}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    texts={texts}
                  />
                ))}

                {groupedTasks[status].length === 0 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                    {texts.noTasks}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tasks List View - Mobile */}
        <div className="lg:hidden space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="card text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{texts.noTasks}</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isRTL={isRTL}
                onEdit={() => openEditModal(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onStatusChange={handleStatusChange}
                getPriorityColor={getPriorityColor}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                texts={texts}
                showStatus
              />
            ))
          )}
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleEditTask : handleAddTask}
        task={editingTask}
        members={members}
        goals={goals}
      />
    </div>
  );
}

// Task Card Component
function TaskCard({
  task,
  isRTL,
  onEdit,
  onDelete,
  onStatusChange,
  getPriorityColor,
  openDropdown,
  setOpenDropdown,
  texts,
  showStatus = false,
}: {
  task: Task;
  isRTL: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (taskId: string, status: string) => void;
  getPriorityColor: (priority: string) => string;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  texts: any;
  showStatus?: boolean;
}) {
  const StatusIcon = task.status === 'done' ? CheckCircle2 : 
                     task.status === 'in_progress' ? Clock : Circle;

  return (
    <div className="card hover:shadow-md transition-shadow group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3">
        {/* Status Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const nextStatus = task.status === 'todo' ? 'in_progress' :
                              task.status === 'in_progress' ? 'done' : 'todo';
            onStatusChange(task.id, nextStatus);
          }}
          className={`mt-0.5 transition-colors shrink-0 ${
            task.status === 'done' ? 'text-green-500' :
            task.status === 'in_progress' ? 'text-blue-500' : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <StatusIcon className="w-5 h-5" />
        </button>

        {/* Content - click to edit */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('[data-dropdown="task-menu"]')) return;
            onEdit();
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-gray-900 dark:text-white ${task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
              {task.title}
            </h4>

            {/* Actions */}
            <div className="relative" data-dropdown="task-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === task.id ? null : task.id);
                }}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {openDropdown === task.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                                border border-gray-200 dark:border-gray-700 py-1 min-w-[100px] z-10
                                ${isRTL ? 'left-0' : 'right-0'}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {texts.edit}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 
                               flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {texts.delete}
                  </button>
                </div>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
            {/* Priority */}
            <span className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3.5 h-3.5" />
              {task.priority}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.dueDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
              </span>
            )}

            {/* Assigned To */}
            {task.assignedUser && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <User className="w-3.5 h-3.5" />
                {task.assignedUser.name}
              </span>
            )}

            {/* Goal */}
            {task.goal && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Target className="w-3.5 h-3.5" />
                {task.goal.title}
              </span>
            )}

            {/* Status Badge - Mobile */}
            {showStatus && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                              ${task.status === 'done' ? 'bg-green-100 text-green-700' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'}`}>
                {task.status === 'done' ? texts.done :
                 task.status === 'in_progress' ? texts.inProgress : texts.todo}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
