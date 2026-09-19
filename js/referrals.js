Import { db } from “./firebase.js”;
Import {
 Collection,
 onSnapshot,
 deleteDoc,
 doc,
 query,
 orderBy,
 updateDoc,
 getDocs,
 addDoc,
 serverTimestamp
} from https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js;
Const GOOGLE_SCRIPT_URL =

https://script.google.com/macros/s/AKfycbwl_YFz58K6Cu1238_fbS4UoQkp5JIhpq9x7lLh
Ww0jdibnjf-obpgb-V9MPtuK7fg/exec;
// ========================================
// Existing Referral Details Modal
// ========================================
Const referralModal =
 New bootstrap.Modal(
 Document.getElementById(“referralModal”)
 );
// ========================================
// Add New Case Modal
// ========================================
Const addCaseModal =
 New bootstrap.Modal(
 Document.getElementById(“addCaseModal”)
 );
Let allReferrals = [];
// ========================================
// Doctors
// ========================================
Let allDoctors = [];
// ========================================
// CBCT Tooth Selection – Add Case
// ========================================
Const selectedAddTeeth = new Set();
Const addToothGroups = [
 {
 Name: “UR”,
 Color: “blue”,
 Teeth: [
 11, 12, 13, 14,
 15, 16, 17, 18
 ]
 },
 {
 Name: “UL”,
 Color: “red”,
 Teeth: [
 21, 22, 23, 24,
 25, 26, 27, 28
 ]
 },
 {
 Name: “LL”,
 Color: “green”,
 Teeth: [
 31, 32, 33, 34,
 35, 36, 37, 38
 ]
 },
 {
 Name: “LR”,
 Color: “purple”,
 Teeth: [
 41, 42, 43, 44,
 45, 46, 47, 48
 ]
 }
];
Const addCbctTooth =
 Document.getElementById(“addCbctTooth”);
Const addToothChartContainer =
 Document.getElementById(
 “addToothChartContainer”
 );
Const addToothDropdownBtn =
 Document.getElementById(
 “addToothDropdownBtn”
 );
Const addToothDropdownMenu =
 Document.getElementById(
 “addToothDropdownMenu”
 );
Const addToothOptions =
 Document.getElementById(
 “addToothOptions”
 );
Const addSelectedTeethText =
 Document.getElementById(
 “addSelectedTeethText”
 );
