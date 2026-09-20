import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwl_YFz58K6Cu1238_fbS4UoQkp5JIhpq9x7lLhWw0jdibnjf-obpgb-V9MPtuK7fg/exec";


console.log("REFERRALS JS LOADED");


// ======================================================
// Bootstrap Modals
// ======================================================

const referralModalElement =
    document.getElementById("referralModal");

const addCaseModalElement =
    document.getElementById("addCaseModal");


const referralModal =
    referralModalElement
        ? new bootstrap.Modal(referralModalElement)
        : null;


const addCaseModal =
    addCaseModalElement
        ? new bootstrap.Modal(addCaseModalElement)
        : null;


// ======================================================
// Global
// ======================================================

let allReferrals = [];
let allDoctors = [];


// ======================================================
// Tooth Selection
// ======================================================

const selectedAddTeeth = new Set();


const addToothGroups = [

    {
        name: "UR",
        color: "blue",
        teeth: [
            11, 12, 13, 14,
            15, 16, 17, 18
        ]
    },

    {
        name: "UL",
        color: "red",
        teeth: [
            21, 22, 23, 24,
            25, 26, 27, 28
        ]
    },

    {
        name: "LL",
        color: "green",
        teeth: [
            31, 32, 33, 34,
            35, 36, 37, 38
        ]
    },

    {
        name: "LR",
        color: "purple",
        teeth: [
            41, 42, 43, 44,
            45, 46, 47, 48
        ]
    }

];


const addCbctTooth =
    document.getElementById("addCbctTooth");

const addToothChartContainer =
    document.getElementById("addToothChartContainer");

const addToothDropdownBtn =
    document.getElementById("addToothDropdownBtn");

const addToothDropdownMenu =
    document.getElementById("addToothDropdownMenu");

const addToothOptions =
    document.getElementById("addToothOptions");

const addSelectedTeethText =
    document.getElementById("addSelectedTeethText");


// ======================================================
// Selected Teeth Text
// ======================================================

function updateAddSelectedTeeth() {

    if (!addSelectedTeethText) {
        return;
    }

    const teeth =
        Array.from(selectedAddTeeth)
            .sort((a, b) => a - b);


    addSelectedTeethText.textContent =
        teeth.length
            ? teeth.join(", ")
            : "اختيار الأسنان";

}


// ======================================================
// Create Tooth Options
// ======================================================

function createAddToothOptions() {

    if (!addToothOptions) {
        return;
    }


    addToothOptions.innerHTML = "";


    addToothGroups.forEach(group => {

        const groupRow =
            document.createElement("div");

        groupRow.className =
            `tooth-group ${group.color}`;


        const groupTitle =
            document.createElement("div");

        groupTitle.className =
            "tooth-group-title";

        groupTitle.textContent =
            group.name;


        const teethContainer =
            document.createElement("div");

        teethContainer.className =
            "tooth-group-teeth";


        group.teeth.forEach(toothNumber => {

            const label =
                document.createElement("label");

            label.className =
                "tooth-option";


            const checkbox =
                document.createElement("input");

            checkbox.type =
                "checkbox";

            checkbox.value =
                toothNumber;


            checkbox.addEventListener(
                "change",
                () => {

                    if (checkbox.checked) {

                        selectedAddTeeth.add(
                            toothNumber
                        );

                    } else {

                        selectedAddTeeth.delete(
                            toothNumber
                        );

                    }

                    updateAddSelectedTeeth();

                }
            );


            const number =
                document.createElement("span");

            number.textContent =
                toothNumber;


            label.appendChild(checkbox);
            label.appendChild(number);

            teethContainer.appendChild(label);

        });


        groupRow.appendChild(groupTitle);
        groupRow.appendChild(teethContainer);

        addToothOptions.appendChild(groupRow);

    });

}


// ======================================================
// Clear Teeth
// ======================================================

function clearAddSelectedTeeth() {

    selectedAddTeeth.clear();


    document
        .querySelectorAll(
            "#addToothOptions input[type='checkbox']"
        )
        .forEach(input => {

            input.checked = false;

        });


    updateAddSelectedTeeth();

}


// ======================================================
// CBCT Tooth Toggle
// ======================================================

if (addCbctTooth) {

    addCbctTooth.addEventListener(
        "change",
        () => {

            if (addCbctTooth.checked) {

                if (addToothChartContainer) {

                    addToothChartContainer.style.display =
                        "block";

                }

            } else {

                if (addToothChartContainer) {

                    addToothChartContainer.style.display =
                        "none";

                }

                clearAddSelectedTeeth();

            }

        }
    );

}


