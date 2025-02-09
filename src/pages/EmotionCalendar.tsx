import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Smile, Save, BarChart2, X } from 'lucide-react';

type Emotion = {
  date: string; // YYYY-MM-DD format
  emoji: string;
  note?: string;
};

const EMOJI_OPTIONS = [
  { emoji: '😊', label: 'Mutlu', type: 'positive' },
  { emoji: '🥰', label: 'Aşık', type: 'positive' },
  { emoji: '😌', label: 'Huzurlu', type: 'positive' },
  { emoji: '🤔', label: 'Düşünceli', type: 'neutral' },
  { emoji: '😢', label: 'Üzgün', type: 'negative' },
  { emoji: '😡', label: 'Kızgın', type: 'negative' },
  { emoji: '😴', label: 'Yorgun', type: 'neutral' },
  { emoji: '🤗', label: 'Şefkatli', type: 'positive' },
  { emoji: '😎', label: 'Havalı', type: 'positive' },
  { emoji: '🥳', label: 'Coşkulu', type: 'positive' },
  { emoji: '😤', label: 'Stresli', type: 'negative' },
  { emoji: '😇', label: 'Rahat', type: 'positive' },
] as const;

type EmotionType = 'positive' | 'negative' | 'neutral';

const getEmotionType = (emoji: string): EmotionType => {
  const emotion = EMOJI_OPTIONS.find(e => e.emoji === emoji);
  return emotion?.type || 'neutral';
};

const getEmotionLabel = (emoji: string): string => {
  const emotion = EMOJI_OPTIONS.find(e => e.emoji === emoji);
  return emotion?.label || '';
};

