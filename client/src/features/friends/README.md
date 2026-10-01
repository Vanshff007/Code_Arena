# Friends (client)

Friend list, requests, online status and live challenges.

## Files

| File | Job |
|---|---|
| `FriendsPage.jsx` | Add by username; incoming and outgoing requests; friends with status (online, in a battle, offline) and a Challenge button. |
| `FriendNotifications.jsx` | Mounted for logged-in users on every page. Toasts for friend requests, accepted requests and challenges; Accept joins the room. |
| `friends.js` | `friendStatus`, `pushToast` (keeps the newest 3). |
| `friendsService.js` | `/friends` endpoints. |
| `friends.test.js` | Service contract and helper tests. |

Socket events (`friend:*`) are listed in `docs/api.md` and checked by the
contract test in `features/battles/battles.test.js`.

## Manual test cases

1. Two accounts: send a request from one. The other gets a toast and sees
   it under incoming requests. Accept it; both lists show the friend.
2. Click Challenge on an online friend. They get a toast; Accept takes both
   to the lobby. Decline shows a note to the challenger.
3. Log the friend out. Their status turns offline and Challenge is disabled.
