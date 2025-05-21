document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailOrUsername = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch("http://localhost:5000/api/auth/login", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emailOrUsername, password }),
                });

                const data = await response.json();
                console.log("Login response data:", data);

                if (response.ok && data.token) {
                    // Store token
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('token', data.token);

                    // Store user role for frontend logic if needed
                    localStorage.setItem('userRole', data.role);
                    sessionStorage.setItem('userRole', data.role);

                    console.log("Token and role stored:", data.token, data.role);

                    // Redirect based on backend-provided role-aware URL
                    const redirectTo = data.redirectUrl || "/dashboard";
                    console.log("Redirecting to:", redirectTo);

                    setTimeout(() => {
                        window.location.href = redirectTo;
                    }, 500);
                } else {
                    document.getElementById('error-message').textContent =
                        data.error || "Invalid credentials";
                }
            } catch (error) {
                console.error('Login error:', error);
                document.getElementById('error-message').textContent =
                    'Something went wrong. Try again.';
            }
        });
    }
});
