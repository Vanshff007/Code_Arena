import api from '../../shared/api';

export const getFriends = () => api.get('/friends').then((res) => res.data);

export const sendFriendRequest = (username) => api.post('/friends/requests', { username }).then((res) => res.data);

export const acceptFriendRequest = (requestId) => api.post(`/friends/requests/${requestId}/accept`).then((res) => res.data);

// Declines an incoming request or cancels an outgoing one.
export const removeFriendRequest = (requestId) => api.delete(`/friends/requests/${requestId}`).then((res) => res.data);

export const removeFriend = (userId) => api.delete(`/friends/${userId}`).then((res) => res.data);
