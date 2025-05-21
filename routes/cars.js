const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// POST - Add a car
router.post('/', authMiddleware, async (req, res) => {
    const { make, model, color, year, primary_image } = req.body;

    if (!make || !model || !color || !year) {
        return res.status(400).json({ error: 'Make, model, color, and year are required' });
    }

    try {
        await db.query(
            'INSERT INTO cars (user_id, make, model, color, year, primary_image) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, make, model, color, year, primary_image]
        );
        res.json({ message: 'Car added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding car' });
    }
});

// DELETE - Remove a car
router.delete('/:carId', authMiddleware, async (req, res) => {
    const { carId } = req.params;

    try {
        const result = await db.query('SELECT * FROM cars WHERE id = ? AND user_id = ?', [carId, req.user.id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Car not found or not owned by this user' });
        }

        await db.query('DELETE FROM cars WHERE id = ? AND user_id = ?', [carId, req.user.id]);
        res.json({ message: 'Car removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error removing car' });
    }
});

// GET - List user's cars
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM cars WHERE user_id = ?', [req.user.id]);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching cars' });
    }
});

// PUT - Update car details
router.put('/:carId', authMiddleware, async (req, res) => {
    const { carId } = req.params;
    const { make, model, color, year, primary_image } = req.body;

    if (!make || !model || !color || !year) {
        return res.status(400).json({ error: 'Make, model, color, and year are required' });
    }

    try {
        const result = await db.query('SELECT * FROM cars WHERE id = ? AND user_id = ?', [carId, req.user.id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Car not found or not owned by this user' });
        }

        await db.query(
            'UPDATE cars SET make = ?, model = ?, color = ?, year = ?, primary_image = ? WHERE id = ? AND user_id = ?',
            [make, model, color, year, primary_image, carId, req.user.id]
        );

        res.json({ message: 'Car details updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating car details' });
    }
});

module.exports = router;
