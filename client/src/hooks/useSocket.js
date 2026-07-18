import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

// Returns null until the socket has connected (or if the user is logged
// out) - callers should treat a null socket as "not ready yet", same
// pattern as AuthContext's `loading` flag.
export function useSocket() {
  return useContext(SocketContext);
}
