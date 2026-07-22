import { db } from "./firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const doctor = {
    id: "FDC001",
    name: "د. عامر",
    clinic: "عيادة الفارس"
};

document.getElementById("doctorName").textContent = doctor.name;
document.getElementById("clinicName").textContent = doctor.clinic;

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
