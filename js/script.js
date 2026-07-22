const API_URL = "https://script.google.com/macros/s/AKfycbwl_YFz58K6Cu1238_fbS4UoQkp5JIhpq9x7lLhWw0jdibnjf-obpgb-V9MPtuK7fg/exec";

// بيانات مؤقتة (إلى أن نربط جدول Doctors)
const doctor = {
    id: "FDC001",
    name: "د. عامر",
    clinic: "عيادة الفارس"
};

document.getElementById("doctorName").textContent = doctor.name;
document.getElementById("clinicName").textContent = doctor.clinic;

document.getElementById("submitBtn").addEventListener("click", async () => {

    const xrays = [];

    document.querySelectorAll("input[type='checkbox']:checked").forEach(c => {
        xrays.push(c.value);
    });

    const data = {
        doctorID: doctor.id,
        doctorName: doctor.name,
        clinicName: doctor.clinic,
        patientName: document.getElementById("patientName").value,
        age: document.getElementById("patientAge").value,
        gender: document.querySelector("input[name='gender']:checked")?.value || "",
        phone: document.getElementById("patientPhone").value,
        xrays: xrays.join(", "),
        notes: document.getElementById("notes").value
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if(result.success){

            alert("✅ تم إرسال الإحالة\n\nرقم الإحالة: " + result.referralID);

        }else{

            alert("حدث خطأ أثناء الإرسال");

        }

    } catch (err){

        alert("فشل الاتصال بالخادم");

        console.error(err);

    }

});
