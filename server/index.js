import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Game rooms storage: { roomCode: { gameState, players: [{id, name, avatar, socketId}] } }
const rooms = {};

// Generate 4-letter room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Initialize default game state
function createInitialGameState() {
  return {
    currentPlayer: 0,
    diceValues: [1, 1],
    isRolling: false,
    playerPositions: [0, 0, 0, 0],
    playerMoney: [10000, 10000, 10000, 10000],
    propertyOwnership: {},
    propertyLevels: {},
    history: ['Game started!'],
    gameStage: 'lobby',
    hoppingPlayer: null,
    turnFinished: false,
    isProcessingTurn: false,
    cashStack: 0,
    battlePot: 0
  };
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Host creates a new room
  socket.on('create_room', ({ name, avatar }) => {
    const roomCode = generateRoomCode();
    
    rooms[roomCode] = {
      gameState: createInitialGameState(),
      players: [{
        id: 0,
        name,
        avatar,
        socketId: socket.id,
        isHost: true
      }]
    };
    
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerIndex = 0;
    
    console.log(`Room ${roomCode} created by ${name}`);
    
    socket.emit('room_created', { 
      roomCode, 
      playerIndex: 0,
      gameState: rooms[roomCode].gameState,
      players: rooms[roomCode].players
    });
  });

  // Client joins an existing room
  socket.on('join_room', ({ roomCode, name, avatar }) => {
    const room = rooms[roomCode];
    
    if (!room) {
      socket.emit('error', { message: 'Room not found!' });
      return;
    }
    
    if (room.players.length >= 4) {
      socket.emit('error', { message: 'Room is full!' });
      return;
    }
    
    // Check for duplicate name/avatar
    const isDuplicate = room.players.some(p => p.name === name || p.avatar === avatar);
    if (isDuplicate) {
      socket.emit('error', { message: 'Name or Avatar already taken!' });
      return;
    }
    
    const playerIndex = room.players.length;
    
    room.players.push({
      id: playerIndex,
      name,
      avatar,
      socketId: socket.id,
      isHost: false
    });
    
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerIndex = playerIndex;
    
    console.log(`${name} joined room ${roomCode} as player ${playerIndex}`);
    
    // Send join confirmation to the new player
    socket.emit('joined_room', {
      roomCode,
      playerIndex,
      gameState: room.gameState,
      players: room.players
    });
    
    // Broadcast updated players list to all in room
    io.to(roomCode).emit('players_updated', { players: room.players });
  });

  // Start game (host only)
  socket.on('start_game', () => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player || !player.isHost) return;
    
    room.gameState.gameStage = 'playing';
    
    console.log(`Game started in room ${socket.roomCode}`);
    
    io.to(socket.roomCode).emit('game_started', { 
      gameState: room.gameState,
      players: room.players
    });
  });

  // Game action (roll, buy, end turn, etc.)
  socket.on('game_action', ({ action, payload }) => {
    const room = rooms[socket.roomCode];
    if (!room) return;
    
    const playerIndex = socket.playerIndex;
    
    console.log(`Action from player ${playerIndex} in room ${socket.roomCode}:`, action);
    
    // Validate it's this player's turn for certain actions
    if (['roll_dice', 'buy_property', 'end_turn'].includes(action)) {
      if (room.gameState.currentPlayer !== playerIndex) {
        socket.emit('error', { message: 'Not your turn!' });
        return;
      }
    }
    
    // Process the action and update game state
    switch (action) {
      case 'roll_dice':
        handleRollDice(room, playerIndex);
        break;
      case 'buy_property':
        handleBuyProperty(room, playerIndex, payload);
        break;
      case 'upgrade_property':
        handleUpgradeProperty(room, playerIndex, payload);
        break;
      case 'end_turn':
        handleEndTurn(room);
        break;
      case 'update_state':
        // Direct state update from host OR current player (for complex client-side logic like Chance cards)
        const isHost = room.players.find(p => p.socketId === socket.id)?.isHost;
        const isCurrentPlayer = room.gameState.currentPlayer === playerIndex;
        
        if (isHost || isCurrentPlayer) {
          Object.assign(room.gameState, payload);
        }
        break;
    }
    
    // Broadcast updated state to all players
    io.to(socket.roomCode).emit('state_update', { 
      gameState: room.gameState,
      players: room.players
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const roomCode = socket.roomCode;
    if (roomCode && rooms[roomCode]) {
      const room = rooms[roomCode];
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      
      if (playerIndex !== -1) {
        const wasHost = room.players[playerIndex].isHost;
        room.players.splice(playerIndex, 1);
        
        // If host left, destroy room
        if (wasHost) {
          io.to(roomCode).emit('room_closed', { message: 'Host left the game' });
          delete rooms[roomCode];
        } else {
          io.to(roomCode).emit('players_updated', { players: room.players });
        }
      }
    }
  });
});

