router.post('/', authMiddleware, async (req, res) => {
    const { carMake, carModel, color, primaryImage } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO cars (user_id, make, model, color, primary_image) VALUES (?, ?, ?, ?, ?)',
        [req.user.user_id, carMake, carModel, color, primaryImage]
      );
      res.json({ message: 'Car added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error adding car' });
    }
  });
  
router.delete('/:carId', authMiddleware, async (req, res) => {
    const { carId } = req.params;
    try {
      await db.query('DELETE FROM cars WHERE car_id = ? AND user_id = ?', [carId, req.user.user_id]);
      res.json({ message: 'Car removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error removing car' });
    }
  });
  