document.addEventListener("DOMContentLoaded", async function () {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      alert("Access denied. Redirecting...");
      window.location.href = "/HTML/LN.html";
      return;
    }
  
    const tableBody = document.querySelector("#customer-table tbody");
    const searchInput = document.getElementById("searchInput");
    const addCustomerBtn = document.getElementById("addCustomerBtn");
    const addCustomerForm = document.getElementById("addCustomerForm");
    const editModal = document.getElementById("editCustomerModal");
    const editForm = document.getElementById("editCustomerForm");
    const carFieldsContainer = document.getElementById("carFieldsContainer");
  
    let allUsers = [];
  
    // Add Customer Logic
    if (addCustomerBtn && addCustomerForm) {
      addCustomerBtn.addEventListener("click", () => {
        addCustomerForm.style.display = addCustomerForm.style.display === "none" ? "block" : "none";
      });
  
      addCustomerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const formData = new FormData(addCustomerForm);
        const payload = {
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          password: formData.get("password")
        };
  
        try {
          const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
  
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unknown error");
  
          alert("Customer added successfully");
          addCustomerForm.reset();
          addCustomerForm.style.display = "none";
          location.reload();
        } catch (err) {
          console.error("Add customer failed:", err);
          alert("Error: " + err.message);
        }
      });
    }
  
    // Fetch customers
    try {
      const response = await fetch("http://localhost:5000/api/admin/customers", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
  
      allUsers = await response.json();
      renderTable(allUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      tableBody.innerHTML = "<tr><td colspan='6'>Error loading users.</td></tr>";
    }
  
    // Render Table
    function renderTable(users) {
      tableBody.innerHTML = "";
      if (users.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='6'>No matching users found.</td></tr>";
        return;
      }
  
      users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.first_name} ${user.last_name}</td>
          <td>${user.email}</td>
          <td>${user.phone || ""}</td>
          <td>${user.role}</td>
          <td style="color: ${user.status === 'inactive' ? 'red' : 'green'}">${user.status}</td>
          <td>
            <button class="edit-btn" data-id="${user.id}" data-email="${user.email}" data-name="${user.first_name}" data-last="${user.last_name}" data-phone="${user.phone || ""}">Edit</button>
            ${user.status === "inactive"
              ? `<button class="reactivate-btn" data-id="${user.id}">Reactivate</button>`
              : `<button class="deactivate-btn" data-id="${user.id}">Deactivate</button>`}
            <button class="view-cars-btn" data-id="${user.id}">View Cars</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
  
      document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const userId = btn.dataset.id;
          editForm.dataset.id = userId;
          editForm.elements["first_name"].value = btn.dataset.name;
          editForm.elements["last_name"].value = btn.dataset.last;
          editForm.elements["email"].value = btn.dataset.email;
          editForm.elements["phone"].value = btn.dataset.phone;
  
          carFieldsContainer.innerHTML = ""; // clear previous
  
          carFieldsContainer.style.display = "none";
          editModal.style.display = "flex";
        });
      });
  
      document.querySelectorAll(".deactivate-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const userId = e.target.dataset.id;
          if (!confirm("Are you sure you want to deactivate this user?")) return;
  
          try {
            const res = await fetch(`http://localhost:5000/api/admin/customers/${userId}/deactivate`, {
              method: "PUT",
              headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
  
            const data = await res.json();
            alert(data.message || "User deactivated");
            allUsers = allUsers.map(u => u.id == userId ? { ...u, status: "inactive" } : u);
            renderTable(allUsers);
          } catch (err) {
            console.error("Error deactivating user:", err);
            alert("Failed to deactivate user.");
          }
        });
      });
  
      document.querySelectorAll(".reactivate-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const userId = e.target.dataset.id;
          if (!confirm("Reactivate this user?")) return;
  
          try {
            const res = await fetch(`http://localhost:5000/api/admin/customers/${userId}/reactivate`, {
              method: "PUT",
              headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
  
            const data = await res.json();
            alert(data.message || "User reactivated");
            allUsers = allUsers.map(u => u.id == userId ? { ...u, status: "active" } : u);
            renderTable(allUsers);
          } catch (err) {
            console.error("Error reactivating user:", err);
            alert("Failed to reactivate user.");
          }
        });
      });
  
      document.querySelectorAll(".view-cars-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const userId = e.target.dataset.id;
          window.location.href = `carsA.html?user_id=${userId}`;
        });
      });
    }
  
    // Live search
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const filtered = allUsers.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.toLowerCase().includes(query))
      );
      renderTable(filtered);
    });
  
    // Modal handling
    document.getElementById("cancelEdit").addEventListener("click", () => {
      editModal.style.display = "none";
      editForm.reset();
      carFieldsContainer.innerHTML = "";
    });

    const toggleCarFieldsBtn = document.getElementById("toggleCarFields");
    const addCarRowBtn = document.getElementById("addCarRow");
    
    if (toggleCarFieldsBtn && carFieldsContainer) {
      toggleCarFieldsBtn.addEventListener("click", () => {
        carFieldsContainer.style.display = "block";
        addCarRowBtn.style.display = "inline-block";
    
        // Add one car row by default only the first time
        if (carFieldsContainer.childElementCount === 0) {
          addCarRowBtn.click();
        }
      });
    }
    
    if (addCarRowBtn) {
      addCarRowBtn.addEventListener("click", () => {
        const carRow = document.createElement("div");
        carRow.classList.add("car-row", "car-field-group");
        carRow.innerHTML = `
          <h4>New Car</h4>
          <input type="text" name="make" placeholder="Make" required />
          <input type="text" name="model" placeholder="Model" required />
          <input type="number" name="year" placeholder="Year" required />
          <input type="text" name="color" placeholder="Color" required />
          <input type="text" name="license_plate" placeholder="License Plate" required />
          <button type="button" class="removeCar">✖ Remove</button>
        `;
        carFieldsContainer.appendChild(carRow);
    
        carRow.querySelector(".removeCar").addEventListener("click", () => {
          carRow.remove();
        });
      });
    }
    
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userId = editForm.dataset.id;
      const formData = new FormData(editForm);
  
      const cars = [];
      carFieldsContainer.querySelectorAll(".car-row").forEach(row => {
        cars.push({
          make: row.querySelector("input[name='make']").value,
          model: row.querySelector("input[name='model']").value,
          year: row.querySelector("input[name='year']").value,
          color: row.querySelector("input[name='color']").value,
          license_plate: row.querySelector("input[name='license_plate']").value
        });
      });
  
      const payload = {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        cars
      };
  
      try {
        const res = await fetch(`http://localhost:5000/api/admin/customers/${userId}/update`, {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
  
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Update failed");
  
        alert("Customer updated.");
        editModal.style.display = "none";
        location.reload();
      } catch (err) {
        console.error("Update failed:", err);
        alert("Error updating user.");
      }
    });
  });