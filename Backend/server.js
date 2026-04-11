require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const studentCoreRoutes = require('./routes/studentCore');
const academicRoutes = require('./routes/academic');
const occupancyRoutes = require('./routes/occupancy');
const clubsRoutes = require('./routes/clubs');
const recruitmentRoutes = require('./routes/recruitment');
const assignmentsRoutes = require('./routes/assignments');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/core', studentCoreRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/occupancy', occupancyRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io for Real-Time Features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Chat Room
  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log(`User join room: ${room}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Pass IO instance to routes via app locals or simply expose it
app.set('socketio', io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect';

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