export function EmotionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [emotions, setEmotions] = useState<Emotion[]>(() => {
    const saved = localStorage.getItem('emotions');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [note, setNote] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    localStorage.setItem('emotions', JSON.stringify(emotions));
  }, [emotions]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getEmotionForDate = (date: Date): Emotion | undefined => {
    return emotions.find(e => e.date === formatDate(date));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const emotion = getEmotionForDate(date);
    if (emotion) {
      setSelectedEmoji(emotion.emoji);
      setNote(emotion.note || '');
    } else {
      setSelectedEmoji('');
      setNote('');
    }
  };

  const handleSaveEmotion = () => {
    if (!selectedDate || !selectedEmoji) return;

    const dateStr = formatDate(selectedDate);
    const newEmotions = emotions.filter(e => e.date !== dateStr);
    newEmotions.push({
      date: dateStr,
      emoji: selectedEmoji,
      note: note.trim() || undefined
    });

    setEmotions(newEmotions);
    setSelectedDate(null);
    setSelectedEmoji('');
    setNote('');
  };

  const getEmotionBackground = (emotion: Emotion | undefined): string => {
    if (!emotion) return '';
    
    const type = getEmotionType(emotion.emoji);
    switch (type) {
      case 'positive':
        return 'bg-green-50';
      case 'negative':
        return 'bg-red-50';
      case 'neutral':
        return 'bg-gray-50';
      default:
        return '';
    }
  };

  const calculateStats = () => {
    const stats = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    emotions.forEach(emotion => {
      const type = getEmotionType(emotion.emoji);
      stats[type]++;
    });

    return stats;
  };

  const calculateDetailedStats = () => {
    const emojiStats = EMOJI_OPTIONS.map(option => ({
      ...option,
      count: emotions.filter(e => e.emoji === option.emoji).length
    }));

    return {
      byType: calculateStats(),
      byEmoji: emojiStats
    };
  };

  const renderStats = () => {
    const stats = calculateDetailedStats();
    const maxTypeValue = Math.max(...Object.values(stats.byType));
    const maxEmojiValue = Math.max(...stats.byEmoji.map(e => e.count));
    const barHeight = 200;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 size={24} className="text-gray-700" />
              <h2 className="text-xl font-display font-medium text-gray-800">
                Duygu İstatistikleri
              </h2>
            </div>
            <button
              onClick={() => setShowStats(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Emotion Types Chart */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4"></h3>
              <div className="flex items-end justify-around h-[200px] mb-4">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const percentage = maxTypeValue > 0 ? (count / maxTypeValue) * barHeight : 0;
                  const getBarColor = () => {
                    switch (type) {
                      case 'positive': return 'bg-green-400';
                      case 'negative': return 'bg-red-400';
                      case 'neutral': return 'bg-gray-400';
                      default: return 'bg-gray-400';
                    }
                  };

                  const getLabel = () => {
                    switch (type) {
                      case 'positive': return 'Olumlu';
                      case 'negative': return 'Olumsuz';
                      case 'neutral': return 'Nötr';
                      default: return type;
                    }
                  };

                  return (
                    <div key={type} className="flex flex-col items-center gap-2">
                      <div className="text-sm font-medium text-gray-600">
                        {count}
                      </div>
                      <div 
                        className={`w-16 ${getBarColor()} rounded-t-lg transition-all duration-500`}
                        style={{ height: `${percentage}px` }}
                      />
                      <div className="text-sm font-medium text-gray-700">
                        {getLabel()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specific Emotions Chart */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4"></h3>
              <div className="space-y-3">
                {stats.byEmoji
                  .filter(emoji => emoji.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map(({ emoji, label, type, count }) => {
                    const percentage = maxEmojiValue > 0 ? (count / maxEmojiValue) * 100 : 0;
                    const getBarColor = () => {
                      switch (type) {
                        case 'positive': return 'bg-green-400';
                        case 'negative': return 'bg-red-400';
                        case 'neutral': return 'bg-gray-400';
                      }
                    };

                    return (
                      <div key={emoji} className="flex items-center gap-3">
                        <div className="w-8 text-xl">{emoji}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{label}</span>
                            <span className="text-gray-500">{count}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getBarColor()} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-6">
            Toplam Kayıt: {emotions.length} gün
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const monthYear = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`${monthYear}-empty-${i}`} 
          className="h-24" 
        />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const emotion = getEmotionForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const emotionBackground = getEmotionBackground(emotion);

      days.push(
        <button
          key={`${monthYear}-day-${day}`}
          onClick={() => handleDateClick(date)}
          className={`h-24 p-2 border border-gray-200 relative transition-all duration-300 ${
            isToday ? 'bg-blue-50' : emotionBackground || 'hover:bg-gray-50'
          } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
          <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
            {day}
          </span>
          {emotion && (
            <div className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none group">
              <div className="relative">
                <span>{emotion.emoji}</span>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                  {getEmotionLabel(emotion.emoji)}
                </div>
              </div>
            </div>
          )}
        </button>
      );
    }

    return days;
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
          <Link to="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
            <ArrowLeft size={20} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">Duygu Takvimi</h1>
            <p className="text-gray-300 mt-1">Her gün için duygularınızı kaydedin</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={24} className="text-gray-700" />
                  <h2 className="text-xl font-display font-medium text-gray-800">
                    {currentDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowStats(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300 flex items-center gap-2"
                  >
                    <BarChart2 size={20} />
                    <span className="text-sm">İstatistikler</span>
                  </button>
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px mb-2">
                {['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px">
                {renderCalendar()}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedDate ? (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Smile size={20} className="text-gray-700" />
                  <h2 className="text-xl font-display font-medium text-gray-800">
                    {selectedDate.toLocaleDateString('tr-TR', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedEmoji 
                        ? `Seçilen Duygu: ${getEmotionLabel(selectedEmoji)}`
                        : 'Duygu Seçin'
                      }
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJI_OPTIONS.map(({ emoji, label, type }) => (
                        <div key={`emoji-${emoji}`} className="relative group">
                          <button
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`w-full aspect-square text-2xl flex items-center justify-center rounded-lg border transition-all duration-300 ${
                              selectedEmoji === emoji
                                ? type === 'positive'
                                  ? 'border-green-500 bg-green-50 scale-110'
                                  : type === 'negative'
                                  ? 'border-red-500 bg-red-50 scale-110'
                                  : 'border-gray-500 bg-gray-50 scale-110'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {emoji}
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Not (İsteğe bağlı)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 resize-none"
                      rows={3}
                      placeholder="Bugün hakkında not ekleyin..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEmotion}
                      disabled={!selectedEmoji}
                      className="flex-1 py-3 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedEmoji('');
                        setNote('');
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="text-center py-8">
                  <Smile size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Duygunuzu kaydetmek için takvimden bir gün seçin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showStats && renderStats()}
    </div>
  );
}