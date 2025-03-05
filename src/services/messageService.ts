import { Message, User } from '../models';
import { Op } from 'sequelize';
import { MessageData } from '../types';

// Get all messages
export const getAllMessages = async () => {
  const messages = await Message.findAll({
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] }
    ]
  });
  
  return messages.map(message => message.get({ plain: true }));
};

// Get message by ID
export const getMessageById = async (id: string) => {
  const message = await Message.findByPk(id, {
    include: [  
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] }
    ]
  });
  
  return message ? message.get({ plain: true }) : null;
};

// Get messages between two users
export const getMessagesForUsers = async (user1Id: string, user2Id: string) => {
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        {
          senderId: user1Id,
          receiverId: user2Id
        },
        {
          senderId: user2Id,
          receiverId: user1Id
        }
      ]
    },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] },
      { model: Message, as: 'replyTo' }
    ],
    order: [['createdAt', 'ASC']]
  });
  console.log('whats in messages-->',messages);
  return messages.map(message => message.get({ plain: true }));
};

// Add a new message
export const addMessage = async (messageData: MessageData) => {
  const newMessage = await Message.create({
    senderId: messageData.senderId,
    receiverId: messageData.receiverId,
    content: messageData.content,
    isReply: messageData.isReply,
    replyToId: messageData.replyToId,
    read: messageData.read || false,
  });
  
  // Fetch the complete message with associations
  const messageWithAssociations = await Message.findByPk(newMessage.id, {
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] },
      { model: Message, as: 'replyTo' }
    ]
  });
  
  return messageWithAssociations?.get({ plain: true });
};

// Add this to your messageService.ts file

// Mark messages as read
export const markMessagesAsRead = async (senderId: string, recipientId: string): Promise<boolean> => {
    try {
      // Update all unread messages from senderId to recipientId
      // You might want to add a 'read' column to your messages table
      // For now, let's assume we have that column
      const [updatedCount] = await Message.update(
        { read: true },
        {
          where: {
            senderId,
            receiverId: recipientId,
            read: false
          }
        }
      );
      
      return updatedCount > 0;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  };
// Get users with whom a user has conversations
export const getUserConversations = async (userId: string) => {
  // Find all unique users that the specified user has exchanged messages with
  const sentMessages = await Message.findAll({
    attributes: ['receiverId'],
    where: { senderId: userId },
    group: ['receiverId']
  });
  
  const receivedMessages = await Message.findAll({
    attributes: ['senderId'],
    where: { receiverId: userId },
    group: ['senderId']
  });
  
  
  // Extract user IDs
  const senderIds = receivedMessages.map(msg => msg.getDataValue('senderId'));
  const receiverIds = sentMessages.map(msg => msg.getDataValue('receiverId'));
  
  // Combine and remove duplicates
  const userIds = [...new Set([...senderIds, ...receiverIds])];
  
  return userIds;
};