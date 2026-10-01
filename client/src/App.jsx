import { Routes, Route } from 'react-router-dom';
import Navbar from './shared/layout/Navbar';
import Footer from './shared/layout/Footer';
import ProtectedRoute from './features/auth/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import HomePage from './features/home/HomePage';
import NotFoundPage from './features/home/NotFoundPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProblemsPage from './features/problems/ProblemsPage';
import ProblemSolvePage from './features/problems/ProblemSolvePage';
import FindBattlePage from './features/battles/FindBattlePage';
import BattleRoomPage from './features/battles/BattleRoomPage';
import MatchHistoryPage from './features/battles/MatchHistoryPage';
import LeaderboardPage from './features/leaderboard/LeaderboardPage';
import ProfilePage from './features/profiles/ProfilePage';
import SkillDashboardPage from './features/skills/SkillDashboardPage';

const protectedRoutes = [
  ['/dashboard', DashboardPage],
  ['/problems', ProblemsPage],
  ['/practice/:id', ProblemSolvePage],
  ['/battle', FindBattlePage],
  ['/battle/:roomCode', BattleRoomPage],
  ['/leaderboard', LeaderboardPage],
  ['/history', MatchHistoryPage],
  ['/profile/:username', ProfilePage],
  ['/skills', SkillDashboardPage],
];

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {protectedRoutes.map(([path, Page]) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Page />
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
