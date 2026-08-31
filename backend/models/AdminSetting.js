const mongoose = require('mongoose');

const adminSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'escrow',
    immutable: true,
  },
  autoAccept: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('AdminSetting', adminSettingSchema);
