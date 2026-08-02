import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function loadReferrals() {

    const table = document.getElementById("referralTable");

    table.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "referrals"));

        console.log("Referrals:", snapshot.size);

        snapshot.forEach((referral) => {

            const data = referral.data();

            const row = document.createElement("tr");

            const tdDoctor = document.createElement("td");
tdDoctor.textContent = data.doctorName || "";

const tdClinic = document.createElement("td");
tdClinic.textContent = data.clinicName || "";

const tdPatient = document.createElement("td");
tdPatient.textContent = data.patientName || "";

const tdAge = document.createElement("td");
tdAge.textContent = data.age || "";

const tdPhone = document.createElement("td");
tdPhone.textContent = data.phone || "";

const tdGender = document.createElement("td");
tdGender.textContent = data.gender || "";

const tdXrays = document.createElement("td");

if (Array.isArray(data.xrays)) {

    tdXrays.textContent = data.xrays.join(", ");

} else {

    tdXrays.textContent = data.xrays || "";

}

const tdNotes = document.createElement("td");
tdNotes.textContent = data.notes || "";

const tdDate = document.createElement("td");

if (data.createdAt) {

    tdDate.textContent =
        new Date(data.createdAt.seconds * 1000)
        .toLocaleString();

} else {

    tdDate.textContent = "";

}

row.appendChild(tdDoctor);
row.appendChild(tdClinic);
row.appendChild(tdPatient);
row.appendChild(tdAge);
row.appendChild(tdPhone);
row.appendChild(tdGender);
row.appendChild(tdXrays);
row.appendChild(tdNotes);
row.appendChild(tdDate);

            table.appendChild(row);

        });

    } catch (e) {

        console.error(e);

    }

}

loadReferrals();
