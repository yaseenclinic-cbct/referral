import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    setDoc,
    updateDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let allClinics = [];

console.log("clinics.js loaded");


// ==========================================
// Bootstrap Modal
// ==========================================

const clinicModalElement =
    document.getElementById("clinicModal");

const clinicModal =
    new bootstrap.Modal(clinicModalElement);


// ==========================================
// Editing
// ==========================================

let editingClinic = null;


// ==========================================
// Constants
// ==========================================

const ROMEXIS_WARNING_DAYS = 50;


// ==========================================
// Date Helpers
// ==========================================

function getTodayWithoutTime() {

    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

}


function convertFirebaseDate(value) {

    if (!value) {
        return null;
    }


    // Firebase Timestamp

    if (
        typeof value.toDate === "function"
    ) {

        return value.toDate();

    }


    // JavaScript Date

    if (
        value instanceof Date
    ) {

        return value;

    }


    // String

    const date = new Date(value);

    if (
        !isNaN(date.getTime())
    ) {

        return date;

    }


    return null;

}


// ==========================================
// Calculate Romexis Status
// ==========================================

function getRomexisStatus(dateValue) {

    if (!dateValue) {

        return {
            type: "inactive",
            text: "غير مفعل",
            days: null
        };

    }


    const activationDate =
        convertFirebaseDate(dateValue);

    if (!activationDate) {

        return {
            type: "inactive",
            text: "غير مفعل",
            days: null
        };

    }


    const today =
        getTodayWithoutTime();


    const activation =
        new Date(
            activationDate.getFullYear(),
            activationDate.getMonth(),
            activationDate.getDate()
        );


    const difference =
        today.getTime() -
        activation.getTime();


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (
        days >= ROMEXIS_WARNING_DAYS
    ) {

        return {
            type: "warning",
            text: "يحتاج تنبيه",
            days: days
        };

    }


    return {
        type: "active",
        text: "فعال",
        days: days
    };

}


// ==========================================
// Format Date
// ==========================================

function formatDate(dateValue) {

    const date =
        convertFirebaseDate(dateValue);

    if (!date) {
        return "";
    }


    return date.toLocaleDateString(
        "ar-IQ",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    );

}


// ==========================================
// Add Clinic Button
// ==========================================

document
    .getElementById("addClinicBtn")
    .onclick = function () {

        editingClinic = null;


        document
            .getElementById("clinicCodeInput")
            .value = "";


        document
            .getElementById("clinicNameInput")
            .value = "";


        document
            .getElementById("romexisDateInput")
            .value = "";


        document
            .getElementById("clinicCodeInput")
            .disabled = false;


        document
            .getElementById("clinicModalTitle")
            .textContent = "إضافة عيادة";


        clinicModal.show();

    };


// ==========================================
// Load Clinics
// ==========================================

