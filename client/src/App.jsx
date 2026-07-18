import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemSolve from './pages/ProblemSolve';
import FindBattle from './pages/FindBattle';
import BattleRoom from './pages/BattleRoom';
import Leaderboard from './pages/Leaderboard';
import MatchHistory from './pages/MatchHistory';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:id"
          element={
            <ProtectedRoute>
              <ProblemSolve />
            </ProtectedRoute>
          }
        />
        <Route
          path="/battle"
          element={
            <ProtectedRoute>
              <FindBattle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/battle/:roomCode"
          element={
            <ProtectedRoute>
              <BattleRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <MatchHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
