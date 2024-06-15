import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      content: { type: String, required: true },
      type: { type: String, required: true },
      format: { type: String, required: true },
      caption: { type: String }, 
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    status: {
      type: String,
      // enum: ['sent', 'delivered', 'seen'],
      // default: 'sent',
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ], 
    messageReplyDetails: {
      replyMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
      replyMessageUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: Boolean },
    },
  },
  { timestamps: true },
);

export const Message = mongoose.model('Message', messageSchema);    
 