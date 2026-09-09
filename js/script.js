import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ========================================
// Doctor Parameters
// ========================================

const params = new URLSearchParams(window.location.search);
const doctorID = params.get("doctor");

let doctor = {};


// ========================================
// Selected Teeth
// ========================================

const selectedTeeth = new Set();


// ========================================
// Load Doctor
// ========================================

async function loadDoctor() {
    if (!doctorID) {
        alert("رابط الطبيب غير صحيح");
        return;
    }

    try {
        const snapshot = await getDoc(
            doc(db, "doctors", doctorID)
        );

        if (!snapshot.exists()) {
            alert("الطبيب غير موجود");
            return;
        }

        doctor = {
            id: snapshot.id,
            ...snapshot.data()
        };

        document.getElementById("doctorName").textContent =
            doctor.doctorName || "";

        document.getElementById("clinicName").textContent =
            doctor.clinicName || "";

    } catch (error) {
        console.error("Error loading doctor:", error);
        alert("تعذر تحميل بيانات الطبيب");
    }
}


// ========================================
// Create Tooth
// ========================================

function getToothType(toothNumber) {
    const position = Number(toothNumber) % 10;

    if (position === 1 || position === 2) return "incisor";
    if (position === 3) return "canine";
    if (position === 4 || position === 5) return "premolar";
    if (position === 6 || position === 7) return "molar";
    return "wisdom";
}

function createTooth(container, toothNumber) {
    const tooth = document.createElement("button");

    tooth.type = "button";
    tooth.className = "tooth-item";
    tooth.dataset.tooth = String(toothNumber);
    tooth.setAttribute("aria-pressed", "false");
    tooth.setAttribute("aria-label", `السن ${toothNumber}`);

    const toothType = getToothType(toothNumber);

    tooth.innerHTML = `
        <span class="tooth-icon ${toothType}" aria-hidden="true"></span>
        <span class="tooth-number">${toothNumber}</span>
    `;

    tooth.addEventListener("click", () => {
        toggleTooth(toothNumber, tooth);
    });

    container.appendChild(tooth);
}


// ========================================
// Build Dental Chart
// ========================================

function buildDentalChart() {
    const upperRight = document.getElementById("upperRight");
    const upperLeft = document.getElementById("upperLeft");
    const lowerRight = document.getElementById("lowerRight");
    const lowerLeft = document.getElementById("lowerLeft");

    if (!upperRight || !upperLeft || !lowerRight || !lowerLeft) {
        console.error("Dental chart containers not found.");
        return;
    }

    upperRight.innerHTML = "";
    upperLeft.innerHTML = "";
    lowerRight.innerHTML = "";
    lowerLeft.innerHTML = "";

    /*
        FDI numbering.

        The center/midline is between:
        Upper: 11 | 21
        Lower: 41 | 31

        Visual order:
        Upper: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
        Lower: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38

        Therefore 11/21/41/31 are closest to the center.
    */

    [
        11, 12, 13, 14, 15, 16, 17, 18
    ].forEach(number => createTooth(upperRight, number));

    [
        21, 22, 23, 24, 25, 26, 27, 28
    ].forEach(number => createTooth(upperLeft, number));

    [
        41, 42, 43, 44, 45, 46, 47, 48
    ].forEach(number => createTooth(lowerRight, number));

    [
        31, 32, 33, 34, 35, 36, 37, 38
    ].forEach(number => createTooth(lowerLeft, number));
}


// ========================================
// Toggle Tooth
// ========================================

function toggleTooth(toothNumber, element) {
    if (selectedTeeth.has(toothNumber)) {
        selectedTeeth.delete(toothNumber);
        element.classList.remove("selected");
        element.setAttribute("aria-pressed", "false");
    } else {
        selectedTeeth.add(toothNumber);
        element.classList.add("selected");
        element.setAttribute("aria-pressed", "true");
    }

    updateSelectedTeeth();
}


// ========================================
// Update Selected Teeth Display
// ========================================

function updateSelectedTeeth() {
    const display = document.getElementById("selectedTeethText");

    const teeth = Array.from(selectedTeeth).sort(
        (a, b) => Number(a) - Number(b)
    );

    if (teeth.length === 0) {
        display.textContent = "لا يوجد";
        return;
    }

    display.textContent = teeth.join(", ");
}


// ========================================
// Get Selected Teeth
// ========================================

function getSelectedTeeth() {
    return Array.from(selectedTeeth).sort(
        (a, b) => Number(a) - Number(b)
    );
}


// ========================================
// Clear Selected Teeth
// ========================================

function clearSelectedTeeth() {
    selectedTeeth.clear();

    document
        .querySelectorAll(".tooth-item.selected")
        .forEach(tooth => {
            tooth.classList.remove("selected");
            tooth.setAttribute("aria-pressed", "false");
        });

    updateSelectedTeeth();
}


// ========================================
// CBCT Tooth Checkbox
// ========================================

const cbctTooth = document.getElementById("cbctTooth");
const toothChartContainer = document.getElementById("toothChartContainer");

