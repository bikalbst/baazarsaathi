const mongoose = require('mongoose');

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required'],
    immutable: true,
    index: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
    immutable: true,
    index: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing is required'],
    immutable: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than zero'],
    immutable: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least one'],
    immutable: true,
  },
  price: {
    type: Number,
    required: [true, 'Purchase price is required'],
    default() {
      return this.amount;
    },
    min: [0.01, 'Purchase price must be greater than zero'],
    immutable: true,
  },
  commission: {
    type: Number,
    required: true,
    min: 0,
    immutable: true,
  },
  sellerEarning: {
    type: Number,
    required: true,
    min: 0,
    immutable: true,
  },
  paymentMethod: {
    type: String,
    enum: ['khalti_wallet', 'card'],
    default: 'khalti_wallet',
    immutable: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  paymentId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  paymentTransactionId: {
    type: String,
    trim: true,
  },
  paymentVerified: {
    type: Boolean,
    default: false,
  },
  paymentStatus: {
    type: String,
    enum: ['initiated', 'paid', 'failed', 'refunded'],
    default: 'initiated',
    index: true,
  },
  paidAt: Date,
  releasedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

orderSchema.pre('validate', async function calculateEscrowAmounts() {
  if (this.isNew || this.isModified('amount')) {
    this.amount = roundCurrency(this.amount);
    this.price = roundCurrency(this.price ?? this.amount);
    this.commission = roundCurrency(this.amount * 0.1);
    this.sellerEarning = roundCurrency(this.amount - this.commission);
  }
});

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
