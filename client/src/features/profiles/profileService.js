import api from '../../shared/api';

export const getProfileByUsername = (username) =>
  api.get(`/users/${encodeURIComponent(username)}/profile`).then((res) => res.data);
