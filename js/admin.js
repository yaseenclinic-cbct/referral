import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("admin.js loaded");
console.log(db);

// ======================
// Dashboard
// ======================

async function loadDashboard() {

    try {

        const doctors = await getDocs(collection(db, "doctors"));
        const clinics = await getDocs(collection(db, "clinics"));
        const referrals = await getDocs(collection(db, "referrals"));

        console.log("Doctors:", doctors.size);
        console.log("Clinics:", clinics.size);
        console.log("Referrals:", referrals.size);

        document.getElementById("doctorCount").textContent = doctors.size;
        document.getElementById("clinicCount").textContent = clinics.size;
        document.getElementById("referralCount").textContent = referrals.size;

    } catch (e) {

        console.error("Dashboard Error:", e);

    }

}

loadDashboard();


// ======================
// Clinic Modal
// ======================

const clinicModal = new bootstrap.Modal(
    document.getElementById("clinicModal")
);

document
.getElementById("addClinicBtn")
.addEventListener("click", () => {

    clinicModal.show();

});

document
.getElementById("saveClinicBtn")
.addEventListener("click", async () => {

    try {

        const code = document
            .getElementById("clinicCode")
            .value
            .trim()
            .toUpperCase();

        const name = document
            .getElementById("clinicName")
            .value
            .trim();

        if (!code || !name) {

            alert("املأ جميع الحقول");
            return;

        }

        await setDoc(doc(db, "clinics", code), {

            code: code,
            name: name,
            active: true,
            createdAt: new Date()

        });

        clinicModal.hide();

        alert("تمت إضافة العيادة بنجاح");

        loadDashboard();

    } catch (e) {

        console.error(e);

    }

});
console.log(document.getElementById("doctorModal"));
console.log(document.getElementById("addDoctorBtn"));
