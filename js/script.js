import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);

const doctorID = params.get("doctor");

let doctor = {};

async function loadDoctor() {

    if (!doctorID) {

        alert("رابط الطبيب غير صحيح");

        return;

    }

    const snapshot = await getDoc(doc(db, "doctors", doctorID));

    if (!snapshot.exists()) {

        alert("الطبيب غير موجود");

        return;

    }

    doctor = snapshot.data();

    document.getElementById("doctorName").textContent =
        doctor.doctorName;

    document.getElementById("clinicName").textContent =
        doctor.clinicName;

}

loadDoctor();


document.getElementById("submitBtn").addEventListener("click", async () => {

    const xrays = [];

    document.querySelectorAll("input[type='checkbox']:checked").forEach(c => {
        xrays.push(c.value);
    });

    try {

        await addDoc(collection(db, "referrals"), {

            doctorID: doctor.id,
            doctorName: doctor.name,
            clinicName: doctor.clinic,

            patientName: document.getElementById("patientName").value,
            age: document.getElementById("patientAge").value,
            gender: document.querySelector("input[name='gender']:checked")?.value || "",
            phone: document.getElementById("patientPhone").value,

            xrays: xrays,

            notes: document.getElementById("notes").value,

            createdAt: new Date()

        });

        alert("✅ تم إرسال الإحالة");

    } catch (e) {

        console.error(e);

        alert("حدث خطأ");

    }

});
