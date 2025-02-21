import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskCard({ task, onUpdateStatus, onDeleteTask }: TaskCardProps) {
  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  // Format date and time more compactly
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Created {formatDateTime(task.createdAt)}
          </p>
        </div>
        <button
          onClick={() => onDeleteTask(task._id)}
          className="text-red-500 hover:text-red-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          {task.assignee && (
            <span className="text-sm text-gray-500">
              Assigned to {task.assignee.username}
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onUpdateStatus(task._id, "in-progress")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg 
              ${task.status === 'in-progress' 
                ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700'} 
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            disabled={task.status === 'in-progress'}
          >
            In Progress
          </button>
          <button
            onClick={() => onUpdateStatus(task._id, "completed")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg 
              ${task.status === 'completed' 
                ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                : 'text-white bg-emerald-600 hover:bg-emerald-700'} 
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
            disabled={task.status === 'completed'}
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
} 