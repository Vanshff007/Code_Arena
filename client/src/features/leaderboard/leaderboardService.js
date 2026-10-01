import api from '../../shared/api';

export const getLeaderboard = () => api.get('/leaderboard').then((res) => res.data);
