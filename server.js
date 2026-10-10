const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تحديد مجلد الملفات
app.use(express.static(path.join(__dirname, 'public')));

// لما حد يكتب لينك الغرفة، نفتحله صفحة الغرفة
app.get('/:room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// حفظ الفيديو الشغال في كل غرفة
const roomsMedia = {};

io.on('connection', (socket) => {
    // لما مستخدم يدخل غرفة معينة
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`مستخدم دخل غرفة: ${roomId}`);
        
        // لو الغرفة فيها فيديو شغال، ابعتهوله
        if (roomsMedia[roomId]) {
            socket.emit('syncMedia', roomsMedia[roomId]);
        }
    });

    socket.on('playMedia', (data) => {
        roomsMedia[data.roomId] = data.url;
        io.to(data.roomId).emit('syncMedia', data.url); // بث للغرفة دي بس
    });

    socket.on('sendMessage', (data) => {
        io.to(data.roomId).emit('receiveMessage', data.msg);
    });

    socket.on('sendEmoji', (data) => {
        io.to(data.roomId).emit('receiveEmoji', data.emoji);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال بنجاح على: http://localhost:${PORT}`);
});