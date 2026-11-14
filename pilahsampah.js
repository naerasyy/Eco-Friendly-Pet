/* =====================================
   DAILY QUEST: PILAH SAMPAH
===================================== */
document.addEventListener("DOMContentLoaded", () => {

  const wasteCheckbox = document.getElementById("wasteQuestCheckbox");
  const wasteModal = document.getElementById("wasteModal");

  if (!wasteCheckbox || !wasteModal) return; // Mencegah error jika elemen belum ada

  const wasteCamera = document.getElementById("wasteCamera");
  const wasteCanvas = document.getElementById("wasteCanvas");
  const wastePreview = document.getElementById("wastePreview");

  const startCameraBtn = document.getElementById("startWasteCamera");
  const captureBtn = document.getElementById("captureWastePhoto");
  const retakeBtn = document.getElementById("retakeWastePhoto");
  const scanBtn = document.getElementById("scanWastePhoto");

  const closeModalBtn = document.getElementById("closeWasteModal");

  const scanStatus = document.getElementById("wasteScanStatus");
  const wasteResult = document.getElementById("wasteResult");

  const wasteCategory = document.getElementById("wasteCategory");
  const wasteEmission = document.getElementById("wasteEmission");

  const finishBtn = document.getElementById("finishWasteQuest");
  const petBubble = document.getElementById("petBubble");

  let wasteStream = null;
  let capturedWastePhoto = null;
  let verifiedWaste = null;

  /* =====================================
     OPEN MODAL
  ===================================== */
  wasteCheckbox.addEventListener("change", async () => {
    wasteCheckbox.checked = false;
    if (wasteCheckbox.disabled) return;
    openWasteModal();
  });

  function openWasteModal() {
    wasteModal.classList.add("active");

    wasteResult.hidden = true;
    wastePreview.hidden = true;
    wasteCamera.hidden = true;

    startCameraBtn.hidden = false;
    captureBtn.hidden = true;
    retakeBtn.hidden = true;
    scanBtn.hidden = true;

    scanStatus.textContent = "";

    const instruction = document.getElementById("wasteInstruction");
    if (instruction) {
      instruction.textContent = "Aktifkan kamera dan foto sampah yang ingin kamu pilah.";
    }
  }

  /* =====================================
     CAMERA PERMISSION
  ===================================== */
  startCameraBtn.addEventListener("click", async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser tidak mendukung akses kamera.");
      }

      wasteStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

      wasteCamera.srcObject = wasteStream;
      await wasteCamera.play();

      wasteCamera.hidden = false;
      wastePreview.hidden = true;

      startCameraBtn.hidden = true;
      captureBtn.hidden = false;

      scanStatus.textContent = "Kamera berhasil diaktifkan!";
    } catch (error) {
      console.error("Camera error:", error);
      scanStatus.textContent = "Kamera tidak dapat diakses. Periksa izin kamera browser.";
    }
  });

  /* =====================================
     CAPTURE PHOTO
  ===================================== */
  captureBtn.addEventListener("click", () => {
    const width = wasteCamera.videoWidth;
    const height = wasteCamera.videoHeight;

    if (!width || !height) {
      scanStatus.textContent = "Kamera belum siap. Coba lagi.";
      return;
    }

    wasteCanvas.width = width;
    wasteCanvas.height = height;

    const context = wasteCanvas.getContext("2d");
    context.drawImage(wasteCamera, 0, 0, width, height);

    capturedWastePhoto = wasteCanvas.toDataURL("image/jpeg", 0.85);

    wastePreview.src = capturedWastePhoto;
    wasteCamera.hidden = true;
    wastePreview.hidden = false;

    stopWasteCamera();

    captureBtn.hidden = true;
    retakeBtn.hidden = false;
    scanBtn.hidden = false;

    scanStatus.textContent = "Foto berhasil diambil! Siap untuk dipindai.";
  });

  /* =====================================
     RETAKE PHOTO
  ===================================== */
  retakeBtn.addEventListener("click", async () => {
    capturedWastePhoto = null;
    verifiedWaste = null;

    wastePreview.hidden = true;
    retakeBtn.hidden = true;
    scanBtn.hidden = true;
    scanStatus.textContent = "";
    startCameraBtn.hidden = false;
  });

  /* =====================================
     NVIDIA AI WASTE CLASSIFICATION
  ===================================== */
  scanBtn.addEventListener("click", async () => {
    if (!capturedWastePhoto) {
      scanStatus.textContent = "Ambil foto terlebih dahulu.";
      return;
    }

    scanBtn.disabled = true;
    retakeBtn.disabled = true;
    scanStatus.textContent = "NVIDIA AI sedang memindai sampah...";

    try {
      const response = await fetch("/api/classify-waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedWastePhoto })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Pemindaian gagal.");
      }

      const allowedCategories = ["plastik", "buah", "sisa makanan", "bungkus/kemasan"];
      if (!allowedCategories.includes(data.category)) {
        throw new Error("Kategori hasil AI tidak valid.");
      }

      if (
        typeof data.emissionSavedKg !== "number" ||
        !Number.isFinite(data.emissionSavedKg) ||
        data.emissionSavedKg < 0
      ) {
        throw new Error("Data pengurangan emisi tidak valid.");
      }

      verifiedWaste = data;
      showWasteResult(data);
    } catch (error) {
      console.error("NVIDIA AI error:", error);
      scanStatus.textContent = error.message || "Gagal memindai sampah. Silakan coba lagi.";
    } finally {
      scanBtn.disabled = false;
      retakeBtn.disabled = false;
    }
  });

  /* =====================================
     SHOW AI RESULT
  ===================================== */
  function showWasteResult(data) {
    const categoryNames = {
      "plastik": "Sampah Plastik ♻️",
      "buah": "Sampah Buah 🍎",
      "sisa makanan": "Sisa Makanan 🍃",
      "bungkus/kemasan": "Bungkus / Kemasan 📦"
    };

    wasteCategory.textContent = categoryNames[data.category];
    wasteEmission.textContent =
      "Potensi emisi berkurang: " + data.emissionSavedKg.toFixed(3) + " kg CO₂e";

    wasteResult.hidden = false;
    scanStatus.textContent = "Sampah berhasil dikenali oleh NVIDIA AI!";

    scanBtn.hidden = true;
    retakeBtn.hidden = true;
  }

  /* =====================================
     COMPLETE QUEST
  ===================================== */
  finishBtn.addEventListener("click", async () => {
    if (!verifiedWaste) return;

    const data = verifiedWaste;

    wasteCheckbox.checked = true;
    wasteCheckbox.disabled = true;

    wasteModal.classList.remove("active");

    showWastePetMessage(data);
    updateWasteEmission(data);

    capturedWastePhoto = null;
    verifiedWaste = null;
    wasteResult.hidden = true;
  });

  /* =====================================
     PET SPEECH BUBBLE
  ===================================== */
  function showWastePetMessage(data) {
    if (!petBubble) return;

    petBubble.textContent =
      "Selamat! 🎉 Kamu berhasil memilah " +
      data.category +
      "! Emisi berkurang " +
      data.emissionSavedKg.toFixed(3) +
      " kg CO₂e. Terima kasih sudah menjaga bumi! 🌱";

    petBubble.classList.add("active");
  }

  /* =====================================
     UPDATE EMISSION DISPLAY
  ===================================== */
  function updateWasteEmission(data) {
    const emissionElement = document.getElementById("currentEmission");
    if (!emissionElement) return;

    if (
      typeof data.totalEmission === "number" &&
      Number.isFinite(data.totalEmission)
    ) {
      emissionElement.dataset.value = data.totalEmission;
      emissionElement.textContent = data.totalEmission.toFixed(2) + " kg CO₂e";
    }
  }

  /* =====================================
     STOP CAMERA
  ===================================== */
  function stopWasteCamera() {
    if (wasteStream) {
      wasteStream.getTracks().forEach(track => track.stop());
      wasteStream = null;
    }
    if (wasteCamera) {
      wasteCamera.srcObject = null;
    }
  }

  /* =====================================
     CLOSE MODAL
  ===================================== */
  function closeWasteModal() {
    stopWasteCamera();
    wasteModal.classList.remove("active");

    capturedWastePhoto = null;
    verifiedWaste = null;

    wasteResult.hidden = true;
    wastePreview.hidden = true;
    scanStatus.textContent = "";

    scanBtn.disabled = false;
    retakeBtn.disabled = false;
  }

  closeModalBtn.addEventListener("click", closeWasteModal);

  wasteModal.addEventListener("click", (event) => {
    if (event.target === wasteModal) {
      closeWasteModal();
    }
  });

  window.addEventListener("pagehide", stopWasteCamera);

});