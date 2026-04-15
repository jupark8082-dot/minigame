import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// { roomId: { status, currentTurnIndex, stage, players: [{id, name, isHost}], scores: [] } }
const rooms = {}; 

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on('joinRoom', ({ roomId, name }, callback) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { 
        status: 'LOBBY', 
        currentTurnIndex: 0, 
        stage: 'wood', 
        players: [], 
        scores: [] 
      };
    }

    const room = rooms[roomId];
    
    // 이미 참가한 사람인지 방어 코드
    const existingPlayer = room.players.find(p => p.id === socket.id);
    if (!existingPlayer) {
      const isHost = room.players.length === 0;
      room.players.push({
        id: socket.id,
        name: name || `Guest-${socket.id.substring(0,4)}`,
        isHost
      });
    }

    console.log(`[Socket] ${socket.id} (${name}) joined room: ${roomId}`);
    
    // 방정보 전체 브로드캐스트
    io.to(roomId).emit('roomUpdated', room);

    if (callback) {
      callback({ status: 'success', room });
    }
  });

  socket.on('startGame', ({ roomId, stage }) => {
    const room = rooms[roomId];
    if (room) {
      room.status = 'PLAYING';
      room.stage = stage;
      room.currentTurnIndex = 0;
      room.scores = [];
      io.to(roomId).emit('gameStarted', room);
    }
  });

  socket.on('fireCap', (data) => {
    // data: { roomId, force, angle, position, beverageId }
    if (data.roomId) {
      socket.to(data.roomId).emit('capFired', { ...data, playerId: socket.id });
    }
  });

  socket.on('updateCap', (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit('capUpdated', { ...data, playerId: socket.id });
    }
  });

  // 누군가의 턴이 종료됨
  socket.on('turnEnd', ({ roomId, result }) => {
    const room = rooms[roomId];
    if (room) {
      // 기록 저장
      room.scores.push({
        playerId: socket.id,
        name: room.players.find(p => p.id === socket.id)?.name || 'Unknown',
        result
      });

      // 다음 턴 확인
      room.currentTurnIndex++;
      
      if (room.currentTurnIndex >= room.players.length) {
        // 모든 인원 완료 -> 랭킹
        room.status = 'RESULT';
        io.to(roomId).emit('gameFinished', room);
      } else {
        // 다음 사람 턴
        io.to(roomId).emit('nextTurn', room);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        
        // 만약 방에 아무도 없으면 폭파
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          // 남은 사람 중 0번을 호스트로 승격
          if (index === 0) {
             room.players[0].isHost = true;
          }
          io.to(roomId).emit('roomUpdated', room);
        }
      }
    }
  });
});

// 프론트엔드 빌드 결과물 서빙
app.use(express.static(path.join(__dirname, 'dist')));

// 클라이언트 사이드 라우팅(딥링크) 폴백 - Express 5 호환
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Server] Socket.io server running on http://localhost:${PORT}`);
});
