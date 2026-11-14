document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("bottleModal");
  const camera = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  const preview = document.getElementById("preview");
  const statusText = document.getElementById("status");

  const captureBtn = document.getElementById("captureBtn");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");
  const closeModal = document.getElementById("closeModal");

  // Jika modal belum dimuat di halaman, hentikan agar tidak error
  if (!modal || !captureBtn) return;

  let stream = null;
  let model = null;

  // Load AI model
  async function loadAI() {
    try {
      model = await cocoSsd.load();
    } catch (e) {
      console.error("Gagal memuat model AI Coco-SSD", e);
    }
  }

  loadAI();

  // Open camera
  window.openBottleCamera = async function() {
    modal.style.display = "flex";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert("Browser atau perangkatmu tidak mendukung akses kamera langsung.");
  return;
}

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

      camera.srcObject = stream;
      camera.hidden = false;

      statusText.textContent = "Arahkan kamera ke botol minummu!";
    } catch (error) {
      statusText.textContent =
        "Kamera tidak tersedia. Periksa izin kamera browser.";
    }
  };

  // Capture photo
  captureBtn.addEventListener("click", async () => {
    if (!model) {
      statusText.textContent = "AI sedang dimuat. Tunggu sebentar!";
      return;
    }

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(camera, 0, 0);

    preview.src = canvas.toDataURL("image/jpeg");
    preview.hidden = false;

    camera.hidden = true;

    statusText.textContent = "Memeriksa foto...";

    // AI object detection
    const predictions = await model.detect(canvas);

    const bottle = predictions.find(item =>
      item.class === "bottle" &&
      item.score >= 0.50
    );

    if (bottle) {
      const [x, y, width, height] = bottle.bbox;
      const verticalBottle = height > width * 0.8;

      if (verticalBottle) {
        completeQuest();
      } else {
        showConfirmation();
      }
    } else {
      showConfirmation();
    }
  });

  // If AI does not recognize the bottle
  function showConfirmation() {
    statusText.textContent = "Apakah Anda benar-benar membawa botol minum?";
    confirmYes.hidden = false;
    confirmNo.hidden = false;
  }

  // User confirms YES
  confirmYes.addEventListener("click", () => {
    completeQuest();
  });

  // User confirms NO
  confirmNo.addEventListener("click", () => {
    statusText.textContent = "Jangan lupa bawa botol minummu besok! 🌱";
    showPetMessage("Ingat bawa botol minum sendiri besok! 💧");
    updateEmission();

    confirmYes.hidden = true;
    confirmNo.hidden = true;
  });

  // Complete quest
  function completeQuest() {
    const quest = document.getElementById("bottleQuest");

    if (quest) {
      quest.classList.add("completed");
      quest.innerHTML = "✅ Bawa botol minum sendiri";
    }

    statusText.textContent = "Quest berhasil diselesaikan! 🌱";
    confirmYes.hidden = true;
    confirmNo.hidden = true;

    showPetMessage("Yeay! Kamu mengurangi sampah plastik! 💚");
  }

  // Pet chat
  function showPetMessage(message) {
    const petChat = document.getElementById("petChat");

    if (petChat) {
      petChat.textContent = message;
      petChat.style.display = "block";
    }
  }

  // Emission update
  function updateEmission() {
    const emission = document.getElementById("currentEmission");

    if (emission) {
      const current = Number(emission.dataset.value || 0);
      const updated = Math.max(0, current - 0.05);

      emission.dataset.value = updated;
      emission.textContent = updated.toFixed(2) + " kg CO₂e";
    }
  }

  // Close modal
  closeModal.addEventListener("click", () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    modal.style.display = "none";

    camera.hidden = false;
    preview.hidden = true;
    confirmYes.hidden = true;
    confirmNo.hidden = true;
  });
});