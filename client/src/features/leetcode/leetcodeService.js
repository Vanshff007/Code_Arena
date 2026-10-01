import api from '../../shared/api';

export const connectLeetCode = (username) =>
  api.post('/leetcode/connect', { username }).then((res) => res.data);

export const disconnectLeetCode = () => api.post('/leetcode/disconnect').then((res) => res.data);

export const syncLeetCode = () => api.post('/leetcode/sync').then((res) => res.data);

export const getLeetCodeRecommendations = () => api.get('/leetcode/recommendations').then((res) => res.data);
