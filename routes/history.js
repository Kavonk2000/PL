router.get('/', authMiddleware, async (req, res) => {
    try {
      const result = await db.query(
        'SELECT * FROM car_history WHERE user_id = ? ORDER BY check_in_time DESC',
        [req.user.user_id]
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching check-in/check-out history' });
    }
  });
  