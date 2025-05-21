
document.addEventListener('DOMContentLoaded', function () {
    console.log("Dashboard.js loaded");

    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
        console.error("No Token found. Redirecting to login page.");
        window.location.href = "/ln";
        return;
    }

    loadUserProfile(token);
    loadPayments();
    loadGarage(token);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function () {
            showTab(this.getAttribute('onclick').replace("showTab('", "").replace("')", ""));
        });
    });
    showTab('garage');

    // Profile Edit Handlers
    const editBtn = document.getElementById('edit-profile-btn');
    const profileForm = document.getElementById('edit-profile-form');
    const pictureUploadSection = document.getElementById("picture-upload-section");
    if (editBtn && profileForm) {
        editBtn.addEventListener("click", () => {
            profileForm.style.display = 'block';
            pictureUploadSection.style.display = 'block';
        });
    }

    const saveBtn = document.getElementById("save-profile-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async function () {
            const updatedEmail = document.getElementById("edit-email").value;
            const updatedPhone = document.getElementById("edit-phone").value;
            try {
                const response = await fetch("/api/users/profile", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ email: updatedEmail, phone: updatedPhone })
                });
                if (response.ok) {
                    profileForm.style.display = 'none';
                    pictureUploadSection.style.display = 'none';
                    loadUserProfile(token);
                } else {
                    console.error("Failed to update profile");
                }
            } catch (err) {
                console.error("Error updating profile:", err);
            }
        });
    }

    // Upload Profile Picture
    const uploadBtn = document.getElementById("uploadPictureBtn");
    const fileInput = document.getElementById("profilePictureInput");
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener("click", async () => {
            const file = fileInput.files[0];
            if (!file) {
                document.getElementById("upload-status").textContent = "Please select a file.";
                return;
            }
            const formData = new FormData();
            formData.append("profilePicture", file);
            try {
                const response = await fetch("/api/auth/profile-picture", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await response.json();
                if (response.ok) {
                    document.getElementById("upload-status").textContent = "Upload successful!";
                    document.getElementById("profile-picture").src = `/uploads/profiles/${data.profile_picture}?t=${Date.now()}`;
                } else {
                    document.getElementById("upload-status").textContent = data.error || "Upload failed.";
                }
            } catch (err) {
                console.error("Upload error:", err);
                document.getElementById("upload-status").textContent = "Server error.";
            }
        });
    }

    // Payment simulation
    const payBtn = document.getElementById("pay-now-btn");
    if (payBtn) {
        payBtn.addEventListener("click", () => {
            document.getElementById("payment-message").textContent = "Payment submitted (simulated)";
        });
    }
});

// Load user profile
function loadUserProfile(token) {
    fetch('/api/users/profile', {
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        document.querySelector('#profile-name').textContent = `${data.first_name} ${data.last_name}`;
        document.querySelector('email_display').textContent = data.email;
        document.querySelector('phone_display').textContent = data.phone || "Not available";
        document.getElementById("edit-email").value = data.email || "";
        document.getElementById("edit-phone").value = data.phone || "";
        document.getElementById("profile-picture").src = data.profile_picture
            ? `/uploads/profiles/${data.profile_picture}`
            : "/images/default-profile.jpg";
    })
    .catch(err => console.error("Error loading profile:", err));
}

// Dummy billing info
function loadPayments() {
    const tableBody = document.querySelector("#payments-table tbody");
    tableBody.innerHTML = "";
    const payments = [
        { date: "2025-01-10", amount: "$150.00", status: "Paid" },
        { date: "2025-02-10", amount: "$150.00", status: "Unpaid" }
    ];
    payments.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${p.date}</td><td>${p.amount}</td><td>${p.status}</td>`;
        tableBody.appendChild(row);
    });
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) activeTab.style.display = 'block';
    if (tabName === "payments") loadPayments();
    if (tabName === "garage") {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) loadGarage(token);
    }
}

// ========== Garage ==========

let isGridView = true;

function showAddCarForm() {
    document.getElementById("add-car-form").style.display = "block";
}

async function submitNewCar() {
    const formData = new FormData();
    formData.append("make", document.getElementById("car-make").value);
    formData.append("model", document.getElementById("car-model").value);
    formData.append("year", document.getElementById("car-year").value);
    formData.append("color", document.getElementById("car-color").value);
    formData.append("primary_image", document.getElementById("car-image").files[0]);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const response = await fetch("/api/cars", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
    });

    if (response.ok) {
        document.getElementById("add-car-form").style.display = "none";
        loadGarage(token);
    } else {
        alert("Error adding car");
    }
}

async function loadGarage(token) {


    const garage = document.getElementById("car-list");
    garage.innerHTML = "";
    try {
        const res = await fetch("/api/cars", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cars = await res.json();

        cars.forEach(car => {
            const card = document.createElement("div");
            card.className = "car-card";
        
            card.innerHTML = `
                <img src="${car.primary_image ? `/uploads/cars/${car.primary_image}` : "/images/default-car.jpg"}" />
                <h4>${car.year} ${car.make} ${car.model}</h4>
                <p>Color: ${car.color}</p>
                <button onclick="requestPickup(${car.id})">Request Pickup</button>
                <div id="edit-car-${car.id}" class="car-edit-form" style="display: none;">
                    <input type="text" id="edit-make-${car.id}" value="${car.make}" />
                    <input type="text" id="edit-model-${car.id}" value="${car.model}" />
                    <input type="number" id="edit-year-${car.id}" value="${car.year}" />
                    <input type="text" id="edit-color-${car.id}" value="${car.color}" />
                    <button onclick="submitCarUpdate(${car.id})">Save</button>
                    <button onclick="deleteCar(${car.id})">Remove</button>
                    <button onclick="requestService(${car.id})">Request Service</button>
                </div>
            `;
        
            // Toggle just this card's form on card click
            card.addEventListener("click", (e) => {
                if (e.target.closest("button") || e.target.closest("input")) return;

                const thisForm = document.getElementById(`edit-car-${car.id}`);
                if (!thisForm) return;
                {
                    
                    document.querySelectorAll(".car-edit-form").forEach(form => {
                        if (form.id !== thisForm) {
                            form.style.display = "none";
                        }
                    });
        
                    const thisForm = document.getElementById(`edit-car-${car.id}`);
                    if (thisForm) {
                        const isHidden = thisForm.style.display === "none";
                        thisForm.style.display = isHidden ? "block" : "none";
                    }
                }
            });
        
            garage.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading garage:", err);
    }
}

function toggleEditCar(id) {
    const form = document.getElementById(`edit-car-${id}`);
    form.style.display = form.style.display === "none" ? "block" : "none";
}

async function submitCarUpdate(id) {
    const updated = {
        make: document.getElementById(`edit-make-${id}`).value,
        model: document.getElementById(`edit-model-${id}`).value,
        year: document.getElementById(`edit-year-${id}`).value,
        color: document.getElementById(`edit-color-${id}`).value
    };

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const res = await fetch(`/api/cars/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
    });

    if (res.ok) {
        loadGarage(token);
    } else {
        alert("Failed to update car.");
    }
}

async function deleteCar(id) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch(`/api/cars/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
        loadGarage(token);
    } else {
        alert("Failed to delete car.");
    }
}

function requestPickup(carId) {
    alert(`Pickup request sent for car ID: ${carId}`);
}

function requestService(carId) {
    alert(`Service request sent for car ID: ${carId}. Admin will follow up.`);
}
