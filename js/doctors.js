import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("doctors.js loaded");

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

    loadDoctors();

};

            btn.className = "btn btn-primary btn-sm";

            btn.textContent = "Copy Link";

            btn.onclick = function () {

                copyLink(data.id);

            };

            tdButton.appendChild(btn);

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
