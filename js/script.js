// =========================
// YRMS v0.1 - Dynamic Referral System
// =========================

// قاعدة بيانات الأطباء والعيادات (يمكنك إضافة أو تعديل الأطباء هنا بسهولة)
const doctorsDatabase = {
    "amer": { name: "د. عامر", clinic: "عيادة الفارس التخصصية" },
    "dina": { name: "د. دينا", clinic: "عيادة الفارس التخصصية" },
    "asma": { name: "د. أسماء", clinic: "مركز الفارس للأسنان" },
    "ahmed": { name: "د. أحمد", clinic: "عيادة ابتسامة بغداد" }
};

// 1. قراءة الـ ID الخاص بالطبيب من الرابط (URL Parameter)
const urlParams = new URLSearchParams(window.location.search);
const doctorId = urlParams.get('doc'); // سيبحث في الرابط عن ?doc=

let currentDoctor = { name: "طبيب غير مسجل", clinic: "جهة غير معروفة" };

// التأكد إذا كان الطبيب موجوداً في قاعدة البيانات
if (doctorId && doctorsDatabase[doctorId]) {
    currentDoctor = doctorsDatabase[doctorId];
}

// عرض بيانات الطبيب في الكارت العلوي للـ HTML
document.getElementById("doctorName").textContent = currentDoctor.name;
document.getElementById("clinicName").textContent = currentDoctor.clinic;

// =========================
// 2. توليد خيارات أنواع الأشعة
// =========================
const xrayTypes = [
    "CBCT Tooth", 
    "CBCT Jaw", 
    "CBCT Full Mouth", 
    "OPG", 
    "Cephalometric", 
    "3D Proface", 
    "Surgical Guide", 
    "Report", 
    "Ceph Analysis"
];

const container = document.getElementById("xrayContainer");

xrayTypes.forEach(type => {
    // إنشاء معرف آمن بدون مسافات للـ ID لتجنب مشاكل المتصفح
    const safeId = type.replace(/\s+/g, '-');

    const html = 
        <div class="form-check xray-item">
            <input
                class="form-check-input"
                type="checkbox"
                value="${type}"
                id="${safeId}">
            <label
                class="form-check-label"
                for="${safeId}">
                ${type}
            </label>
        </div>
    ;
    container.insertAdjacentHTML("beforeend", html);
});

// =========================
// 3. معالجة إرسال الطلب (Submit)
// =========================
document.getElementById("submitBtn").addEventListener("click", function() {
    // جلب قيم المدخلات من الـ HTML
    const patientName = document.getElementById("patientName").value.trim();
    const patientAge = document.getElementById("patientAge").value.trim();
    const patientGender = document.getElementById("patientGender").value;
    const patientPhone = document.getElementById("patientPhone").value.trim();
    const notes = document.getElementById("notes").value.trim();

    // التحقق من الحقول المطلوبة (الاسم والهاتف) كما حددتها أنت بالنجمة *
    if (!patientName || !patientPhone) {
        alert("يرجى ملء الحقول المطلوبة (الاسم الثلاثي ورقم الهاتف).");
        return;
    }

    // جمع أنواع الأشعة التي اختارها الطبيب
    const selectedXrays = [];
    // هنا نبحث عن كل الـ inputs من نوع checkbox المحددة بـ checked داخل الـ container
    document.querySelectorAll("#xrayContainer input[type='checkbox']:checked").forEach(checkbox => {
        selectedXrays.push(checkbox.value);
    });

    // التحقق من أن الطبيب اختار نوع أشعة واحد على الأقل
    if (selectedXrays.length === 0) {
        alert("يرجى اختيار نوع أشعة واحد على الأقل.");
        return;
    }

    // تجهيز كائن البيانات (Data Object) لإرساله لجوجل شيت والتليجرام
    const formData = {
        doctorName: currentDoctor.name,
        clinicName: currentDoctor.clinic,
        patientName: patientName,
        patientAge: patientAge,
        patientGender: patientGender,
        patientPhone: patientPhone,
        xrayTypes: selectedXrays.join(", "), // دمج الخيارات بنص يفصل بينها بفارزة
        notes: notes
    };

    // تغيير حالة زر الإرسال لمنع النقرات المتكررة أثناء الإرسال
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري إرسال الطلب...";

    // رابط الـ Webhook (جوجل سكريبت) الذي سيربط البيانات بالشيت والتليجرام
    const googleScriptUrl = "ضع_رابط_جوجل_سكريبت_هنا";
    // إرسال البيانات باستخدام تقنية Fetch API
    fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors", // لتجنب مشاكل الـ CORS الأمنية مع متصفحات جوجل
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(() => {
        alert("تم إرسال طلب الإحالة بنجاح! شكراً لك دكتور.");
        
        // تفريغ الاستمارة لإعادة الاستخدام
        document.getElementById("patientName").value = "";
        document.getElementById("patientAge").value = "";
        document.getElementById("patientPhone").value = "";
        document.getElementById("notes").value = "";
        document.querySelectorAll("#xrayContainer input[type='checkbox']").forEach(cb => cb.checked = false);
    })
    .catch(error => {
        console.error("Error:", error);
        alert("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.");
    })
    .finally(() => {
        // إعادة الزر لوضعه الطبيعي بعد انتهاء العملية
        submitBtn.disabled = false;
        submitBtn.textContent = "إرسال الطلب";
    });
});
