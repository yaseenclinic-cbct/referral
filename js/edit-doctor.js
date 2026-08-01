import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const doctorID = params.get("id");

async function loadDoctor() {

    if (!doctorID) {

        alert("Doctor ID not found");

        return;

    }

    const doctorRef = doc(db, "doctors", doctorID);

    const doctorSnap = await getDoc(doctorRef);

    if (!doctorSnap.exists()) {

        alert("Doctor not found");

        return;

    }

    const doctor = doctorSnap.data();

    document.getElementById("doctorName").value =
        doctor.doctorName;

    const clinicSelect =
        document.getElementById("doctorClinic");

    clinicSelect.innerHTML = "";

    const clinics =
        await getDocs(collection(db, "clinics"));

    clinics.forEach((clinic) => {

        const data = clinic.data();

        const option =
            document.createElement("option");

        option.value = data.code;

        option.textContent = data.name;

        if (data.code === doctor.clinicCode) {

            option.selected = true;

        }

        clinicSelect.appendChild(option);

    });

}

loadDoctor();

document.getElementById("saveBtn").onclick = async function () {

    const clinicCode =
        document.getElementById("doctorClinic").value;

    const clinics =
        await getDocs(collection(db, "clinics"));

    let clinicName = "";

    clinics.forEach((clinic) => {

        const data = clinic.data();

        if (data.code === clinicCode) {

            clinicName = data.name;

        }

    });

    await updateDoc(

        doc(db, "doctors", doctorID),

        {

            doctorName:
                document.getElementById("doctorName").value,

            clinicCode: clinicCode,

            clinicName: clinicName

        }

    );

    alert("تم تحديث بيانات الطبيب");

    window.location = "doctors.html";

};
