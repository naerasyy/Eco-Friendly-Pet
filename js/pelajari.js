
/* =================================
   PELAJARI FAKTA ALAM QUEST
================================= */

document.addEventListener("DOMContentLoaded", function () {

  const modal = document.getElementById("natureFactModal");
  const input = document.getElementById("natureFactInput");
  const submitBtn = document.getElementById("submitNatureFact");
  const closeBtn = document.getElementById("closeNatureFact");
  const error = document.getElementById("natureFactError");

  const petBubble = document.getElementById("petBubble");

  if (!modal || !input || !submitBtn || !closeBtn) return;

  let currentCheckbox = null;

  // Cari checkbox berdasarkan nama quest
  function findNatureQuestCheckbox() {
    const questItems = document.querySelectorAll(".quest-item");

    for (const item of questItems) {
      if (item.textContent.toLowerCase().includes("pelajari fakta alam")) {
        return item.querySelector('input[type="checkbox"]');
      }
    }

    return null;
  }

  const natureCheckbox = findNatureQuestCheckbox();

  if (!natureCheckbox) {
    console.warn("Quest Pelajari Fakta Alam tidak ditemukan.");
    return;
  }

  // Buka popup ketika checkbox ditekan
  natureCheckbox.addEventListener("change", function () {

    if (this.checked && !this.disabled) {

      currentCheckbox = this;

      // Batalkan centang sementara
      this.checked = false;

      input.value = "";
      error.textContent = "";

      modal.classList.add("active");
    }
  });

  // Tutup popup
  function closeNatureModal() {
    modal.classList.remove("active");
    input.value = "";
    error.textContent = "";
    currentCheckbox = null;
  }

  closeBtn.addEventListener("click", closeNatureModal);

  // Tutup jika klik area luar popup
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeNatureModal();
    }
  });

  // Selesaikan quest
  submitBtn.addEventListener("click", function () {

    const learnedFact = input.value.trim();

    if (!learnedFact) {
      error.textContent = "Eits! Tulis dulu ilmu baru yang kamu pelajari ya 🌱";
      input.focus();
      return;
    }

    if (!currentCheckbox) return;

    // Tandai quest selesai
    currentCheckbox.checked = true;
    currentCheckbox.disabled = true;

    // Pesan lucu untuk pet
    if (petBubble) {
      petBubble.textContent =
        "YAY! 🌿 Kamu baru saja menambah satu ilmu tentang alam! " +
        "Makin kenal alam, makin sayang bumi! Keep growing, little explorer! 💚";

      petBubble.classList.add("active");
    }

    // Tutup popup
    closeNatureModal();

  });

});
