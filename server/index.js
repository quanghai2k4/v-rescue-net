const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const rescueRoutes = require('./routes/rescue');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/rescue', rescueRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'V-Rescue Net API is running' });
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-rescue-team', () => {
    socket.join('rescue-teams');
    console.log('Rescue team joined:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
