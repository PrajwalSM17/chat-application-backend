import sequelize, { testConnection } from './database';
import bcrypt from 'bcryptjs';
import { User, Message } from '../models';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await testConnection();
    
    await sequelize.sync({ force: false, alter: true });
    console.log('Database synced successfully.');
    
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('Creating sample users...');
      
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('password123', salt);
      
      const bharath = await User.create({
        username: 'Bharath',
        email: 'bharth@simpleuser.com',
        password: hashedPassword,
        status: 'Offline'
      });
      
      const hanumanth = await User.create({
        username: 'hanumanth',
        email: 'hanumanth@example.com',
        password: hashedPassword,
        status: 'Offline'
      });
      
      const arvind = await User.create({
        username: 'arvind',
        email: 'arvinf@example.com',
        password: hashedPassword,
        status: 'Offline'
      });
      
      console.log('Sample users created.');
      
      console.log('Creating sample messages...');
      
      await Message.create({
        senderId: bharath.id,
        receiverId: bharath.id,
        content: 'Hey Bharath, how are you?',
        isReply: false,
        replyToId: null,
        read: false
      });
      
      await Message.create({
        senderId: hanumanth.id,
        receiverId: hanumanth.id,
        content: 'Hi Hanumanth! I\'m good, thanks for asking!',
        isReply: false,
        replyToId: null,
        read: false
      });
      
      const ArvindMessage = await Message.create({
        senderId: bharath.id,
        receiverId: hanumanth.id,
        content: 'Bharath, do you have time for a meeting today?',
        isReply: false,
        replyToId: null,
        read: false
      });
      
      await Message.create({
        senderId: arvind.id,
        receiverId: hanumanth.id,
        content: 'Sure Hanumanth, how about 2 PM?',
        isReply: true,
        replyToId: ArvindMessage.id,
        read: false
      });
      
      console.log('Sample messages created.');
    }
    
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};