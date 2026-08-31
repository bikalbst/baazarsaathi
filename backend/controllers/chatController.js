const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const User = require('../models/User');

const validationMessage = (error) => {
  if (error.name !== 'ValidationError') {
    return null;
  }

  return Object.values(error.errors)
    .map((validationError) => validationError.message)
    .join(', ');
};

const sendError = (res, error, fallbackMessage) => {
  const message = validationMessage(error);

  if (message) {
    return res.status(400).json({ success: false, data: null, message });
  }

  return res.status(500).json({
    success: false,
    data: null,
    message: fallbackMessage,
  });
};

const createConversation = async (req, res) => {
  try {
    const { participantId, listingId } = req.body || {};

    if (!mongoose.isValidObjectId(participantId) || !mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Valid participant and listing IDs are required',
      });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'You cannot start a conversation with yourself',
      });
    }

    const [listing, participantExists] = await Promise.all([
      Listing.findById(listingId),
      User.exists({ _id: participantId }),
    ]);

    if (!listing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Listing not found',
      });
    }

    if (!participantExists) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Participant not found',
      });
    }

    const requesterId = req.user._id.toString();
    const sellerId = listing.seller.toString();

    if (requesterId !== sellerId && participantId !== sellerId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A listing conversation must include its seller',
      });
    }

    const participants = [req.user._id, new mongoose.Types.ObjectId(participantId)];
    const conversationKey = Conversation.buildConversationKey(listing._id, participants);
    let conversation = await Conversation.findOne({ conversationKey });
    let created = false;

    if (!conversation) {
      try {
        conversation = await Conversation.create({
          participants,
          listingRef: listing._id,
          conversationKey,
        });
        created = true;
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }

        conversation = await Conversation.findOne({ conversationKey });
      }
    }

    await conversation.populate([
      { path: 'participants', select: 'name role' },
      { path: 'listingRef', select: 'title images price status' },
    ]);

    return res.status(created ? 201 : 200).json({
      success: true,
      data: conversation,
      message: created ? 'Conversation created successfully' : 'Conversation already exists',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to create conversation');
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name role')
      .populate('listingRef', 'title images price status')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: conversations,
      message: 'Conversations retrieved successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve conversations');
  }
};

const getMessageHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid conversation ID',
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Conversation not found',
      });
    }

    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
    const messageFilter = { conversationId: conversation._id };

    if (req.query.before) {
      const before = new Date(req.query.before);

      if (Number.isNaN(before.getTime())) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'before must be a valid date',
        });
      }

      messageFilter.createdAt = { $lt: before };
    }

    const messages = await Message.find(messageFilter)
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit);

    messages.reverse();

    const unreadMessageIds = messages
      .filter((message) => {
        const senderId = message.sender?._id || message.sender;
        return !message.read && senderId?.toString() !== req.user._id.toString();
      })
      .map((message) => message._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $set: { read: true } },
      );

      for (const message of messages) {
        if (unreadMessageIds.some((messageId) => messageId.equals(message._id))) {
          message.read = true;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: messages,
      message: 'Message history retrieved successfully',
    });
  } catch (error) {
    return sendError(res, error, 'Unable to retrieve message history');
  }
};

module.exports = {
  createConversation,
  getConversations,
  getMessageHistory,
};
