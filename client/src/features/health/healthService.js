import api from '../../shared/api';

// Used by the footer to show the server version next to the client's.
export const getHealth = () => api.get('/health').then((res) => res.data);
