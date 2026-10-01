import api from '../../shared/api';

export const getLeaderboard = () => api.get('/leaderboard').then((res) => res.data);

export const getSeasons = () => api.get('/leaderboard/seasons').then((res) => res.data);

export const getSeasonLeaderboard = (season) => api.get(`/leaderboard/seasons/${season}`).then((res) => res.data);