// ======================================================
// Tooth Dropdown
// ======================================================

if (
    addToothDropdownBtn &&
    addToothDropdownMenu
) {

    addToothDropdownBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            addToothDropdownMenu.hidden =
                !addToothDropdownMenu.hidden;

            addToothDropdownBtn.setAttribute(
                "aria-expanded",
                String(
                    !addToothDropdownMenu.hidden
                )
            );

        }
    );


    addToothDropdownMenu.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );

}


// ======================================================
// Get X-Rays
// ======================================================

function getNewCaseXrays() {

    const xrays = [];


    document
        .querySelectorAll(
            ".add-xray-option:checked"
        )
        .forEach(input => {

            if (
                input.id === "addCbctTooth"
            ) {
                return;
            }

            xrays.push(input.value);

        });


    if (
        addCbctTooth &&
        addCbctTooth.checked
    ) {

        const teeth =
            Array.from(selectedAddTeeth)
                .sort((a, b) => a - b);


        if (teeth.length > 0) {

            xrays.push(
                "CBCT Tooth: " +
                teeth.join(", ")
            );

        }

    }


    return xrays;

}


// ======================================================
// Load Doctors
// ======================================================

async function loadDoctors() {

    const doctorSelect =
        document.getElementById("addDoctor");


    if (!doctorSelect) {
        return;
    }


    try {

        console.log(
            "Loading doctors..."
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "doctors"
                )
            );


        allDoctors = [];


        snapshot.forEach(
            doctorDoc => {

                allDoctors.push({

                    id: doctorDoc.id,

                    ...doctorDoc.data()

                });

            }
        );


        console.log(
            "Doctors loaded:",
            allDoctors
        );


        allDoctors.sort(
            (a, b) =>
                (a.doctorName || "")
                    .localeCompare(
                        b.doctorName || "",
                        "ar"
                    )
        );


        doctorSelect.innerHTML =
            `<option value="">اختر الطبيب</option>`;


        allDoctors.forEach(
            doctor => {

                const option =
                    document.createElement("option");


                option.value =
                    doctor.id;


                option.textContent =
                    doctor.doctorName || "";


                doctorSelect.appendChild(option);

            }
        );


    } catch (error) {

        console.error(
            "LOAD DOCTORS ERROR:",
            error
        );

        alert(
            "تعذر تحميل قائمة الأطباء:\n\n" +
            error.message
        );

    }

}


// ======================================================
// Doctor Selection
// ======================================================

const addDoctor =
    document.getElementById("addDoctor");

const addClinic =
    document.getElementById("addClinic");


if (addDoctor) {

    addDoctor.addEventListener(
        "change",
        () => {

            const doctor =
                allDoctors.find(
                    item =>
                        item.id ===
                        addDoctor.value
                );


            if (doctor) {

                addClinic.value =
                    doctor.clinicName || "";

            } else {

                addClinic.value = "";

            }

        }
    );

}


// ======================================================
// Reset Add Case Form
// ======================================================

