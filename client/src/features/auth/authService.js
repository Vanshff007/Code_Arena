import api from '../../shared/api';

// Thin wrappers around the auth endpoints, so AuthContext never has to
// know REST paths directly.
export const registerUser = (payload) => api.post('/auth/register', payload).then((res) => res.data);

export const loginUser = (payload) => api.post('/auth/login', payload).then((res) => res.data);

export const getCurrentUser = () => api.get('/auth/me').then((res) => res.data);

export const logoutUser = () => api.post('/auth/logout').then((res) => res.data);

export const logoutEverywhere = () => api.post('/auth/logout-all').then((res) => res.data);

export const changePassword = (payload) => api.put('/auth/password', payload).then((res) => res.data);
