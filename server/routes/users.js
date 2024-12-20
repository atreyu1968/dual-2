import express from 'express';
import { hashPassword, comparePasswords } from '../utils/passwords.js';

export default (db, broadcastUpdate) => {
  const router = express.Router();

  // Get company tutors
  router.get('/company-tutors', async (req, res) => {
    try {
      const tutors = await db.all(
        `SELECT id, username, role, email, phone, full_name
         FROM users 
         WHERE role = 'company_tutor' AND active = 1
         ORDER BY full_name`
      );
      res.json(tutors);
    } catch (err) {
      console.error('Error fetching company tutors:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Change password
  router.post('/:id/change-password', async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Only allow users to change their own password unless admin
      if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
        return res.sendStatus(403);
      }

      const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // If not admin, verify current password
      if (req.user.role !== 'admin') {
        const isValid = await comparePasswords(currentPassword, user.password);
        if (!isValid) {
          return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        }
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      await db.run(
        'UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?',
        [hashedPassword, id]
      );
      
      // Get updated user data
      const updatedUser = await db.get(
        'SELECT id, username, role, must_change_password FROM users WHERE id = ?',
        [id]
      );

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all users
  router.get('/', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    try {
      const users = await db.all(
        'SELECT id, username, role, active, email, phone, full_name, department, created_at FROM users'
      );
      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create user
  router.post('/', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { username, password, role, email, phone, full_name, department } = req.body;
    
    try {
      const hashedPassword = await hashPassword(password);
      
      const result = await db.run(
        `INSERT INTO users (username, password, role, email, phone, full_name, department)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, hashedPassword, role, email, phone, full_name, department]
      );
      
      const newUser = await db.get(
        'SELECT id, username, role, active, email, phone, full_name, department, created_at FROM users WHERE id = ?',
        [result.lastID]
      );
      
      broadcastUpdate('users');
      res.json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};