function resetAddCaseForm() {

    if (addDoctor) {
        addDoctor.value = "";
    }

    if (addClinic) {
        addClinic.value = "";
    }


    const patientName =
        document.getElementById(
            "addPatientName"
        );

    const patientAge =
        document.getElementById(
            "addPatientAge"
        );

    const patientPhone =
        document.getElementById(
            "addPatientPhone"
        );

    const notes =
        document.getElementById(
            "addNotes"
        );


    if (patientName) {
        patientName.value = "";
    }

    if (patientAge) {
        patientAge.value = "";
    }

    if (patientPhone) {
        patientPhone.value = "";
    }

    if (notes) {
        notes.value = "";
    }


    document
        .querySelectorAll(
            "input[name='addGender']"
        )
        .forEach(input => {

            input.checked = false;

        });


    document
        .querySelectorAll(
            ".add-xray-option"
        )
        .forEach(input => {

            input.checked = false;

        });


    clearAddSelectedTeeth();


    if (addToothChartContainer) {

        addToothChartContainer.style.display =
            "none";

    }


    if (addToothDropdownMenu) {

        addToothDropdownMenu.hidden =
            true;

    }


    if (addToothDropdownBtn) {

        addToothDropdownBtn.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// ======================================================
// Add Case Button
// ======================================================

const addCaseBtn =
    document.getElementById("addCaseBtn");


if (addCaseBtn) {

    addCaseBtn.addEventListener(
        "click",
        () => {

            resetAddCaseForm();

            if (addCaseModal) {
                addCaseModal.show();
            }

        }
    );

}


// ======================================================
// Save New Case
// ======================================================

const saveNewCaseBtn =
    document.getElementById(
        "saveNewCaseBtn"
    );


if (saveNewCaseBtn) {

    saveNewCaseBtn.addEventListener(
        "click",
        async () => {

            if (saveNewCaseBtn.disabled) {
                return;
            }


            try {

                saveNewCaseBtn.disabled = true;

                saveNewCaseBtn.textContent =
                    "جاري الحفظ...";


                // Doctor

                const doctorId =
                    addDoctor.value;


                if (!doctorId) {

                    alert(
                        "يرجى اختيار الطبيب"
                    );

                    return;

                }


                const selectedDoctor =
                    allDoctors.find(
                        doctor =>
                            doctor.id ===
                            doctorId
                    );


                if (!selectedDoctor) {

                    alert(
                        "تعذر العثور على الطبيب"
                    );

                    return;

                }


                // Patient

                const patientName =
                    document
                        .getElementById(
                            "addPatientName"
                        )
                        .value
                        .trim();


                const age =
                    document
                        .getElementById(
                            "addPatientAge"
                        )
                        .value;


                const phone =
                    document
                        .getElementById(
                            "addPatientPhone"
                        )
                        .value
                        .trim();


                const gender =
                    document
                        .querySelector(
                            "input[name='addGender']:checked"
                        )
                        ?.value || "";


                const notes =
                    document
                        .getElementById(
                            "addNotes"
                        )
                        .value
                        .trim();


                if (
                    !patientName ||
                    !phone
                ) {

                    alert(
                        "يرجى إدخال اسم المراجع ورقم الهاتف"
                    );

                    return;

                }


                // X-rays

                const xrays =
                    getNewCaseXrays();


                if (
                    addCbctTooth &&
                    addCbctTooth.checked &&
                    selectedAddTeeth.size === 0
                ) {

                    alert(
                        "يرجى اختيار سن واحد على الأقل لـ CBCT Tooth"
                    );

                    return;

                }


                if (xrays.length === 0) {

                    alert(
                        "يرجى اختيار نوع الأشعة"
                    );

                    return;

                }


                // Referral ID

                const referralID =
                    "YR-" +
                    Date.now();


                // Firebase

                const referralData = {

                    referralID,

                    doctorID:
                        selectedDoctor.id || "",

                    doctorName:
                        selectedDoctor.doctorName || "",

                    clinicName:
                        selectedDoctor.clinicName || "",

                    patientName,

                    age,

                    gender,

                    phone,

                    xrays,

                    notes,

                    dateOfCBCT: "",

                    cbctPrice: "",

                    done: false,

                    createdAt:
                        serverTimestamp()

                };


                console.log(
                    "Saving referral:",
                    referralData
                );


                await addDoc(
                    collection(
                        db,
                        "referrals"
                    ),
                    referralData
                );


                // Google Sheet

                try {

                    const formData =
                        new URLSearchParams();


                    formData.append(
                        "referralID",
                        referralID
                    );

                    formData.append(
                        "doctorID",
                        selectedDoctor.id || ""
                    );

                    formData.append(
                        "doctorName",
                        selectedDoctor.doctorName || ""
                    );

                    formData.append(
                        "clinicName",
                        selectedDoctor.clinicName || ""
                    );

                    formData.append(
                        "patientName",
                        patientName
                    );

                    formData.append(
                        "age",
                        age
                    );

                    formData.append(
                        "gender",
                        gender
                    );

                    formData.append(
                        "phone",
                        phone
                    );

                    formData.append(
                        "xrays",
                        xrays.join(", ")
                    );

                    formData.append(
                        "notes",
                        notes
                    );


                    await fetch(
                        GOOGLE_SCRIPT_URL,
                        {

                            method: "POST",

                            mode: "no-cors",

                            headers: {

                                "Content-Type":
                                    "application/x-www-form-urlencoded"

                            },

                            body:
                                formData.toString()

                        }
                    );

                } catch (sheetError) {

                    console.error(
                        "Google Sheet error:",
                        sheetError
                    );

                }


                alert(
                    "✅ تم إضافة الحالة بنجاح"
                );


                if (addCaseModal) {
                    addCaseModal.hide();
                }


                resetAddCaseForm();


            } catch (error) {

                console.error(
                    "SAVE CASE ERROR:",
                    error
                );


                alert(
                    "❌ حدث خطأ أثناء إضافة الحالة:\n\n" +
                    error.message
                );

            } finally {

                saveNewCaseBtn.disabled =
                    false;

                saveNewCaseBtn.textContent =
                    "حفظ الحالة";

            }

        }
    );

}


// ======================================================
// Load Referrals
// ======================================================

function loadReferrals() {

    const table =
        document.getElementById(
            "referralTable"
        );


    if (!table) {

        console.error(
            "referralTable not found"
        );

        return;

    }


    console.log(
        "Starting referrals listener..."
    );


    table.innerHTML =
        `
        <tr>
            <td colspan="13" class="text-center">
                جاري تحميل الإحالات...
            </td>
        </tr>
        `;


    const referralsCollection =
        collection(
            db,
            "referrals"
        );


    onSnapshot(

        referralsCollection,

        snapshot => {

            console.log(
                "Firebase referrals:",
                snapshot.size
            );


            allReferrals = [];


            snapshot.forEach(
                referralDoc => {

                    const data =
                        referralDoc.data();


                    allReferrals.push({

                        docId:
                            referralDoc.id,

                        ...data

                    });

                }
            );


            // Sort in JavaScript

            allReferrals.sort(
                (a, b) => {

                    const dateA =
                        getTimestampMillis(
                            a.createdAt
                        );

                    const dateB =
                        getTimestampMillis(
                            b.createdAt
                        );


                    return dateB - dateA;

                }
            );


            renderReferrals(
                allReferrals
            );

        },

        error => {

            console.error(
                "FIREBASE REFERRALS ERROR:",
                error
            );


            table.innerHTML =
                `
                <tr>
                    <td
                        colspan="13"
                        class="text-center text-danger"
                    >
                        ❌ خطأ في تحميل الإحالات
                        <br>
                        <small>
                            ${escapeHtml(error.message)}
                        </small>
                    </td>
                </tr>
                `;

        }

    );

}


// ======================================================
// Timestamp Helper
// ======================================================

function getTimestampMillis(timestamp) {

    if (!timestamp) {
        return 0;
    }


    try {

        if (
            typeof timestamp.toMillis ===
            "function"
        ) {

            return timestamp.toMillis();

        }


        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp.toDate().getTime();

        }


        if (
            timestamp instanceof Date
        ) {

            return timestamp.getTime();

        }


        if (
            typeof timestamp ===
            "number"
        ) {

            return timestamp;

        }


        if (
            typeof timestamp ===
            "string"
        ) {

            const parsed =
                Date.parse(timestamp);


            return isNaN(parsed)
                ? 0
                : parsed;

        }

    } catch (error) {

        return 0;

    }


    return 0;

}


// ======================================================
// Escape HTML
// ======================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ======================================================
// Render Referrals
// ======================================================

function renderReferrals(list) {

    const table =
        document.getElementById(
            "referralTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (list.length === 0) {

        table.innerHTML =
            `
            <tr>
                <td
                    colspan="13"
                    class="text-center text-muted"
                >
                    لا توجد إحالات
                </td>
            </tr>
            `;

        return;

    }


    list.forEach(data => {

        const row =
            document.createElement("tr");


        row.style.cursor =
            "pointer";


        // Doctor

        const tdDoctor =
            document.createElement("td");

        tdDoctor.textContent =
            data.doctorName || "";


        // Clinic

        const tdClinic =
            document.createElement("td");

        tdClinic.textContent =
            data.clinicName || "";


        // Patient

        const tdPatient =
            document.createElement("td");

        tdPatient.textContent =
            data.patientName || "";


        // Age

        const tdAge =
            document.createElement("td");

        tdAge.textContent =
            data.age ?? "";


        // Phone

        const tdPhone =
            document.createElement("td");

        tdPhone.textContent =
            data.phone || "";


        // Gender

        const tdGender =
            document.createElement("td");

        tdGender.textContent =
            data.gender || "";


        // X-rays

        const tdXrays =
            document.createElement("td");


        if (Array.isArray(data.xrays)) {

            tdXrays.textContent =
                data.xrays.join(", ");

        } else {

            tdXrays.textContent =
                data.xrays || "";

        }


        // Notes

        const tdNotes =
            document.createElement("td");

        tdNotes.textContent =
            data.notes || "";


        // Created Date

        const tdDate =
            document.createElement("td");


        const createdMillis =
            getTimestampMillis(
                data.createdAt
            );


        if (createdMillis) {

            tdDate.textContent =
                new Date(
                    createdMillis
                ).toLocaleString(
                    "ar-IQ"
                );

        } else {

            tdDate.textContent =
                "";

        }


        // Date of CBCT

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


        cbctDateInput.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        cbctDateInput.addEventListener(
            "change",
            event => {

                event.stopPropagation();

                updateReferralField(
                    data,
                    "dateOfCBCT",
                    event.target.value
                );

            }
        );


        tdCBCTDate.appendChild(
            cbctDateInput
        );


        // Price

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


        priceInput.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        priceInput.addEventListener(
            "change",
            event => {

                event.stopPropagation();

                updateReferralField(
                    data,
                    "cbctPrice",
                    event.target.value
                );

            }
        );


        tdPrice.appendChild(
            priceInput
        );


        // Done

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


        doneCheckbox.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        doneCheckbox.addEventListener(
            "change",
            event => {

                event.stopPropagation();

                updateReferralField(
                    data,
                    "done",
                    event.target.checked
                );

            }
        );


        tdDone.appendChild(
            doneCheckbox
        );


        // Actions

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
            async event => {

                event.stopPropagation();


                const confirmed =
                    confirm(
                        "هل أنت متأكد من حذف هذه الإحالة؟"
                    );


                if (!confirmed) {
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
                        "✅ تم حذف الإحالة من Firebase"
                    );


                } catch (error) {

                    console.error(
                        "DELETE ERROR:",
                        error
                    );


                    alert(
                        "❌ حدث خطأ أثناء الحذف:\n\n" +
                        error.message
                    );

                }

            }
        );


        tdAction.appendChild(
            deleteBtn
        );


        // Append

        row.appendChild(tdDoctor);
        row.appendChild(tdClinic);
        row.appendChild(tdPatient);
        row.appendChild(tdAge);
        row.appendChild(tdPhone);
        row.appendChild(tdGender);
        row.appendChild(tdXrays);
        row.appendChild(tdNotes);
        row.appendChild(tdDate);
        row.appendChild(tdCBCTDate);
        row.appendChild(tdPrice);
        row.appendChild(tdDone);
        row.appendChild(tdAction);


        // Row click

        row.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "viewDoctor"
                ).textContent =
                    data.doctorName || "";


                document.getElementById(
                    "viewClinic"
                ).textContent =
                    data.clinicName || "";


                document.getElementById(
                    "viewPatient"
                ).textContent =
                    data.patientName || "";


                document.getElementById(
                    "viewAge"
                ).textContent =
                    data.age ?? "";


                document.getElementById(
                    "viewGender"
                ).textContent =
                    data.gender || "";


                document.getElementById(
                    "viewPhone"
                ).textContent =
                    data.phone || "";


                document.getElementById(
                    "viewXrays"
                ).textContent =
                    Array.isArray(data.xrays)
                        ? data.xrays.join(", ")
                        : data.xrays || "";


                document.getElementById(
                    "viewNotes"
                ).textContent =
                    data.notes || "";


                const millis =
                    getTimestampMillis(
                        data.createdAt
                    );


                document.getElementById(
                    "viewDate"
                ).textContent =
                    millis
                        ? new Date(
                            millis
                        ).toLocaleString(
                            "ar-IQ"
                        )
                        : "";


                if (referralModal) {
                    referralModal.show();
                }

            }
        );


        table.appendChild(row);

    });

}


