const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

function initSocket(server) {
  const io = socketIo(server, {
    cors: { origin: '*' }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('sendMessage', async ({ conversationId, text }) => {
      try {
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text
        });
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageAt: new Date()
        });
        const populated = await message.populate('sender', 'username profileImage');
        io.to(conversationId).emit('newMessage', populated);
      } catch (err) {
        socket.emit('errorMessage', err.message);
      }
    });
  });

  return io;
}

module.exports = initSocket;