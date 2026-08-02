import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    setDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("doctors.js loaded");
const doctorModal = new bootstrap.Modal(
    document.getElementById("doctorModal")
);

document
.getElementById("addDoctorBtn")
.addEventListener("click", async () => {

    const select =
    document.getElementById("doctorClinic");

    select.innerHTML = "";

    try {

        const snapshot =
        await getDocs(collection(db, "clinics"));

        snapshot.forEach((clinic) => {

            const data = clinic.data();

            const option =
            document.createElement("option");

            option.value = data.code;
            option.textContent =
            `${data.name} (${data.code})`;

            select.appendChild(option);

        });

        doctorModal.show();

    } catch (e) {

        console.error(e);

        alert("تعذر تحميل العيادات");

    }

});


async function loadDoctors() {

    const table = document.getElementById("doctorTable");

    table.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "doctors"));

        console.log("Doctors:", snapshot.size);

        snapshot.forEach((doctor) => {

            const data = doctor.data();

            const row = document.createElement("tr");

            const tdID = document.createElement("td");
            tdID.textContent = data.id;

            const tdName = document.createElement("td");
            tdName.textContent = data.doctorName;

            const tdClinic = document.createElement("td");
            tdClinic.textContent = data.clinicName;

            const tdButton = document.createElement("td");

            const btn = document.createElement("button");
            const editBtn = document.createElement("button");

editBtn.className = "btn btn-warning btn-sm ms-2";

editBtn.textContent = "Edit";
            editBtn.onclick = function () {

    window.location =
        "edit-doctor.html?id=" + data.id;

};
            const deleteBtn = document.createElement("button");

deleteBtn.className = "btn btn-danger btn-sm ms-2";

deleteBtn.textContent = "Delete";

deleteBtn.onclick = async function () {

    const ok = confirm(
        "هل أنت متأكد من حذف الطبيب؟"
    );

    if (!ok) return;

    await deleteDoc(doc(db, "doctors", data.id));

    alert("تم حذف الطبيب");
document
.getElementById("saveDoctorBtn")
.addEventListener("click", async () => {
    alert("save clicked");

    const clinicCode =
    document.getElementById("doctorClinic").value;

    const doctorName =
    document.getElementById("doctorNameInput").value.trim();

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

        const doctorID =
        clinicCode +
        String(nextNumber).padStart(3, "0");

        const clinicText =
        document.getElementById("doctorClinic");

        const clinicName =
        clinicText.options[
            clinicText.selectedIndex
        ].text;

        await setDoc(
            doc(db, "doctors", doctorID),
            {

                id: doctorID,
                doctorName: doctorName,
                clinicCode: clinicCode,
                clinicName: clinicName,
                active: true,
                createdAt: new Date()

            }
        );

        doctorModal.hide();

        alert(
            "تمت إضافة الطبيب\n\n" +
            doctorID
        );

        document.getElementById("doctorNameInput").value = "";

        loadDoctors();

    } catch (e) {

        console.error(e);

        alert("حدث خطأ");

    }

});
    loadDoctors();

};

            btn.className = "btn btn-primary btn-sm";

            btn.textContent = "Copy Link";

            btn.onclick = function () {

                copyLink(data.id);

            };

           tdButton.appendChild(btn);

tdButton.appendChild(editBtn);

tdButton.appendChild(deleteBtn);

            row.appendChild(tdID);
            row.appendChild(tdName);
            row.appendChild(tdClinic);
            row.appendChild(tdButton);

            table.appendChild(row);

        });

    } catch (e) {

        console.error(e);

    }

}

async function copyLink(id) {

    const link =
        "https://yaseenclinic-cbct.github.io/referral/?doctor=" + id;

    await navigator.clipboard.writeText(link);

    alert("تم نسخ الرابط");

}

loadDoctors();
