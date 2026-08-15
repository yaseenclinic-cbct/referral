import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


console.log("admin.js loaded");


// ==========================================
// Dashboard
// ==========================================

async function loadDashboard() {

    try {

        // ==========================
        // Doctors
        // ==========================

        const doctorsSnapshot =
            await getDocs(
                collection(
                    db,
                    "doctors"
                )
            );


        // ==========================
        // Clinics
        // ==========================

        const clinicsSnapshot =
            await getDocs(
                collection(
                    db,
                    "clinics"
                )
            );


        // ==========================
        // Referrals
        // ==========================

        const referralsSnapshot =
            await getDocs(
                collection(
                    db,
                    "referrals"
                )
            );


        // ==========================
        // Update Dashboard
        // ==========================

        const doctorCount =
            document.getElementById(
                "doctorCount"
            );

        const clinicCount =
            document.getElementById(
                "clinicCount"
            );

        const referralCount =
            document.getElementById(
                "referralCount"
            );


        if (doctorCount) {

            doctorCount.textContent =
                doctorsSnapshot.size;

        }


        if (clinicCount) {

            clinicCount.textContent =
                clinicsSnapshot.size;

        }


        if (referralCount) {

            referralCount.textContent =
                referralsSnapshot.size;

        }


        console.log(
            "Dashboard loaded:",
            {
                doctors:
                    doctorsSnapshot.size,

                clinics:
                    clinicsSnapshot.size,

                referrals:
                    referralsSnapshot.size
            }
        );


    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}


// ==========================================
// Start Dashboard
// ==========================================

loadDashboard();
