const express = require('express');
const path = require("path");
const http= require('http');
const publicDirectoryPath = path.join(__dirname, '../public');
const socketio  = require('socket.io');
const Filter = require('bad-words');
const { generateMessage , generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users');

const app = express();

const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketio(server);

// let count = 0;

// set up static directory to serve
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('new web socket connection'); 

    socket.on('join', (options, callback) => {
        const { error , user } =  addUser({ id: socket.id , ...options });

        if( error ) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message',generateMessage(user.username,'welcome'));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined! `));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if( filter.isProfane(message)) {
            return callback('profanity is not allowed');
        }

        const user = getUser(socket.id);

        if( user) {
            io.to(user.room).emit('message',generateMessage(user.username, message));        
        }
    
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if( user ) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

    socket.on('sendLocation', (coords, callback) => {

        const user = getUser(socket.id);
        if( user ) {
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitutde}`));
        }
       // socket.broadcast.emit('sendLocation', coords);
       callback()
    })
   /*  socket.emit('countupdated', count);

    socket.on('increment', () => {
        count++;
       // socket.emit('countupdated',count); // emits to a specific connection 
       io.emit('countupdated',count); // emits to everyone
    }); */
});

server.listen(port , () => {
    console.log('started at port 3000'); 
});

