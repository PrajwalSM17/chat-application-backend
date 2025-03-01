// Authentication routes
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginCredentials, UserRegistrationData } from '../types';
import { getUserByEmail, getUserByUsername, createUser } from '../data/users';

const router = express.Router();

// JWT secret key (in production, store this in environment variables)
const JWT_SECRET = 'your-secret-key';

// Register a new user
router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as UserRegistrationData;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    if (getUserByEmail(email)) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    if (getUserByUsername(username)) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Create new user
    const newUser = createUser({ username, email, password });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginCredentials;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;