// ========================================
// Update Selected Teeth Text
// ========================================
Function updateAddSelectedTeeth() {
 Const teeth =
 Array.from(selectedAddTeeth)
 .sort((a, b) => a – b);
 If (teeth.length === 0) {
 addSelectedTeethText.textContent =
 ;"األسنان اختيار "
 } else {
 addSelectedTeethText.textContent =
 teeth.join(“, “);
 }
}
// ========================================
// Create Tooth Options
// ========================================
Function createAddToothOptions() {
 If (!addToothOptions) {
 Return;
 }
 addToothOptions.innerHTML = “”;
 addToothGroups.forEach(group => {
 const groupRow =
 document.createElement(“div”);
 groupRow.className =
 “tooth-group “ +
 Group.color;
 // Quadrant title
 Const groupTitle =
 Document.createElement(“div”);
 groupTitle.className =
 “tooth-group-title”;
 groupTitle.textContent =
 group.name;
 groupRow.appendChild(
 groupTitle
 );
 // Teeth container
 Const teethContainer =
 Document.createElement(“div”);
 teethContainer.className =
 “tooth-group-teeth”;
 Group.teeth.forEach(toothNumber => {
 Const label =
 Document.createElement(“label”);
 Label.className =
 “tooth-option”;
 Const checkbox =
 Document.createElement(“input”);
 Checkbox.type =
 “checkbox”;
 Checkbox.value =
 toothNumber;
 checkbox.addEventListener(
 “change”,
 () => {
 If (checkbox.checked) {
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
 Const number =
 Document.createElement(“span”);
 Number.textContent =
 toothNumber;
 label.appendChild(
 checkbox
 );
 Label.appendChild(
 Number
 );
 teethContainer.appendChild(
 label
 );
 });
 groupRow.appendChild(
 teethContainer
 );
 addToothOptions.appendChild(
 groupRow
 );
 });
}
// ========================================
// Get Selected Teeth
// ========================================
Function getSelectedAddTeeth() {
 Return Array.from(
 selectedAddTeeth
 ).sort(
 (a, b) => a – b
 );
}
// ========================================
// Clear Teeth
// ========================================
Function clearAddSelectedTeeth() {
 selectedAddTeeth.clear();
 document
 .querySelectorAll(
 “#addToothOptions input[type=checkbox]”
 )
 .forEach(checkbox => {
 Checkbox.checked =
 False;
 });
 updateAddSelectedTeeth();
}
// ========================================
// Show / Hide Tooth Selector
// ========================================
If (
 addCbctTooth &&
 addToothChartContainer
) {
 addCbctTooth.addEventListener(
 “change”,
 () => {
 If (addCbctTooth.checked) {
 addToothChartContainer.style.display =
 “block”;
 } else {
 addToothChartContainer.style.display =
 “none”;
 clearAddSelectedTeeth();
 if (addToothDropdownMenu) {
 addToothDropdownMenu.hidden =
 true;
 }
 If (addToothDropdownBtn) {
 addToothDropdownBtn.setAttribute(
 “aria-expanded”,
 “false”
 );
 }
 }
 }
 );
}
// ========================================
// Tooth Dropdown
// ========================================
If (
 addToothDropdownBtn &&
 addToothDropdownMenu
) {
 addToothDropdownBtn.addEventListener(
 “click”,
 (event) => {
 Event.stopPropagation();
 addToothDropdownMenu.hidden =
 !addToothDropdownMenu.hidden;
 addToothDropdownBtn.setAttribute(
 “aria-expanded”,
 String(
 !addToothDropdownMenu.hidden
 )
 );
 }
 );
 addToothDropdownMenu.addEventListener(
 “click”,
 Event => {
 Event.stopPropagation();
 }
 );
}
// ========================================
// Build X-Ray List
// ========================================
Function getNewCaseXrays() {
 Const xrays = [];
 Document
 .querySelectorAll(
 “.add-xray-option:checked”
 )
 .forEach(checkbox => {
 If (
 Checkbox.id ===
 “addCbctTooth”
 ) {
 Return;
 }
 Xrays.push(
 Checkbox.value
 );
 });
 If (
 addCbctTooth &&
 addCbctTooth.checked
 ) {
 Const teeth =
 getSelectedAddTeeth();
 if (teeth.length > 0) {
 xrays.push(
 “CBCT Tooth: “ +
 Teeth.join(“, “)
 );
 }
 }
 Return xrays;
}
// ========================================
// Load Doctors
// ========================================
Async function loadDoctors() {
 Const doctorSelect =
 Document.getElementById(
 “addDoctor”
 );
 If (!doctorSelect) {
 Return;
 }
 Try {
 Const snapshot =
 Await getDocs(
 Collection(
 Db,
 “doctors”
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
 Const nameA =
 a.doctorName || “”;
 const nameB =
 b.doctorName || “”;
 return nameA.localeCompare(
 nameB,
 “ar”
 );
 }
 );
 doctorSelect.innerHTML =
 `<option value=””>/<الطبيب اخترoption>`;
 allDoctors.forEach(
 doctor => {
 const option =
 document.createElement(
 “option”
 );
 Option.value =
 Doctor.id;
 Option.textContent =
 Doctor.doctorName || “”;
 doctorSelect.appendChild(
 option
 );
 }
 );
 } catch (error) {
 Console.error(
 “Error loading doctors:”,
 Error
 );
 Alert(
"األطباء قائمة تحميل تعذر "
 );
 }
}
// ========================================
// Doctor Selection
// ========================================
Const addDoctor =
 Document.getElementById(
 “addDoctor”
 );
Const addClinic =
 Document.getElementById(
 “addClinic”
 );
If (addDoctor) {
 addDoctor.addEventListener(
 “change”,
 () => {
 Const selectedDoctor =
 allDoctors.find(
 doctor =>
 doctor.id ===
 addDoctor.value
 );
 If (selectedDoctor) {
 addClinic.value =
 selectedDoctor.clinicName ||
 “”;
 } else {
 addClinic.value =
 “”;
 }
 }
 );
}
// ========================================
// Reset Add Case Form
// ========================================
Function resetAddCaseForm() {
 Const formIds = [
 “addDoctor”,
 “addPatientName”,
 “addPatientAge”,
 “addPatientPhone”,
 “addNotes”
 ];
 Document.getElementById(
 “addDoctor”
 ).value = “”;
 Document.getElementById(
 “addClinic”
 ).value = “”;
 Document.getElementById(
 “addPatientName”
 ).value = “”;
 Document.getElementById(
 “addPatientAge”
 ).value = “”;
 Document.getElementById(
 “addPatientPhone”
 ).value = “”;
 Document.getElementById(
 “addNotes”
 ).value = “”;
 Document
 .querySelectorAll(
 “input[name=’addGender’]”
 )
 .forEach(input => {
 Input.checked =
 False;
 });
 Document
 .querySelectorAll(
 “.add-xray-option”
 )
 .forEach(checkbox => {
 Checkbox.checked =
 False;
 });
 clearAddSelectedTeeth();
 if (addToothChartContainer) {
 addToothChartContainer.style.display =
 “none”;
 }
 If (addToothDropdownMenu) {
 addToothDropdownMenu.hidden =
 true;
 }
 If (addToothDropdownBtn) {
 addToothDropdownBtn.setAttribute(
 “aria-expanded”,
 “false”
 );
 }
}
// ========================================
// Open Add Case Modal
// ========================================
Const addCaseBtn =
 Document.getElementById(
 “addCaseBtn”
 );
If (addCaseBtn) {
 addCaseBtn.addEventListener(
 “click”,
 () => {
 resetAddCaseForm();
 addCaseModal.show();
 }
 );
}
// ========================================
// Save New Case
// ========================================
Const saveNewCaseBtn =
 Document.getElementById(
 “saveNewCaseBtn”
 );
If (saveNewCaseBtn) {
 saveNewCaseBtn.addEventListener(
 “click”,
 Async () => {
 If (
 saveNewCaseBtn.disabled
 ) {
 Return;
 }
 saveNewCaseBtn.disabled =
 true;
 saveNewCaseBtn.textContent =
 ;"...الحفظ جاري "
 Try {
 // ========================================
 // Doctor
 // ========================================
 Const doctorId =
 Document.getElementById(
 “addDoctor”
 ).value;
 If (!doctorId) {
 Alert(
"الطبيب اختيار يرجى "
 );
 Return;
 }
 Const selectedDoctor =
 allDoctors.find(
 doctor =>
 doctor.id ===
 doctorId
 );
 If (!selectedDoctor) {
 Alert(
"الطبيب بيانات على العثور تعذر "
 );
 Return;
 }
 // ========================================
 // Patient
 // ========================================
 Const patientName =
 Document.getElementById(
 “addPatientName”
 ).value.trim();
 Const age =
 Document.getElementById(
 “addPatientAge”
 ).value;
 Const phone =
 Document.getElementById(
 “addPatientPhone”
 ).value.trim();
 Const gender =
 Document.querySelector(
 “input[name=’addGender’]:checked”
 )?.value || “”;
 Const notes =
 Document.getElementById(
 “addNotes”
 ).value.trim();
 If (
 !patientName ||
 !phone
 ) {
 Alert(
"الهاتف ورقم المراجع اسم إدخال يرجى "
 );
 Return;
 }
 // ========================================
 // X-Rays
 // ========================================
 Const xrays =
 getNewCaseXrays();
 if (
 addCbctTooth &&
 addCbctTooth.checked
 ) {
 Const teeth =
 getSelectedAddTeeth();
 if (
 teeth.length === 0
 ) {
 Alert(
 لـ األقل على واحد سن اختيار يرجى "CBCT Tooth”
 );
 Return;
 }
 }
 If (xrays.length === 0) {
 Alert(
 "األشعة نوع اختيار يرجى "
 );
 Return;
 }
 // ========================================
 // Create Referral ID
 // ========================================
 Const referralID =
 “YR-“ +
 Date.now();
 // ========================================
 // Firebase
 // ========================================
 Await addDoc(
 Collection(
 Db,
 “referrals”
 ),
 {
 referralID,
 doctorID:
 selectedDoctor.id || “”,
 doctorName:
 selectedDoctor.doctorName || “”,
 clinicName:
 selectedDoctor.clinicName || “”,
 patientName,
 age,
 gender,
 phone,
 xrays,
 notes,
 dateOfCBCT:
 “”,
 cbctPrice:
 “”,
 Done:
 False,
 createdAt:
 serverTimestamp()
 }
 );
 // ========================================
 // Google Sheet
 // ========================================
 Const formData =
 New URLSearchParams();
 formData.append(
 “referralID”,
 referralID
 );
 formData.append(
 “doctorID”,
 selectedDoctor.id || “”
 );
 formData.append(
 “doctorName”,
 selectedDoctor.doctorName || “”
 );
 formData.append(
 “clinicName”,
 selectedDoctor.clinicName || “”
 );
 formData.append(
 “patientName”,
 patientName
 );
 formData.append(
 “age”,
 Age
 );
 formData.append(
 “gender”,
 Gender
 );
 formData.append(
 “phone”,
 Phone
 );
 formData.append(
 “xrays”,
 Xrays.join(“, “)
 );
 formData.append(
 “notes”,
 Notes
 );
 Await fetch(
 GOOGLE_SCRIPT_URL,
 {
 Method:
 “POST”,
 Mode:
 “no-cors”,
 Headers: {
 “Content-Type”:
 “application/x-www-form-urlencoded”
 },
 Body:
 formData
 }
 );
 // ========================================
 // Success
 // ========================================
 Alert(
 "بنجاح الحالة إضافة تم "
 );
 addCaseModal.hide();
 resetAddCaseForm();
 } catch (error) {
 Console.error(
 “Add case error:”,
 Error
 );
 Alert(
\:الحالة إضافة أثناء خطأ حدث " n\n” +
 Error.message
 );
 } finally {
 saveNewCaseBtn.disabled =
 false;
 saveNewCaseBtn.textContent =
 ;"الحالة حفظ "
 }
 }
 );
}
// ========================================
// Real-time Referrals Listener
// ========================================
Function loadReferrals() {
 Const table =
 Document.getElementById(
 “referralTable”
 );
 Table.innerHTML = “”;
 Const q =
 Query(
 Collection(
 Db,
 “referrals”
 ),
 orderBy(
 “createdAt”,
 “desc”
 )
 );
 onSnapshot(
 q,
 snapshot => {
 console.log(
 “Referrals:”,
 Snapshot.size
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
 Error => {
 Console.error(
 “Error listening to referrals:”,
 Error
 );
 }
 );
}
// ========================================
// Render Referrals
// ========================================
Function renderReferrals(list) {
 Const table =
 Document.getElementById(
 “referralTable”
 );
 Table.innerHTML = “”;
 List.forEach(data => {
 Const row =
 Document.createElement(
 “tr”
 );
 // ========================================
 // Doctor
 // ========================================
 Const tdDoctor =
 Document.createElement(
 “td”
 );
 tdDoctor.textContent =
 data.doctorName || “”;
 // ========================================
 // Clinic
 // ========================================
 Const tdClinic =
 Document.createElement(
 “td”
 );
 tdClinic.textContent =
 data.clinicName || “”;
 // ========================================
 // Patient
 // ========================================
 Const tdPatient =
 Document.createElement(
 “td”
 );
 tdPatient.textContent =
 data.patientName || “”;
 // ========================================
 // Age
 // ========================================
 Const tdAge =
 Document.createElement(
 “td”
 );
 tdAge.textContent =
 data.age || “”;
 // ========================================
 // Phone
 // ========================================
 Const tdPhone =
 Document.createElement(
 “td”
 );
 tdPhone.textContent =
 data.phone || “”;
 // ========================================
 // Gender
 // ========================================
 Const tdGender =
 Document.createElement(
 “td”
 );
 tdGender.textContent =
 data.gender || “”;
 // ========================================
 // X-Rays
 // ========================================
 Const tdXrays =
 Document.createElement(
 “td”
 );
 tdXrays.textContent =
 Array.isArray(data.xrays)
 ? data.xrays.join(“, “)
 : data.xrays || “”;
 // ========================================
 // Notes
 // ========================================
 Const tdNotes =
 Document.createElement(
 “td”
 );
 tdNotes.textContent =
 data.notes || “”;
 // ========================================
 // Created Date
 // ========================================
 Const tdDate =
 Document.createElement(
 “td”
 );
 If (data.createdAt) {
 Try {
 tdDate.textContent =
 data.createdAt
 .toDate()
 .toLocaleString(
 “ar-IQ”
 );
 } catch (error) {
 tdDate.textContent =
 “”;
 }
 } else {
 tdDate.textContent =
 “”;
 }
 // ========================================
 // Date of CBCT
 // ========================================
 Const tdCBCTDate =
 Document.createElement(
 “td”
 );
 Const cbctDateInput =
 Document.createElement(
 “input”
 );
 cbctDateInput.type =
 “date”;
 cbctDateInput.className =
 “form-control form-control-sm”;
 cbctDateInput.value =
 data.dateOfCBCT || “”;
 cbctDateInput.addEventListener(
 “click”,
 E => {
 e.stopPropagation();
 }
 );
 cbctDateInput.addEventListener(
 “change”,
 Async function (e) {
 e.stopPropagation();
 await updateReferralField(
 data,
 “dateOfCBCT”,
 This.value
 );
 }
 );
 tdCBCTDate.appendChild(
 cbctDateInput
 );
 // ========================================
 // CBCT Price
 // ========================================
 Const tdPrice =
 Document.createElement(
 “td”
 );
 Const priceInput =
 Document.createElement(
 “input”
 );
 priceInput.type =
 “number”;
 priceInput.min =
 “0”;
 priceInput.className =
 “form-control form-control-sm”;
 priceInput.placeholder =
 “Price”;
 priceInput.value =
 data.cbctPrice ?? “”;
 priceInput.addEventListener(
 “click”,
 E => {
 e.stopPropagation();
 }
 );
 priceInput.addEventListener(
 “change”,
 Async function (e) {
 e.stopPropagation();
 await updateReferralField(
 data,
 “cbctPrice”,
 This.value
 );
 }
 );
 tdPrice.appendChild(
 priceInput
 );
 // ========================================
 // Done
 // ========================================
 Const tdDone =
 Document.createElement(
 “td”
 );
 tdDone.className =
 “text-center”;
 Const doneCheckbox =
 Document.createElement(
 “input”
 );
 doneCheckbox.type =
 “checkbox”;
 doneCheckbox.className =
 “form-check-input”;
 doneCheckbox.style.transform =
 “scale(1.3)”;
 doneCheckbox.checked =
 data.done === true;
 doneCheckbox.addEventListener(
 “click”,
 E => {
 e.stopPropagation();
 }
 );
 doneCheckbox.addEventListener(
 “change”,
 Async function (e) {
 e.stopPropagation();
 await updateReferralField(
 data,
 “done”,
 This.checked
 );
 }
 );
 tdDone.appendChild(
 doneCheckbox
 );
 // ========================================
 // Actions
 // ========================================
 Const tdAction =
 Document.createElement(
 “td”
 );
 Const deleteBtn =
 Document.createElement(
 “button”
 );
 deleteBtn.className =
 “btn btn-danger btn-sm”;
 deleteBtn.textContent =
 “Delete”;
 deleteBtn.addEventListener(
 “click”,
 Async e => {
 e.stopPropagation();
 const ok =
 confirm(
\ اإلحالة؟ هذه حذف من متأكد أنت هل "n\n” +
 من حذفها سيتم "Firebase وGoogle Sheet.”
 );
 If (!ok) {
 Return;
 }
 Try {
 // Firebase
 Await deleteDoc(
 Doc(
 Db,
 “referrals”,
 Data.docId
 )
 );
 // Google Sheet
 Const formData =
 New URLSearchParams();
 formData.append(
 “action”,
 “deleteReferral”
 );
 formData.append(
 “referralID”,
 Data.referralID || “”
 );
 Const response =
 Await fetch(
 GOOGLE_SCRIPT_URL,
 {
 Method:
 “POST”,
 Headers: {
 “Content-Type”:
 “application/x-www-form-urlencoded”
 },
 Body:
 formData.toString()
 }
 );
 Const result =
 Await response.json();
 If (!result.success) {
 Console.error(
 “Google Sheet delete failed:”,
 Result
 );
 Alert(
 “ من اإلحالة حذف تم Firebase، “ +
 من حذفها يتم لم لكن "Google Sheet.\n\n” +
 “Referral ID: “ +
 (
 Data.referralID ||
 “”
 )
 );
 Return;
 }
 Alert(
 من بنجاح اإلحالة حذف تم " Firebase وGoogle Sheet”
 );
 } catch (error) {
 Console.error(
 “Delete error:”,
 Error
 );
 Alert(
\ :اإلحالة حذف أثناء خطأ حدث " n\n” +
 Error.message
 );
 }
 }
 );
 tdAction.appendChild(
 deleteBtn
 );
 // ========================================
 // Append Columns
 // ========================================
 Row.appendChild(tdDoctor);
 Row.appendChild(tdClinic);
 Row.appendChild(tdPatient);
 Row.appendChild(tdAge);
 Row.appendChild(tdPhone);
 Row.appendChild(tdGender);
 Row.appendChild(tdXrays);
 Row.appendChild(tdNotes);
 Row.appendChild(tdDate);
 Row.appendChild(tdCBCTDate);
 Row.appendChild(tdPrice);
 Row.appendChild(tdDone);
 Row.appendChild(tdAction);
 // ========================================
 // Row Click
 // ========================================
 Row.style.cursor =
 “pointer”;
 Row.addEventListener(
 “click”,
 () => {
 Document.getElementById(
 “viewDoctor”
 ).textContent =
 Data.doctorName || “”;
 Document.getElementById(
 “viewClinic”
 ).textContent =
 Data.clinicName || “”;
 Document.getElementById(
 “viewPatient”
 ).textContent =
 Data.patientName || “”;
 Document.getElementById(
 “viewAge”
 ).textContent =
 Data.age || “”;
 Document.getElementById(
 “viewGender”
 ).textContent =
 Data.gender || “”;
 Document.getElementById(
 “viewPhone”
 ).textContent =
 Data.phone || “”;
 Document.getElementById(
 “viewXrays”
 ).textContent =
 Array.isArray(
 Data.xrays
 )
 ? data.xrays.join(“, “)
 : data.xrays || “”;
 Document.getElementById(
 “viewNotes”
 ).textContent =
 Data.notes || “”;
 Document.getElementById(
 “viewDate”
 ).textContent =
 Data.createdAt
 ? data.createdAt
 .toDate()
 .toLocaleString(
 “ar-IQ”
 )
 : “”;
 referralModal.show();
 }
 );
 Table.appendChild(
 Row
 );
 });
}
// ========================================
// Update Firebase + Google Sheet
// ========================================
Async function updateReferralField(
 Data,
 Field,
 Value
) {
 Try {
 // Firebase
 Await updateDoc(
 Doc(
 Db,
 “referrals”,
 Data.docId
 ),
 {
 [field]: value
 }
 );
 Data[field] =
 Value;
 // Google Sheet
 If (data.referralID) {
 Const formData =
 New URLSearchParams();
 formData.append(
 “action”,
 “updateReferral”
 );
 formData.append(
 “referralID”,
 Data.referralID
 );
 formData.append(
 “dateOfCBCT”,
 Data.dateOfCBCT || “”
 );
 formData.append(
 “cbctPrice”,
 Data.cbctPrice ?? “”
 );
 formData.append(
 “done”,
 Data.done === true
 ? “TRUE”
 : “FALSE”
 );
 Await fetch(
 GOOGLE_SCRIPT_URL,
 {
 Method:
 “POST”,
 Mode:
 “no-cors”,
 Headers: {
 “Content-Type”:
 “application/x-www-form-urlencoded”
 },
 Body:
 formData
 }
 );
 }
 Console.log(
 “Updated:”,
 Field,
 Value
 );
 } catch (error) {
 Console.error(
 “Update referral error:”,
 Error
 );
 Alert(
 "التعديل حفظ أثناء خطأ حدث "
 );
 }
}
// ========================================
// Search
// ========================================
Document
 .getElementById(
 “searchReferral”
 )
 .addEventListener(
 “input”,
 Function () {
 Const search =
 This.value
 .toLowerCase();
 Const filtered =
 allReferrals.filter(
 data => {
 return (
 (
 Data.doctorName ||
 “”
 )
 .toLowerCase()
 .includes(search)
 (
 Data.clinicName ||
 “”
 )
 .toLowerCase()
 .includes(search)
 (
 Data.patientName ||
 “”
 )
 .toLowerCase()
 .includes(search)
 (
 Data.phone ||
 “”
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
// Initialize
// ========================================
createAddToothOptions();
updateAddSelectedTeeth();
loadDoctors();
loadReferrals();
