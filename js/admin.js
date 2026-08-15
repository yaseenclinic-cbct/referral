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
        // Update basic counts
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


        // ==========================
        // Convert referrals to array
        // ==========================

        const referrals = [];


        referralsSnapshot.forEach(
            (docSnapshot) => {

                referrals.push({

                    id:
                        docSnapshot.id,

                    ...docSnapshot.data()

                });

            }
        );


        // ==========================
        // Setup month selector
        // ==========================

        setupMonthSelector(
            referrals
        );


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
// Month Selector
// ==========================================

function setupMonthSelector(referrals) {

    const selector =
        document.getElementById(
            "monthSelector"
        );


    const monthlyCount =
        document.getElementById(
            "monthlyReferralCount"
        );


    if (!selector) {

        console.warn(
            "monthSelector not found"
        );

        return;

    }


    selector.innerHTML = "";


    // الأشهر الموجودة فعليًا بالإحالات

    const months =
        new Set();


    referrals.forEach(
        (referral) => {

            const date =
                convertFirebaseDate(
                    referral.createdAt
                );


            if (!date) {

                return;

            }


            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );
            months.add(
                `${year}-${month}`
            );

        }
    );


    // ==========================
    // No referrals
    // ==========================

    if (months.size === 0) {

        const option =
            document.createElement(
                "option"
            );


        option.value = "";


        option.textContent =
            "لا توجد إحالات";


        selector.appendChild(
            option
        );


        if (monthlyCount) {

            monthlyCount.textContent =
                "0";

        }


        return;

    }


    // ==========================
    // Sort months
    // newest → oldest
    // ==========================

    const sortedMonths =
        Array.from(months)
            .sort()
            .reverse();


    // ==========================
    // Create options
    // ==========================

    sortedMonths.forEach(
        (monthKey) => {

            const [
                year,
                month
            ] =
                monthKey.split("-");


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                monthKey;


            const date =
                new Date(
                    Number(year),
                    Number(month) - 1,
                    1
                );


            option.textContent =
                date.toLocaleString(
                    "ar-IQ",
                    {
                        month:
                            "long",

                        year:
                            "numeric"
                    }
                );


            selector.appendChild(
                option
            );

        }
    );


    // ==========================
    // Select current month
    // ==========================

    const now =
        new Date();


    const currentMonth =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        )}`;


    if (
        sortedMonths.includes(
            currentMonth
        )
    ) {

        selector.value =
            currentMonth;

    } else {

        selector.value =
            sortedMonths[0];

    }


    // ==========================
    // Initial count
    // ==========================

    updateMonthlyReferralCount(
        referrals,
        selector.value
    );


    // ==========================
    // Change month
    // ==========================

    selector.addEventListener(
        "change",
        function () {

            updateMonthlyReferralCount(
                referrals,
                this.value
            );

        }
    );

}


// ==========================================
// Update Monthly Referral Count
// ==========================================

function updateMonthlyReferralCount(
    referrals,
    selectedMonth
) {

    if (!selectedMonth) {

        return;

    }


    const count =
        referrals.filter(
            (referral) => {

                const date =
                    convertFirebaseDate(
                        referral.createdAt
                    );


                if (!date) {

                    return false;

                }


                const year =
                    date.getFullYear();


                const month =
                    String(
                        date.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    );


                const referralMonth =
                    `${year}-${month}`;


                return (
                    referralMonth ===
                    selectedMonth
                );

            }
        ).length;


    const element =
        document.getElementById(
            "monthlyReferralCount"
        );


    if (element) {

        element.textContent =
            count;

    }
    console.log(
        "Selected month:",
        selectedMonth,
        "Count:",
        count
    );

}


// ==========================================
// Firebase Date Converter
// ==========================================

function convertFirebaseDate(value) {

    if (!value) {

        return null;

    }


    // Firebase Timestamp

    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    // JavaScript Date

    if (
        value instanceof Date
    ) {

        return value;

    }


    // String date

    const date =
        new Date(value);


    if (
        !isNaN(
            date.getTime()
        )
    ) {

        return date;

    }


    return null;

}


// ==========================================
// Start Dashboard
// ==========================================

loadDashboard();
