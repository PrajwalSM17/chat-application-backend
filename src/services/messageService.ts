import { Message, User } from '../models';
import { Op } from 'sequelize';
import { MessageData } from '../types';

export const getAllMessages = async () => {
  const messages = await Message.findAll({
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] }
    ]
  });
  
  return messages.map(message => message.get({ plain: true }));
};

export const getMessageById = async (id: string) => {
  const message = await Message.findByPk(id, {
    include: [  
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] }
    ]
  });
  
  return message ? message.get({ plain: true }) : null;
};

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

export const addMessage = async (messageData: MessageData) => {
  const newMessage = await Message.create({
    senderId: messageData.senderId,
    receiverId: messageData.receiverId,
    content: messageData.content,
    isReply: messageData.isReply,
    replyToId: messageData.replyToId,
    read: messageData.read || false,
  });
  
  const messageWithAssociations = await Message.findByPk(newMessage.id, {
    include: [
      { model: User, as: 'sender', attributes: ['id', 'username'] },
      { model: User, as: 'receiver', attributes: ['id', 'username'] },
      { model: Message, as: 'replyTo' }
    ]
  });
  
  return messageWithAssociations?.get({ plain: true });
};
export const markMessagesAsRead = async (senderId: string, recipientId: string): Promise<boolean> => {
    try {
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
export const getUserConversations = async (userId: string) => {
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
  
  const senderIds = receivedMessages.map(msg => msg.getDataValue('senderId'));
  const receiverIds = sentMessages.map(msg => msg.getDataValue('receiverId'));
  const userIds = [...new Set([...senderIds, ...receiverIds])];
  
  return userIds;
};