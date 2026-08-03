import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const referralModal = new bootstrap.Modal(
    document.getElementById("referralModal")
);
let allReferrals = [];
async function loadReferrals() {

    const table = document.getElementById("referralTable");

    table.innerHTML = "";

    try {

        const q = query(
    collection(db, "referrals"),
    orderBy("createdAt", "desc")
);

const snapshot = await getDocs(q);
        console.log("Referrals:", snapshot.size);
allReferrals = [];
        snapshot.forEach((referral) => {

    allReferrals.push({

        docId: referral.id,

        ...referral.data()

    });

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
const tdAction =
    document.createElement("td");

const deleteBtn =
    document.createElement("button");

deleteBtn.className =
    "btn btn-danger btn-sm";

deleteBtn.textContent =
    "Delete";
        deleteBtn.onclick = async function (e) {

    e.stopPropagation();

    const ok = confirm(
        "هل أنت متأكد من حذف هذه الإحالة؟"
    );

    if (!ok) return;

    await deleteDoc(
        doc(db, "referrals", data.docId)
    );

    alert("تم حذف الإحالة");

    loadReferrals();

};
        tdAction.appendChild(deleteBtn);
        tdDate.textContent =
    data.createdAt
    ? data.createdAt.toDate().toLocaleString("ar-IQ")
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
        row.appendChild(tdAction);
row.style.cursor = "pointer";

row.onclick = function () {

    document.getElementById("viewDoctor").textContent =
        data.doctorName || "";

    document.getElementById("viewClinic").textContent =
        data.clinicName || "";

    document.getElementById("viewPatient").textContent =
        data.patientName || "";

    document.getElementById("viewAge").textContent =
        data.age || "";

    document.getElementById("viewGender").textContent =
        data.gender || "";

    document.getElementById("viewPhone").textContent =
        data.phone || "";

    document.getElementById("viewXrays").textContent =
        Array.isArray(data.xrays)
        ? data.xrays.join(", ")
        : data.xrays || "";

    document.getElementById("viewNotes").textContent =
        data.notes || "";

    document.getElementById("viewDate").textContent =
        data.createdAt
        ? data.createdAt.toDate()
          .toLocaleString()
        : "";

    referralModal.show();

};
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
