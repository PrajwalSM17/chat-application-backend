import { testConnection } from '../config/database';

const testDbConnection = async (): Promise<void> => {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection test completed. Press Ctrl+C to exit.');
  } catch (error) {
    console.error('Failed to test database connection:', error);
    process.exit(1);
  }
};

testDbConnection();