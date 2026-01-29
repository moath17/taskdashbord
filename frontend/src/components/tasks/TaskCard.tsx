import { Task } from '../../types';
import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColors = {
    High: 'border-l-red-500 bg-red-50',
    Medium: 'border-l-yellow-500 bg-yellow-50',
    Low: 'border-l-green-500 bg-green-50',
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border-l-4 p-4 cursor-pointer hover:shadow-md transition-shadow ${priorityColors[task.priority]}`}
    >
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        </div>
        {task.assignedUser && (
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            <span>{task.assignedUser.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

