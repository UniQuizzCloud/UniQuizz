const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);

        // Check if the room exists, if not, create random letters for it
        if (!rooms[roomCode]) {
            rooms[roomCode] = generateRandomLetters();
        }

        // Emit the random letters to everyone in the room
        io.to(roomCode).emit('updateLetters', rooms[roomCode]);
    });

    socket.on('createRoom', () => {
        const roomCode = generateRoomCode();
        socket.join(roomCode);
        rooms[roomCode] = generateRandomLetters();

        // Emit the random letters to the creator
        socket.emit('updateLetters', rooms[roomCode]);

        // Broadcast the new room code to everyone in the room
        io.to(roomCode).emit('updateRoomCode', roomCode);
    });

    socket.on('disconnect', () => {
        // Handle disconnection if needed
    });
});

function generateRoomCode() {
    const length = 4;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateRandomLetters() {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
