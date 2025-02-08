document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for the car update form submission
    document.getElementById('update-car-form').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent form from reloading the page

        // Get the values of the form inputs
        const make = document.getElementById('make').value; // Car make
        const model = document.getElementById('model').value; // Car model
        const year = document.getElementById('year').value; // Car year
        const color = document.getElementById('color').value; // Car color
        const carId = document.getElementById('carId').value; // Car ID (from hidden input or elsewhere)

        try {
            // Send the updated car data to the server via a PUT request
            const response = await fetch('http://localhost:5000/api/cars/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Include JWT token for authentication
                },
                body: JSON.stringify({
                    car_id,
                    make,
                    model,
                    year,
                    color,
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Car updated successfully!');
                // Redirect to another page or update the UI
            } else {
                document.getElementById('error-message').textContent = data.error || 'Something went wrong.';
            }
        } catch (error) {
            console.error('Update car error:', error);
            document.getElementById('error-message').textContent = 'Error updating car. Please try again.';
        }
    });
});