async function loadClinics() {

    const table =
        document.getElementById(
            "clinicTable"
        );


    table.innerHTML = "";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "clinics"
                )
            );


        allClinics = [];


        console.log(
            "Clinics:",
            snapshot.size
        );


        snapshot.forEach(
            (clinic) => {

                allClinics.push({

                    id:
                        clinic.id,

                    ...clinic.data()

                });

            }
        );


        renderClinics(
            allClinics
        );


    } catch (e) {

        console.error(
            "Error loading clinics:",
            e
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-danger">

                    حدث خطأ أثناء تحميل العيادات

                </td>

            </tr>

        `;

    }

}


// ==========================================
// Render Clinics
// ==========================================

function renderClinics(list) {

    const table =
        document.getElementById(
            "clinicTable"
        );


    table.innerHTML = "";


    if (list.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted">

                    لا توجد عيادات

                </td>

            </tr>

        `;

        return;

    }


    list.forEach(
        (data) => {

            const row =
                document.createElement(
                    "tr"
                );


            // ==================================
            // Clinic Code
            // ==================================

            const tdCode =
                document.createElement(
                    "td"
                );

            tdCode.textContent =
                data.code || "";


            // ==================================
            // Clinic Name
            // ==================================

            const tdName =
                document.createElement(
                    "td"
                );

            tdName.textContent =
                data.name || "";


            // ==================================
            // Romexis
            // ==================================

            const tdRomexis =
                document.createElement(
                    "td"
                );


            const romexisWrapper =
                document.createElement(
                    "div"
                );

            romexisWrapper.className =
                "romexis-date-wrapper";


            // Date input

            const dateInput =
                document.createElement(
                    "input"
                );

            dateInput.type = "date";

            dateInput.className =
                "form-control form-control-sm";


            if (
                data.romexisActivatedAt
            ) {

                const date =
                    convertFirebaseDate(
                        data.romexisActivatedAt
                    );


                if (date) {

                    const year =
                        date.getFullYear();


                    const month =
                        String(
                            date.getMonth() + 1
                        ).padStart(
                            2,
                            "0"
                        );


                    const day =
                        String(
                            date.getDate()
                        ).padStart(
                            2,
                            "0"
                        );


                    dateInput.value =
                        `${year}-${month}-${day}`;

                }

            }


            // ==================================
            // Status
            // ==================================

            const status =
                getRomexisStatus(
                    data.romexisActivatedAt
                );


            const statusElement =
                document.createElement(
                    "span"
                );


            statusElement.className =
                `romexis-status status-${status.type}`;


            const dot =
                document.createElement(
                    "span"
                );

            dot.className =
                "status-dot";


            const statusText =
                document.createElement(
                    "span"
                );

            statusText.textContent =
                status.text;


            statusElement.appendChild(
                dot
            );


            statusElement.appendChild(
                statusText
            );


            // Warning icon

            if (
                status.type === "warning"
            ) {

                const warning =
                    document.createElement(
                        "span"
                    );

                warning.className =
                    "warning-icon";

                warning.textContent =
                    "⚠";


                statusElement.appendChild(
                    warning
                );

            }


            // ==================================
            // Date Change
            // ==================================

            dateInput.addEventListener(
                "change",
                async function () {

                    const newDate =
                        this.value;


                    try {

                        await updateDoc(

                            doc(
                                db,
                                "clinics",
                                data.code
                            ),

                            {
                                romexisActivatedAt:
                                    newDate || null
                            }

                        );


                        data.romexisActivatedAt =
                            newDate || null;


                        renderClinics(
                            list
                        );


                    } catch (error) {

                        console.error(
                            "Romexis date update error:",
                            error
                        );


                        alert(
                            "حدث خطأ أثناء حفظ تاريخ Romexis"
                        );

                    }

                }
            );


            romexisWrapper.appendChild(
                dateInput
            );


            romexisWrapper.appendChild(
                statusElement
            );


            tdRomexis.appendChild(
                romexisWrapper
            );


            // ==================================
            // Actions
            // ==================================

            const tdButton =
                document.createElement(
                    "td"
                );


            // Edit

            const editBtn =
                document.createElement(
                    "button"
                );


            editBtn.className =
                "btn btn-warning btn-sm ms-2";


            editBtn.textContent =
                "Edit";


            editBtn.onclick =
                function () {

                    editingClinic =
                        data.code;


                    document
                        .getElementById(
                            "clinicCodeInput"
                        )
                        .value =
                        data.code;


                    document
                        .getElementById(
                            "clinicNameInput"
                        )
                        .value =
                        data.name || "";


                    // Romexis date

                    const romexisDate =
                        convertFirebaseDate(
                            data.romexisActivatedAt
                        );


                    if (
                        romexisDate
                    ) {

                        const year =
                            romexisDate.getFullYear();


                        const month =
                            String(
                                romexisDate.getMonth() + 1
                            ).padStart(
                                2,
                                "0"
                            );


                        const day =
                            String(
                                romexisDate.getDate()
                            ).padStart(
                                2,
                                "0"
                            );


                        document
                            .getElementById(
                                "romexisDateInput"
                            )
                            .value =
                            `${year}-${month}-${day}`;

                    } else {

                        document
                            .getElementById(
                                "romexisDateInput"
                            )
                            .value = "";

                    }


                    document
                        .getElementById(
                            "clinicCodeInput"
                        )
                        .disabled = true;


                    document
                        .getElementById(
                            "clinicModalTitle"
                        )
                        .textContent =
                        "تعديل العيادة";


                    clinicModal.show();

                };


            // Delete

            const deleteBtn =
                document.createElement(
                    "button"
                );


            deleteBtn.className =
                "btn btn-danger btn-sm";


            deleteBtn.textContent =
                "Delete";


            deleteBtn.onclick =
                async function () {

                    const doctors =
                        await getDocs(

                            query(

                                collection(
                                    db,
                                    "doctors"
                                ),

                                where(
                                    "clinicCode",
                                    "==",
                                    data.code
                                )

                            )

                        );


                    if (
                        doctors.size > 0
                    ) {

                        alert(
                            "لا يمكن حذف العيادة لأنها تحتوي على أطباء."
                        );

                        return;

                    }


                    if (
                        !confirm(
                            "هل أنت متأكد من حذف العيادة؟"
                        )
                    ) {

                        return;

                    }


                    await deleteDoc(

                        doc(
                            db,
                            "clinics",
                            data.code
                        )

                    );


                    loadClinics();

                };


            tdButton.appendChild(
                editBtn
            );

            tdButton.appendChild(
                deleteBtn
            );


            // ==================================
            // Row
            // ==================================

            row.appendChild(
                tdCode
            );

            row.appendChild(
                tdName
            );

            row.appendChild(
                tdRomexis
            );

            row.appendChild(
                tdButton
            );


            table.appendChild(
                row
            );

        }
    );

}


