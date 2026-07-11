import api from './api';

// Used by the Home page to prove the frontend can actually reach the
// backend (CORS, base URL, and network path all working together) before
// any real feature depends on it.
export const getHealth = () => api.get('/health').then((res) => res.data);
