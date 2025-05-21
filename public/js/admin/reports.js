document.addEventListener("DOMContentLoaded", async function () {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      alert("Access denied. Redirecting...");
      window.location.href = "/HTML/LN.html";
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/admin/reports", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });
  
      const data = await response.json();
      renderSection("expiredRegistrationBody", data.expiredRegistrations, 5);
      renderSection("inactiveCarsBody", data.inactiveCars, 5);
      renderSection("topCustomersBody", data.topCustomers, 3);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  
    function renderSection(sectionId, rows, columnCount) {
      const body = document.getElementById(sectionId);
      body.innerHTML = "";
  
      if (!rows || rows.length === 0) {
        body.innerHTML = `<tr><td colspan="${columnCount}">No data available.</td></tr>`;
        return;
      }
  
      rows.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = Object.values(row).map(v => `<td>${v}</td>`).join("");
        body.appendChild(tr);
      });
    }
  });
  