if (cbctTooth && toothChartContainer) {
    cbctTooth.addEventListener("change", () => {
        if (cbctTooth.checked) {
            toothChartContainer.style.display = "block";
        } else {
            toothChartContainer.style.display = "none";
            clearSelectedTeeth();
        }
    });
}


// ========================================
// Build X-Ray List
// ========================================

function getSelectedXrays() {
    const xrays = [];

    document
        .querySelectorAll(".xray-option:checked")
        .forEach(checkbox => {
            if (checkbox.id === "cbctTooth") {
                return;
            }

            xrays.push(checkbox.value);
        });

    if (cbctTooth && cbctTooth.checked) {
        const teeth = getSelectedTeeth();

        if (teeth.length > 0) {
            xrays.push(
                "CBCT Tooth: " + teeth.join(", ")
            );
        }
    }

    return xrays;
}


// ========================================
// Submit Referral
// ========================================

document.getElementById("submitBtn").addEventListener(
    "click",
    async () => {
        const submitBtn = document.getElementById("submitBtn");

        // Prevent double click
        if (submitBtn.disabled) {
            return;
        }

        submitBtn.disabled = true;

        // ========================================
        // X-Rays + Teeth
        // ========================================

        const xrays = getSelectedXrays();

        if (cbctTooth && cbctTooth.checked) {
            const teeth = getSelectedTeeth();

            if (teeth.length === 0) {
                alert(
                    "يرجى اختيار سن واحد على الأقل لـ CBCT Tooth"
                );

                submitBtn.disabled = false;
                return;
            }
        }

        // ========================================
        // Patient Data
        // ========================================

        const patientName = document
            .getElementById("patientName")
            .value
            .trim();

        const age = document
            .getElementById("patientAge")
            .value;

        const gender = document.querySelector(
            "input[name='gender']:checked"
        )?.value || "";

        const phone = document
            .getElementById("patientPhone")
            .value
            .trim();

        const notes = document
            .getElementById("notes")
            .value
            .trim();

        // ========================================
        // Basic Validation
        // ========================================

        if (!patientName || !phone) {
            alert(
                "يرجى إدخال اسم المراجع ورقم الهاتف"
            );

            submitBtn.disabled = false;
            return;
        }

        if (!doctor.id) {
            alert("تعذر تحميل بيانات الطبيب، يرجى إعادة فتح الرابط.");

            submitBtn.disabled = false;
            return;
        }

        try {
            // ========================================
            // Create Referral ID
            // ========================================

            const referralID = "YR-" + Date.now();

            // ========================================
            // Save to Firebase
            // ========================================

            await addDoc(
                collection(db, "referrals"),
                {
                    referralID,
                    doctorID: doctor.id || "",
                    doctorName: doctor.doctorName || "",
                    clinicName: doctor.clinicName || "",

                    patientName,
                    age,
                    gender,
                    phone,

                    /*
                        Keep all X-Ray information in the
                        existing xrays field.
                        No new Firestore field is created.
                    */
                    xrays,

                    notes,

                    dateOfCBCT: "",
                    cbctPrice: "",
                    done: false,

                    createdAt: serverTimestamp()
                }
            );

            // ========================================
            // Send to Google Sheet
            // ========================================

            const formData = new URLSearchParams();

            formData.append("referralID", referralID);
            formData.append("doctorID", doctor.id || "");
            formData.append("doctorName", doctor.doctorName || "");
            formData.append("clinicName", doctor.clinicName || "");
            formData.append("patientName", patientName);
            formData.append("age", age);
            formData.append("gender", gender);
            formData.append("phone", phone);

            // Same existing X-Rays column
            formData.append("xrays", xrays.join(", "));

            formData.append("notes", notes);

            await fetch(
                "https://script.google.com/macros/s/AKfycbwl_YFz58K6Cu1238_fbS4UoQkp5JIhpq9x7lLhWw0jdibnjf-obpgb-V9MPtuK7fg/exec",
                {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body: formData
                }
            );

            // ========================================
            // Reset Form
            // ========================================

            document.getElementById("patientName").value = "";
            document.getElementById("patientAge").value = "";
            document.getElementById("patientPhone").value = "";
            document.getElementById("notes").value = "";

            document
                .querySelectorAll("input[name='gender']")
                .forEach(input => {
                    input.checked = false;
                });

            document
                .querySelectorAll(".xray-option")
                .forEach(checkbox => {
                    checkbox.checked = false;
                });

            clearSelectedTeeth();

            if (toothChartContainer) {
                toothChartContainer.style.display = "none";
            }

            alert("✅ تم إرسال الإحالة بنجاح");

        } catch (e) {
            console.error("Error submitting referral:", e);

            alert("حدث خطأ أثناء إرسال البيانات");

        } finally {
            submitBtn.disabled = false;
        }
    }
);


// ========================================
// Initialize
// ========================================

buildDentalChart();
updateSelectedTeeth();
loadDoctor();
