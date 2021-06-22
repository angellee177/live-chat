const express = require('express')
    , app = express()
    , http = require('http')
    , socketio = require('socket.io')
    , server = http.createServer(app)
    , io = socketio(server)
    , path = require('path')
    , { setLog } = require('./helpers/utils')
    , PORT = process.env.PORT || 3000
    , formatMessage = require('./utils/messages')
    , { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
    , chatName = 'live-chat';

// Set static folder
app.use('/test', express.static(path.join(__dirname, 'public')));


// listening to 'Connection' event
io.on('connection', socket => {
    setLog({
        level: 'Live chat Server', method: 'connect to socket', message: 'run connection'
    }); 

    // Get the username and room name
    socket.on('joinRoom', ({ username, room }) => {
        // Socket.id as user ID
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Create event message to welcome new users
        socket.emit('message', formatMessage(chatName, 'Welcome to live chat'));

        // send Broadcast message to all users when new users connect
        socket.broadcast
            .to(user.room)
            .emit('message', 
                formatMessage(chatName, `${user.username} has joined the chat`)
            );
        
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if(user) {
            io.to(user.room).emit('message', formatMessage(chatName, `${user.username} has left the chat room`));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

server.listen(PORT, () => {
    setLog({
        level: 'Live chat Server', method: 'start server', message: 'Successfully start server', others: PORT
    });
});
