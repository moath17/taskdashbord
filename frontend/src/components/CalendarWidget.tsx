'use client';

import { useEffect, useState } from 'react';
import { calendarApi } from '../api/calendar';
import { dashboardApi } from '../api/dashboard';
import { CalendarEvent, Task, VacationPlan, TrainingPlan } from '../types';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  X, 
  CheckSquare, 
  Umbrella, 
  GraduationCap,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface CalendarWidgetProps {
  compact?: boolean;
}

interface UpcomingItem {
  id: string;
  title: string;
  type: 'task' | 'vacation' | 'training' | 'holiday' | 'event';
  date: string;
  endDate?: string;
  status?: string;
  priority?: string;
  description?: string;
  userName?: string;
}

export default function CalendarWidget({ compact = false }: CalendarWidgetProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vacationPlans, setVacationPlans] = useState<VacationPlan[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UpcomingItem | null>(null);
  const isManager = user?.role === 'manager';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, dashboardData] = await Promise.all([
        calendarApi.getAll(),
        dashboardApi.getStats(),
      ]);
      setEvents(eventsData);
      setTasks(dashboardData.recentTasks || []);
      setVacationPlans(dashboardData.vacationPlans || []);
      setTrainingPlans(dashboardData.trainingPlans || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await calendarApi.delete(id);
      toast.success('Event deleted successfully');
      loadData();
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  // Combine all items into unified list
  const getUpcomingItems = (): UpcomingItem[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMonth = addDays(today, 30);
    const items: UpcomingItem[] = [];

    // Add tasks (upcoming due dates)
    tasks.forEach((task) => {
      const dueDate = new Date(task.dueDate);
      if (isAfter(dueDate, addDays(today, -1)) && isBefore(dueDate, nextMonth) && task.status !== 'Completed') {
        items.push({
          id: `task-${task.id}`,
          title: task.title,
          type: 'task',
          date: task.dueDate,
          status: task.status,
          priority: task.priority,
          userName: task.assignedUser?.name,
        });
      }
    });

    // Add vacation plans (approved ones)
    vacationPlans.forEach((plan) => {
      const startDate = new Date(plan.startDate);
      if (isAfter(startDate, addDays(today, -1)) && isBefore(startDate, nextMonth)) {
        items.push({
          id: `vacation-${plan.id}`,
          title: `${plan.user?.name || 'Employee'} - ${plan.type} Leave`,
          type: 'vacation',
          date: plan.startDate,
          endDate: plan.endDate,
          status: plan.status,
          userName: plan.user?.name,
          description: plan.notes,
        });
      }
    });

    // Add training plans
    trainingPlans.forEach((plan) => {
      if (plan.startDate) {
        const startDate = new Date(plan.startDate);
        if (isAfter(startDate, addDays(today, -1)) && isBefore(startDate, nextMonth)) {
          items.push({
            id: `training-${plan.id}`,
            title: plan.courseName,
            type: 'training',
            date: plan.startDate,
            endDate: plan.endDate,
            status: plan.status,
            userName: plan.user?.name,
            description: `Platform: ${plan.platform}`,
          });
        }
      }
    });

    // Add calendar events (holidays & training courses)
    events.forEach((event) => {
      const startDate = new Date(event.startDate);
      if (isAfter(startDate, addDays(today, -1)) && isBefore(startDate, nextMonth)) {
        items.push({
          id: `event-${event.id}`,
          title: event.title,
          type: event.type === 'holiday' ? 'holiday' : 'event',
          date: event.startDate,
          endDate: event.endDate,
          description: event.description,
        });
      }
    });

    // Sort by date
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'vacation':
        return <Umbrella className="w-4 h-4" />;
      case 'training':
        return <GraduationCap className="w-4 h-4" />;
      case 'holiday':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getItemColor = (type: string, status?: string) => {
    if (status === 'Delayed') return 'border-red-500 bg-red-50';
    if (status === 'rejected') return 'border-red-300 bg-red-50';
    if (status === 'pending') return 'border-yellow-500 bg-yellow-50';
    
    switch (type) {
      case 'task':
        return 'border-blue-500 bg-blue-50';
      case 'vacation':
        return 'border-green-500 bg-green-50';
      case 'training':
        return 'border-purple-500 bg-purple-50';
      case 'holiday':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getItemBadgeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'vacation':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-purple-100 text-purple-800';
      case 'holiday':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Label helper used in event details
  const getItemLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'vacation':
        return 'Vacation';
      case 'training':
        return 'Training';
      case 'holiday':
        return 'Holiday';
      default:
        return 'Event';
    }
  };
  // Use in EventDetailModal
  void getItemLabel;

  const upcomingItems = getUpcomingItems();

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Calendar className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Upcoming Schedule</h3>
            <p className="text-xs text-gray-500">{upcomingItems.length} items</p>
          </div>
        </div>
        {isManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            title="Add Event"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b bg-gray-50 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Tasks
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Vacations
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-purple-700">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span> Training
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-orange-700">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span> Holidays
        </span>
      </div>

      {/* Items List */}
      <div className="divide-y max-h-80 overflow-y-auto">
        {upcomingItems.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No upcoming events</p>
          </div>
        ) : (
          upcomingItems.slice(0, compact ? 6 : 10).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getItemColor(item.type, item.status)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg ${getItemBadgeColor(item.type)}`}>
                    {getItemIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {format(new Date(item.date), 'MMM d')}
                        {item.endDate && ` - ${format(new Date(item.endDate), 'MMM d')}`}
                      </span>
                      {item.userName && (
                        <span className="text-xs text-gray-400">• {item.userName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      item.status === 'Delayed' || item.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : item.status === 'approved' || item.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {upcomingItems.length > (compact ? 6 : 10) && (
        <div className="p-3 border-t text-center">
          <span className="text-xs text-gray-500">
            +{upcomingItems.length - (compact ? 6 : 10)} more items
          </span>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && isManager && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            try {
              await calendarApi.create(data);
              toast.success('Event created successfully');
              loadData();
              setShowCreateModal(false);
            } catch (error: any) {
              toast.error(error.response?.data?.error || 'Failed to create event');
            }
          }}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={isManager && (selectedItem.type === 'holiday' || selectedItem.type === 'event') 
            ? () => handleDeleteEvent(selectedItem.id.replace('event-', ''))
            : undefined
          }
        />
      )}
    </div>
  );
}

function ItemDetailModal({
  item,
  onClose,
  onDelete,
}: {
  item: UpcomingItem;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const getIcon = () => {
    switch (item.type) {
      case 'task':
        return <CheckSquare className="w-6 h-6 text-blue-600" />;
      case 'vacation':
        return <Umbrella className="w-6 h-6 text-green-600" />;
      case 'training':
        return <GraduationCap className="w-6 h-6 text-purple-600" />;
      case 'holiday':
        return <Calendar className="w-6 h-6 text-orange-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'task': return 'Task';
      case 'vacation': return 'Vacation';
      case 'training': return 'Training';
      case 'holiday': return 'Holiday';
      default: return 'Event';
    }
  };

  const getBgColor = () => {
    switch (item.type) {
      case 'task': return 'from-blue-500 to-blue-600';
      case 'vacation': return 'from-green-500 to-green-600';
      case 'training': return 'from-purple-500 to-purple-600';
      case 'holiday': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${getBgColor()} text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {getIcon()}
              </div>
              <div>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {getTypeLabel()}
                </span>
                <h3 className="font-bold mt-1">{item.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Date */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-gray-900">
                {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}
                {item.endDate && (
                  <>
                    <br />
                    <span className="text-sm text-gray-600">
                      to {format(new Date(item.endDate), 'MMMM d, yyyy')}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Status */}
          {item.status && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`inline-block mt-1 text-sm px-2 py-0.5 rounded-full font-medium ${
                  item.status === 'Delayed' || item.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : item.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : item.status === 'approved' || item.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          )}

          {/* Priority (for tasks) */}
          {item.priority && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                item.priority === 'High' ? 'bg-red-500' :
                item.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <div>
                <p className="text-xs text-gray-500">Priority</p>
                <p className="font-medium text-gray-900">{item.priority}</p>
              </div>
            </div>
          )}

          {/* User */}
          {item.userName && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
                {item.userName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned to</p>
                <p className="font-medium text-gray-900">{item.userName}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Close
          </button>
          {onDelete && (
            <button onClick={onDelete} className="btn btn-danger flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateEventModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'holiday' as 'holiday' | 'training',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <h3 className="font-bold">Add Calendar Event</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Event title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'holiday' | 'training' })}
              className="input"
            >
              <option value="holiday">Holiday</option>
              <option value="training">Training Course</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Add details..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Saving...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
