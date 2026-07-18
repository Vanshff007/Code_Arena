import { createContext, useEffect, useState } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'codearena_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true until we've checked whether an existing token in storage is still
  // valid - ProtectedRoute waits on this so a page refresh doesn't bounce a
  // legitimately logged-in user to /login before we've had a chance to ask.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  };

  // Stateless auth - there is no backend session to invalidate, so logging
  // out is just dropping the token and clearing local state.
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // rating/wins/losses only get fetched at login - they'd otherwise go
  // stale the moment a battle changes them. Dashboard calls this on every
  // mount (e.g. returning from a battle) to pick up the latest numbers.
  const refreshUser = async () => {
    const res = await getCurrentUser();
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
