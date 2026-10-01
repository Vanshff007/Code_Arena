import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './socketContext';
import { useAuth } from '../auth/useAuth';

// Socket.io shares the same host as the REST API but not the /api path
// prefix - VITE_API_URL is "http://localhost:5000/api", so strip the
// trailing /api to get the bare origin Socket.io connects to.
const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');

// One socket per logged-in user. The handshake carries the session cookie
// (withCredentials), the same way REST requests do.
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const userId = user?._id;

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      return;
    }
    const newSocket = io(SOCKET_URL, { withCredentials: true });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [userId]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
