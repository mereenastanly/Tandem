import { io } from 'socket.io-client';

// Socket.io connects to the raw backend host (no /api suffix here,
// since Socket.io has its own connection handshake, separate from REST routes).
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL);

export default socket;