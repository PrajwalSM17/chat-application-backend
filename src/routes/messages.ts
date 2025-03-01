// Message routes
import express, { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { getMessagesForUsers, addMessage, getMessageById } from '../data/messages';

const router = express.Router();

// Get conversation between two users (protected route)
router.get('/conversation/:userId/:otherUserId', verifyToken, (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.params;
    
    // Verify user is accessing their own conversations
    if (userId !== req.user?.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const messages = getMessagesForUsers(userId, otherUserId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message (protected route)
router.post('/', verifyToken, (req: Request, res: Response) => {
  try {
    const { receiverId, content, isReply = false, replyToId = null } = req.body;
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
      const originalMessage = getMessageById(replyToId);
      if (!originalMessage) {
        return res.status(404).json({ message: 'Original message not found' });
      }
    }
    
    // Create and save the new message
    const newMessage = addMessage({
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isReply,
      replyToId
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;