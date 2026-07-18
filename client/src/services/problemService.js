import api from './api';

export const getProblems = (params = {}) => api.get('/problems', { params }).then((res) => res.data);

export const getProblemById = (id) => api.get(`/problems/${id}`).then((res) => res.data);
