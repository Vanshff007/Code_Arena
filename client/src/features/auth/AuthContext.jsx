import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import { loginUser, registerUser, getCurrentUser, logoutUser, logoutEverywhere } from './authService';
import { onUnauthorized } from '../../shared/api';

// The session is an httpOnly cookie the page cannot read, so "am I logged
// in?" is answered by asking the server (/auth/me) once at startup.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true until /auth/me answers - ProtectedRoute waits on this so a page
  // refresh doesn't bounce a logged-in user to /login.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Any 401 (expired or revoked session) logs the user out locally.
  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.data.user);
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    setUser(res.data.user);
  };

  const logout = useCallback(async () => {
    await logoutUser().catch(() => {});
    setUser(null);
  }, []);

  const logoutAll = useCallback(async () => {
    await logoutEverywhere();
    setUser(null);
  }, []);

  // rating/wins/losses only get fetched at login - they'd otherwise go
  // stale the moment a battle changes them. Dashboard calls this on every
  // mount (e.g. returning from a battle) to pick up the latest numbers.
  const refreshUser = useCallback(async () => {
    const res = await getCurrentUser();
    setUser(res.data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, logoutAll, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
