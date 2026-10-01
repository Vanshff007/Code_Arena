import api from '../../shared/api';

// Thin wrappers around the auth endpoints, so AuthContext never has to
// know REST paths directly.
export const registerUser = (payload) => api.post('/auth/register', payload).then((res) => res.data);

export const loginUser = (payload) => api.post('/auth/login', payload).then((res) => res.data);

export const getCurrentUser = () => api.get('/auth/me').then((res) => res.data);
