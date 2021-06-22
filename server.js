const express = require('express')
    , app = express()
    , http = require('http')
    , socketio = require('socket.io')
    , server = http.createServer(app)
    , io = socketio(server)
    , path = require('path')
    , { setLog } = require('./helpers/utils')
    , PORT = process.env.PORT || 3000;


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', socket => {
    setLog({
        level: 'Live chat Server', method: 'connect to socket', message: 'run connection'
    });

    // Create event message to welcome new users
    socket.emit('message','Welcome to live chat');

    // send Broadcast message to all users when new users connect
    socket.broadcast.emit('message', 'A user has joined the chat');

    // Runs when client disconnect
    socket.on('disconnect', () => {
        io.emit('message', 'A users has left the chat room');
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        io.emit('message', msg);
    });
});

app.listen(PORT, () => {
    setLog({
        level: 'Live chat Server', method: 'start server', message: 'Successfully start server', others: PORT
    });
});
