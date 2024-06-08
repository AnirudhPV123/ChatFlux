import { CustomResponse } from '../utils/CustomResponse.js';
import { asyncErrorHandler } from '../utils/asyncErrorHandler.js';
import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { getReceiverSocketId, getSocketIds, io } from '../socket/socket.js';
import mongoose from 'mongoose';

// @DESC Send a message between users and handle socket communication
// @METHOD POST
// @PATH /message/send/:id (id - receiverId)
// @RETURN Created newMessage
export const sendMessage = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const { message } = req.body;

  // Find or create conversation between sender and receiver
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroupChat: false,
  });

  const newMessage = await Message.create({
    senderId,
    receiverId,
    conversationId: conversation._id,
    message,
    status:"sent"
  });

  // Update conversation with new message
  conversation.messages.push(newMessage._id);
  await conversation.save();

  //   SOCKET.IO
  const receiverSocketId = getReceiverSocketId(receiverId);

  // send new message to receiver
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('new_message', newMessage);
  }

  return res.status(201).json(new CustomResponse(201, newMessage));
});

// @DESC Get messages between the specific users
// @METHOD GET
// @PATH /message/:id (id - receiverId)
// @RETURN Array of messages belonging to the conversation between the users
export const getMessage = asyncErrorHandler(async (req, res, next) => {
  const receiverId = req.params.id;
  const senderId = req.user._id;

  // check status is seen , otherwise update status to seen
  const updateStatus = await Message.updateMany(
    {
      senderId: req.params.id, // only change status the message send by opposite user , in this case the getMessage called is receiver
      receiverId: req.user._id,
      status: { $ne: 'seen' },
    },
    {
      $set: { status: 'seen' },
    },
  );

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroupChat: false,
  }).populate('messages');

  // the user call getMessage is sender and other is receiver thats why we use like this
  // actually receiverId is the senderId of message
  const socketId = getReceiverSocketId(receiverId);
  // send status update to sender
  if (updateStatus.modifiedCount > 0) {
    io.to(socketId).emit('message_status_update_from_backend_to_sender', conversation._id, 'seen');
  }

  return res.status(200).json(new CustomResponse(200, conversation?.messages));
});

// @DESC Send group messages and handle socket communication
// @METHOD POST
// @PATH /message/send-group/:id (id - groupId)
// @RETURN Created newMessage
export const sendGroupMessage = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const groupId = req.params.id;
  const { message } = req.body;

  // add all participants id to notification array and whenever the participant seen the message their id remove from notification
  // used to track whether participant seen the message or not and show notification
  const group = await Conversation.findById(groupId)

  const notifications = group.participants.filter((participant)=>!(participant._id).equals(senderId))

  let newMessage = await Message.create({ senderId, groupId, message ,notifications});

  // Update conversation with new message
  let conversation = await Conversation.findById(groupId);
  conversation.messages.push(newMessage._id);
  await conversation.save();

  newMessage = await Message.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(newMessage._id) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'senderDetails',
      },
    },
    {
      $unwind: '$senderDetails',
    },
    {
      $project: {
        'senderDetails.password': 0,
        'senderDetails.gender': 0,
        'senderDetails.isActive': 0,
        'senderDetails.createdAt': 0,
        'senderDetails.updatedAt': 0,
        'senderDetails.__v': 0,
        'senderDetails.refreshToken': 0,
      },
    },
  ]);

  //   SOCKET.IO
  let socketIds = getSocketIds();

  conversation.participants.forEach((userId) => {
    // to prevent emit message to the senderItself
    if (req.user._id.equals(userId)) {
      return;
    }

    const socketId = socketIds[userId]; // Assuming userId directly corresponds to index in socketIds array
    if (socketId) {
      io.to(socketId).emit('new_message', newMessage[0]);
    }
  });

  res.status(201).json(new CustomResponse(201, newMessage[0]));
});

// @DESC Get group messages
// @METHOD GET
// @PATH /message/group/:id (id - groupId)
// @RETURN Array of group messages
export const getGroupMessage = asyncErrorHandler(async (req, res, next) => {
  const groupId = req.params.id;

const check = await Message.updateMany(
  { groupId: groupId },
  { $pull: { notifications: req.user._id } },
);

  const conversation = await Conversation.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(groupId)},
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'messages',
        foreignField: '_id',
        as: 'messageDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'messageDetails.senderId',
        foreignField: '_id',
        as: 'senderDetails',
      },
    },
    {
      $project: {
        messages: {
          $map: {
            input: '$messageDetails',
            as: 'message',
            in: {
              $mergeObjects: [
                {
                  senderId: '$$message.senderId',
                  message: '$$message.message',
                  groupId: '$$message.groupId',
                  createdAt: '$$message.createdAt',
                  updatedAt: '$$message.updatedAt',
                  _id: '$$message._id',
                },
                {
                  senderDetails: {
                    $let: {
                      vars: {
                        sender: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$senderDetails',
                                as: 'sender',
                                cond: { $eq: ['$$sender._id', '$$message.senderId'] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        _id: '$$sender._id',
                        phoneNumber: '$$sender.phoneNumber',
                        userName: '$$sender.userName',
                        avatar: '$$sender.avatar',
                        // Add other fields you want to include, but exclude password and refreshToken
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  ]);

  res.status(200).json(new CustomResponse(200, conversation[0].messages));
});










/*

[
  {
    $match: { _id: ObjectId('666369b6fa0ec48b72f972ae') }
  },
  {
    $lookup: {
      from: 'messages',
      localField: 'messages',
      foreignField: '_id',
      as: 'messageDetails'
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'messageDetails.senderId',
      foreignField: '_id',
      as: 'senderDetails'
    }
  },
  {
    $project: {
      messages: {
        $map: {
          input: '$messageDetails',
          as: 'message',
          in: {
            $mergeObjects: [
              '$$message',
              {
                senderDetails: {
                  $let: {
                    vars: {
                      sender: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$senderDetails',
                              as: 'sender',
                              cond: { $eq: ['$$sender._id', '$$message.senderId'] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: {
                      _id: '$$sender._id',
                      phoneNumber: '$$sender.phoneNumber',
                      userName: '$$sender.userName',
                      avatar: '$$sender.avatar',
                      // Add other fields you want to include, but exclude password and refreshToken
                    }
                  }
                },
                notifications: {
                  $filter: {
                    input: '$$message.notifications',
                    as: 'notification',
                    cond: { $ne: ['$$notification', ObjectId('666369b6fa0ec48b72f972ae')] } // Replace USER_ID_TO_REMOVE with the actual user ID
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
]


*/