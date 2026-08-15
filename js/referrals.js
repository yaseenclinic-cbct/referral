import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwl_YFz58K6Cu1238_fbS4UoQkp5JIhpq9x7lLhWw0jdibnjf-obpgb-V9MPtuK7fg/exec";


const referralModal =
    new bootstrap.Modal(
        document.getElementById("referralModal")
    );


let allReferrals = [];


// ========================================
// Load Referrals
// ========================================

async function loadReferrals() {

    const table =
        document.getElementById("referralTable");

    table.innerHTML = "";


    try {

        const q = query(
            collection(db, "referrals"),
            orderBy("createdAt", "desc")
        );


        const snapshot =
            await getDocs(q);


        console.log(
            "Referrals:",
            snapshot.size
        );


        allReferrals = [];


        snapshot.forEach((referral) => {

            allReferrals.push({

                docId: referral.id,

                ...referral.data()

            });

        });


        renderReferrals(
            allReferrals
        );


    } catch (e) {

        console.error(
            "Error loading referrals:",
            e
        );

    }

}


// ========================================
// Render Referrals
// ========================================

function renderReferrals(list) {

    const table =
        document.getElementById("referralTable");


    table.innerHTML = "";


    list.forEach((data) => {

        const row =
            document.createElement("tr");


        // ========================================
        // Doctor
        // ========================================

        const tdDoctor =
            document.createElement("td");

        tdDoctor.textContent =
            data.doctorName || "";


        // ========================================
        // Clinic
        // ========================================

        const tdClinic =
            document.createElement("td");

        tdClinic.textContent =
            data.clinicName || "";


        // ========================================
        // Patient
        // ========================================

        const tdPatient =
            document.createElement("td");

        tdPatient.textContent =
            data.patientName || "";


        // ========================================
        // Age
        // ========================================

        const tdAge =
            document.createElement("td");

        tdAge.textContent =
            data.age || "";


        // ========================================
        // Phone
        // ========================================

        const tdPhone =
            document.createElement("td");

        tdPhone.textContent =
            data.phone || "";


        // ========================================
        // Gender
        // ========================================

        const tdGender =
            document.createElement("td");

        tdGender.textContent =
            data.gender || "";


        // ========================================
        // X-Rays
        // ========================================

        const tdXrays =
            document.createElement("td");


        tdXrays.textContent =
            Array.isArray(data.xrays)

                ? data.xrays.join(", ")

                : data.xrays || "";


        // ========================================
        // Notes
        // ========================================

        const tdNotes =
            document.createElement("td");

        tdNotes.textContent =
            data.notes || "";


        // ========================================
        // Created Date
        // ========================================

        const tdDate =
            document.createElement("td");


        if (data.createdAt) {

            try {
                tdDate.textContent =
                    data.createdAt
                        .toDate()
                        .toLocaleString("ar-IQ");

            } catch (error) {

                tdDate.textContent = "";

            }

        } else {

            tdDate.textContent = "";

        }


        // ========================================
        // Date of CBCT
        // ========================================

        const tdCBCTDate =
            document.createElement("td");


        const cbctDateInput =
            document.createElement("input");


        cbctDateInput.type =
            "date";


        cbctDateInput.className =
            "form-control form-control-sm";


        cbctDateInput.value =
            data.dateOfCBCT || "";


        // مهم:
        // منع فتح نافذة تفاصيل الإحالة
        // عند الضغط على التاريخ

        cbctDateInput.addEventListener(
            "click",
            function (e) {

                e.stopPropagation();

            }
        );


        cbctDateInput.addEventListener(
            "change",
            async function (e) {

                e.stopPropagation();


                await updateReferralField(
                    data,
                    "dateOfCBCT",
                    this.value
                );

            }
        );


        tdCBCTDate.appendChild(
            cbctDateInput
        );


        // ========================================
        // CBCT Price
        // ========================================

        const tdPrice =
            document.createElement("td");


        const priceInput =
            document.createElement("input");


        priceInput.type =
            "number";


        priceInput.min =
            "0";


        priceInput.className =
            "form-control form-control-sm";


        priceInput.placeholder =
            "Price";


        priceInput.value =
            data.cbctPrice ?? "";


        // مهم:
        // منع فتح نافذة تفاصيل الإحالة
        // عند الضغط على السعر

        priceInput.addEventListener(
            "click",
            function (e) {

                e.stopPropagation();

            }
        );


        priceInput.addEventListener(
            "change",
            async function (e) {

                e.stopPropagation();


                await updateReferralField(
                    data,
                    "cbctPrice",
                    this.value
                );

            }
        );


        tdPrice.appendChild(
            priceInput
        );


        // ========================================
        // Done?
        // ========================================

        const tdDone =
            document.createElement("td");


        tdDone.className =
            "text-center";


        const doneCheckbox =
            document.createElement("input");


        doneCheckbox.type =
            "checkbox";


        doneCheckbox.className =
            "form-check-input";


        doneCheckbox.style.transform =
            "scale(1.3)";


        doneCheckbox.checked =
            data.done === true;


        // مهم:
        // منع فتح نافذة تفاصيل الإحالة
        // عند الضغط على Checkbox

        doneCheckbox.addEventListener(
            "click",
            function (e) {

                e.stopPropagation();

            }
        );


        doneCheckbox.addEventListener(
            "change",
            async function (e) {

                e.stopPropagation();


                await updateReferralField(
                    data,
                    "done",
                    this.checked
                );

            }
        );


        tdDone.appendChild(
            doneCheckbox
        );


        // ========================================
        // Actions
        // ========================================

        const tdAction =
            document.createElement("td");


        const deleteBtn =
            document.createElement("button");
        deleteBtn.className =
            "btn btn-danger btn-sm";


        deleteBtn.textContent =
            "Delete";


        deleteBtn.addEventListener(
            "click",
            async function (e) {

                e.stopPropagation();


                const ok =
                    confirm(
                        "هل أنت متأكد من حذف هذه الإحالة؟"
                    );


                if (!ok) {
                    return;
                }


                try {

                    await deleteDoc(
                        doc(
                            db,
                            "referrals",
                            data.docId
                        )
                    );


                    alert(
                        "تم حذف الإحالة"
                    );


                    loadReferrals();


                } catch (error) {

                    console.error(
                        "Delete error:",
                        error
                    );


                    alert(
                        "حدث خطأ أثناء حذف الإحالة"
                    );

                }

            }
        );


        tdAction.appendChild(
            deleteBtn
        );


        // ========================================
        // Append all columns
        // ========================================

        row.appendChild(
            tdDoctor
        );

        row.appendChild(
            tdClinic
        );

        row.appendChild(
            tdPatient
        );

        row.appendChild(
            tdAge
        );

        row.appendChild(
            tdPhone
        );

        row.appendChild(
            tdGender
        );

        row.appendChild(
            tdXrays
        );

        row.appendChild(
            tdNotes
        );

        row.appendChild(
            tdDate
        );

        row.appendChild(
            tdCBCTDate
        );

        row.appendChild(
            tdPrice
        );

        row.appendChild(
            tdDone
        );

        row.appendChild(
            tdAction
        );


        // ========================================
        // Row click
        // ========================================

        row.style.cursor =
            "pointer";


        row.addEventListener(
            "click",
            function () {

                document
                    .getElementById(
                        "viewDoctor"
                    )
                    .textContent =
                    data.doctorName || "";


                document
                    .getElementById(
                        "viewClinic"
                    )
                    .textContent =
                    data.clinicName || "";


                document
                    .getElementById(
                        "viewPatient"
                    )
                    .textContent =
                    data.patientName || "";


                document
                    .getElementById(
                        "viewAge"
                    )
                    .textContent =
                    data.age || "";


                document
                    .getElementById(
                        "viewGender"
                    )
                    .textContent =
                    data.gender || "";


                document
                    .getElementById(
                        "viewPhone"
                    )
                    .textContent =
                    data.phone || "";


                document
                    .getElementById(
                        "viewXrays"
                    )
                    .textContent =

                    Array.isArray(
                        data.xrays
                    )

                        ? data.xrays.join(", ")

                        : data.xrays || "";
                document
                    .getElementById(
                        "viewNotes"
                    )
                    .textContent =
                    data.notes || "";


                document
                    .getElementById(
                        "viewDate"
                    )
                    .textContent =

                    data.createdAt

                        ? data.createdAt
                            .toDate()
                            .toLocaleString(
                                "ar-IQ"
                            )

                        : "";


                referralModal.show();

            }
        );


        table.appendChild(
            row
        );

    });

}


