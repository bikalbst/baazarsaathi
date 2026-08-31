const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'chat-test-jwt-secret-that-is-not-used-in-production';

const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getMessageHistory } = require('../controllers/chatController');
const {
  authenticateSocket,
  registerSocketHandlers,
  roomName,
} = require('../socket/socketServer');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('Conversation creates a stable key for two participants and a listing', async () => {
  const firstParticipant = new mongoose.Types.ObjectId();
  const secondParticipant = new mongoose.Types.ObjectId();
  const listingId = new mongoose.Types.ObjectId();
  const conversation = new Conversation({
    participants: [secondParticipant, firstParticipant],
    listingRef: listingId,
  });

  await conversation.validate();

  const expectedParticipants = [firstParticipant.toString(), secondParticipant.toString()].sort();
  assert.equal(
    conversation.conversationKey,
    `${listingId}:${expectedParticipants.join(':')}`,
  );
});

test('Conversation rejects duplicate participants', async () => {
  const participantId = new mongoose.Types.ObjectId();
  const conversation = new Conversation({
    participants: [participantId, participantId],
    listingRef: new mongoose.Types.ObjectId(),
  });

  await assert.rejects(
    conversation.validate(),
    /exactly two different participants/,
  );
});

test('Message trims content and defaults to unread', async () => {
  const message = new Message({
    conversationId: new mongoose.Types.ObjectId(),
    sender: new mongoose.Types.ObjectId(),
    content: '  Namaste!  ',
  });

  await message.validate();

  assert.equal(message.content, 'Namaste!');
  assert.equal(message.read, false);
  assert.ok(message.createdAt instanceof Date);
});

test('getMessageHistory returns chronological messages and marks fetched incoming messages read', async () => {
  const originalConversationFindOne = Conversation.findOne;
  const originalMessageFind = Message.find;
  const originalUpdateMany = Message.updateMany;
  const conversationId = new mongoose.Types.ObjectId();
  const currentUserId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();
  const olderMessage = new Message({
    _id: new mongoose.Types.ObjectId(),
    conversationId,
    sender: currentUserId,
    content: 'First',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });
  const newerMessage = new Message({
    _id: new mongoose.Types.ObjectId(),
    conversationId,
    sender: otherUserId,
    content: 'Second',
    createdAt: new Date('2026-01-01T00:01:00Z'),
  });
  let markedReadFilter;

  try {
    Conversation.findOne = async () => ({ _id: conversationId });
    Message.find = () => ({
      populate() {
        return this;
      },
      sort() {
        return this;
      },
      async limit() {
        return [newerMessage, olderMessage];
      },
    });
    Message.updateMany = async (filter) => {
      markedReadFilter = filter;
      return { modifiedCount: 1 };
    };

    const req = {
      params: { conversationId: conversationId.toString() },
      query: {},
      user: { _id: currentUserId },
    };
    const res = createResponse();

    await getMessageHistory(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data[0].content, 'First');
    assert.equal(res.body.data[1].content, 'Second');
    assert.equal(newerMessage.read, true);
    assert.equal(olderMessage.read, false);
    assert.equal(markedReadFilter._id.$in.length, 1);
    assert.equal(markedReadFilter._id.$in[0].toString(), newerMessage._id.toString());
  } finally {
    Conversation.findOne = originalConversationFindOne;
    Message.find = originalMessageFind;
    Message.updateMany = originalUpdateMany;
  }
});

test('Socket authentication attaches the JWT user', async () => {
  const originalFindById = User.findById;
  const userId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();
  const user = { _id: userId, name: 'Asha' };

  try {
    User.findById = async () => user;
    const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const socket = {
      handshake: { auth: { token }, headers: {} },
      data: {},
    };
    let nextError;

    await authenticateSocket(socket, (error) => {
      nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(socket.data.user, user);
  } finally {
    User.findById = originalFindById;
  }
});

test('Socket handlers join rooms, persist messages, emit receive_message, and broadcast typing', async () => {
  const originalConversationFindOne = Conversation.findOne;
  const originalConversationUpdateOne = Conversation.updateOne;
  const originalMessageCreate = Message.create;
  const conversationId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();
  const otherUserId = new mongoose.Types.ObjectId();
  const handlers = new Map();
  const emittedToRoom = [];
  const broadcastFromSocket = [];
  const socket = {
    data: { user: { _id: userId, name: 'Asha', role: 'buyer' } },
    rooms: new Set(['socket-id']),
    on(event, handler) {
      handlers.set(event, handler);
    },
    async join(room) {
      this.rooms.add(room);
    },
    to(room) {
      return {
        emit(event, data) {
          broadcastFromSocket.push({ room, event, data });
        },
      };
    },
    emit() {},
  };
  const io = {
    to(room) {
      return {
        emit(event, data) {
          emittedToRoom.push({ room, event, data });
        },
      };
    },
  };

  try {
    Conversation.findOne = async () => ({
      _id: conversationId,
      participants: [userId, otherUserId],
    });
    Conversation.updateOne = async () => ({ modifiedCount: 1 });
    Message.create = async (messageData) => ({
      ...messageData,
      _id: new mongoose.Types.ObjectId(),
      read: false,
      async populate() {},
    });

    registerSocketHandlers(io, socket);

    let joinResponse;
    await handlers.get('join_room')(
      { conversationId: conversationId.toString() },
      (response) => {
        joinResponse = response;
      },
    );

    assert.equal(joinResponse.success, true);
    assert.equal(socket.rooms.has(roomName(conversationId.toString())), true);

    let sendResponse;
    await handlers.get('send_message')(
      { conversationId: conversationId.toString(), content: '  Hello seller  ' },
      (response) => {
        sendResponse = response;
      },
    );

    assert.equal(sendResponse.success, true);
    assert.equal(sendResponse.data.content, 'Hello seller');
    assert.equal(emittedToRoom[0].event, 'receive_message');

    await handlers.get('typing')(
      { conversationId: conversationId.toString() },
      () => {},
    );

    assert.equal(broadcastFromSocket[0].event, 'typing');
    assert.equal(broadcastFromSocket[0].data.user.name, 'Asha');
  } finally {
    Conversation.findOne = originalConversationFindOne;
    Conversation.updateOne = originalConversationUpdateOne;
    Message.create = originalMessageCreate;
  }
});
