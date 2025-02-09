import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage as ChatMessageType, ChatResponse, Thread, User } from '../types';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { BotAvatar } from '../components/BotAvatar';
import { Login } from '../components/Login';
import { MessageSquare, Trophy, Calendar, Target, Plus, Pencil, Trash2, Check, X, LogOut } from 'lucide-react';

const API_KEY = 'SVQWSN9-1H24CPH-GD7ZRY0-02PKV1H';
const API_URL = 'https://skchuzee.rcld.dev/api/v1/workspace/chatbot/chat';

export function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [threads, setThreads] = useState<Thread[]>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return [{
      id: 'default',
      title: 'Yeni Sohbet',
      createdAt: new Date().toISOString(), // Store as ISO string
      messages: []
    }];

    const savedThreads = localStorage.getItem(`threads_${user?.username}`);
    if (savedThreads) {
      const parsedThreads = JSON.parse(savedThreads);
      return parsedThreads.map((thread: any) => ({
        ...thread,
        createdAt: thread.createdAt ? new Date(thread.createdAt).toISOString() : new Date().toISOString(), // Ensure valid date
        messages: thread.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || new Date()).toISOString() // Ensure valid date
        }))
      }));
    }

    return [{
      id: 'default',
      title: 'Yeni Sohbet',
      createdAt: new Date().toISOString(),
      messages: []
    }];
  });

  const [currentThreadId, setCurrentThreadId] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return 'default';
    const user = JSON.parse(savedUser);
    const savedThreadId = localStorage.getItem(`currentThread_${user.username}`);
    return savedThreadId || 'default';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentThread = threads.find(t => t.id === currentThreadId) || threads[0];

  useEffect(() => {
    if (user) {
      localStorage.setItem(`threads_${user.username}`, JSON.stringify(threads));
    }
  }, [threads, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`currentThread_${user.username}`, currentThreadId);
    }
  }, [currentThreadId, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentThread.messages]);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    
    const savedThreads = localStorage.getItem(`threads_${loggedInUser.username}`);
    if (savedThreads) {
      const parsedThreads = JSON.parse(savedThreads);
      setThreads(parsedThreads.map((thread: any) => ({
        ...thread,
        createdAt: thread.createdAt ? new Date(thread.createdAt).toISOString() : new Date().toISOString(),
        messages: thread.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || new Date()).toISOString()
        }))
      })));
      const savedThreadId = localStorage.getItem(`currentThread_${loggedInUser.username}`);
      if (savedThreadId) {
        setCurrentThreadId(savedThreadId);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setThreads([{
      id: 'default',
      title: 'Yeni Sohbet',
      createdAt: new Date().toISOString(),
      messages: []
    }]);
    setCurrentThreadId('default');
    navigate('/');
  };

  const createNewThread = () => {
    const newThread: Thread = {
      id: Date.now().toString(),
      title: 'Yeni Sohbet',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setThreads(prev => [...prev, newThread]);
    setCurrentThreadId(newThread.id);
  };

  const startEditingThread = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const saveThreadTitle = () => {
    if (editingThreadId && editingTitle.trim()) {
      setThreads(prev => prev.map(thread =>
        thread.id === editingThreadId
          ? { ...thread, title: editingTitle.trim() }
          : thread
      ));
      setEditingThreadId(null);
    }
  };

  const deleteThread = (threadId: string) => {
    const updatedThreads = threads.filter(thread => thread.id !== threadId);
    setThreads(updatedThreads);
    if (currentThreadId === threadId) {
      setCurrentThreadId(updatedThreads[0].id);
    }
  };

  const generateThreadTitle = (message: string): string => {
    let title = message.split(/[.!?]/)[0].trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    return title;
  };

  const handleEditMessage = (id: string, newMessage: string) => {
    const messageIndex = currentThread.messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) return;

    const updatedMessages = [...currentThread.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      message: newMessage,
    };

    setThreads(prev => prev.map(thread =>
      thread.id === currentThreadId
        ? { ...thread, messages: updatedMessages }
        : thread
    ));

    sendMessage(newMessage);
  };

  const sendMessage = async (message: string) => {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        type: 'bot',
        message: 'Please configure a valid API key to use the chat functionality.',
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...currentThread.messages, errorMessage];
      setThreads(prev => prev.map(thread =>
        thread.id === currentThreadId
          ? { ...thread, messages: updatedMessages }
          : thread
      ));
      return;
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentThread.messages, userMessage];
    setThreads(prev => prev.map(thread =>
      thread.id === currentThreadId
        ? { ...thread, messages: updatedMessages }
        : thread
    ));

    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          message,
          mode: 'chat',
          sessionId: currentThreadId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403 
            ? 'Invalid API key. Please check your configuration.' 
            : `API request failed with status ${response.status}`
        );
      }

      const data: ChatResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: ChatMessageType = {
        id: data.id,
        type: 'bot',
        message: data.textResponse,
        timestamp: new Date().toISOString(),
      };

      setThreads(prev => prev.map(thread => {
        if (thread.id === currentThreadId) {
          const updatedThread = {
            ...thread,
            messages: [...updatedMessages, botMessage]
          };
          
          if (updatedThread.messages.filter(m => m.type === 'bot').length === 1) {
            updatedThread.title = generateThreadTitle(botMessage.message);
          }
          
          return updatedThread;
        }
        return thread;
      }));
    } catch (error) {
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        type: 'bot',
        message: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setThreads(prev => prev.map(thread =>
        thread.id === currentThreadId
          ? { ...thread, messages: [...updatedMessages, errorMessage] }
          : thread
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const sideButtons = [
    { icon: MessageSquare, label: 'Sohbet Odası', path: '/forum' },
    { icon: Trophy, label: 'Sezar Olimpiyatları', path: '/olympics' },
    { icon: Calendar, label: 'Duygu Takvimi', path: '/emotion-calendar' },
    { icon: Target, label: 'Hedefler', path: '/goals' }
  ];

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

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
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e9ecef] to-[#dee2e6] p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <BotAvatar size={48} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-display text-white tracking-wide font-medium">Sezar</h1>
            <p className="text-sm text-gray-300 font-light">Antik çağların bilgeliği, modern zamanın rehberi</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-gray-300">
              <span className="text-sm">Hoş geldin,</span>
              <span className="font-medium ml-1">{user.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="fixed left-6 top-32 bottom-6 w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 space-y-3 overflow-y-auto">
          <button
            onClick={createNewThread}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300"
          >
            <Plus size={18} />
            <span>Yeni Sohbet</span>
          </button>
          <div className="space-y-2">
            {threads.map(thread => (
              <div
                key={thread.id}
                className={`relative group rounded-xl transition-all duration-300 ${
                  thread.id === currentThreadId
                    ? 'bg-gray-100 shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                {editingThreadId === thread.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-gray-400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveThreadTitle();
                        if (e.key === 'Escape') setEditingThreadId(null);
                      }}
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={saveThreadTitle}
                        className="p-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={() => setEditingThreadId(null)}
                        className="p-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentThreadId(thread.id)}
                    className="w-full text-left px-4 py-3"
                  >
                    <div className="font-medium text-gray-700">{thread.title}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                )}
                {editingThreadId !== thread.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingThread(thread);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (threads.length > 1) {
                          deleteThread(thread.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                      disabled={threads.length <= 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="fixed right-6 top-1/2 -translate-y-1/2 space-y-4 z-10">
          {sideButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => navigate(button.path)}
              className="group flex items-center"
            >
              <div className="bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/50 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <button.icon 
                  size={24} 
                  className="text-gray-600 group-hover:text-[#212529] transition-colors duration-300" 
                />
              </div>
              <div className="pl-3 pr-4 py-2 bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/50 rounded-xl ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {button.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        <main className="flex-1 max-w-3xl mx-auto p-6 ml-80 flex flex-col gap-6">
          <div className="flex-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 space-y-4 min-h-[500px] max-h-[600px] overflow-y-auto">
            {currentThread.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                <div className="text-2xl font-display font-light text-center leading-relaxed">
                  "Bilgelik, geçmişin ışığında geleceği aydınlatır."
                </div>
                <div className="w-16 h-0.5 bg-gray-200" />
                <div className="text-sm text-gray-400">
                  - Sezar
                </div>
              </div>
            ) : (
              <>
                {currentThread.messages.map(message => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    onEdit={handleEditMessage}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="sticky bottom-0">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4">
              <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}