// ========================================
// Update Firebase + Google Sheet
// ========================================

async function updateReferralField(
    data,
    field,
    value
) {

    try {

        // ========================================
        // Firebase
        // ========================================

        await updateDoc(
            doc(
                db,
                "referrals",
                data.docId
            ),
            {
                [field]: value
            }
        );


        // تحديث البيانات المحلية

        data[field] =
            value;


        // ========================================
        // Google Sheet
        // ========================================

        if (data.referralID) {

            const formData =
                new URLSearchParams();


            formData.append(
                "action",
                "updateReferral"
            );


            formData.append(
                "referralID",
                data.referralID
            );


            formData.append(
                "dateOfCBCT",
                data.dateOfCBCT || ""
            );


            formData.append(
                "cbctPrice",
                data.cbctPrice ?? ""
            );


            formData.append(
                "done",
                data.done === true
                    ? "TRUE"
                    : "FALSE"
            );


            await fetch(
                GOOGLE_SCRIPT_URL,
                {

                    method:
                        "POST",

                    mode:
                        "no-cors",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    },

                    body:
                        formData

                }
            );

        }


        console.log(
            "Updated:",
            field,
            value
        );


    } catch (error) {

        console.error(
            "Update referral error:",
            error
        );


        alert(
            "حدث خطأ أثناء حفظ التعديل"
        );

    }

}


// ========================================
// Search
// ========================================

document
    .getElementById(
        "searchReferral"
    )
    .addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase();


            const filtered =
                allReferrals.filter(
                    (data) => {

                        return (

                            (
                                data.doctorName ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            (
                                data.clinicName ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||
                            (
                                data.patientName ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            (
                                data.phone ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            renderReferrals(
                filtered
            );

        }
    );


// ========================================
// Start
// ========================================

loadReferrals();
