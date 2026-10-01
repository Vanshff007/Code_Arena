import api from '../../shared/api';

export const getProblems = (params = {}) => api.get('/problems', { params }).then((res) => res.data);

export const getProblemById = (id) => api.get(`/problems/${id}`).then((res) => res.data);

// Opening the editorial is recorded by the server; later accepted
// solutions to this problem earn fewer points.
export const getEditorial = (id) => api.get(`/problems/${id}/editorial`).then((res) => res.data);
