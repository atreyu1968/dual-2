import express from 'express';

export default (db) => {
  const router = express.Router();

  // Get dashboard statistics
  router.get('/stats', async (req, res) => {
    try {
      const [
        { count: users },
        { count: students },
        { count: activities },
        { count: companies }
      ] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM users WHERE active = 1'),
        db.get('SELECT COUNT(*) as count FROM students WHERE active = 1'),
        db.get('SELECT COUNT(*) as count FROM activities WHERE date >= date("now", "-30 days")'),
        db.get('SELECT COUNT(*) as count FROM companies WHERE active = 1')
      ]);

      res.json({
        users,
        students,
        activities,
        companies
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};