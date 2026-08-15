import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    orderBy,
    deleteDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


console.log("admin.js loaded");


// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const doctors =
            await getDocs(
                collection(
                    db,
                    "doctors"
                )
            );


        const clinics =
            await getDocs(
                collection(
                    db,
                    "clinics"
                )
            );


        const q =
            query(
                collection(
                    db,
                    "referrals"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );
        const referralsSnapshot =
            await getDocs(q);


        document
            .getElementById(
                "doctorCount"
            )
            .textContent =
            doctors.size;


        document
            .getElementById(
                "clinicCount"
            )
            .textContent =
            clinics.size;


        document
            .getElementById(
                "referralCount"
            )
            .textContent =
            referralsSnapshot.size;


        let referralsList = [];


        referralsSnapshot.forEach(
            (referral) => {

                referralsList.push({

                    id: referral.id,

                    ...referral.data()

                });

            }
        );


        // لا نحتاج عرض الإحالات هنا
        // لأن لوحة الإدارة الرئيسية
        // تعرض الأرقام فقط.


    } catch (e) {

        console.error(
            "Dashboard Error:",
            e
        );

    }

}


// ==========================================
// CLINIC MODAL
// ==========================================

const clinicModalElement =
    document.getElementById(
        "clinicModal"
    );


const clinicModal =
    clinicModalElement
        ? new bootstrap.Modal(
            clinicModalElement
        )
        : null;


document
    .getElementById(
        "addClinicBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            clinicModal?.show();

        }
    );


// ==========================================
// SAVE CLINIC
// ==========================================

document
    .getElementById(
        "saveClinicBtn"
    )
    ?.addEventListener(
        "click",
        async () => {

            try {

                const code =
                    document
                        .getElementById(
                            "clinicCode"
                        )
                        .value
                        .trim()
                        .toUpperCase();


                const name =
                    document
                        .getElementById(
                            "clinicName"
                        )
                        .value
                        .trim();


                if (
                    !code ||
                    !name
                ) {

                    alert(
                        "املأ جميع الحقول"
                    );

                    return;

                }


                await setDoc(
                    doc(
                        db,
                        "clinics",
                        code
                    ),
                    {

                        code:
                            code,

                        name:
                            name,

                        active:
                            true,

                        createdAt:
                            new Date()
                                .toISOString()

                    }
                );


                clinicModal?.hide();


                alert(
                    "تمت إضافة العيادة بنجاح"
                );


                loadDashboard();


            } catch (e) {

                console.error(e);

            }

        }
    );


// ==========================================
// DOCTOR MODAL
// ==========================================

const doctorModalElement =
    document.getElementById(
        "doctorModal"
    );


const doctorModal =
    doctorModalElement
        ? new bootstrap.Modal(
            doctorModalElement
        )
        : null;


document
    .getElementById(
        "addDoctorBtn"
    )
    ?.addEventListener(
        "click",
        async () => {

            const select =
                document.getElementById(
                    "doctorClinic"
                );


            if (!select) {
                return;
            }


            select.innerHTML =
                "";


            try {
                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "clinics"
                        )
                    );


                snapshot.forEach(
                    (clinic) => {

                        const data =
                            clinic.data();


                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            data.code;


                        option.textContent =
                            ${data.name} (${data.code});


                        select.appendChild(
                            option
                        );

                    }
                );


                doctorModal?.show();


            } catch (e) {

                console.error(e);


                alert(
                    "تعذر تحميل العيادات"
                );

            }

        }
    );


// ==========================================
// SAVE DOCTOR
// ==========================================

document
    .getElementById(
        "saveDoctorBtn"
    )
    ?.addEventListener(
        "click",
        async () => {

            const clinicCode =
                document
                    .getElementById(
                        "doctorClinic"
                    )
                    .value;


            const doctorName =
                document
                    .getElementById(
                        "doctorNameInput"
                    )
                    .value
                    .trim();


            if (
                !clinicCode ||
                !doctorName
            ) {

                alert(
                    "املأ جميع الحقول"
                );

                return;

            }


            try {

                const doctorsRef =
                    collection(
                        db,
                        "doctors"
                    );


                const q =
                    query(
                        doctorsRef,
                        where(
                            "clinicCode",
                            "==",
                            clinicCode
                        )
                    );


                const snapshot =
                    await getDocs(q);


                const nextNumber =
                    snapshot.size + 1;


                const doctorID =
                    clinicCode +
                    String(
                        nextNumber
                    ).padStart(
                        3,
                        "0"
                    );


                const clinicSelect =
                    document
                        .getElementById(
                            "doctorClinic"
                        );


                const clinicName =
                    clinicSelect
                        .options[
                            clinicSelect
                                .selectedIndex
                        ]
                        .text;


                await setDoc(
                    doc(
                        db,
                        "doctors",
                        doctorID
                    ),
                    {

                        id:
                            doctorID,

                        doctorName:
                            doctorName,

                        clinicCode:
                            clinicCode,

                        clinicName:
                            clinicName,

                        active:
                            true,

                        createdAt:
                            new Date()
                                .toISOString()

                    }
                );


                doctorModal?.hide();
                alert(
                    "تمت إضافة الطبيب\n\n" +
                    doctorID
                );


                loadDashboard();


            } catch (e) {

                console.error(e);


                alert(
                    "حدث خطأ"
                );

            }

        }
    );


// ==========================================
// START
// ==========================================

