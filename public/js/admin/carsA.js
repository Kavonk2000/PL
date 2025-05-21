document.addEventListener("DOMContentLoaded", async function () {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      alert("Access denied. Redirecting...");
      window.location.href = "/HTML/LN.html";
      return;
    }
  
    const tableBody = document.querySelector("#allCarsTable tbody");
    let allCars = [];
  
    try {
      const response = await fetch("http://localhost:5000/api/admin/cars", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });
  
      allCars = await response.json();
      renderTable(allCars);
    } catch (err) {
      console.error("Failed to load cars:", err);
      tableBody.innerHTML = "<tr><td colspan='7'>Error loading cars.</td></tr>";
    }
  
    function renderTable(cars) {
      tableBody.innerHTML = "";
      if (cars.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='7'>No cars found.</td></tr>";
        return;
      }
  
      cars.forEach(car => {
        const tr = document.createElement("tr");
        tr.dataset.id = car.id;
  
        tr.innerHTML = `
          <td>
            ${car.primary_image ? `<img src="../../Images/${car.primary_image}" width="60" />` : "N/A"}
            <input type="file" accept="image/*" class="image-input" hidden>
          </td>
          <td>
            <span>${car.make}</span>
            <input type="text" value="${car.make}" class="edit-input" hidden>
          </td>
          <td>
            <span>${car.model}</span>
            <input type="text" value="${car.model}" class="edit-input" hidden>
          </td>
          <td>
            <span>${car.year}</span>
            <input type="number" value="${car.year}" class="edit-input" hidden>
          </td>
          <td>
            <span>${car.color}</span>
            <input type="text" value="${car.color}" class="edit-input" hidden>
          </td>
          <td>${new Date(car.created_at).toLocaleDateString()}</td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="save-btn" hidden>Save</button>
            <button class="delete-btn" hidden>Delete</button>
            <button class="check-btn" data-id="${car.id}" data-checked-in="${car.checked_in}">Check ${car.checked_in ? "Out" : "In"} Car</button>
          </td>
        `;
  
        tableBody.appendChild(tr);
      });
  
      attachEventListeners();
    }
  
    function attachEventListeners() {
      document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const row = btn.closest("tr");
          row.classList.add("editing");
          row.querySelectorAll("span").forEach(span => span.style.display = "none");
          row.querySelectorAll(".edit-input").forEach(input => {
            input.hidden = false;
            input.style.display = "inline-block";
          });
  
          row.querySelector(".image-input").hidden = false;
          row.querySelector(".edit-btn").hidden = true;
          row.querySelector(".save-btn").hidden = false;
          row.querySelector(".delete-btn").hidden = false;
  
          const checkBtn = row.querySelector(".check-btn");
          if (checkBtn) {
            checkBtn.textContent = "Cancel";
            checkBtn.classList.add("cancel-edit-btn");
            checkBtn.classList.remove("check-btn");
            checkBtn.removeEventListener("click", checkBtn._clickHandler);
            checkBtn.addEventListener("click", () => location.reload());
          }
        });
      });
  
      document.querySelectorAll(".save-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const row = btn.closest("tr");
          const carId = row.dataset.id;
          const inputs = row.querySelectorAll(".edit-input");
          const fileInput = row.querySelector(".image-input");
  
          const formData = new FormData();
          formData.append("make", inputs[0].value);
          formData.append("model", inputs[1].value);
          formData.append("year", inputs[2].value);
          formData.append("color", inputs[3].value);
          if (fileInput.files.length > 0) {
            formData.append("primary_image", fileInput.files[0]);
          }
  
          try {
            const res = await fetch(`http://localhost:5000/api/admin/cars/${carId}`, {
              method: "PUT",
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              },
              body: formData
            });
  
            if (!res.ok) throw new Error("Failed to update car");
            alert("Car updated.");
            location.reload();
          } catch (err) {
            console.error("Save failed:", err);
            alert("Could not save changes.");
          }
        });
      });
  
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const row = btn.closest("tr");
          const carId = row.dataset.id;
          if (!confirm("Are you sure you want to delete this car?")) return;
  
          try {
            const res = await fetch(`http://localhost:5000/api/admin/cars/${carId}`, {
              method: "DELETE",
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              }
            });
  
            if (!res.ok) throw new Error("Failed to delete car");
            alert("Car deleted.");
            location.reload();
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete car.");
          }
        });
      });
  
      document.querySelectorAll(".check-btn").forEach(btn => {
        const handler = () => {
          const carId = btn.dataset.id;
          const isCheckedIn = btn.dataset.checkedIn === "true";
          openCheckModal(carId, isCheckedIn);
        };
        btn._clickHandler = handler;
        btn.addEventListener("click", handler);
      });
    }
  
    // Modal logic
    let currentCarId = null;
    let signaturePad = null;
  
    function openCheckModal(carId, isCheckedIn) {
      currentCarId = carId;
  
      document.getElementById("locationInput").value = "";
      document.getElementById("employeeInput").value = "";
      signaturePad?.clear();
  
      document.getElementById("checkModal").style.display = "flex";
  
      const label = document.getElementById("signatureLabel");
      label.textContent = isCheckedIn ? "Customer Signature:" : "Employee Signature:";
  
      const employeeLabel = document.getElementById("employeeLabel");
      if (employeeLabel) {
        employeeLabel.textContent = isCheckedIn ? "Customer" : "Employee";
      }
  
      const canvas = document.getElementById("signatureCanvas");
      signaturePad = new SignaturePad(canvas);
      resizeCanvas(canvas);
    }
  
    document.getElementById("cancelCheck").addEventListener("click", () => {
      document.getElementById("checkModal").style.display = "none";
    });
  
    document.getElementById("clearSignature").addEventListener("click", () => {
      signaturePad.clear();
    });
  
    let isSubmitting = false;
  
    document.getElementById("submitCheck").addEventListener("click", async () => {
      if (isSubmitting) return;
      isSubmitting = true;
  
      const locationVal = document.getElementById("locationInput").value.trim();
      const employee = document.getElementById("employeeInput").value.trim();
  
      if (!locationVal || !employee || signaturePad.isEmpty()) {
        alert("All fields and a signature are required.");
        isSubmitting = false;
        return;
      }
  
      const signatureBlob = dataURLtoBlob(signaturePad.toDataURL());
  
      const formData = new FormData();
      formData.append("location", locationVal);
      formData.append("employee", employee);
      formData.append("signature", signatureBlob);
  
      try {
        const res = await fetch(`http://localhost:5000/api/admin/cars/${currentCarId}/check`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          },
          body: formData
        });
  
        if (!res.ok) throw new Error("Failed to check car in/out");
  
        alert("Car status updated.");
        document.getElementById("checkModal").style.display = "none";
        location.reload();
      } catch (err) {
        console.error("Check-in/out failed:", err);
        alert("Something went wrong.");
      } finally {
        isSubmitting = false;
      }
    });
  
    function dataURLtoBlob(dataUrl) {
      const parts = dataUrl.split(",");
      const mime = parts[0].match(/:(.*?);/)[1];
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new Blob([u8arr], { type: mime });
    }
  
    function resizeCanvas(canvas) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
    }
  });
  