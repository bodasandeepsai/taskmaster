import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
}

export default function TaskCard({ task, onUpdateStatus }: TaskCardProps) {
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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 mb-4 overflow-hidden">
      <div className="p-5">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
              {task.title}
            </h3>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[task.status as keyof typeof statusColors]}`}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Assignee Section */}
        {task.assignee && (
          <div className="flex items-center mb-3 bg-gray-50 rounded-lg p-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                {task.assignee.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">Assigned to</p>
              <p className="text-sm font-medium text-gray-900">{task.assignee.username}</p>
            </div>
          </div>
        )}

        {/* Timestamps Section */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Created: {formatDateTime(task.createdAt)}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Updated: {formatDateTime(task.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
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