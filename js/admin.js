import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    orderBy,
    deleteDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("admin.js loaded");

// ======================
// Dashboard
// ======================

async function loadDashboard() {
    try {
        const doctors = await getDocs(collection(db, "doctors"));
        const clinics = await getDocs(collection(db, "clinics"));
       const q = query(
    collection(db, "referrals"),
    orderBy("createdAt", "desc")
);

const referralsSnapshot = await getDocs(q);
        referralsSnapshot.forEach((doc) => {
    console.log(
        doc.data().patientName,
        doc.data().createdAt?.toDate?.()
    );
});

        document.getElementById("doctorCount").textContent = doctors.size;
        document.getElementById("clinicCount").textContent = clinics.size;
        document.getElementById("referralCount").textContent = referralsSnapshot.size;

        let referralsList = [];

referralsSnapshot.forEach((doc) => {
    referralsList.push({
        id: doc.id,
        ...doc.data()
    });
});

renderReferrals(referralsList);

        renderReferrals(referralsList);

    } catch (e) {
        console.error("Dashboard Error:", e);
    }
}

function renderReferrals(referrals) {
    const tableBody = document.getElementById("referralsTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    referrals.forEach((data) => {
        let formattedDate = "";
        if (data.createdAt) {
            const dateObj = new Date(data.createdAt);
            if (!isNaN(dateObj)) {
                formattedDate = dateObj.toLocaleString("ar-IQ", {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        const row = document.createElement("tr");
        row.innerHTML = `
    <td>${data.doctorName || ""}</td>
    <td>${data.clinicName || ""}</td>
    <td>${data.patientName || ""}</td>
    <td>${data.age || ""}</td>
    <td>${data.gender || ""}</td>
    <td>${data.phone || ""}</td>
    <td>${Array.isArray(data.xrays)
        ? data.xrays.join(", ")
        : (data.xrays || "")}</td>
    <td>${data.notes || ""}</td>
    <td>${formattedDate}</td>
`;
        tableBody.appendChild(row);
    });
}

loadDashboard();

// ======================
// Clinic Modal
// ======================

const clinicModal = new bootstrap.Modal(
    document.getElementById("clinicModal")
);

document.getElementById("addClinicBtn")?.addEventListener("click", () => {
    clinicModal.show();
});

document.getElementById("saveClinicBtn")?.addEventListener("click", async () => {
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
            createdAt: new Date().toISOString()
        });

        clinicModal.hide();
        alert("تمت إضافة العيادة بنجاح");
        loadDashboard();

    } catch (e) {
        console.error(e);
    }
});

// ======================
// Doctor Modal
// ======================

const doctorModal = new bootstrap.Modal(
    document.getElementById("doctorModal")
);

document.getElementById("addDoctorBtn")?.addEventListener("click", async () => {
    const select = document.getElementById("doctorClinic");
    select.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "clinics"));
        snapshot.forEach((clinic) => {
            const data = clinic.data();
            const option = document.createElement("option");
            option.value = data.code;
            option.textContent = `${data.name} (${data.code})`;
            select.appendChild(option);
        });

        doctorModal.show();

    } catch (e) {
        console.error(e);
        alert("تعذر تحميل العيادات");
    }
});

document.getElementById("saveDoctorBtn")?.addEventListener("click", async () => {
    const clinicCode = document.getElementById("doctorClinic").value;
    const doctorName = document.getElementById("doctorNameInput").value.trim();

    if (!clinicCode || !doctorName) {
        alert("املأ جميع الحقول");
        return;
    }

    try {
        const doctorsRef = collection(db, "doctors");
        const q = query(
            doctorsRef,
            where("clinicCode", "==", clinicCode)
        );

        const snapshot = await getDocs(q);
        const nextNumber = snapshot.size + 1;

        const doctorID = clinicCode + String(nextNumber).padStart(3, "0");

        const clinicSelect = document.getElementById("doctorClinic");
        const clinicName = clinicSelect.options[clinicSelect.selectedIndex].text;

        await setDoc(doc(db, "doctors", doctorID), {
            id: doctorID,
            doctorName: doctorName,
            clinicCode: clinicCode,
            clinicName: clinicName,
            active: true,
            createdAt: new Date().toISOString()
        });

        doctorModal.hide();
        alert("تمت إضافة الطبيب\n\n" + doctorID);
        loadDashboard();

    } catch (e) {
        console.error(e);
        alert("حدث خطأ");
    }
});
