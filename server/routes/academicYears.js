import express from 'express';

export default (db) => {
  const router = express.Router();

  // Get all academic years
  router.get('/', async (req, res) => {
    try {
      const years = await db.all('SELECT * FROM academic_years ORDER BY start_date DESC');
      res.json(years);
    } catch (err) {
      console.error('Error fetching academic years:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create academic year
  router.post('/', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { name, start_date, end_date } = req.body;

    try {
      const result = await db.run(
        `INSERT INTO academic_years (name, start_date, end_date)
         VALUES (?, ?, ?)`,
        [name, start_date, end_date]
      );

      const newYear = await db.get(
        'SELECT * FROM academic_years WHERE id = ?',
        [result.lastID]
      );

      res.status(201).json(newYear);
    } catch (err) {
      console.error('Error creating academic year:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update academic year
  router.put('/:id', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { id } = req.params;
    const { name, start_date, end_date } = req.body;

    try {
      await db.run(
        `UPDATE academic_years 
         SET name = ?, start_date = ?, end_date = ?
         WHERE id = ?`,
        [name, start_date, end_date, id]
      );

      const updatedYear = await db.get(
        'SELECT * FROM academic_years WHERE id = ?',
        [id]
      );

      if (!updatedYear) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      res.json(updatedYear);
    } catch (err) {
      console.error('Error updating academic year:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle academic year status
  router.patch('/:id/toggle', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { id } = req.params;

    try {
      const year = await db.get('SELECT active FROM academic_years WHERE id = ?', [id]);
      
      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      await db.run(
        'UPDATE academic_years SET active = ? WHERE id = ?',
        [!year.active, id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error('Error toggling academic year status:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete academic year
  router.delete('/:id', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { id } = req.params;

    try {
      // Check if the academic year exists
      const year = await db.get('SELECT * FROM academic_years WHERE id = ?', [id]);
      
      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      // Check if there are any groups associated with this academic year
      const groups = await db.get(
        'SELECT COUNT(*) as count FROM groups WHERE academic_year_id = ?',
        [id]
      );

      if (groups.count > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar el curso académico porque tiene grupos asociados'
        });
      }

      await db.run('DELETE FROM academic_years WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting academic year:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};