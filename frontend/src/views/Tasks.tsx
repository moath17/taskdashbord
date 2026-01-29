'use client';

import { useEffect, useState } from 'react';
import { tasksApi, usersApi, goalsApi } from '../api';
import { Task, User, AnnualGoal, MBOGoal } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TableView from '../components/tasks/TableView';
import CalendarView from '../components/tasks/CalendarView';
import TaskModal from '../components/tasks/TaskModal';
import { Plus, LayoutGrid, Table, Calendar } from 'lucide-react';

type ViewType = 'kanban' | 'table' | 'calendar';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([]);
  const [mboGoals, setMboGoals] = useState<MBOGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    assignedTo: '',
    status: '',
    priority: '',
    search: '',
    annualGoalId: '',
    mboGoalId: '',
  });
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData, goalsData] = await Promise.all([
        tasksApi.getAll(filters),
        user?.role !== 'employee' ? usersApi.getAll() : Promise.resolve([]),
        goalsApi.getAllAnnualGoals(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setAnnualGoals(goalsData);
    } catch (error) {
      toast.error(t.messages.loadingFailed);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const tasksData = await tasksApi.getAll(filters);
      setTasks(tasksData);
    } catch (error) {
      toast.error(t.messages.loadingFailed);
    }
  };

  // Load MBO goals when annual goal filter changes
  useEffect(() => {
    if (filters.annualGoalId) {
      goalsApi.getMBOGoalsByAnnualGoal(filters.annualGoalId).then(setMboGoals);
    } else {
      setMboGoals([]);
      if (filters.mboGoalId) {
        setFilters(prev => ({ ...prev, mboGoalId: '' }));
      }
    }
  }, [filters.annualGoalId]);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await tasksApi.update(taskId, updates);
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
      toast.success(t.tasks.taskUpdated);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const handleTaskCreate = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      const newTask = await tasksApi.create(taskData);
      setTasks([...tasks, newTask]);
      setIsModalOpen(false);
      toast.success(t.tasks.taskCreated);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm(t.tasks.confirmDeleteTask)) return;
    try {
      await tasksApi.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success(t.tasks.taskDeleted);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.messages.failed);
    }
  };

  const canCreateTask = user?.role !== 'employee';

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <h1 className="text-3xl font-bold text-gray-900">{t.tasks.title}</h1>
        <div className="flex items-center gap-2">
          {canCreateTask && (
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsModalOpen(true);
              }}
              className={`btn btn-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.tasks.newTask}
            </button>
          )}
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <input
            type="text"
            placeholder={t.tasks.searchTasks}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
          {user?.role !== 'employee' && (
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="input"
            >
              <option value="">{t.tasks.allEmployees}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="">{t.tasks.allStatuses}</option>
            <option value="New">{t.tasks.new}</option>
            <option value="In Progress">{t.tasks.inProgress}</option>
            <option value="Completed">{t.tasks.completed}</option>
            <option value="Delayed">{t.tasks.delayed}</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="input"
          >
            <option value="">{t.tasks.allPriorities}</option>
            <option value="High">{t.tasks.high}</option>
            <option value="Medium">{t.tasks.medium}</option>
            <option value="Low">{t.tasks.low}</option>
          </select>
          {/* Goal Filters */}
          <select
            value={filters.annualGoalId}
            onChange={(e) => setFilters({ ...filters, annualGoalId: e.target.value, mboGoalId: '' })}
            className="input"
          >
            <option value="">{t.tasks.allAnnualGoals}</option>
            {annualGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({g.year})
              </option>
            ))}
          </select>
          <select
            value={filters.mboGoalId}
            onChange={(e) => setFilters({ ...filters, mboGoalId: e.target.value })}
            className="input"
            disabled={!filters.annualGoalId}
          >
            <option value="">{filters.annualGoalId ? t.tasks.allMboGoals : t.tasks.selectAnnualGoal}</option>
            {mboGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center gap-2 border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className={`text-sm text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>{t.app.view}:</span>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              view === 'kanban' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <LayoutGrid className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.tasks.kanban}
          </button>
          <button
            onClick={() => setView('table')}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              view === 'table' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Table className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.tasks.table}
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              view === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.tasks.calendar}
          </button>
        </div>
      </div>

      {/* Task Views */}
      {loading ? (
        <div className="text-center py-12">{t.tasks.loadingTasks}</div>
      ) : (
        <>
          {view === 'kanban' && (
            <KanbanBoard
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
            />
          )}
          {view === 'table' && (
            <TableView
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
              canDelete={canCreateTask}
            />
          )}
          {view === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
            />
          )}
        </>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          users={users}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={selectedTask ? handleTaskUpdate : handleTaskCreate}
          onDelete={selectedTask ? handleTaskDelete : undefined}
          canCreate={canCreateTask}
        />
      )}
    </div>
  );
}
