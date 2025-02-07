router.get('/:carId/location', authMiddleware, async (req, res) => {
    const { carId } = req.params;
    try {
      const result = await db.query(
        'SELECT location FROM car_location WHERE car_id = ?',
        [carId]
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching car location' });
    }
  });
  