'use client';

import { Task } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the first day of the month's weekday (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  return (
    <div className="card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday Headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month start */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-[100px] border border-gray-200 rounded-lg"></div>
        ))}

        {/* Days of the month */}
        {days.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border rounded-lg p-2 ${
                isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-primary-700' : 'text-gray-700'
                }`}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => {
                  const priorityColors = {
                    High: 'bg-red-100 text-red-800 border-red-300',
                    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    Low: 'bg-green-100 text-green-800 border-green-300',
                  };
                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${priorityColors[task.priority]}`}
                      title={task.title}
                    >
                      <div className="truncate font-medium">{task.title}</div>
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

