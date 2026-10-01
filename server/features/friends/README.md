# Friends (server)

Friend requests, friend lists with online status, and live challenges.

## Files

| File | Job |
|---|---|
| `Friendship.model.js` | One document per pair of users (`pair` = sorted ids, unique): pending request or accepted. |
| `friends.service.js` | `areFriends`, `groupFriendships` (friends, incoming, outgoing). |
| `friends.controller.js`, `friends.routes.js` | `/api/friends` endpoints. Notifies the other user over their socket room. |
| `friendSockets.js` | `friend:challenge` (creates a private room and invites the friend) and `friend:challengeDecline`. |
| `friends.test.js` | Automated tests. |

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/friends` | Friends (`online`, `inBattle`), incoming and outgoing requests |
| POST | `/api/friends/requests` | `{ username }`. Accepts at once if they already asked you |
| POST | `/api/friends/requests/:id/accept` | Recipient only |
| DELETE | `/api/friends/requests/:id` | Decline or cancel |
| DELETE | `/api/friends/:userId` | Remove a friend |

All routes need a session. Online status comes from `server/core/presence.js`
(in memory, so single process only).

## Rules

- Only friends can be challenged, and only when online and not in a battle.
- No request to yourself, to an unknown user, or a second one for the same pair.

## Tests

Automated: send, list and accept; only the recipient accepts; auto-accept
when both asked; invalid requests; decline and remove; live notification;
challenge creates a room and invites; challenge refused for non-friends or
offline friends; grouping helper.

Manual: see `client/src/features/friends/README.md`.
