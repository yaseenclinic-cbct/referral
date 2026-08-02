import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
let allReferrals = [];
async function loadReferrals() {

    const table = document.getElementById("referralTable");

    table.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "referrals"));
let allReferrals = [];
        console.log("Referrals:", snapshot.size);

        snapshot.forEach((referral) => {

    allReferrals.push(referral.data());

});

renderReferrals(allReferrals);

    } catch (e) {

        console.error(e);

    }

}
function renderReferrals(list) {

    const table =
        document.getElementById("referralTable");

    table.innerHTML = "";

    list.forEach((data) => {

        const row =
            document.createElement("tr");

        const tdDoctor =
            document.createElement("td");
        tdDoctor.textContent =
            data.doctorName || "";

        const tdClinic =
            document.createElement("td");
        tdClinic.textContent =
            data.clinicName || "";

        const tdPatient =
            document.createElement("td");
        tdPatient.textContent =
            data.patientName || "";

        const tdAge =
            document.createElement("td");
        tdAge.textContent =
            data.age || "";

        const tdPhone =
            document.createElement("td");
        tdPhone.textContent =
            data.phone || "";

        const tdGender =
            document.createElement("td");
        tdGender.textContent =
            data.gender || "";

        const tdXrays =
            document.createElement("td");

        tdXrays.textContent =
            Array.isArray(data.xrays)
            ? data.xrays.join(", ")
            : data.xrays || "";

        const tdNotes =
            document.createElement("td");
        tdNotes.textContent =
            data.notes || "";

        const tdDate =
            document.createElement("td");

        tdDate.textContent =
            data.createdAt
            ? new Date(
                data.createdAt.seconds * 1000
              ).toLocaleString()
            : "";

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

}
document
.getElementById("searchReferral")
.addEventListener("input", function () {

    const search =
        this.value.toLowerCase();

    const filtered =
        allReferrals.filter((data) => {

            return (
                (data.doctorName || "")
                .toLowerCase()
                .includes(search)

                ||

                (data.clinicName || "")
                .toLowerCase()
                .includes(search)

                ||

                (data.patientName || "")
                .toLowerCase()
                .includes(search)

                ||

                (data.phone || "")
                .toLowerCase()
                .includes(search)

            );

        });

    renderReferrals(filtered);

});
loadReferrals();
