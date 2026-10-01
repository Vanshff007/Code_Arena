import { Routes, Route, useParams } from 'react-router-dom';
import Navbar from './shared/layout/Navbar';
import Footer from './shared/layout/Footer';
import ProtectedRoute from './features/auth/ProtectedRoute';
import AdminRoute from './features/auth/AdminRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import SettingsPage from './features/auth/SettingsPage';
import HomePage from './features/home/HomePage';
import NotFoundPage from './features/home/NotFoundPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProblemsPage from './features/problems/ProblemsPage';
import ProblemSolvePage from './features/problems/ProblemSolvePage';
import FindBattlePage from './features/battles/FindBattlePage';
import BattleRoomPage from './features/battles/BattleRoomPage';
import MatchHistoryPage from './features/battles/MatchHistoryPage';
import ReplayPage from './features/battles/ReplayPage';
import WatchListPage from './features/battles/WatchListPage';
import SpectatePage from './features/battles/SpectatePage';
import LeaderboardPage from './features/leaderboard/LeaderboardPage';
import ProfilePage from './features/profiles/ProfilePage';
import SkillDashboardPage from './features/skills/SkillDashboardPage';
import FriendsPage from './features/friends/FriendsPage';
import FriendNotifications from './features/friends/FriendNotifications';
import AdminProblemsPage from './features/admin/AdminProblemsPage';
import AdminProblemEditor from './features/admin/AdminProblemEditor';
import { useAuth } from './features/auth/useAuth';

// A new room code (e.g. after a rematch) remounts the battle page, so no
// state from the previous battle carries over.
function BattleRoomRoute() {
  const { roomCode } = useParams();
  return <BattleRoomPage key={roomCode} />;
}

const protectedRoutes = [
  ['/dashboard', DashboardPage],
  ['/problems', ProblemsPage],
  ['/practice/:id', ProblemSolvePage],
  ['/battle', FindBattlePage],
  ['/battle/:roomCode', BattleRoomRoute],
  ['/replay/:matchId', ReplayPage],
  ['/watch', WatchListPage],
  ['/watch/:roomCode', SpectatePage],
  ['/leaderboard', LeaderboardPage],
  ['/history', MatchHistoryPage],
  ['/profile/:username', ProfilePage],
  ['/skills', SkillDashboardPage],
  ['/friends', FriendsPage],
  ['/settings', SettingsPage],
];

const adminRoutes = [
  ['/admin/problems', AdminProblemsPage],
  ['/admin/problems/new', AdminProblemEditor],
  ['/admin/problems/:id/edit', AdminProblemEditor],
];

function App() {
  const { user } = useAuth();
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
          {adminRoutes.map(([path, Page]) => (
            <Route
              key={path}
              path={path}
              element={
                <AdminRoute>
                  <Page />
                </AdminRoute>
              }
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
      {user && <FriendNotifications />}
    </div>
  );
}

export default App;
