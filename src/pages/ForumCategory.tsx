import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Activity, Briefcase, MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { ForumTopic } from '../types';
import { loadForumData, saveForumData } from '../utils/forum';

const categories = {
  relationship: {
    title: 'İlişki',
    description: 'İlişkiler, duygular ve sosyal bağlar hakkında her şey',
    icon: Heart,
    color: 'rose'
  },
  family: {
    title: 'Aile',
    description: 'Aile ilişkileri ve ebeveynlik üzerine tartışmalar',
    icon: Users,
    color: 'blue'
  },
  health: {
    title: 'Sağlık',
    description: 'Fiziksel ve zihinsel sağlık konuları',
    icon: Activity,
    color: 'green'
  },
  work: {
    title: 'İş',
    description: 'Kariyer, iş hayatı ve profesyonel gelişim',
    icon: Briefcase,
    color: 'amber'
  }
};

export function ForumCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories[categoryId as keyof typeof categories];
  
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    const forumData = loadForumData();
    setTopics(forumData.topics.filter(topic => topic.categoryId === categoryId));
  }, [categoryId]);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const topic: ForumTopic = {
      id: Date.now().toString(),
      categoryId,
      title: newTopic,
      content: '',
      author: 'Kullanıcı',
      createdAt: new Date(),
      likes: 0,
      comments: []
    };

    const forumData = loadForumData();
    const updatedData = {
      topics: [...forumData.topics, topic]
    };
    saveForumData(updatedData);
    
    setTopics(prev => [topic, ...prev]);
    setNewTopic('');
  };

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
          <Link to="/forum" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
            <ArrowLeft size={20} />
            <span>Kategorilere Dön</span>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">{category.title}</h1>
            <p className="text-gray-300 mt-1">{category.description}</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-6">
          <form onSubmit={handleCreateTopic} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Yeni konu aç..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
            />
          </form>

          <div className="space-y-4">
            {topics.map(topic => (
              <Link
                key={topic.id}
                to={`/forum/${categoryId}/${topic.id}`}
                className="block bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300"
              >
                <h2 className="text-xl font-display font-medium text-gray-800 mb-4">
                  {topic.title}
                </h2>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{topic.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp size={16} />
                    <span>{topic.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>{topic.comments.length}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}