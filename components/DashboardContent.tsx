'use client';

import { useState, useEffect } from 'react';
import TaskCard from "@/components/TaskCard";
import AiChatBot from "@/components/AiChatBot";
import { Task } from "@/types/task";

export default function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    };
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-4 mt-4">
        {tasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>
      <AiChatBot />
    </div>
  );
} 