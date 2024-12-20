import express from 'express';

export default (db) => {
  const router = express.Router();

  // Get all students
  router.get('/', async (req, res) => {
    try {
      const query = `
        SELECT s.*, g.name as group_name
        FROM students s
        JOIN groups g ON s.group_id = g.id
        JOIN academic_years ay ON g.academic_year_id = ay.id
        WHERE ay.active = 1
      `;
      
      const students = await db.all(query);
      res.json(students);
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create student
  router.post('/', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    try {
      const { cial, dni, nuss, full_name, email, phone, group_id } = req.body;
      
      const result = await db.run(
        `INSERT INTO students (cial, dni, nuss, full_name, email, phone, group_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cial, dni, nuss, full_name, email, phone, group_id]
      );

      const newStudent = await db.get(
        `SELECT s.*, g.name as group_name
         FROM students s
         JOIN groups g ON s.group_id = g.id
         WHERE s.id = ?`,
        [result.lastID]
      );

      res.status(201).json(newStudent);
    } catch (err) {
      console.error('Error creating student:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};