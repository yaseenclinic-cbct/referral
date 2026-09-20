[2026-09-20 7:58 PM] سلمان مصور: import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwl_YFz58K6Cu1238_fbS4UoQkp5JIhpq9x7lLhWw0jdibnjf-obpgb-V9MPtuK7fg/exec";


// ======================================================
// Modals
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
// Global Data
// ======================================================

let allReferrals = [];
let allDoctors = [];


// ======================================================
// CBCT Tooth Selection
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
    document.getElementById(
        "addToothChartContainer"
    );

const addToothDropdownBtn =
    document.getElementById(
        "addToothDropdownBtn"
    );

const addToothDropdownMenu =
    document.getElementById(
        "addToothDropdownMenu"
    );

const addToothOptions =
    document.getElementById(
        "addToothOptions"
    );

const addSelectedTeethText =
    document.getElementById(
        "addSelectedTeethText"
    );


// ======================================================
// Selected Teeth Text
// ======================================================

function updateAddSelectedTeeth() {

    const teeth =
        Array.from(selectedAddTeeth)
            .sort((a, b) => a - b);

    if (!addSelectedTeethText) {
        return;
    }

    if (teeth.length === 0) {

        addSelectedTeethText.textContent =
            "اختيار الأسنان";

    } else {

        addSelectedTeethText.textContent =
            teeth.join(", ");

    }

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
            "tooth-group " +
            group.color;


        const groupTitle =
            document.createElement("div");

        groupTitle.className =
            "tooth-group-title";

        groupTitle.textContent =
            group.name;

        groupRow.appendChild(groupTitle);


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
[2026-09-20 7:58 PM] سلمان مصور: checkbox.value =
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


        groupRow.appendChild(
            teethContainer
        );

        addToothOptions.appendChild(
            groupRow
        );

    });

}


// ======================================================
// Get Selected Teeth
// ======================================================

function getSelectedAddTeeth() {

    return Array.from(
        selectedAddTeeth
    ).sort(
        (a, b) => a - b
    );

}


// ======================================================
// Clear Selected Teeth
// ======================================================

function clearAddSelectedTeeth() {

    selectedAddTeeth.clear();

    document
        .querySelectorAll(
            "#addToothOptions input[type='checkbox']"
        )
        .forEach(checkbox => {

            checkbox.checked = false;

        });

    updateAddSelectedTeeth();

}


// ======================================================
// Show / Hide Tooth Selector
// ======================================================

