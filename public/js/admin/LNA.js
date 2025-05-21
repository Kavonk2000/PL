document.getElementById("adminLoginForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();
  
    // Temporary hardcoded login check (replace later with real API call)
    if (username === "admin" && password === "admin123") {
      window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
      document.getElementById("errorMessage").classList.remove("hidden");
    }
  });
  