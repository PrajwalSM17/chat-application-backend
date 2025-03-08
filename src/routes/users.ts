import express, { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { UserStatus } from '../types';
import { getAllUsers, getUserById, updateUserStatus } from '../services/userService';
import { getUserConversations } from '../services/messageService';

const router = express.Router();

router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', verifyToken, async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: UserStatus };
    const userId = req.params.id;
    
    if (userId !== req.user?.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const validStatuses: UserStatus[] = ['Available', 'Busy', 'Away', 'Offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const success = await updateUserStatus(userId, status);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Status updated successfully', userId, status });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/conversations', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    if (userId !== req.user?.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const conversationUserIds = await getUserConversations(userId);
    const conversations = await Promise.all(
      conversationUserIds.map(id => getUserById(id))
    );
    
    const validConversations = conversations.filter(user => user !== null);
    
    res.json(validConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;