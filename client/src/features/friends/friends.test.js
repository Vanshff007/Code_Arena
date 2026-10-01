import { describe, it, expect, vi } from 'vitest';

vi.mock('../../shared/api', () => ({
  default: {
    get: vi.fn(async () => ({ data: 'ok' })),
    post: vi.fn(async () => ({ data: 'ok' })),
    delete: vi.fn(async () => ({ data: 'ok' })),
  },
}));

import api from '../../shared/api';
import { getFriends, sendFriendRequest, acceptFriendRequest, removeFriendRequest, removeFriend } from './friendsService';
import { friendStatus, pushToast } from './friends';

describe('friendsService', () => {
  it('calls the friends endpoints', async () => {
    await getFriends();
    expect(api.get).toHaveBeenCalledWith('/friends');
    await sendFriendRequest('ann');
    expect(api.post).toHaveBeenCalledWith('/friends/requests', { username: 'ann' });
    await acceptFriendRequest('r1');
    expect(api.post).toHaveBeenCalledWith('/friends/requests/r1/accept');
    await removeFriendRequest('r2');
    expect(api.delete).toHaveBeenCalledWith('/friends/requests/r2');
    await removeFriend('u1');
    expect(api.delete).toHaveBeenCalledWith('/friends/u1');
  });
});

describe('friend helpers', () => {
  it('describes status from online and in-battle flags', () => {
    expect(friendStatus({ online: false, inBattle: false })).toBe('offline');
    expect(friendStatus({ online: true, inBattle: false })).toBe('online');
    expect(friendStatus({ online: true, inBattle: true })).toBe('in a battle');
    expect(friendStatus()).toBe('offline');
  });

  it('keeps only the newest toasts', () => {
    const list = [1, 2, 3].map((id) => ({ id }));
    expect(pushToast(list, { id: 4 }).map((t) => t.id)).toEqual([2, 3, 4]);
    expect(pushToast([], { id: 1 })).toEqual([{ id: 1 }]);
  });
});
