// Socket handler for WebSocket connections
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getUserById, updateUserStatus } from '../data/users';
import { addMessage, getMessagesForUsers } from '../data/messages';
import { 
  ConversationPayload, 
  PrivateMessagePayload, 
  ReplyMessagePayload, 
  StatusChangePayload,
  UserStatus,
  UserWithoutPassword
} from '../types';

// To track connected users and their socket IDs
const connectedUsers = new Map<string, string>();

export default (io: SocketIOServer): void => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);
    
    // Handle user login
    socket.on('login', (userId: string) => {
      console.log(`User ${userId} logged in`);
      
      // Store socket ID with user ID
      connectedUsers.set(userId, socket.id);
      
      // Update user status to "Available"
      updateUserStatus(userId, 'Available');
      
      // Broadcast to all users that this user is now online
      io.emit('userStatusChanged', { userId, status: 'Available' });
      
      // Send list of online users to the just connected user
      const onlineUsers: UserWithoutPassword[] = [];
      for (const [id, _] of connectedUsers) {
        const user = getUserById(id);
        if (user) {
          onlineUsers.push(user);
        }
      }
      
      socket.emit('onlineUsers', onlineUsers);
    });
    
    // Handle status change
    socket.on('statusChange', ({ userId, status }: StatusChangePayload) => {
      updateUserStatus(userId, status);
      io.emit('userStatusChanged', { userId, status });
    });
    
    // Handle private message
    socket.on('privateMessage', ({ senderId, receiverId, message }: PrivateMessagePayload) => {
      console.log(`Private message from ${senderId} to ${receiverId}: ${message}`);
      
      // Save message to "database"
      const newMessage = addMessage({
        senderId,
        receiverId,
        content: message,
        timestamp: new Date().toISOString(),
        isReply: false,
        replyToId: null
      });
      
      // Send to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);
      }
      
      // Also send back to sender to confirm delivery
      socket.emit('messageSent', newMessage);
    });
    
    // Handle message reply
    socket.on('replyMessage', ({ senderId, receiverId, message, replyToId }: ReplyMessagePayload) => {
      // Save reply to "database"
      const newReply = addMessage({
        senderId,
        receiverId,
        content: message,
        timestamp: new Date().toISOString(),
        isReply: true,
        replyToId
      });
      
      // Send to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newReply);
      }
      
      // Also send back to sender
      socket.emit('messageSent', newReply);
    });
    
    // Handle get conversation history
    socket.on('getConversation', ({ userId, otherUserId }: ConversationPayload) => {
      const messages = getMessagesForUsers(userId, otherUserId);
      socket.emit('conversationHistory', { userId: otherUserId, messages });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find the user ID associated with this socket
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      
      if (disconnectedUserId) {
        // Remove from connected users
        connectedUsers.delete(disconnectedUserId);
        
        // Update status to offline
        updateUserStatus(disconnectedUserId, 'Offline');
        
        // Notify other users
        io.emit('userStatusChanged', { userId: disconnectedUserId, status: 'Offline' });
      }
    });
  });
};