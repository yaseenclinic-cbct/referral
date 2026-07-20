// =========================
// YRMS v0.1
// script.js
// =========================

// Temporary doctor information
const doctor = {
    name: "جاري تحميل البيانات...",
    clinic: "..."
};

// Display doctor information
document.getElementById("doctorName").textContent = doctor.name;
document.getElementById("clinicName").textContent = doctor.clinic;

// =========================
// X-Ray Types
// =========================

const xrayTypes = [
    "CBCT Tooth",
    "CBCT Jaw",
    "CBCT Full Mouth",
    "OPG",
    "Cephalometric",
    "3D Proface",
    "Surgical Guide",
    "Report",
    "Ceph Analysis"
];

const container = document.getElementById("xrayContainer");

xrayTypes.forEach(function(type) {

    const html = 
        <div class="form-check xray-item">
            <input
                class="form-check-input"
                type="checkbox"
                id="${type}"
                value="${type}">
            <label
                class="form-check-label"
                for="${type}">
                ${type}
            </label>
        </div>
    ;

    container.insertAdjacentHTML("beforeend", html);

});

// =========================
// Submit Button
// =========================

document.getElementById("submitBtn").addEventListener("click", function () {

    alert("هذه النسخة التجريبية فقط.");

});
