import api from '../../shared/api';

export const getMyMatches = () => api.get('/matches/me').then((res) => res.data);
