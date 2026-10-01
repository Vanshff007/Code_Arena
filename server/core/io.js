// Shared handle on the Socket.io server, for code outside socket handlers
// that needs to emit or find sockets: REST controllers (battle results after
// a submit, friend challenges, logging out every session) and battle logic.
// Simpler than threading `io` through Express for these few uses.
let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;
