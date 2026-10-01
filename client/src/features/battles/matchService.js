import api from '../../shared/api';

export const getMyMatches = () => api.get('/matches/me').then((res) => res.data);

export const getLiveBattles = () => api.get('/matches/live').then((res) => res.data);

export const getReplay = (matchId) => api.get(`/matches/${matchId}/replay`).then((res) => res.data);
