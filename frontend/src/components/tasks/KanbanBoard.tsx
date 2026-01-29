'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskClick: (task: Task) => void;
}

const statuses: TaskStatus[] = ['New', 'In Progress', 'Completed', 'Delayed'];

const statusColors: Record<TaskStatus, string> = {
  New: 'bg-gray-100 border-gray-300',
  'In Progress': 'bg-blue-50 border-blue-300',
  Completed: 'bg-green-50 border-green-300',
  Delayed: 'bg-red-50 border-red-300',
};

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskClick }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;

    onTaskUpdate(taskId, { status: newStatus });
  };

  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <div key={status} className="flex flex-col">
            <div className={`p-3 rounded-t-lg border-b-2 ${statusColors[status]}`}>
              <h3 className="font-semibold text-gray-900">
                {status} ({tasksByStatus[status].length})
              </h3>
            </div>
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 min-h-[400px] rounded-b-lg ${
                    snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-gray-50/50'
                  }`}
                >
                  {tasksByStatus[status].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-3 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                        >
                          <TaskCard task={task} onClick={() => onTaskClick(task)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

