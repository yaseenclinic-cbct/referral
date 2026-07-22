import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function loadDashboard() {

    const doctors = await getDocs(collection(db, "doctors"));
    const clinics = await getDocs(collection(db, "clinics"));
    const referrals = await getDocs(collection(db, "referrals"));

    document.getElementById("doctorCount").textContent = doctors.size;
    document.getElementById("clinicCount").textContent = clinics.size;
    document.getElementById("referralCount").textContent = referrals.size;

}

loadDashboard();
