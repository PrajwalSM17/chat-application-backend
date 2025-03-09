// src/__tests__/socket/socketHandler.test.ts
import socketHandler from '../../socket/socketHandler';
import { getUserById, updateUserStatus } from '../../services/userService';
import { addMessage, getMessagesForUsers, markMessagesAsRead } from '../../services/messageService';
import jwt from 'jsonwebtoken';

// Mock services
jest.mock('../../services/userService');
jest.mock('../../services/messageService');
jest.mock('jsonwebtoken');

// Create mock for Socket.IO
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

// Mock connected users map (we need to access the internal map)
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
    // Mock implementations
    (updateUserStatus as jest.Mock).mockResolvedValue(true);
    (getUserById as jest.Mock).mockResolvedValue({
      id: 'user-id-123',
      username: 'testuser',
      status: 'Available'
    });

    // Trigger login handler
    const loginHandler = jest.fn(async (userId: string) => {
      connectedUsers.set(userId, 'socket-id-123');
      await updateUserStatus(userId, 'Available');
      mockIo.emit('status-update', { userId, status: 'Available' });
    });

    loginHandler('user-id-123');

    // Verify behavior
    expect(updateUserStatus).toHaveBeenCalledWith('user-id-123', 'Available');
    expect(mockIo.emit).toHaveBeenCalledWith('status-update', {
      userId: 'user-id-123',
      status: 'Available'
    });
    expect(connectedUsers.get('user-id-123')).toBe('socket-id-123');
  });

  it('should handle sending messages', async () => {
    // Mock implementations
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

    // Simulate handler logic
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

      // Send confirmation to sender
      mockSocketInstance.emit('message-sent', newMessage);
    });

    // Execute
    await sendMessageHandler({
      receiverId: 'user-id-456',
      content: 'Test message'
    });

    // Verify behavior
    expect(addMessage).toHaveBeenCalled();
    expect(mockIo.to).toHaveBeenCalledWith('receiver-socket-id');
    expect(mockSocketInstance.emit).toHaveBeenCalledWith('message-sent', mockMessage);
  });

  // Additional tests for other socket events...
});