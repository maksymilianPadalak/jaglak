'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DbPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-2 border-black mb-4 p-3 bg-white">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 text-black">
            Database Tasks
          </h1>
          <p className="text-sm font-bold text-black uppercase">
            Add and manage tasks
          </p>
        </div>

        {/* Add Task Form */}
        <div className="border-2 border-black bg-white p-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="title" className="block text-sm font-black uppercase text-black mb-2">
                Task Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full border-2 border-black px-4 py-2 font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="border-2 border-black bg-black text-white p-3">
                <p className="text-sm font-bold uppercase">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="border-2 border-black px-6 py-2 font-black text-sm uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white hover:bg-white hover:text-black"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="border-2 border-black bg-white">
          <div className="p-4 border-b-2 border-black">
            <h2 className="text-xl font-black uppercase text-black">
              Tasks ({tasks.length})
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-bold uppercase text-black opacity-50">
                  No tasks yet. Add one above!
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="border-2 border-black bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-black uppercase mb-1 ${
                        task.completed ? 'line-through opacity-50' : 'text-black'
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`border-2 border-black px-2 py-1 text-xs font-black uppercase ${
                            task.completed
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          }`}
                        >
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        <span className="text-xs font-bold text-black opacity-60">
                          {formatDate(task.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

