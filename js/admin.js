import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function loadDashboard() {

    const doctors = await getDocs(collection(db, "doctors"));
    const clinics = await getDocs(collection(db, "clinics"));
    const referrals = await getDocs(collection(db, "referrals"));

    document.getElementById("doctorCount").textContent = doctors.size;
    document.getElementById("clinicCount").textContent = clinics.size;
    document.getElementById("referralCount").textContent = referrals.size;

}

loadDashboard();

const clinicModal =
new bootstrap.Modal(document.getElementById("clinicModal"));

document
.getElementById("addClinicBtn")
.addEventListener("click", () => {

    clinicModal.show();

});

document
.getElementById("saveClinicBtn")
.addEventListener("click", async () => {

    const code =
    document.getElementById("clinicCode")
    .value
    .trim()
    .toUpperCase();

    const name =
    document.getElementById("clinicName")
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

});
