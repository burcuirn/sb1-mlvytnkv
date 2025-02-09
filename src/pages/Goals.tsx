import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Check, Trash2, Target, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
  createdAt: string;
}

export function Goals() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      deadline: newDeadline || undefined,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [task, ...prev]);
    setNewTask('');
    setNewDeadline('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Süresi geçti';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün kaldı`;
    if (hours > 0) return `${hours} saat kaldı`;
    return 'Son gün';
  };

  const filteredTasks = tasks.filter(task => showCompleted || !task.completed);
  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583425921686-c5daf5f49e22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-[0.03] bg-fixed"
        style={{ 
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-5deg) scale(1.1)',
          filter: 'contrast(120%) brightness(150%)'
        }}
      />
      
      <header className="relative bg-gradient-to-r from-[#212529] to-[#343a40] shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
            <ArrowLeft size={20} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">Hedefler</h1>
            <p className="text-gray-300 mt-1">Hedeflerinizi planlayın ve takip edin</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Add New Task */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <form onSubmit={addTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Hedef
                  </label>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Hedef ekleyin..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Son Tarih (İsteğe bağlı)
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newTask.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Hedef Ekle
                </button>
              </form>
            </div>

            {/* Tasks List */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-gray-700" />
                  <h2 className="text-xl font-display font-medium text-gray-800">
                    Hedefler
                  </h2>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-gray-600">Tamamlananları göster</span>
                </label>
              </div>

              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Henüz hedef eklenmemiş
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        task.completed
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {task.completed && <Check size={14} />}
                      </button>
                      
                      <div className="flex-1">
                        <p className={`font-medium ${
                          task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}>
                          {task.title}
                        </p>
                        {task.deadline && (
                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-500">
                              {getTimeRemaining(task.deadline)}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors duration-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-gray-700" />
                <h2 className="text-xl font-display font-medium text-gray-800">
                  İlerleme
                </h2>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-700">
                    {completedCount}/{totalCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    hedef tamamlandı
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="text-xs font-semibold text-gray-600">
                      {Math.round(progress)}%
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#212529] to-[#343a40] transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            {tasks.some(task => task.deadline && !task.completed) && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-gray-700" />
                  <h2 className="text-xl font-display font-medium text-gray-800">
                    Yaklaşan Son Tarihler
                  </h2>
                </div>

                <div className="space-y-3">
                  {tasks
                    .filter(task => task.deadline && !task.completed)
                    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                    .map(task => (
                      <div
                        key={`deadline-${task.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        <Calendar size={16} className="text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTimeRemaining(task.deadline!)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}