import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isVideo: {
      type: Boolean,
    },
    isAttend: {
      type: Boolean,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
  },
  { timestamps: true },
);

export const Call = mongoose.model('Call', callSchema);
