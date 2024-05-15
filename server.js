// init & express 호출
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user');


const app = express();
// socket.io로 server를 연결하기 위한 변수
const server = http.createServer(app);
// socket을 server에 전달
const io = socketio(server);

// 정적 resource 경로 setting
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatRoom Bot';

// 환경변수으 포트를 사용하고, 그렇지 않으면 3000 port 사용
const PORT = 3000 || process.env.PORT;

// client socket 실행
io.on('connection', socket => {
    // console.log('New WS Connection...');
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin( socket.id, username, room );
        socket.join(user.room);

        // 단일 사용자 또는 연결 중인 단일 client에게만 알림
        // socket.emit('message', 'Welcome to ChatRoom!');
        socket.emit('message', formatMessage(botName, 'Welcome to ChatRoom!'));

        // 사용자 연결을 알림 (연결 중인 client를 제외한 모든 client에게 알림)
        // socket.broadcast.emit('message', 'A user has joined the chat');
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the chat`)
            );
        
        // Send users and room info (sidebar)
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for ChatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        // console.log(msg);
        // io.emit('message', msg);
        io.to(user.room)
            .emit('message', formatMessage(user.username, msg));
    });
    
    // 모든 client에게 알림
    // io.emit();

    // client가 disconnect 할 때 실행
    socket.on('disconnect', () => {
        // io.emit('message', 'A user has left the chat');
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room)
                .emit('message', formatMessage(botName, `${user.username} has left the chat`));
    
            // Send users and room info (sidebar)
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// socket 사용
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));