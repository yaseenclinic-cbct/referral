import { db } from "./firebase.js";

import {
    collection,
    getDocs
}
  console.log("doctors.js loaded");  
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function loadDoctors() {

    const table = document.getElementById("doctorTable");

    table.innerHTML = "";

    const snapshot = await getDocs(collection(db, "doctors"));
    console.log(snapshot.size);
snapshot.forEach(doc => console.log(doc.data()));

    snapshot.forEach((doctor) => {

        const data = doctor.data();

        const row = document.createElement("tr");

        row.innerHTML = 
            <td>${data.id}</td>
            <td>${data.doctorName}</td>
            <td>${data.clinicName}</td>
            <td>
                <button
                    class="btn btn-sm btn-primary"
                    onclick="copyLink('${data.id}')">

                    Copy Link

                </button>
            </td>
        ;

        table.appendChild(row);

    });

}

window.copyLink = async function(id){

    const link =
    "https://yaseenclinic-cbct.github.io/referral/?doctor=" + id;

    await navigator.clipboard.writeText(link);

    alert("تم نسخ الرابط");

}

loadDoctors();