// ==========================================
// Save Clinic
// ==========================================

document
    .getElementById("saveClinicBtn")
    .onclick = async function () {

        const code =
            document
                .getElementById(
                    "clinicCodeInput"
                )
                .value
                .trim();


        const name =
            document
                .getElementById(
                    "clinicNameInput"
                )
                .value
                .trim();


        const romexisDate =
            document
                .getElementById(
                    "romexisDateInput"
                )
                .value;


        if (
            !code ||
            !name
        ) {

            alert(
                "املأ جميع الحقول"
            );

            return;

        }


        try {

            if (
                editingClinic == null
            ) {

                // ==========================
                // Check duplicate
                // ==========================

                const exists =
                    await getDocs(

                        query(

                            collection(
                                db,
                                "clinics"
                            ),

                            where(
                                "code",
                                "==",
                                code
                            )

                        )

                    );


                if (
                    exists.size > 0
                ) {

                    alert(
                        "كود العيادة مستخدم مسبقاً"
                    );

                    return;

                }


                // ==========================
                // Create
                // ==========================

                await setDoc(

                    doc(
                        db,
                        "clinics",
                        code
                    ),

                    {
                        code: code,

                        name: name,

                        romexisActivatedAt:
                            romexisDate || null
                    }

                );


                alert(
                    "تمت إضافة العيادة"
                );


            } else {

                // ==========================
                // Update
                // ==========================

                await updateDoc(

                    doc(
                        db,
                        "clinics",
                        editingClinic
                    ),

                    {

                        name:
                            name,

                        romexisActivatedAt:
                            romexisDate || null

                    }

                );


                alert(
                    "تم تعديل العيادة"
                );

            }


            clinicModal.hide();


            loadClinics();


        } catch (e) {

            console.error(
                "Save clinic error:",
                e
            );


            alert(
                "حدث خطأ"
            );

        }

    };


// ==========================================
// Search
// ==========================================

document
    .getElementById(
        "searchClinic"
    )
    .addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase();


            const filtered =
                allClinics.filter(
                    (data) => {

                        return (

                            (data.code || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            (data.name || "")
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            renderClinics(
                filtered
            );

        }
    );


// ==========================================
// Start
// ==========================================

loadClinics();
