import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: string) => void;
}

export default function TaskCard({ task, onUpdateStatus }: TaskCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">{task.description}</p>
        
        <div className="space-y-2 text-xs">
          {/* Assignment Information */}
          <div className="flex flex-wrap gap-x-4 text-gray-500 mb-2">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium">Created by:</span>
              <span className="ml-1 text-gray-700">{task.createdBy?.username || "Unknown"}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Assigned to:</span>
              <span className="ml-1 text-gray-700">{task.assignee?.username || "Unassigned"}</span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap gap-x-4 text-gray-400">
            <div className="flex items-center">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Created: {formatDateTime(task.createdAt)}</span>
            </div>

            {task.updatedAt !== task.createdAt && (
              <div className="flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Updated: {formatDateTime(task.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex space-x-3">
          <button
            onClick={() => onUpdateStatus(task._id, "in-progress")}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            In Progress
          </button>
          <button
            onClick={() => onUpdateStatus(task._id, "completed")}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
} 