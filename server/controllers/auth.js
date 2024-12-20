import { generateToken } from '../utils/tokens.js';
import { comparePasswords } from '../utils/passwords.js';

export const loginController = async (req, res, db) => {
  const { identifier, password } = req.body;
  
  console.log('Login attempt for:', identifier);
  
  try {
    const user = await db.get(
      `SELECT * FROM users WHERE (username = ? OR email = ?) AND active = 1`,
      [identifier, identifier]
    );

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Comparing passwords...');
    if (!user || !(await comparePasswords(password, user.password))) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.username);
    const token = generateToken(user);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        must_change_password: user.must_change_password 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};