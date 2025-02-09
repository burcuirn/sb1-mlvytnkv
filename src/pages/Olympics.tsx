import React from 'react';
import { Trophy, ArrowLeft, Medal, Users, Target, Calendar, Building, ChevronRight as ChessKnight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Olympics() {
  const navigate = useNavigate();
  
  const competitions = [
    {
      title: "İmparatorluk Yarışı",
      description: "Roma İmparatorluğu'nun en değerli mülklerini topla ve imparator ol!",
      icon: Building,
      startDate: "Hemen Başla",
      participants: 2,
      prize: "2000 Sezar Puanı",
      onClick: () => navigate('/empire-race')
    },
    {
      title: "Roma Satrancı",
      description: "Antik Roma'nın stratejik satranç oyununda rakiplerini alt et",
      icon: ChessKnight,
      startDate: "Hemen Başla",
      participants: 2,
      prize: "1500 Sezar Puanı",
      onClick: () => navigate('/roman-chess')
    },
    {
      title: "Liderlik Yarışması",
      description: "Stratejik düşünme ve liderlik yeteneklerinizi test edin",
      icon: Trophy,
      startDate: "15 Mart 2024",
      participants: 128,
      prize: "1000 Sezar Puanı"
    },
    {
      title: "Bilgelik Turnuvası",
      description: "Antik Roma bilgeliği üzerine bilgi yarışması",
      icon: Medal,
      startDate: "1 Nisan 2024",
      participants: 256,
      prize: "750 Sezar Puanı"
    },
    {
      title: "Strateji Maratonu",
      description: "48 saatlik strateji geliştirme yarışması",
      icon: Target,
      startDate: "20 Nisan 2024",
      participants: 64,
      prize: "1500 Sezar Puanı"
    }
  ];

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
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">Sezar Olimpiyatları</h1>
            <p className="text-gray-300 mt-1">Antik Roma'nın ruhuyla modern yeteneklerin yarışması</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition, index) => (
            <div 
              key={index} 
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300"
              onClick={competition.onClick}
              style={{ cursor: competition.onClick ? 'pointer' : 'default' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e9ecef] to-[#dee2e6] p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <competition.icon size={24} className="text-gray-700" />
                  </div>
                </div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {competition.prize}
                </span>
              </div>
              
              <h2 className="text-xl font-display font-medium text-gray-800 mb-2">
                {competition.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {competition.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>Başlangıç: {competition.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  <span>{competition.participants} Katılımcı</span>
                </div>
              </div>
              
              <button 
                className="w-full mt-6 py-3 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 font-medium"
                onClick={competition.onClick}
              >
                {competition.onClick ? 'Hemen Oyna' : 'Yakında'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}