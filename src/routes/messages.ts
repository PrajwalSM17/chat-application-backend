// Message routes
import express, { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { getMessagesForUsers, addMessage, getMessageById, getAllMessages, markMessagesAsRead } from '../services/messageService';

const router = express.Router();

// Get all messages (protected route)
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const messages = await getAllMessages();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation between two users (protected route)
router.get('/conversation/:userId/:otherUserId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.params;
    
    // Verify user is accessing their own conversations
    if (userId !== req.user?.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const messages = await getMessagesForUsers(userId, otherUserId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add this to your messages.ts routes file

// Mark messages as read (protected route)
router.patch('/read/:senderId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { senderId } = req.params;
    const recipientId = req.user?.id;
    
    if (!recipientId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Update messages in the database to mark them as read
    // You'll need to implement this function in your messageService.ts
    const success = await markMessagesAsRead(senderId, recipientId);
    
    res.json({ success });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message (protected route)
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { receiverId, content, isReply = false, replyToId = null, read = false } = req.body;
    const senderId = req.user?.id;
    
    if (!senderId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }
    
    // If it's a reply, make sure the referenced message exists
    if (isReply && replyToId) {
      const originalMessage = await getMessageById(replyToId);
      if (!originalMessage) {
        return res.status(404).json({ message: 'Original message not found' });
      }
    }
    
    // Create and save the new message
    const newMessage = await addMessage({
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isReply,
      replyToId,
      read
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;