import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    setDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


console.log("doctors.js loaded");


let allDoctors = [];


const doctorModal =
    new bootstrap.Modal(
        document.getElementById("doctorModal")
    );


// ========================================
// Add Doctor Button
// ========================================

document
    .getElementById("addDoctorBtn")
    .addEventListener(
        "click",
        async () => {

            const select =
                document.getElementById(
                    "doctorClinic"
                );

            select.innerHTML = "";


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
                            `${data.name} (${data.code})`;


                        select.appendChild(
                            option
                        );

                    }
                );


                doctorModal.show();


            } catch (e) {

                console.error(e);

                alert(
                    "تعذر تحميل العيادات"
                );

            }

        }
    );


// ========================================
// Load Doctors
// ========================================

async function loadDoctors() {

    const table =
        document.getElementById(
            "doctorTable"
        );


    table.innerHTML = "";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "doctors"
                )
            );


        allDoctors = [];


        console.log(
            "Doctors:",
            snapshot.size
        );


        snapshot.forEach(
            (doctor) => {

                allDoctors.push(
                    doctor.data()
                );

            }
        );


        renderDoctors(
            allDoctors
        );


    } catch (e) {

        console.error(e);

        alert(
            "تعذر تحميل الأطباء"
        );

    }

}


// ========================================
// Render Doctors
// ========================================

function renderDoctors(list) {

    const table =
        document.getElementById(
            "doctorTable"
        );


    table.innerHTML = "";


    list.forEach(
        (data) => {

            const row =
                document.createElement(
                    "tr"
                );


            // ========================================
            // ID
            // ========================================

            const tdID =
                document.createElement(
                    "td"
                );

            tdID.textContent =
                data.id || "";


            // ========================================
            // Doctor Name
            // ========================================

            const tdName =
                document.createElement(
                    "td"
                );

            tdName.textContent =
                data.doctorName || "";


            // ========================================
            // Clinic
            // ========================================

            const tdClinic =
                document.createElement(
                    "td"
                );
            tdClinic.textContent =
                data.clinicName || "";


            // ========================================
            // QR Code
            // ========================================

            const tdQR =
                document.createElement(
                    "td"
                );


            if (data.qrCode) {

                const qrImage =
                    document.createElement(
                        "img"
                    );


                qrImage.src =
                    data.qrCode;


                qrImage.className =
                    "qr-preview";


                qrImage.alt =
                    "QR Code";


                tdQR.appendChild(
                    qrImage
                );


            } else {

                const noQR =
                    document.createElement(
                        "span"
                    );


                noQR.className =
                    "no-qr";


                noQR.textContent =
                    "No QR";


                tdQR.appendChild(
                    noQR
                );

            }


            // ========================================
            // Link
            // ========================================

            const tdLink =
                document.createElement(
                    "td"
                );


            const copyBtn =
                document.createElement(
                    "button"
                );


            copyBtn.className =
                "btn btn-primary btn-sm";


            copyBtn.textContent =
                "Copy Link";


            copyBtn.onclick =
                () => copyLink(
                    data.id
                );


            tdLink.appendChild(
                copyBtn
            );


            // ========================================
            // Actions
            // ========================================

            const tdActions =
                document.createElement(
                    "td"
                );


            // Edit

            const editBtn =
                document.createElement(
                    "button"
                );


            editBtn.className =
                "btn btn-warning btn-sm";


            editBtn.textContent =
                "Edit";


            editBtn.onclick =
                () => {

                    window.location =
                        "edit-doctor.html?id=" +
                        encodeURIComponent(
                            data.id
                        );

                };


            // Download QR

            if (data.qrCode) {

                const downloadBtn =
                    document.createElement(
                        "button"
                    );


                downloadBtn.className =
                    "btn btn-success btn-sm ms-2";


                downloadBtn.textContent =
                    "Download QR";


                downloadBtn.onclick =
                    () => downloadQR(
                        data.qrCode,
                        data.id
                    );


                tdActions.appendChild(
                    downloadBtn
                );

            }


            // Delete

            const deleteBtn =
                document.createElement(
                    "button"
                );


            deleteBtn.className =
                "btn btn-danger btn-sm ms-2";


            deleteBtn.textContent =
                "Delete";


            deleteBtn.onclick =
                async () => {

                    if (
                        !confirm(
                            "هل أنت متأكد من حذف الطبيب؟"
                        )
                    ) {

                        return;

                    }


                    try {
                        await deleteDoc(
                            doc(
                                db,
                                "doctors",
                                data.id
                            )
                        );


                        await loadDoctors();


                    } catch (error) {

                        console.error(
                            error
                        );


                        alert(
                            "حدث خطأ أثناء حذف الطبيب"
                        );

                    }

                };


            tdActions.appendChild(
                editBtn
            );


            tdActions.appendChild(
                deleteBtn
            );


            // ========================================
            // Append Row
            // ========================================

            row.appendChild(
                tdID
            );

            row.appendChild(
                tdName
            );

            row.appendChild(
                tdClinic
            );

            row.appendChild(
                tdQR
            );

            row.appendChild(
                tdLink
            );

            row.appendChild(
                tdActions
            );


            table.appendChild(
                row
            );

        }
    );

}


// ========================================
// Copy Doctor Link
// ========================================

async function copyLink(id) {

    const link =
        "https://yaseenclinic-cbct.github.io/referral/?doctor=" +
        id;


    try {

        await navigator.clipboard.writeText(
            link
        );


        alert(
            "تم نسخ الرابط"
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "تعذر نسخ الرابط"
        );

    }

}


// ========================================
// Download QR
// ========================================

function downloadQR(
    imageData,
    doctorID
) {

    const link =
        document.createElement(
            "a"
        );


    link.href =
        imageData;


    link.download =
        "QR-" +
        doctorID +
        ".png";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );

}


// ========================================
// Add Doctor
// ========================================

document
    .getElementById("saveDoctorBtn")
    .addEventListener(
        "click",
        async () => {

            const clinicCode =
                document.getElementById(
                    "doctorClinic"
                ).value;


            const doctorName =
                document.getElementById(
                    "doctorNameInput"
                ).value.trim();


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


                const clinicText =
                    document.getElementById(
                        "doctorClinic"
                    );
                const clinicName =
                    clinicText.options[
                        clinicText.selectedIndex
                    ].text;


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

                        qrCode:
                            "",

                        createdAt:
                            new Date()

                    }

                );


                doctorModal.hide();


                alert(
                    "تمت إضافة الطبيب\n\n" +
                    doctorID
                );


                document
                    .getElementById(
                        "doctorNameInput"
                    )
                    .value = "";


                await loadDoctors();


            } catch (e) {

                console.error(e);

                alert(
                    "حدث خطأ"
                );

            }

        }
    );


// ========================================
// Search Doctors
// ========================================

document
    .getElementById(
        "searchDoctor"
    )
    .addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const filtered =
                allDoctors.filter(
                    (data) => {

                        return (

                            (data.id || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            (data.doctorName || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            (data.clinicName || "")
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            renderDoctors(
                filtered
            );

        }
    );


// ========================================
// Initial Load
// ========================================

loadDoctors();