// ======================================================
// Update Referral
// ======================================================

async function updateReferralField(
    data,
    field,
    value
) {

    try {

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


        data[field] =
            value;


        console.log(
            "Updated:",
            field,
            value
        );


        if (!data.referralID) {
            return;
        }


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


        try {

            await fetch(
                GOOGLE_SCRIPT_URL,
                {

                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body:
                        formData.toString()

                }
            );

        } catch (sheetError) {

            console.error(
                "Google Sheet update error:",
                sheetError
            );

        }

    } catch (error) {

        console.error(
            "UPDATE ERROR:",
            error
        );


        alert(
            "❌ حدث خطأ أثناء حفظ التعديل:\n\n" +
            error.message
        );

    }

}


// ======================================================
// Search
// ======================================================

const searchReferral =
    document.getElementById(
        "searchReferral"
    );


if (searchReferral) {

    searchReferral.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderReferrals(
                    allReferrals
                );

                return;

            }


            const filtered =
                allReferrals.filter(
                    data => {

                        const doctor =
                            String(
                                data.doctorName || ""
                            ).toLowerCase();

                        const clinic =
                            String(
                                data.clinicName || ""
                            ).toLowerCase();

                        const patient =
                            String(
                                data.patientName || ""
                            ).toLowerCase();

                        const phone =
                            String(
                                data.phone || ""
                            ).toLowerCase();


                        return (
                            doctor.includes(search) ||
                            clinic.includes(search) ||
                            patient.includes(search) ||
                            phone.includes(search)
                        );

                    }
                );


            renderReferrals(
                filtered
            );

        }
    );

}


// ======================================================
// Initialize
// ======================================================

createAddToothOptions();

updateAddSelectedTeeth();

loadDoctors();

loadReferrals();
  
