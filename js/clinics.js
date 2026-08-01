import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("clinics.js loaded");

async function loadClinics() {

    const table = document.getElementById("clinicTable");

    table.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "clinics"));

        console.log("Clinics:", snapshot.size);

        snapshot.forEach((clinic) => {

            const data = clinic.data();

            const row = document.createElement("tr");

            const tdCode = document.createElement("td");
            tdCode.textContent = data.code;

            const tdName = document.createElement("td");
            tdName.textContent = data.name;

            const tdButton = document.createElement("td");

            const deleteBtn = document.createElement("button");

            deleteBtn.className = "btn btn-danger btn-sm";

            deleteBtn.textContent = "Delete";

            deleteBtn.onclick = async function () {

                const ok = confirm("هل أنت متأكد من حذف العيادة؟");

                if (!ok) return;

                await deleteDoc(doc(db, "clinics", data.code));

                alert("تم حذف العيادة");

                loadClinics();

            };

            tdButton.appendChild(deleteBtn);

            row.appendChild(tdCode);
            row.appendChild(tdName);
            row.appendChild(tdButton);

            table.appendChild(row);

        });

    } catch (e) {

        console.error(e);

    }

}

loadClinics();
