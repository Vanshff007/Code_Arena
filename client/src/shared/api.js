import axios from 'axios';

// Single configured Axios instance - every feature service imports this
// instead of calling axios directly, so the base URL and credentials
// handling are defined exactly once.
//
// The session lives in an httpOnly cookie set by the server; scripts on the
// page can't read it. withCredentials makes the browser send it (the API is
// on the same site, a different port in development).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Listeners for "the session is gone" (a 401 from any request), so the auth
// state can drop the user without every caller handling it.
const unauthorizedListeners = new Set();

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) unauthorizedListeners.forEach((fn) => fn());
    return Promise.reject(error);
  }
);

export default api;
