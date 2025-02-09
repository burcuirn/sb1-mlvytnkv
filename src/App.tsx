import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Forum } from './pages/Forum';
import { ForumCategory } from './pages/ForumCategory';
import { ForumTopic } from './pages/ForumTopic';
import { Olympics } from './pages/Olympics';
import { EmpireRace } from './pages/EmpireRace';
import { RomanChess } from './pages/RomanChess';
import { EmotionCalendar } from './pages/EmotionCalendar';
import { Goals } from './pages/Goals';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/forum/:categoryId" element={<ForumCategory />} />
      <Route path="/forum/:categoryId/:topicId" element={<ForumTopic />} />
      <Route path="/olympics" element={<Olympics />} />
      <Route path="/empire-race" element={<EmpireRace />} />
      <Route path="/roman-chess" element={<RomanChess />} />
      <Route path="/emotion-calendar" element={<EmotionCalendar />} />
      <Route path="/goals" element={<Goals />} />
    </Routes>
  );
}

export default App;