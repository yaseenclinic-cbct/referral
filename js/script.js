import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    addDoc,
    collection
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

    doctor = { id: snapshot.id, ...snapshot.data() };

    document.getElementById("doctorName").textContent = doctor.doctorName || "";
    document.getElementById("clinicName").textContent = doctor.clinicName || "";
}

loadDoctor();

document.getElementById("submitBtn").addEventListener("click", async () => {
    const xrays = [];
    document.querySelectorAll("input[type='checkbox']:checked").forEach(c => {
        xrays.push(c.value);
    });

    const patientName = document.getElementById("patientName").value;
    const age = document.getElementById("patientAge").value;
    const gender = document.querySelector("input[name='gender']:checked")?.value || "";
    const phone = document.getElementById("patientPhone").value;
    const notes = document.getElementById("notes").value;

    try {
        // 1. الحفظ في Firebase
        await addDoc(collection(db, "referrals"), {
            doctorID: doctor.id || "",
            doctorName: doctor.doctorName || "",
            clinicName: doctor.clinicName || "",
            patientName: patientName,
            age: age,
            gender: gender,
            phone: phone,
            xrays: xrays,
            notes: notes,
            createdAt: new Date().toISOString() // تاريخ نصي قياسي مضاعف الدقة للترتيب
        });

        // 2. الإرسال إلى Google Sheet
        const formData = new URLSearchParams();
        formData.append("doctorID", doctor.id || "");
        formData.append("doctorName", doctor.doctorName || "");
        formData.append("clinicName", doctor.clinicName || "");
        formData.append("patientName", patientName);
        formData.append("age", age);
        formData.append("gender", gender);
        formData.append("phone", phone);
        formData.append("xrays", xrays.join(", "));
        formData.append("notes", notes);

        await fetch(
            "https://script.google.com/macros/s/AKfycbwl_YFz58K6Cu1238_fbS4UoQkp5JIhpq9x7lLhWw0jdibnjf-obpgb-V9MPtuK7fg/exec",
            {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            }
        );

        alert("✅ تم إرسال الإحالة بنجاح");

    } catch (e) {
        console.error("Error submitting referral:", e);
        alert("حدث خطأ أثناء إرسال البيانات");
    }
});
