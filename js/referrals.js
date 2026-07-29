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

            const tdPatient = document.createElement("td");
            tdPatient.textContent = data.patientName || "";

            const tdDoctor = document.createElement("td");
            tdDoctor.textContent = data.doctorName || "";

            const tdClinic = document.createElement("td");
            tdClinic.textContent = data.clinicName || "";

            const tdPhone = document.createElement("td");
            tdPhone.textContent = data.phone || "";

            const tdXrays = document.createElement("td");
            tdXrays.textContent = data.xrays || "";

            row.appendChild(tdPatient);
            row.appendChild(tdDoctor);
            row.appendChild(tdClinic);
            row.appendChild(tdPhone);
            row.appendChild(tdXrays);

            table.appendChild(row);

        });

    } catch (e) {

        console.error(e);

    }

}

loadReferrals();
