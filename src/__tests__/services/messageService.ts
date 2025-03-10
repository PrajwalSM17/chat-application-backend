import { getMessageById, getMessagesForUsers, addMessage, markMessagesAsRead } from '../../services/messageService';
import Message  from '../../models/Message';
import { Op } from 'sequelize';

jest.mock('../../models/Message', () => ({
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
}));

describe('Message Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessageById', () => {
    it('should return a message when it exists', async () => {
      const mockMessage = {
        id: 'msg1',
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Hello',
        timestamp: new Date(),
        read: false,
        isReply: false,
        replyToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        get: jest.fn().mockReturnValue({
          id: 'msg1',
          senderId: 'user1',
          receiverId: 'user2',
          content: 'Hello',
          timestamp: new Date(),
          read: false,
          isReply: false,
          replyToId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      (Message.findByPk as jest.Mock).mockResolvedValue(mockMessage);

      const result = await getMessageById('msg1');

      expect(Message.findByPk).toHaveBeenCalledWith('msg1', expect.any(Object));
      expect(result).toBeDefined();
      expect(result?.id).toBe('msg1');
      expect(result?.content).toBe('Hello');
    });

    it('should return null when message does not exist', async () => {
      (Message.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await getMessageById('nonexistent');

      expect(Message.findByPk).toHaveBeenCalledWith('nonexistent', expect.any(Object));
      expect(result).toBeNull();
    });
  });

  describe('getMessagesForUsers', () => {
    it('should return messages between two users', async () => {
      const mockMessages = [
        {
          id: 'msg1',
          senderId: 'user1',
          receiverId: 'user2',
          content: 'Hello',
          timestamp: new Date(),
          read: false,
          isReply: false,
          replyToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          get: jest.fn().mockReturnValue({
            id: 'msg1',
            senderId: 'user1',
            receiverId: 'user2',
            content: 'Hello',
            timestamp: new Date(),
            read: false,
            isReply: false,
            replyToId: null
          })
        },
        {
          id: 'msg2',
          senderId: 'user2',
          receiverId: 'user1',
          content: 'Hi there!',
          timestamp: new Date(),
          read: true,
          isReply: false,
          replyToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          get: jest.fn().mockReturnValue({
            id: 'msg2',
            senderId: 'user2',
            receiverId: 'user1',
            content: 'Hi there!',
            timestamp: new Date(),
            read: true,
            isReply: false,
            replyToId: null
          })
        }
      ];

      (Message.findAll as jest.Mock).mockResolvedValue(mockMessages);

      const result = await getMessagesForUsers('user1', 'user2');

      expect(Message.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          [Op.or]: [
            {
              senderId: 'user1',
              receiverId: 'user2'
            },
            {
              senderId: 'user2',
              receiverId: 'user1'
            }
          ]
        }
      }));
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg1');
      expect(result[1].id).toBe('msg2');
    });
  });

  describe('addMessage', () => {
    it('should create and return a new message', async () => {
      const messageData = {
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Hello',
        timestamp: new Date().toISOString(),
        isReply: false,
        replyToId: null,
        read: false
      };

      const newMessage = {
        id: 'new-msg-id',
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockCreatedMessage = {
        ...newMessage,
        get: jest.fn().mockReturnThis
      };

      const mockMessageWithAssociations = {
        ...newMessage,
        sender: { id: 'user1', username: 'user1name' },
        receiver: { id: 'user2', username: 'user2name' },
        get: jest.fn().mockReturnValue({
          ...newMessage,
          sender: { id: 'user1', username: 'user1name' },
          receiver: { id: 'user2', username: 'user2name' }
        })
      };

      (Message.create as jest.Mock).mockResolvedValue(mockCreatedMessage);
      (Message.findByPk as jest.Mock).mockResolvedValue(mockMessageWithAssociations);

      const result = await addMessage(messageData);

      expect(Message.create).toHaveBeenCalledWith(expect.objectContaining({
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Hello',
        isReply: false,
        replyToId: null,
        read: false
      }));
      expect(Message.findByPk).toHaveBeenCalledWith('new-msg-id', expect.any(Object));
      expect(result).toBeDefined();
      expect(result?.id).toBe('new-msg-id');
      expect(result?.senderId).toBe('user1name');
      expect(result?.receiverId).toBe('user2name');
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read and return true on success', async () => {
      (Message.update as jest.Mock).mockResolvedValue([2]);

      const result = await markMessagesAsRead('user1', 'user2');

      expect(Message.update).toHaveBeenCalledWith(
        { read: true },
        {
          where: {
            senderId: 'user1',
            receiverId: 'user2',
            read: false
          }
        }
      );
      expect(result).toBe(true);
    });

    it('should return false when no messages are updated', async () => {
      (Message.update as jest.Mock).mockResolvedValue([0]);

      const result = await markMessagesAsRead('user1', 'user2');

      expect(Message.update).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors and return false', async () => {
      (Message.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await markMessagesAsRead('user1', 'user2');

      expect(Message.update).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});