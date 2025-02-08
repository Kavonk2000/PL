const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you're using db.js for your database connection
const authMiddleware = require('../middleware/authMiddleware'); // Assuming authMiddleware is set up

// POST - Add a car
router.post('/', authMiddleware, async (req, res) => {
    const { make, model, color, year, primary_picture } = req.body;

    // Basic validation
    if (!make || !model || !color || !year) {  // Add year validation
        return res.status(400).json({ error: 'Make, model, color, and year are required' });
    }

    try {
        // Insert the car into the database
        await db.query(
            'INSERT INTO cars (user_id, make, model, color, year, primary_picture) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, make, model, color, year, primary_picture] // Correct user_id reference and added year
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

    // Validate that carId is provided
    if (!carId) {
        return res.status(400).json({ error: 'Car ID is required' });
    }

    try {
        // Check if the car exists and belongs to the user
        const result = await db.query('SELECT * FROM cars WHERE car_id = ? AND user_id = ?', [carId, req.user.id]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Car not found or not owned by this user' });
        }

        // Proceed to delete the car
        await db.query('DELETE FROM cars WHERE car_id = ? AND user_id = ?', [carId, req.user.id]);
        res.json({ message: 'Car removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error removing car' });
    }
});

// GET - List cars (Optional, useful to display user's cars in the garage)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch all cars belonging to the logged-in user
        const result = await db.query('SELECT * FROM cars WHERE user_id = ?', [req.user.id]);
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'No cars found for this user' });
        }

        // Return the list of cars
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching cars' });
    }
});

// PUT - Update car details
router.put('/:carId', authMiddleware, async (req, res) => {
    const { carId } = req.params;
    const { make, model, color, year, primary_picture } = req.body;

    // Validate required fields
    if (!make || !model || !color || !year) {  // Add year validation
        return res.status(400).json({ error: 'Make, model, color, and year are required' });
    }

    try {
        // Check if the car exists and belongs to the user
        const result = await db.query('SELECT * FROM cars WHERE car_id = ? AND user_id = ?', [carId, req.user.user_id]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Car not found or not owned by this user' });
        }

        // Update car details
        await db.query(
            'UPDATE cars SET make = ?, model = ?, color = ?, year = ?, primary_picture = ? WHERE car_id = ? AND user_id = ?',
            [make, model, color, year, primary_picture, car_id, req.user.user_id]  // Add year and ensure primary_picture is correct
        );

        res.json({ message: 'Car details updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating car details' });
    }
});

module.exports = router;
