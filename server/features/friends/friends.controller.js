import Friendship, { pairKey } from './Friendship.model.js';
import User from '../auth/User.model.js';
import { groupFriendships } from './friends.service.js';
import { isOnline, socketsOf } from '../../core/presence.js';
import { getIO } from '../../core/io.js';
import { findRoomByUserId } from '../battles/state.js';

function notify(userId, event, data) {
  const io = getIO();
  if (!io) return;
  for (const socketId of socketsOf(userId)) io.to(socketId).emit(event, data);
}

// GET /api/friends - friends (with online / in-battle status) and pending
// requests both ways.
export const listFriends = async (req, res, next) => {
  try {
    const me = req.user._id;
    const docs = await Friendship.find({ $or: [{ requester: me }, { recipient: me }] })
      .populate('requester', 'username rating')
      .populate('recipient', 'username rating');
    const grouped = groupFriendships(me, docs.filter((d) => d.requester && d.recipient));
    grouped.friends = grouped.friends.map((f) => ({
      ...f,
      online: isOnline(f.userId),
      inBattle: Boolean(findRoomByUserId(f.userId)),
    }));
    return res.status(200).json({ success: true, data: grouped });
  } catch (err) {
    next(err);
  }
};

// POST /api/friends/requests { username }. If that player already sent you
// a request, this accepts it instead of creating a second one.
export const sendRequest = async (req, res, next) => {
  try {
    const target = await User.findOne({ username: req.body.username }).select('username rating');
    if (!target) return res.status(404).json({ success: false, message: 'No player with that username' });
    if (target._id.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: "You can't add yourself" });
    }

    const pair = pairKey(req.user._id, target._id);
    const existing = await Friendship.findOne({ pair });
    if (existing?.status === 'accepted') {
      return res.status(409).json({ success: false, message: `You and ${target.username} are already friends` });
    }
    if (existing && existing.requester.equals(req.user._id)) {
      return res.status(409).json({ success: false, message: 'Request already sent' });
    }
    if (existing) {
      existing.status = 'accepted';
      await existing.save();
      notify(target._id, 'friend:accepted', { username: req.user.username });
      return res.status(200).json({ success: true, message: `You and ${target.username} are now friends` });
    }

    await Friendship.create({ requester: req.user._id, recipient: target._id, pair });
    notify(target._id, 'friend:request', { username: req.user.username });
    return res.status(201).json({ success: true, message: `Request sent to ${target.username}` });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Request already exists' });
    next(err);
  }
};

// POST /api/friends/requests/:id/accept - only the recipient can accept.
export const acceptRequest = async (req, res, next) => {
  try {
    const request = await Friendship.findOne({ _id: req.params.id, recipient: req.user._id, status: 'pending' });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    request.status = 'accepted';
    await request.save();
    notify(request.requester, 'friend:accepted', { username: req.user.username });
    return res.status(200).json({ success: true, message: 'Friend added' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/friends/requests/:id - the recipient declines, or the
// requester cancels.
export const deleteRequest = async (req, res, next) => {
  try {
    const me = req.user._id;
    const deleted = await Friendship.findOneAndDelete({
      _id: req.params.id,
      status: 'pending',
      $or: [{ requester: me }, { recipient: me }],
    });
    if (!deleted) return res.status(404).json({ success: false, message: 'Request not found' });
    return res.status(200).json({ success: true, message: 'Request removed' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/friends/:userId - remove a friend.
export const removeFriend = async (req, res, next) => {
  try {
    const deleted = await Friendship.findOneAndDelete({ pair: pairKey(req.user._id, req.params.userId), status: 'accepted' });
    if (!deleted) return res.status(404).json({ success: false, message: 'Not friends' });
    return res.status(200).json({ success: true, message: 'Friend removed' });
  } catch (err) {
    next(err);
  }
};
