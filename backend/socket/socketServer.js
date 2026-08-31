const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const roomName = (conversationId) => `conversation:${conversationId}`;
const userRoom = (userId) => `user:${userId}`;

const socketResponse = (success, data, message) => ({ success, data, message });

const respondToSocket = (socket, acknowledge, response) => {
  if (typeof acknowledge === 'function') {
    acknowledge(response);
    return;
  }

  if (!response.success) {
    socket.emit('chat_error', response);
  }
};

const findMemberConversation = async (conversationId, userId) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    return null;
  }

  return Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
};

const authenticateSocket = async (socket, next) => {
  try {
    const authorization = socket.handshake.headers.authorization;
    const headerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : null;
    const token = socket.handshake.auth?.token || headerToken;

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('The user for this token no longer exists'));
    }

    socket.data.user = user;
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'Authentication token has expired'
      : 'Authentication token is invalid';
    return next(new Error(message));
  }
};

const registerSocketHandlers = (io, socket) => {
  socket.on('join_room', async (payload = {}, acknowledge) => {
    try {
      const conversation = await findMemberConversation(
        payload.conversationId,
        socket.data.user._id,
      );

      if (!conversation) {
        return respondToSocket(
          socket,
          acknowledge,
          socketResponse(false, null, 'Conversation not found or access denied'),
        );
      }

      const room = roomName(conversation._id.toString());
      await socket.join(room);

      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(true, { conversationId: conversation._id }, 'Joined conversation room'),
      );
    } catch (error) {
      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(false, null, 'Unable to join conversation room'),
      );
    }
  });

  socket.on('send_message', async (payload = {}, acknowledge) => {
    try {
      const { conversationId, content } = payload;

      if (typeof content !== 'string' || !content.trim() || content.trim().length > 2000) {
        return respondToSocket(
          socket,
          acknowledge,
          socketResponse(false, null, 'Message must contain 1 to 2000 characters'),
        );
      }

      const conversation = await findMemberConversation(
        conversationId,
        socket.data.user._id,
      );

      if (!conversation) {
        return respondToSocket(
          socket,
          acknowledge,
          socketResponse(false, null, 'Conversation not found or access denied'),
        );
      }

      const message = await Message.create({
        conversationId: conversation._id,
        sender: socket.data.user._id,
        content: content.trim(),
      });
      await message.populate('sender', 'name role');
      await Conversation.updateOne(
        { _id: conversation._id },
        { $set: { updatedAt: new Date() } },
      );

      const room = roomName(conversation._id.toString());
      await socket.join(room);
      const participantRooms = conversation.participants.map((participant) => (
        userRoom((participant._id || participant).toString())
      ));
      io.to(participantRooms).emit('receive_message', message);

      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(true, message, 'Message sent successfully'),
      );
    } catch (error) {
      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(false, null, 'Unable to send message'),
      );
    }
  });

  const broadcastTyping = async (eventName, payload = {}, acknowledge) => {
    const { conversationId } = payload;

    if (!mongoose.isValidObjectId(conversationId)) {
      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(false, null, 'Invalid conversation ID'),
      );
    }

    const room = roomName(conversationId);

    if (!socket.rooms.has(room)) {
      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(false, null, 'Join the conversation room first'),
      );
    }

    socket.to(room).emit(eventName, {
      conversationId,
      user: {
        id: socket.data.user._id,
        name: socket.data.user.name,
      },
    });

    return respondToSocket(
      socket,
      acknowledge,
      socketResponse(true, { conversationId }, `${eventName} broadcast successfully`),
    );
  };

  socket.on('typing', async (payload, acknowledge) => {
    try {
      return await broadcastTyping('typing', payload, acknowledge);
    } catch (error) {
      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(false, null, 'Unable to broadcast typing status'),
      );
    }
  });

  socket.on('stop_typing', async (payload, acknowledge) => {
    try {
      return await broadcastTyping('stop_typing', payload, acknowledge);
    } catch (error) {
      return respondToSocket(
        socket,
        acknowledge,
        socketResponse(false, null, 'Unable to broadcast typing status'),
      );
    }
  });
};

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(authenticateSocket);
  io.on('connection', async (socket) => {
    await socket.join(userRoom(socket.data.user._id.toString()));
    registerSocketHandlers(io, socket);
  });

  return io;
};

module.exports = {
  initializeSocket,
  authenticateSocket,
  registerSocketHandlers,
  roomName,
  userRoom,
};
