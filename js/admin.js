async function loadDashboard() {

    try {

        const doctors = await getDocs(collection(db, "doctors"));
        console.log("Doctors:", doctors.size);

        const clinics = await getDocs(collection(db, "clinics"));
        console.log("Clinics:", clinics.size);

        const referrals = await getDocs(collection(db, "referrals"));
        console.log("Referrals:", referrals.size);

        document.getElementById("doctorCount").textContent = doctors.size;
        document.getElementById("clinicCount").textContent = clinics.size;
        document.getElementById("referralCount").textContent = referrals.size;

    } catch (e) {

        console.error("Dashboard Error:", e);

    }

}
