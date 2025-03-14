import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth';
import { createUser, getUserByEmail } from '../../services/userService';
import jwt from 'jsonwebtoken';

jest.mock('../../services/userService');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        status: 'Offline'
      });
      
      const mockCompare = jest.fn().mockResolvedValue(true);
      require('bcryptjs').compareSync = mockCompare;
      
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'fake-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'user-123');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 with invalid credentials', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        status: 'Offline'
      });
      
      const mockCompare = jest.fn().mockResolvedValue(false);
      require('bcryptjs').compareSync = mockCompare;

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register successfully with valid credentials', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      
      const mockCompare = jest.fn().mockResolvedValue(true);
      require('bcryptjs').compareSync = mockCompare;
      
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'fake-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 'user-123');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 with invalid credentials', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        status: 'Offline'
      });
      
      const mockCompare = jest.fn().mockResolvedValue(false);
      require('bcryptjs').compareSync = mockCompare;

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

});