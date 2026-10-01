import Friendship, { pairKey } from './Friendship.model.js';

export async function areFriends(a, b) {
  const f = await Friendship.findOne({ pair: pairKey(a, b), status: 'accepted' }).select('_id');
  return Boolean(f);
}

// Splits a user's friendship documents into friends, incoming and outgoing
// requests. `others` are populated users (username, rating).
export function groupFriendships(userId, docs) {
  const me = String(userId);
  const out = { friends: [], incoming: [], outgoing: [] };
  for (const d of docs) {
    const iAmRequester = String(d.requester._id ?? d.requester) === me;
    const other = iAmRequester ? d.recipient : d.requester;
    const entry = { requestId: String(d._id), userId: String(other._id), username: other.username, rating: other.rating };
    if (d.status === 'accepted') out.friends.push(entry);
    else if (iAmRequester) out.outgoing.push(entry);
    else out.incoming.push(entry);
  }
  out.friends.sort((a, b) => a.username.localeCompare(b.username));
  return out;
}
