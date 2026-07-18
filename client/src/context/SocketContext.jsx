import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

// Socket.io shares the same host as the REST API but not the /api path
// prefix - VITE_API_URL is "http://localhost:5000/api", so strip the
// trailing /api to get the bare origin Socket.io connects to.
const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // No logged-in user - nothing to authenticate the socket handshake with.
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    const token = localStorage.getItem('codearena_token');
    const newSocket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
