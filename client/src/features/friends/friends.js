// Pure helpers for friends (covered by friends.test.js).

// One word for a friend's status, from the API's online / inBattle flags.
export function friendStatus({ online, inBattle } = {}) {
  if (!online) return 'offline';
  return inBattle ? 'in a battle' : 'online';
}

// Toasts shown by FriendNotifications, newest last, at most `max` kept.
export function pushToast(list, toast, max = 3) {
  return [...list, toast].slice(-max);
}
