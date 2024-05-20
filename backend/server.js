const express = require('express');
const chats = require('./data/data');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandlingMiddleware');
const path = require('path');

// for setting environment variables
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
connectDB();

const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());  // parsing JSON data from the request body


app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);

// ----------------------- Deployment code ---------------------------

const __dirname1 = path.resolve();
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname1, '/frontend/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname1, 'frontend', 'build', 'index.html'));
    })
}else{
    app.get('/', (req, res) => {
        res.send("API is running");
    });
}

// ----------------------- Deployment code ---------------------------

// API Error Handlers => (add at end of all routes)
app.use(notFound); // handles requests for routes that do not exist
app.use(errorHandler);

const server = app.listen(port, (err) => {
    if(err){
        console.log('error in running the server ', err);
        return;
    }

    console.log('Server is up and running on port', port);
});

// FOR SOCKET IO CONFIGURATION
const socketIO = require('socket.io');

const io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000'
    }
});

io.on('connection', (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);  // created a room for particular user
        socket.emit('connected');
    });

    // creates a new room on seletced chat, with users which are logged in that 
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log(`User joined room : ${room}`);
    });

    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    });
    
    socket.on('stop typing', (room) => {
        socket.in(room).emit('stop typing');
    });

    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if(chat.users) {
            chat.users.forEach((userId) => {
                if(userId === newMessageReceived.sender._id){
                    return;
                }
                
                // 'IN' means inside that user's room, emit/send that message
                socket.in(userId).emit('message received', newMessageReceived);
            });
        }else{
            console.log('chat.users not defined');
        }

        socket.off('setup', () => {
            console.log('USER DISCONNECTED');
            socket.leave(userData._id);
        });
    })
});