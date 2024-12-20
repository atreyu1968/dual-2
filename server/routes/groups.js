import express from 'express';

export default (db) => {
  const router = express.Router();

  // Get all groups
  router.get('/', async (req, res) => {
    try {
      const query = `
        SELECT g.*,
               ay.name as academic_year_name,
               COUNT(s.id) as student_count
        FROM groups g
        JOIN academic_years ay ON g.academic_year_id = ay.id
        LEFT JOIN students s ON s.group_id = g.id
        GROUP BY g.id
        ORDER BY g.created_at DESC
      `;
      
      const groups = await db.all(query);
      res.json(groups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create group
  router.post('/', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    try {
      const activeYear = await db.get(
        'SELECT id FROM academic_years WHERE active = 1'
      );

      if (!activeYear) {
        return res.status(400).json({ error: 'No active academic year found' });
      }

      const { name } = req.body;
      
      const result = await db.run(
        'INSERT INTO groups (name, academic_year_id) VALUES (?, ?)',
        [name, activeYear.id]
      );

      const newGroup = await db.get(
        'SELECT * FROM groups WHERE id = ?',
        [result.lastID]
      );

      res.status(201).json(newGroup);
    } catch (err) {
      console.error('Error creating group:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update group
  router.put('/:id', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    try {
      const { id } = req.params;
      const { name } = req.body;

      await db.run(
        'UPDATE groups SET name = ? WHERE id = ?',
        [name, id]
      );

      const updatedGroup = await db.get(
        'SELECT * FROM groups WHERE id = ?',
        [id]
      );

      if (!updatedGroup) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json(updatedGroup);
    } catch (err) {
      console.error('Error updating group:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle group status
  router.patch('/:id/toggle', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { id } = req.params;

    try {
      const group = await db.get('SELECT active FROM groups WHERE id = ?', [id]);
      
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      await db.run(
        'UPDATE groups SET active = ? WHERE id = ?',
        [!group.active, id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error('Error toggling group status:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete group
  router.delete('/:id', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { id } = req.params;

    try {
      // Check if the group exists
      const group = await db.get('SELECT * FROM groups WHERE id = ?', [id]);
      
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      // Check if there are any students in this group
      const students = await db.get(
        'SELECT COUNT(*) as count FROM students WHERE group_id = ?',
        [id]
      );

      if (students.count > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar el grupo porque tiene estudiantes asociados'
        });
      }

      await db.run('DELETE FROM groups WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting group:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};