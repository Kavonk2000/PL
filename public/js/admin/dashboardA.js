document.addEventListener("DOMContentLoaded", function () {
    console.log("Admin dashboard loaded");
  
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      alert("Access denied. Redirecting...");
      window.location.href = "/HTML/LN.html";
    }
  
    // Future: Fetch and render dashboard summary data here
  });
  