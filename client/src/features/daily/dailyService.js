import api from '../../shared/api';

export const getDaily = () => api.get('/daily').then((res) => res.data);
