import api from './api';

// "Run Code" - one ad-hoc input, no verdict.
export const runCode = (payload) => api.post('/execute/run', payload).then((res) => res.data);

// "Submit" - judged against a problem's full test suite.
export const submitCode = (payload) => api.post('/execute/submit', payload).then((res) => res.data);
