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
        // 1. Save the new message
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text
        });

        // 2. Update the parent conversation's last message details
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text.length > 50 ? text.substring(0, 47) + '...' : text,
          lastMessageAt: new Date()
        });

        // 3. Populate sender details for the emitted message
        const populatedMessage = await message.populate('sender', 'username profileImage');

        // 4. **THE FIX**: Convert the populated message to a plain object
        //    and ensure the conversation ID is a string before emitting.
        const payload = populatedMessage.toObject();
        payload.conversation = payload.conversation.toString();

        // 5. Emit to the entire room (including sender)
        io.to(conversationId).emit('newMessage', payload);
      } catch (err) {
        console.error('Socket sendMessage error:', err);
        socket.emit('errorMessage', 'Failed to send message.');
      }
    });
  });

  return io;
}

module.exports = initSocket;