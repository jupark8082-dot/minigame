import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3000');

class SocketClient {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.playerId = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(URL, { autoConnect: true });
      this.socket.on('connect', () => {
        this.playerId = this.socket.id;
        console.log('[SocketClient] Connected with ID:', this.playerId);
      });
    }
  }

  joinRoom(params, callback) { // params: { roomId, name }
    if (!this.socket) this.connect();
    this.roomId = params.roomId;
    this.socket.emit('joinRoom', params, (response) => {
      if (callback) callback(response);
    });
  }

  startGame(stage) {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('startGame', { roomId: this.roomId, stage });
  }

  fireCap(data) { // data: { force, angle, position, beverageId }
    if (!this.socket || !this.roomId) return;
    this.socket.emit('fireCap', { roomId: this.roomId, ...data });
  }

  updateCap(data) { // data: { position, velocity }
    if (!this.socket || !this.roomId) return;
    this.socket.emit('updateCap', { roomId: this.roomId, ...data });
  }

  turnEnd(result) {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('turnEnd', { roomId: this.roomId, result });
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

const socketClient = new SocketClient();
export default socketClient;
