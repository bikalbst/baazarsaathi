const mongoose = require('mongoose');

const buildConversationKey = (listingId, participants) => {
  const participantIds = participants.map((participant) => participant.toString()).sort();
  return `${listingId.toString()}:${participantIds.join(':')}`;
};

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    required: [true, 'Participants are required'],
    validate: {
      validator(participants) {
        if (participants.length !== 2) {
          return false;
        }

        return new Set(participants.map((participant) => participant.toString())).size === 2;
      },
      message: 'A conversation must have exactly two different participants',
    },
  },
  listingRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing reference is required'],
    immutable: true,
    index: true,
  },
  conversationKey: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    select: false,
  },
}, {
  timestamps: true,
});

conversationSchema.pre('validate', async function createConversationKey() {
  if (this.participants?.length && this.listingRef) {
    this.conversationKey = buildConversationKey(this.listingRef, this.participants);
  }
});

conversationSchema.index({ participants: 1, updatedAt: -1 });

conversationSchema.statics.buildConversationKey = buildConversationKey;

module.exports = mongoose.model('Conversation', conversationSchema);
