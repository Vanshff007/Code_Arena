import axios from 'axios';

// Single configured Axios instance - every service file in this app
// (authService, problemService, battleService, ...) imports this instead of
// calling axios directly, so the base URL and token handling are defined
// exactly once.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attaches the JWT (if the user is logged in) to every outgoing request.
// AuthContext (Step 5) is responsible for writing the token here after
// register/login.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('codearena_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever responds 401 (expired/invalid token), clear the stale
// token immediately so the app doesn't keep resending a dead credential.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('codearena_token');
    }
    return Promise.reject(error);
  }
);

export default api;
