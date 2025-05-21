document.addEventListener("DOMContentLoaded", async function () {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      alert("Access denied. Redirecting...");
      window.location.href = "/HTML/LN.html";
      return;
    }
  
    const tableBody = document.querySelector("#requestsTable tbody");
  
    try {
      const response = await fetch("http://localhost:5000/api/admin/requests", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });
  
      const requests = await response.json();
      renderTable(requests);
    } catch (err) {
      console.error("Failed to load requests:", err);
      tableBody.innerHTML = "<tr><td colspan='7'>Error loading requests.</td></tr>";
    }
  
    function renderTable(requests) {
      tableBody.innerHTML = "";
  
      if (requests.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='7'>No requests found.</td></tr>";
        return;
      }
  
      requests.forEach(req => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${req.id}</td>
          <td>${req.user_id}</td>
          <td>${req.car_id}</td>
          <td>${req.type}</td>
          <td>${req.status}</td>
          <td>${new Date(req.requested_at).toLocaleString()}</td>
          <td>
            ${req.status === "pending" ? `<button class="complete-btn" data-id="${req.id}">Mark Completed</button>` : ""}
          </td>
        `;
        tableBody.appendChild(tr);
      });
  
      document.querySelectorAll(".complete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const requestId = e.target.dataset.id;
  
          const confirmComplete = confirm("Mark this request as completed?");
          if (!confirmComplete) return;
  
          try {
            const res = await fetch(`http://localhost:5000/api/admin/requests/${requestId}/complete`, {
              method: "PUT",
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              }
            });
  
            const data = await res.json();
            alert(data.message || "Request marked as completed");
            location.reload();
          } catch (err) {
            console.error("Error completing request:", err);
            alert("Failed to complete request.");
          }
        });
      });
    }
  });
  