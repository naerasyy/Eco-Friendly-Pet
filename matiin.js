
document.addEventListener("DOMContentLoaded", async () => {

  // LOAD HTML POPUP
  const response = await fetch("/matiin.html");

  if (!response.ok) {
    console.error("Gagal memuat Matiin HTML");
    return;
  }

  const modalHTML = await response.text();

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // ELEMENTS
  const modal = document.getElementById("matiinModal");
  const input = document.getElementById("matiinDeviceInput");
  const submit = document.getElementById("matiinSubmit");
  const close = document.getElementById("matiinClose");
  const error = document.getElementById("matiinError");

  let activeCheckbox = null;

  // ESTIMASI DAYA STANDBY (WATT)
  const devicePower = [
    { keywords: ["tv", "televisi"], watts: 5 },
    { keywords: ["ac", "air conditioner"], watts: 3 },
    { keywords: ["komputer", "pc", "desktop"], watts: 5 },
    { keywords: ["laptop"], watts: 2 },
    { keywords: ["charger", "cas hp", "adaptor"], watts: 0.5 },
    { keywords: ["microwave", "microwave oven"], watts: 3 },
    { keywords: ["printer"], watts: 3 },
    { keywords: ["speaker"], watts: 2 },
    { keywords: ["konsol game", "playstation", "xbox"], watts: 10 },
    { keywords: ["monitor"], watts: 2 },
    { keywords: ["set top box", "receiver"], watts: 5 }
  ];

  // CARI ESTIMASI DAYA PERANGKAT
  function getDevicePower(deviceName) {
    const name = deviceName.toLowerCase().trim();

    const found = devicePower.find(device =>
      device.keywords.some(keyword => name.includes(keyword))
    );

    // Default 2 watt jika perangkat tidak dikenali
    return found ? found.watts : 2;
  }

  // CARI PET BUBBLE
  function showStandbyPetMessage(message) {
    const bubble =
      document.getElementById("petBubble") ||
      document.querySelector(".pet-bubble");

    if (!bubble) {
      console.warn("Pet bubble tidak ditemukan");
      return;
    }

    bubble.textContent = message;
    bubble.classList.add("active");
  }

  // BUKA POPUP
  function openModal(checkbox) {
    activeCheckbox = checkbox;

    input.value = "";
    error.textContent = "";

    modal.classList.add("active");

    setTimeout(() => input.focus(), 100);
  }

  // TUTUP POPUP
  function closeModal() {
    modal.classList.remove("active");

    if (activeCheckbox) {
      activeCheckbox.checked = false;
    }

    activeCheckbox = null;
  }

  close.addEventListener("click", closeModal);

  // TUTUP JIKA KLIK AREA LUAR POPUP
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // DETEKSI QUEST MATIKAN PERANGKAT SIAGA
  document.addEventListener("change", (event) => {

    const checkbox = event.target;

    if (
      !checkbox.matches('input[type="checkbox"]') ||
      !checkbox.checked
    ) {
      return;
    }

    // Cari elemen quest di sekitar checkbox
    let parent = checkbox.parentElement;
    let questText = "";

    for (let i = 0; i < 7 && parent; i++) {
      questText = parent.textContent
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      if (questText.includes("matikan perangkat siaga")) {
        break;
      }

      parent = parent.parentElement;
    }

    if (!questText.includes("matikan perangkat siaga")) {
      return;
    }

    // Cegah checkbox langsung terselesaikan
    checkbox.checked = false;

    if (checkbox.disabled) {
      return;
    }

    openModal(checkbox);

  });

  // KONFIRMASI QUEST
  submit.addEventListener("click", () => {

    const deviceName = input.value.trim();

    if (!deviceName) {
      error.textContent = "Masukkan nama perangkat terlebih dahulu!";
      input.focus();
      return;
    }

    if (!activeCheckbox) {
      closeModal();
      return;
    }

    // ESTIMASI PENGHEMATAN
    const standbyWatts = getDevicePower(deviceName);

    // Asumsi perangkat tidak berada dalam mode standby selama 8 jam
    const hoursSaved = 8;

    // Konversi watt menjadi kWh
    const electricitySaved =
      (standbyWatts * hoursSaved) / 1000;

    // Faktor emisi listrik perkiraan
    const emissionFactor = 0.85;

    // Pengurangan emisi CO2
    const emissionSaved =
      electricitySaved * emissionFactor;

    // TAMPILKAN HASIL
    const message =
      `Selamat! 🎉 Kamu berhasil mematikan ${deviceName}! ` +
      `Dengan mengurangi konsumsi listrik standby, ` +
      `kamu diperkirakan menghemat ${electricitySaved.toFixed(4)} kWh ` +
      `dan mengurangi emisi sekitar ${emissionSaved.toFixed(4)} kg CO₂e. ` +
      `Langkah kecilmu membantu menjaga bumi tetap hijau! 🌱`;

    showStandbyPetMessage(message);

    // TANDAI QUEST SELESAI
    activeCheckbox.checked = true;
    activeCheckbox.disabled = true;

    // TUTUP POPUP
    modal.classList.remove("active");

    activeCheckbox = null;

    console.log("Standby Quest Completed:", {
      device: deviceName,
      standbyWatts,
      electricitySaved,
      emissionSaved
    });

  });

  // ENTER UNTUK KONFIRMASI
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submit.click();
    }
  });

});
