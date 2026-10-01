// The REST /api/execute/submit controller needs to broadcast battle events
// (opponent submitted, battle ended) after judging a submission, but it has
// no direct handle on the Socket.io server otherwise. This tiny singleton
// is simpler than threading `io` through Express's req/app for one use case.
let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;