// Game logic handlers
function handleRollDice(room, playerIndex) {
  if (room.gameState.isRolling || room.gameState.isProcessingTurn) return;
  
  room.gameState.isRolling = true;
  room.gameState.isProcessingTurn = true;
  
  // Generate dice values
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const moveAmount = die1 + die2;
  
  room.gameState.diceValues = [die1, die2];
  
  // Update position
  const currentPos = room.gameState.playerPositions[playerIndex];
  const newPos = (currentPos + moveAmount) % 36;
  room.gameState.playerPositions[playerIndex] = newPos;
  
  // Check for passing GO
  if (newPos < currentPos) {
    room.gameState.playerMoney[playerIndex] += 1000;
    room.gameState.history.unshift(`${room.players[playerIndex]?.name || 'Player'} passed GO! +$1000`);
  }
  
  room.gameState.history.unshift(
    `${room.players[playerIndex]?.name || 'Player'} rolled ${moveAmount}`
  );
  
  room.gameState.hoppingPlayer = playerIndex;
  room.gameState.isRolling = false;
  room.gameState.turnFinished = true;
  
  // Broadcast intermediate state for animation
  io.to(Object.keys(io.sockets.adapter.rooms).find(r => rooms[r] === room) || '').emit('state_update', {
    gameState: room.gameState,
    players: room.players
  });
  
  // Clear hopping after a delay
  setTimeout(() => {
    room.gameState.hoppingPlayer = null;
    room.gameState.isProcessingTurn = false;
  }, 500);
}

function handleBuyProperty(room, playerIndex, payload) {
  const { tileIndex, price } = payload || {};
  if (!tileIndex || !price) return;
  
  if (room.gameState.playerMoney[playerIndex] >= price) {
    room.gameState.playerMoney[playerIndex] -= price;
    room.gameState.propertyOwnership[tileIndex] = playerIndex;
    room.gameState.history.unshift(
      `${room.players[playerIndex]?.name || 'Player'} bought property for $${price}`
    );
  }
}

function handleUpgradeProperty(room, playerIndex, payload) {
  const { tileIndex, price } = payload || {};
  if (!tileIndex || !price) return;
  
  if (room.gameState.playerMoney[playerIndex] >= price) {
    room.gameState.playerMoney[playerIndex] -= price;
    
    const currentLevel = room.gameState.propertyLevels[tileIndex] || 0;
    room.gameState.propertyLevels[tileIndex] = currentLevel + 1;
    
    room.gameState.history.unshift(
      `${room.players[playerIndex]?.name || 'Player'} upgraded property for $${price}`
    );
  }
}

function handleEndTurn(room) {
  const numPlayers = room.players.length;
  room.gameState.currentPlayer = (room.gameState.currentPlayer + 1) % numPlayers;
  room.gameState.turnFinished = false;
  room.gameState.hoppingPlayer = null;
  room.gameState.history.unshift(
    `${room.players[room.gameState.currentPlayer]?.name || 'Player'}'s turn`
  );
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
