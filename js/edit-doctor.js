import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ========================================
// Doctor ID
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );


const doctorID =
    params.get("id");


let currentQRCode = "";


// ========================================
// Elements
// ========================================

const doctorNameInput =
    document.getElementById(
        "doctorName"
    );


const clinicSelect =
    document.getElementById(
        "doctorClinic"
    );


const qrInput =
    document.getElementById(
        "qrInput"
    );


const qrPreview =
    document.getElementById(
        "qrPreview"
    );


const saveBtn =
    document.getElementById(
        "saveBtn"
    );


// ========================================
// Load Doctor
// ========================================

async function loadDoctor() {

    if (!doctorID) {

        alert(
            "Doctor ID not found"
        );

        return;

    }


    try {

        const doctorRef =
            doc(
                db,
                "doctors",
                doctorID
            );


        const doctorSnap =
            await getDoc(
                doctorRef
            );


        if (!doctorSnap.exists()) {

            alert(
                "Doctor not found"
            );

            return;

        }


        const doctor =
            doctorSnap.data();


        // ========================================
        // Doctor Name
        // ========================================

        doctorNameInput.value =
            doctor.doctorName || "";


        // ========================================
        // QR Code
        // ========================================

        currentQRCode =
            doctor.qrCode || "";


        if (currentQRCode) {

            qrPreview.src =
                currentQRCode;


            qrPreview.style.display =
                "block";

        } else {

            qrPreview.style.display =
                "none";

        }


        // ========================================
        // Clinics
        // ========================================

        clinicSelect.innerHTML =
            "";


        const clinics =
            await getDocs(
                collection(
                    db,
                    "clinics"
                )
            );


        clinics.forEach(
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
                    data.name;


                if (
                    data.code ===
                    doctor.clinicCode
                ) {

                    option.selected =
                        true;

                }


                clinicSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "حدث خطأ أثناء تحميل بيانات الطبيب"
        );

    }

}


// ========================================
// QR Image Selection
// ========================================

qrInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {

            return;

        }


        // السماح فقط بالصور

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "الملف يجب أن يكون صورة"
            );


            this.value =
                "";


            return;

        }


        // حد أقصى 2MB
    if (
            file.size >
            2 * 1024 * 1024
        ) {

            alert(
                "حجم الصورة يجب أن لا يتجاوز 2MB"
            );


            this.value =
                "";


            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                currentQRCode =
                    event.target.result;


                qrPreview.src =
                    currentQRCode;


                qrPreview.style.display =
                    "block";

            };


        reader.readAsDataURL(
            file
        );

    }
);


// ========================================
// Save Doctor
// ========================================

saveBtn.onclick =
    async function () {

        try {

            saveBtn.disabled =
                true;


            saveBtn.textContent =
                "جاري الحفظ...";


            // ========================================
            // Clinic
            // ========================================

            const clinicCode =
                clinicSelect.value;


            const clinics =
                await getDocs(
                    collection(
                        db,
                        "clinics"
                    )
                );


            let clinicName =
                "";


            clinics.forEach(
                (clinic) => {

                    const data =
                        clinic.data();


                    if (
                        data.code ===
                        clinicCode
                    ) {

                        clinicName =
                            data.name;

                    }

                }
            );


            // ========================================
            // Update Firebase
            // ========================================

            await updateDoc(

                doc(
                    db,
                    "doctors",
                    doctorID
                ),

                {

                    doctorName:
                        doctorNameInput.value.trim(),

                    clinicCode:
                        clinicCode,

                    clinicName:
                        clinicName,

                    qrCode:
                        currentQRCode

                }

            );


            alert(
                "تم تحديث بيانات الطبيب بنجاح"
            );


            window.location =
                "doctors.html";


        } catch (error) {

            console.error(
                error
            );


            alert(
                "حدث خطأ أثناء حفظ البيانات"
            );


            saveBtn.disabled =
                false;


            saveBtn.textContent =
                "حفظ التعديلات";

        }

    };


// ========================================
// Start
// ========================================

loadDoctor();
