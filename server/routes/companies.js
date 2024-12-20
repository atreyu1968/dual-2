import express from 'express';

export default (db) => {
  const router = express.Router();

  // Get all companies
  router.get('/', async (req, res) => {
    try {
      const companies = await db.all('SELECT * FROM companies');
      const workCenters = await db.all('SELECT * FROM work_centers');
      
      const companiesWithCenters = companies.map(company => ({
        ...company,
        work_centers: workCenters.filter(wc => wc.company_id === company.id)
      }));
      
      res.json(companiesWithCenters);
    } catch (err) {
      console.error('Error fetching companies:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create company
  router.post('/', async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const { name, legal_name, tax_id, address, city, postal_code, phone, email, website } = req.body;
    
    try {
      const result = await db.run(
        `INSERT INTO companies (name, legal_name, tax_id, address, city, postal_code, phone, email, website)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, legal_name, tax_id, address, city, postal_code, phone, email, website]
      );

      const newCompany = await db.get(
        'SELECT * FROM companies WHERE id = ?',
        [result.lastID]
      );

      res.status(201).json({ ...newCompany, work_centers: [] });
    } catch (err) {
      console.error('Error creating company:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};