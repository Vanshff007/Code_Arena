import api from './api';

// Thin wrappers around the auth endpoints built in Step 3. Kept separate
// from api.js so AuthContext (Step 5) never has to know REST paths directly.
export const registerUser = (payload) => api.post('/auth/register', payload).then((res) => res.data);

export const loginUser = (payload) => api.post('/auth/login', payload).then((res) => res.data);

export const getCurrentUser = () => api.get('/auth/me').then((res) => res.data);
