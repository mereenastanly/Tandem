import { io } from 'socket.io-client';

// One shared socket connection for the whole app
const socket = io('http://localhost:5000');

export default socket;