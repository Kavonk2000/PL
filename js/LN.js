// Ensure the DOM is fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for the login form submission
    document.getElementById('login-form').addEventListener('submit', async function (e) {
        e.preventDefault();  // Prevent form from submitting the default way

        // Get the values from the email and password fields
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Make a POST request to the backend API for login
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername: email, password })  // Send email and password as JSON
            });

            // Parse the response from the API
            const data = await response.json();

            if (response.ok) {
                // If login is successful, store the JWT token in localStorage
                localStorage.setItem('auth_token', data.token);
                alert('Login successful!');

                // Redirect the user to the "cars.html" page after successful login
                window.location.href = "cars.html"; 
            } else {
                // If there was an error, display the error message
                document.getElementById('error-message').textContent = data.error;
            }
        } catch (error) {
            console.error('Login error:', error);
            // If there's a network error or other issues, display a generic error message
            document.getElementById('error-message').textContent = 'Something went wrong. Try again.';
        }
    });
});
