import api from './api';

export const getProfileByUsername = (username) =>
  api.get(`/users/${username}/profile`).then((res) => res.data);
