const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  testDriveRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestDriveRequest',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  stripeClientSecret: {
    type: String
  },
  refundAmount: {
    type: Number
  },
  refundDate: {
    type: Date
  },
  transactionDetails: {
    type: Object
  },
  receipt: {
    type: String
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
