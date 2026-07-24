import api from './api';

export const getSkillProfile = () => api.get('/skills/me').then((res) => res.data);

export const getXP = () => api.get('/skills/xp').then((res) => res.data);

export const getRecommendations = () => api.get('/skills/recommendations').then((res) => res.data);

export const getFeedback = () => api.get('/skills/feedback').then((res) => res.data);
