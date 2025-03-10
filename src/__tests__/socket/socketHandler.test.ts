import socketHandler from '../../socket/socketHandler';
import { getUserById, updateUserStatus } from '../../services/userService';
import { addMessage, getMessagesForUsers, markMessagesAsRead } from '../../services/messageService';
import jwt from 'jsonwebtoken';

jest.mock('../../services/userService');
jest.mock('../../services/messageService');
jest.mock('jsonwebtoken');

const mockSocketInstance = {
  id: 'socket-id-123',
  data: {
    user: { id: 'user-id-123', username: 'testuser' }
  },
  emit: jest.fn(),
  on: jest.fn((event, callback) => {
    mockSocketEvents[event] = callback;
  }),
  disconnect: jest.fn()
};

const mockSocketEvents: { [key: string]: Function } = {};

const mockIo = {
  use: jest.fn((middleware) => middleware(mockSocketInstance, jest.fn())),
  on: jest.fn((event, callback) => {
    if (event === 'connection') {
      callback(mockSocketInstance);
    }
  }),
  emit: jest.fn(),
  to: jest.fn(() => ({ emit: jest.fn() }))
};

const connectedUsers = new Map();
(global as any).connectedUsers = connectedUsers;

describe('Socket Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocketEvents.login = jest.fn();
    mockSocketEvents['update-status'] = jest.fn();
    mockSocketEvents['send-message'] = jest.fn();
    mockSocketEvents['getConversation'] = jest.fn();
    mockSocketEvents['markMessagesAsRead'] = jest.fn();
    mockSocketEvents.disconnect = jest.fn();
    connectedUsers.clear();
  });

  it('should set up socket middleware for authentication', () => {
    socketHandler(mockIo as any);
    expect(mockIo.use).toHaveBeenCalled();
  });

  it('should set up connection handler', () => {
    socketHandler(mockIo as any);
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('should handle login event correctly', async () => {
    (updateUserStatus as jest.Mock).mockResolvedValue(true);
    (getUserById as jest.Mock).mockResolvedValue({
      id: 'user-id-123',
      username: 'testuser',
      status: 'Available'
    });

    const loginHandler = jest.fn(async (userId: string) => {
      connectedUsers.set(userId, 'socket-id-123');
      await updateUserStatus(userId, 'Available');
      mockIo.emit('status-update', { userId, status: 'Available' });
    });

    loginHandler('user-id-123');

    expect(updateUserStatus).toHaveBeenCalledWith('user-id-123', 'Available');
    expect(mockIo.emit).toHaveBeenCalledWith('status-update', {
      userId: 'user-id-123',
      status: 'Available'
    });
    expect(connectedUsers.get('user-id-123')).toBe('socket-id-123');
  });

  it('should handle sending messages', async () => {
    const mockMessage = {
      id: 'msg-123',
      senderId: 'user-id-123',
      receiverId: 'user-id-456',
      content: 'Test message',
      timestamp: new Date(),
      read: false,
      isReply: false,
      replyToId: null
    };

    (addMessage as jest.Mock).mockResolvedValue(mockMessage);
    connectedUsers.set('user-id-456', 'receiver-socket-id');

    const sendMessageHandler = jest.fn(async (messageData: any) => {
      const newMessage = await addMessage({
        senderId: 'user-id-123',
        receiverId: messageData.receiverId,
        content: messageData.content,
        timestamp: new Date().toISOString(),
        isReply: !!messageData.replyTo,
        replyToId: messageData.replyTo || null,
        read: false
      });

      // Send to receiver
    //   const receiverSocketId = connectedUsers.get(messageData.receiverId);
    //   if (receiverSocketId) {
    //     mockIo.to(receiverSocketId).emit('message', newMessage);
    //   }

      mockSocketInstance.emit('message-sent', newMessage);
    });

    await sendMessageHandler({
      receiverId: 'user-id-456',
      content: 'Test message'
    });

    expect(addMessage).toHaveBeenCalled();
    expect(mockIo.to).toHaveBeenCalledWith('receiver-socket-id');
    expect(mockSocketInstance.emit).toHaveBeenCalledWith('message-sent', mockMessage);
  });

});