if (
    addCbctTooth &&
    addToothChartContainer
) {

    addCbctTooth.addEventListener(
        "change",
        () => {

            if (addCbctTooth.checked) {

                addToothChartContainer.style.display =
                    "block";

            } else {

                addToothChartContainer.style.display =
                    "none";

                clearAddSelectedTeeth();

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
// Build X-Ray List
// ======================================================

function getNewCaseXrays() {

    const xrays = [];


    document
        .querySelectorAll(
            ".add-xray-option:checked"
        )
        .forEach(checkbox => {

            if (
                checkbox.id ===
                "addCbctTooth"
            ) {

                return;

            }

            xrays.push(
                checkbox.value
            );

        });


    if (
        addCbctTooth &&
        addCbctTooth.checked
    ) {

        const teeth =
            getSelectedAddTeeth();

        if (teeth.length > 0) {
[2026-09-20 7:58 PM] سلمان مصور: xrays.push(
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
        document.getElementById(
            "addDoctor"
        );

    if (!doctorSelect) {
        return;
    }


    try {

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

                    id:
                        doctorDoc.id,

                    ...doctorDoc.data()

                });

            }
        );


        allDoctors.sort(
            (a, b) => {

                const nameA =
                    a.doctorName || "";

                const nameB =
                    b.doctorName || "";

                return nameA.localeCompare(
                    nameB,
                    "ar"
                );

            }
        );


        doctorSelect.innerHTML =
            <option value="">اختر الطبيب</option>;


        allDoctors.forEach(
            doctor => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    doctor.id;

                option.textContent =
                    doctor.doctorName || "";

                doctorSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading doctors:",
            error
        );

        alert(
            "تعذر تحميل قائمة الأطباء"
        );

    }

}


// ======================================================
// Doctor Selection
// ======================================================

const addDoctor =
    document.getElementById(
        "addDoctor"
    );

const addClinic =
    document.getElementById(
        "addClinic"
    );


if (addDoctor) {

    addDoctor.addEventListener(
        "change",
        () => {

            const selectedDoctor =
                allDoctors.find(
                    doctor =>
                        doctor.id ===
                        addDoctor.value
                );


            if (selectedDoctor) {

                if (addClinic) {

                    addClinic.value =
                        selectedDoctor.clinicName ||
                        "";

                }

            } else {

                if (addClinic) {

                    addClinic.value =
                        "";

                }

            }

        }
    );

}


// ======================================================
// Reset Form
// ======================================================

function resetAddCaseForm() {

    const doctor =
        document.getElementById(
            "addDoctor"
        );

    const clinic =
        document.getElementById(
            "addClinic"
        );

    const patientName =
        document.getElementById(
            "addPatientName"
        );

    const age =
        document.getElementById(
            "addPatientAge"
        );

    const phone =
        document.getElementById(
            "addPatientPhone"
        );

    const notes =
        document.getElementById(
            "addNotes"
        );


    if (doctor) doctor.value = "";
    if (clinic) clinic.value = "";
    if (patientName) patientName.value = "";
    if (age) age.value = "";
    if (phone) phone.value = "";
    if (notes) notes.value = "";


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
        .forEach(che
[2026-09-20 7:58 PM] سلمان مصور: ckbox => {

            checkbox.checked = false;

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
    document.getElementById(
        "addCaseBtn"
    );


if (
    addCaseBtn &&
    addCaseModal
) {

    addCaseBtn.addEventListener(
        "click",
        () => {

            resetAddCaseForm();

            addCaseModal.show();

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

            if (
                saveNewCaseBtn.disabled
            ) {

                return;

            }


            saveNewCaseBtn.disabled =
                true;

            saveNewCaseBtn.textContent =
                "جاري الحفظ...";


            try {

                // Doctor

                const doctorId =
                    document.getElementById(
                        "addDoctor"
                    ).value;


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
                        "تعذر العثور على بيانات الطبيب"
                    );

                    return;

                }


                // Patient

                const patientName =
                    document.getElementById(
                        "addPatientName"
                    ).value.trim();


                const age =
                    document.getElementById(
                        "addPatientAge"
                    ).value;


                const phone =
                    document.getElementById(
                        "addPatientPhone"
                    ).value.trim();


                const gender =
                    document.querySelector(
                        "input[name='addGender']:checked"
                    )?.value || "";


                const notes =
                    document.getElementById(
                        "addNotes"
                    ).value.trim();


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
                    addCbctTooth.checked
                ) {

                    const teeth =
                        getSelectedAddTeeth();


                    if (
                        teeth.length === 0
                    ) {

                        alert(
                            "يرجى اختيار سن واحد على الأقل لـ CBCT Tooth"
                        );

                        return;

                    }

                }


                if (
                    xrays.length === 0
                ) {

                    alert(
                        "يرجى اختيار نوع الأشعة"
                    );

                    ret
[2026-09-20 7:58 PM] سلمان مصور: urn;

                }


                // Referral ID

                const referralID =
                    "YR-" +
                    Date.now();


                // Firebase

                await addDoc(
                    collection(
                        db,
                        "referrals"
                    ),
                    {

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

                        dateOfCBCT:
                            "",

                        cbctPrice:
                            "",

                        done:
                            false,

                        createdAt:
                            serverTimestamp()

                    }
                );


                // Google Sheet

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


                alert(
                    "✅ تم إضافة الحالة بنجاح"
                );


                if (addCaseModal) {

                    addCaseModal.hide();

                }


                resetAddCaseForm();


            } catch (error) {

                console.error(
                    "Add case error:",
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
[2026-09-20 7:58 PM] سلمان مصور: return;

    }


    table.innerHTML = "";


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


    onSnapshot(

        q,

        snapshot => {

            console.log(
                "Referrals:",
                snapshot.size
            );


            allReferrals = [];


            snapshot.forEach(
                referral => {

                    allReferrals.push({

                        docId:
                            referral.id,

                        ...referral.data()

                    });

                }
            );


            renderReferrals(
                allReferrals
            );

        },

        error => {

            console.error(
                "❌ Error listening to referrals:",
                error
            );


            alert(
                "خطأ بتحميل الإحالات:\n\n" +
                error.message
            );

        }

    );

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


    list.forEach(data => {

        const row =
            document.createElement(
                "tr"
            );


        // Doctor

        const tdDoctor =
            document.createElement(
                "td"
            );

        tdDoctor.textContent =
            data.doctorName || "";


        // Clinic

        const tdClinic =
            document.createElement(
                "td"
            );

        tdClinic.textContent =
            data.clinicName || "";


        // Patient

        const tdPatient =
            document.createElement(
                "td"
            );

        tdPatient.textContent =
            data.patientName || "";


        // Age

        const tdAge =
            document.createElement(
                "td"
            );

        tdAge.textContent =
            data.age || "";


        // Phone

        const tdPhone =
            document.createElement(
                "td"
            );

        tdPhone.textContent =
            data.phone || "";


        // Gender

        const tdGender =
            document.createElement(
                "td"
            );

        tdGender.textContent =
            data.gender || "";


        // X-rays

        const tdXrays =
            document.createElement(
                "td"
            );


        tdXrays.textContent =
            Array.isArray(data.xrays)
                ? data.xrays.join(", ")
                : data.xrays || "";


        // Notes

        const tdNotes =
            document.createElement(
                "td"
            );

        tdNotes.textContent =
            data.notes || "";


        // Created Date

        const tdDate =
            document.createElement(
                "td"
            );


        if (data.createdAt) {

            try {

                tdDate.textContent =
                    data.createdAt
                        .toDate()
                        .toLocaleString(
                            "ar-IQ"
                        );

            } catch {

                tdDate.textContent =
                    "";

            }

        }


        // Date of CBCT

        const tdCBCTDate =
            document.createElement(
                "td"
            );


        const cbctDateInput =
            document.createElement(
                "input"
            );

        cbctDateInput.type =
            "date";

        cbctDateInput.className =
            "form-control form-control-sm";

        cbctDateInput.value =
            data.dateOfCBCT || "";


        cbctDateInput.addEventListener(
            "click",
            e => e.stopPropagation()
[2026-09-20 7:58 PM] سلمان مصور: );


        cbctDateInput.addEventListener(
            "change",
            async function(e) {

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


        // Price

        const tdPrice =
            document.createElement(
                "td"
            );


        const priceInput =
            document.createElement(
                "input"
            );

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
            e => e.stopPropagation()
        );


        priceInput.addEventListener(
            "change",
            async function(e) {

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


        // Done

        const tdDone =
            document.createElement(
                "td"
            );

        tdDone.className =
            "text-center";


        const doneCheckbox =
            document.createElement(
                "input"
            );

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
            e => e.stopPropagation()
        );


        doneCheckbox.addEventListener(
            "change",
            async function(e) {

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


        // Delete

        const tdAction =
            document.createElement(
                "td"
            );


        const deleteBtn =
            document.createElement(
                "button"
            );

        deleteBtn.className =
            "btn btn-danger btn-sm";

        deleteBtn.textContent =
            "Delete";


        deleteBtn.addEventListener(
            "click",
            async e => {

                e.stopPropagation();


                const ok =
                    confirm(
                        "هل أنت متأكد من حذف هذه الإحالة؟\n\n" +
                        "سيتم حذفها من Firebase و Google Sheet."
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


                    const formData =
                        new URLSearchParams();


                    formData.append(
                        "action",
                        "deleteReferral"
                    );


                    formData.append(
                        "referralID",
                        data.referralID || ""
                    );


                    const response =
                        await fetch(
                            GOOGLE_SCRIPT_URL,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type"
[2026-09-20 7:58 PM] سلمان مصور: :
                                        "application/x-www-form-urlencoded"

                                    },

                                body:
                                    formData.toString()

                            }
                        );


                    const result =
                        await response.json();


                    if (!result.success) {

                        alert(
                            "⚠️ تم حذف الإحالة من Firebase، " +
                            "لكن لم يتم حذفها من Google Sheet."
                        );

                        return;

                    }


                    alert(
                        "✅ تم حذف الإحالة بنجاح من Firebase و Google Sheet"
                    );


                } catch(error) {

                    console.error(
                        "Delete error:",
                        error
                    );

                    alert(
                        "❌ حدث خطأ أثناء حذف الإحالة:\n\n" +
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

        row.style.cursor =
            "pointer";


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
                    data.age || "";


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


                document.getElementById(
                    "viewDate"
                ).textContent =
                    data.createdAt
                        ? data.createdAt
                            .toDate()
                            .toLocaleString("ar-IQ")
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
// Update Referral Field
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


        if (data.referralID) {

            const formData
[2026-09-20 7:58 PM] سلمان مصور: =
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


    } catch(error) {

        console.error(
            "Update referral error:",
            error
        );

        alert(
            "حدث خطأ أثناء حفظ التعديل"
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
        function() {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const filtered =
                allReferrals.filter(
                    data => {

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

}


// ======================================================
// Initialize
// ======================================================

createAddToothOptions();

updateAddSelectedTeeth();

loadDoctors();

loadReferrals();
