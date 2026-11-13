// LOAD CSS OTOMATIS
const plantCSS = document.createElement("link");
plantCSS.rel = "stylesheet";
plantCSS.href = "/plant-quest.css";
document.head.appendChild(plantCSS);
document.addEventListener("DOMContentLoaded", function () {

    // Membuat popup otomatis
    const modalHTML = `
        <div id="plantQuestModal" class="plant-modal">
            <div class="plant-modal-content">

                <button id="plantClose" class="plant-close">&times;</button>

                <div class="plant-icon">🥗</div>

                <h2>Makan Menu Nabati</h2>

                <p>Apa makanan yang kamu konsumsi hari ini?</p>

                <textarea id="plantFoodInput"
                    placeholder="Contoh: Nasi, tempe, tahu, kangkung...">
                </textarea>

                <p id="plantError"></p>

                <button id="plantSubmit">Periksa Makanan</button>

            </div>
        </div>
    `;

    // Cegah popup dibuat dua kali
    if (!document.getElementById("plantQuestModal")) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    const modal = document.getElementById("plantQuestModal");
    const input = document.getElementById("plantFoodInput");
    const error = document.getElementById("plantError");

    // Mencari quest berdasarkan tulisan
    const questElements = [...document.querySelectorAll("*")];

    const quest = questElements.find(element => {
        return (
            element.children.length === 0 &&
            element.textContent.trim().toLowerCase() === "makan menu nabati"
        );
    });

    if (!quest) {
        console.warn("Quest Makan Menu Nabati tidak ditemukan.");
        return;
    }

    // Mencari kotak centang di dalam kartu quest
    const questCard = quest.closest(".quest-item") ||
                      quest.parentElement.parentElement;

    const checkbox = questCard.querySelector(
        'input[type="checkbox"]'
    );

    if (!checkbox) {
        console.warn("Checkbox quest tidak ditemukan.");
        return;
    }

    // Klik checkbox membuka popup
    checkbox.addEventListener("change", function () {

        if (this.checked) {
            this.checked = false;
            modal.classList.add("active");
            input.value = "";
            error.textContent = "";
        }

    });

    // Tutup popup
    document.getElementById("plantClose").onclick = () => {
        modal.classList.remove("active");
    };

    // Kata kunci bahan hewani
    const animalFoods = [
        "ayam", "sapi", "kambing", "babi",
        "daging", "ikan", "udang", "cumi",
        "kepiting", "kerang", "telur",
        "susu", "keju", "yogurt", "mentega",
        "madu", "kaldu ayam", "kaldu sapi",
        "sosis", "bakso", "kornet", "abon",
        "teri", "terasi", "tuna", "salmon",
        "mayones", "saus tiram"
    ];

    // Periksa makanan
    document.getElementById("plantSubmit").onclick = function () {

        const food = input.value.trim().toLowerCase();

        if (!food) {
            error.textContent = "Masukkan nama makanan terlebih dahulu!";
            return;
        }

        const detected = animalFoods.filter(item => {
            const regex = new RegExp(
                "(^|[^a-z])" + item + "([^a-z]|$)",
                "i"
            );

            return regex.test(food);
        });

        const isPlantBased = detected.length === 0;

        // Hasil pemeriksaan
        const result = isPlantBased
            ? "TERINDIKASI FULL NABATI 🌱"
            : "MENGANDUNG PRODUK HEWANI 🍗";

        const message = isPlantBased
            ? "Selamat! Pilihan makanan berbahan tumbuhan dapat membantu mengurangi jejak karbon dan mendukung lingkungan yang lebih lestari! 🌍"
            : "Tetap semangat! Yuk, coba tambahkan lebih banyak sayuran, kacang-kacangan, dan bahan nabati pada menu berikutnya! 🌿";

        modal.classList.remove("active");

        // Cari bubble pet yang sudah ada
        const bubble = document.getElementById("petBubble");

        if (bubble) {
            bubble.innerHTML = `
                <strong>🥗 MAKANAN ANDA:</strong>
                <br>${result}
                <br><br>${message}
            `;

            bubble.classList.add("active");
        } else {
            alert(result + "\n\n" + message);
        }

        // Tandai quest selesai
        checkbox.checked = true;
        checkbox.disabled = true;

    };

});