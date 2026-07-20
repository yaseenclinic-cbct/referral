// =========================
// YRMS v0.1
// =========================

// Temporary doctor information
// Later this data will come from Google Sheets
const doctor = {
    name: "جاري تحميل البيانات...",
    clinic: "..."
};

document.getElementById("doctorName").textContent = doctor.name;
document.getElementById("clinicName").textContent = doctor.clinic;

// X-Ray Types
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

// لووب واحد نظيف وصحيح
xrayTypes.forEach(type => {
    // إزالة المسافات من الـ ID لتجنب مشاكل المتصفحات والنقر
    const safeId = type.replace(/\s+/g, '-');

    // استخدام علامات الاقتباس المائلة `` لإحاطة الـ HTML
    const html = 
        <div class="form-check xray-item">
            <input
                class="form-check-input"
                type="checkbox"
                value="${type}"
                id="${safeId}">
            <label
                class="form-check-label"
                for="${safeId}">
                ${type}
            </label>
        </div>
    ;

    container.insertAdjacentHTML("beforeend", html);
});

// Submit Button
document.getElementById("submitBtn").addEventListener("click", function() {
    alert("هذه النسخة التجريبية فقط.");
});
