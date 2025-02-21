"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Task } from "@/types/task";
import { io } from "socket.io-client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import TaskCard from "@/components/TaskCard";
import AiChatBot from "@/components/AiChatBot";

interface User {
  _id: string;
  username: string;
  email: string;
}

// Create socket connection with options
const socket = io("http://localhost:4000", {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: false // Don't connect automatically
});

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignee: "" });
  const [users, setUsers] = useState<User[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'in-progress', 'completed'

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    // If we have a user, fetch tasks
    if (user) {
      const fetchTasks = async () => {
        try {
          console.log("Fetching tasks...");
          const res = await fetch("/api/tasks", {
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache"
            }
          });
          
          if (!res.ok) {
            throw new Error("Failed to fetch tasks");
          }
          
          const data = await res.json();
          console.log("Fetched tasks:", data);
          setTasks(data);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchTasks();
    }
  }, [user, isLoading, router]);

  // Socket connection effect
  useEffect(() => {
    if (user) {
      socket.connect();

      socket.on("connect", () => {
        console.log("Socket connected");
        setSocketConnected(true);
      });

      socket.on("taskCreated", (newTask: Task) => {
        setTasks(prevTasks => [...prevTasks, newTask]);
      });

      socket.on("taskUpdated", (updatedTask: Task) => {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
      });

      return () => {
        socket.off("connect");
        socket.off("taskCreated");
        socket.off("taskUpdated");
        socket.disconnect();
      };
    }
  }, [user]);

  // Fetch users when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      fetchUsers();
    }
  }, [isCreateModalOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle task creation
  async function handleCreateTask() {
    try {
      if (!newTask.title || !newTask.description || !newTask.assignee) {
        alert("Please fill in all fields");
        return;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create task");
      }

      const createdTask = await res.json();
      
      // Update local state
      setTasks(prevTasks => [...prevTasks, createdTask]);
      
      // Emit socket event
      if (socketConnected) {
        socket.emit("createTask", createdTask);
      }
      
      // Clear form
      setNewTask({ title: "", description: "", assignee: "" });
      
      alert("Task created successfully!");
    } catch (error: any) {
      console.error("Error creating task:", error);
      alert(error.message || "Failed to create task");
    }
  }

  // Handle task update
  async function handleUpdateTask(taskId: string, status: string) {
    try {
      console.log(`Updating task ${taskId} to status: ${status}`);
      
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const updatedTask = await res.json();
      console.log("Task updated successfully:", updatedTask);
      
      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      
      // Emit socket event
      if (socketConnected) {
        socket.emit("updateTask", updatedTask);
      }
    } catch (error: any) {
      console.error("Error updating task:", error);
      alert(error.message || "Failed to update task");
    }
  }

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="flex gap-8">
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>

          {/* Task Filters */}
          <div className="mb-8">
            <nav className="flex space-x-4" aria-label="Tabs">
              {['all', 'pending', 'in-progress', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  } px-3 py-2 font-medium text-sm rounded-md`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdateStatus={handleUpdateTask}
              />
            ))}
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <div className="hidden lg:block w-96">
          <AiChatBot />
        </div>
      </div>

      {/* Updated Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCreateTask();
                  setIsCreateModalOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
