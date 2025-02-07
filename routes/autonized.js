router.post('/', authMiddleware, async (req, res) => {
    const { name, relationship, contactInfo } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO authorized_persons (user_id, name, relationship, contact_info) VALUES (?, ?, ?, ?)',
        [req.user.user_id, name, relationship, contactInfo]
      );
      res.json({ message: 'Authorized person added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error adding authorized person' });
    }
  });
  