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
// CBCT Tooth Dropdown
// ========================================

const selectedTeeth = new Set();

const toothNumbers = [
    11, 12, 13, 14, 15, 16, 17, 18,
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48
];

const cbctTooth = document.getElementById("cbctTooth");
const toothChartContainer = document.getElementById("toothChartContainer");
const toothDropdownBtn = document.getElementById("toothDropdownBtn");
const toothDropdownMenu = document.getElementById("toothDropdownMenu");
const toothOptions = document.getElementById("toothOptions");
const selectedTeethText = document.getElementById("selectedTeethText");

function updateSelectedTeeth() {
    const teeth = Array.from(selectedTeeth).sort((a, b) => a - b);

    if (teeth.length === 0) {
        selectedTeethText.textContent = "اختيار الأسنان";
    } else {
        selectedTeethText.textContent = teeth.join(", ");
    }
}

function createToothOptions() {
    if (!toothOptions) return;

    toothOptions.innerHTML = "";

    toothNumbers.forEach(toothNumber => {
        const label = document.createElement("label");
        label.className = "tooth-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = toothNumber;

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                selectedTeeth.add(toothNumber);
            } else {
                selectedTeeth.delete(toothNumber);
            }

            updateSelectedTeeth();
        });

        const number = document.createElement("span");
        number.textContent = toothNumber;

        label.appendChild(checkbox);
        label.appendChild(number);
        toothOptions.appendChild(label);
    });
}

function getSelectedTeeth() {
    return Array.from(selectedTeeth).sort((a, b) => a - b);
}

function clearSelectedTeeth() {
    selectedTeeth.clear();

    document
        .querySelectorAll("#toothOptions input[type=checkbox]")
        .forEach(checkbox => {
            checkbox.checked = false;
        });

    updateSelectedTeeth();
}

if (cbctTooth && toothChartContainer) {
    cbctTooth.addEventListener("change", () => {
        if (cbctTooth.checked) {
            toothChartContainer.style.display = "block";
        } else {
            toothChartContainer.style.display = "none";
            clearSelectedTeeth();
            if (toothDropdownMenu) toothDropdownMenu.hidden = true;
            if (toothDropdownBtn) toothDropdownBtn.setAttribute("aria-expanded", "false");
        }
    });
}

if (toothDropdownBtn && toothDropdownMenu) {
    toothDropdownBtn.addEventListener("click", () => {
        toothDropdownMenu.hidden = !toothDropdownMenu.hidden;
        toothDropdownBtn.setAttribute("aria-expanded", String(!toothDropdownMenu.hidden));
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".tooth-selector")) {
            toothDropdownMenu.hidden = true;
            toothDropdownBtn.setAttribute("aria-expanded", "false");
        }
    });
}

createToothOptions();
updateSelectedTeeth();


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

loadDoctor();
