import { io } from 'socket.io-client';

// Connect to backend Socket.IO
const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export function joinExecutionRoom(executionId) {
  if (executionId && socket.connected) {
    socket.emit('join:execution', executionId);
  }
}

export function leaveExecutionRoom(executionId) {
  if (executionId && socket.connected) {
    socket.emit('leave:execution', executionId);
  }
}

export default socket;
