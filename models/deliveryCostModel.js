import mongoose from 'mongoose';

const deliveryCostSchema = new mongoose.Schema({
  dhakaInside: {
    type: Number,
    required: true,
    min: 0,
    default: 60
  },
  dhakaOutside: {
    type: Number,
    required: true,
    min: 0,
    default: 120
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one delivery cost document exists
deliveryCostSchema.pre('save', async function(next) {
  if (this.isNew) {
    // If this is a new document, remove all existing ones
    await this.constructor.deleteMany({});
  }
  next();
});

const DeliveryCost = mongoose.model('DeliveryCost', deliveryCostSchema);

export default DeliveryCost;