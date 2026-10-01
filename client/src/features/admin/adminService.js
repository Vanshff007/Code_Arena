import api from '../../shared/api';

export const listProblems = () => api.get('/problems').then((res) => res.data);

// Everything needed to edit a problem; hidden test cases come back as a
// count only.
export const getProblemForEdit = (id) => api.get(`/problems/${id}/admin`).then((res) => res.data);

// Runs a reference solution against a draft without saving.
export const checkProblem = (payload) => api.post('/problems/check', payload).then((res) => res.data);

export const createProblem = (payload) => api.post('/problems', payload).then((res) => res.data);

export const updateProblem = (id, payload) => api.put(`/problems/${id}`, payload).then((res) => res.data);

export const deleteProblem = (id) => api.delete(`/problems/${id}`).then((res) => res.data);
