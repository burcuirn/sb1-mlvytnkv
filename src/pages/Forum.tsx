import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Activity, Briefcase, UserRound, MessageSquare } from 'lucide-react';

const categories = [
  {
    id: 'personal',
    title: 'Kişisel Problemler',
    description: 'Kişisel zorluklar ve çözüm yolları hakkında tartışmalar',
    icon: UserRound,
    color: 'purple',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 'relationship',
    title: 'İlişki',
    description: 'İlişkiler, duygular ve sosyal bağlar hakkında her şey',
    icon: Heart,
    color: 'rose',
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600'
  },
  {
    id: 'family',
    title: 'Aile',
    description: 'Aile ilişkileri ve ebeveynlik üzerine tartışmalar',
    icon: Users,
    color: 'blue',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'health',
    title: 'Sağlık',
    description: 'Fiziksel ve zihinsel sağlık konuları',
    icon: Activity,
    color: 'green',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'work',
    title: 'İş',
    description: 'Kariyer, iş hayatı ve profesyonel gelişim',
    icon: Briefcase,
    color: 'amber',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600'
  }
];

export function Forum() {
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
            <span>Ana Sayfaya Dön</span>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">Sohbet Odası</h1>
            <p className="text-gray-300 mt-1">Düşüncelerinizi paylaşın, deneyimlerinizi aktarın</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/forum/${category.id}`}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-full ${category.bgColor} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon size={24} className={category.iconColor} />
                </div>
                <div className={`${category.bgColor} text-xs font-medium ${category.iconColor} px-2 py-1 rounded-full`}>
                  Yeni
                </div>
              </div>
              
              <h2 className="text-xl font-display font-medium text-gray-800 mt-4 mb-2">
                {category.title}
              </h2>
              <p className="text-gray-600">
                {category.description}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare size={14} />
                <span>Tartışmaya katıl</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}