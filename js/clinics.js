import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    setDoc,
    updateDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("clinics.js loaded");
const clinicModal = new bootstrap.Modal(
    document.getElementById("clinicModal")
);

let editingClinic = null;

document
.getElementById("addClinicBtn")
.onclick = function () {

    editingClinic = null;

    document.getElementById("clinicCodeInput").value = "";
    document.getElementById("clinicNameInput").value = "";

    document.getElementById("clinicCodeInput").disabled = false;

    clinicModal.show();

};
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
const editBtn = document.createElement("button");

editBtn.className = "btn btn-warning btn-sm ms-2";

editBtn.textContent = "Edit";

editBtn.onclick = function () {

    editingClinic = data.code;

    document.getElementById("clinicCodeInput").value =
        data.code;

    document.getElementById("clinicNameInput").value =
        data.name;

    document.getElementById("clinicCodeInput").disabled = true;

    clinicModal.show();

};
            const deleteBtn = document.createElement("button");

            deleteBtn.className = "btn btn-danger btn-sm";

            deleteBtn.textContent = "Delete";

            deleteBtn.onclick = async function () {

                const doctors = await getDocs(

    query(

        collection(db, "doctors"),

        where("clinicCode", "==", data.code)

    )

);

if (doctors.size > 0) {

    alert("لا يمكن حذف العيادة لأنها تحتوي على أطباء.");

    return;

}

const ok = confirm("هل أنت متأكد من حذف العيادة؟");

if (!ok) return;

await deleteDoc(doc(db, "clinics", data.code));

alert("تم حذف العيادة");

loadClinics();
            };

            tdButton.appendChild(editBtn);

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
