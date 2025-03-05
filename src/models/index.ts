import sequelize from '../config/database';
import User from './Users';
import Message from './Message';

// Define associations if needed
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Export models
export {
  User,
  Message
};

// Export database connection
export default sequelize;