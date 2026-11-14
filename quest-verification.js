/* quest-verification.js  —  muat SETELAH script.js
 *
 * Masalah di script.js (baris handler "quest"): klik tombol quest langsung memanggil
 *   add(v, q[1], q[3], q[5]); render()
 * sehingga XP/token masuk tanpa verifikasi. File ini menahan klik itu (fase capture),
 * menjalankan verifikasi, dan HANYA jika lolos baru memanggil add() milikmu.
 * Hasilnya ditampilkan di bubble .speech (#sp) di atas pet.
 *
 * Kamera & GPS hanya jalan di HTTPS atau http://localhost (mis. Live Server).
 * Semua angka emisi adalah PERKIRAAN edukatif.
 */
/* global Q, add, render, dn, cocoSsd */
(() => {
  'use strict';

  const CFG = Object.assign({
    demo: false,            // true = mode uji coba
    bottleEndpoint: '',     // backend yang memanggil AI NVIDIA (lihat classifyBottle)
    minTripMinutes: 3, minTripKm: 0.5,
    strideM: 0.75, stepGoal: 2000,
    gridKgPerKwh: 0.87, rpPerKwh: 1444
  }, window.QV_CONFIG || {});

  /* ---------- Data faktor (perkiraan) ---------- */
  const EF = { car: 0.192, avgPrivate: 0.15, bottle: 0.083, plantMeal: 1.2, kcalPerStep: 0.04 };

  const WASTE = [   // f = kg CO₂e dihindari per kg sampah dipilah/didaur ulang
    { k: 'plastik', label: 'Plastik (botol, kemasan)', f: 1.5 },
    { k: 'kertas', label: 'Kertas / koran', f: 1.0 },
    { k: 'kardus', label: 'Kardus', f: 0.9 },
    { k: 'logam', label: 'Kaleng / logam', f: 4.0 },
    { k: 'kaca', label: 'Kaca / botol kaca', f: 0.3 },
    { k: 'organik', label: 'Sisa makanan (dikompos)', f: 0.5 }
  ];
  const DEVICES = [   // w = watt saat siaga
    { k: 'tv', label: 'TV', w: 2 },
    { k: 'stb', label: 'Set-top box / receiver', w: 10 },
    { k: 'console', label: 'Konsol game', w: 10 },
    { k: 'pc', label: 'Komputer / monitor', w: 5 },
    { k: 'printer', label: 'Printer', w: 3 },
    { k: 'ricecooker', label: 'Rice cooker (mode warm)', w: 30 },
    { k: 'charger', label: 'Charger tercolok', w: 0.5 }
  ];
  const PLANT = [
    { re: /tempe/, perk: 'tempe: protein nabati + probiotik hasil fermentasi' },
    { re: /tahu/, perk: 'tahu: protein nabati rendah lemak jenuh' },
    { re: /sayur|bayam|kangkung|brokoli|wortel|kol|sawi|buncis|terong|lalap|urap|pecel|gado|salad|capcay/,
      perk: 'sayuran: serat dan vitamin yang melancarkan pencernaan' },
    { re: /kacang|edamame|kedelai/, perk: 'kacang-kacangan: protein dan lemak sehat' },
    { re: /jamur/, perk: 'jamur: rendah kalori, kaya mineral' },
    { re: /buah|pisang|apel|jeruk|mangga|pepaya|semangka/, perk: 'buah: vitamin dan antioksidan' },
    { re: /oat|singkong|ubi|jagung/, perk: 'umbi & serealia: karbohidrat kompleks, energi tahan lama' }
  ];
  const ANIMAL = /ayam|sapi|daging|babi|ikan|udang|cumi|bakso|sosis|nugget|telur|susu|keju|kambing|bebek|lele|seafood|rendang|kornet/;

  /* 3 quest terakhir (compost, local, shower) = BONUS: tanpa verifikasi, tetap tampil dampaknya.
     Nilai CO₂ diambil dari Q[5] milikmu. */
  const BONUS = {
    compost: { env: 'Sisa buah yang dikompos tidak membusuk tanpa oksigen di TPA, jadi gas metana (jauh lebih kuat dari CO₂) berkurang.',
               me: 'Kamu dapat pupuk gratis untuk tanaman dan sampah dapur berkurang.' },
    local: { env: 'Produk lokal menempuh jarak distribusi lebih pendek, jadi emisi angkutan dan pendinginan lebih rendah.',
             me: 'Biasanya lebih segar dan uangmu berputar di ekonomi sekitar.' },
    shower: { env: 'Mandi di bawah 5 menit menghemat ±30 L air bersih beserta energi untuk memompa dan memanaskannya.',
              me: 'Tagihan air turun dan kulit tidak terlalu kering.' }
  };

  /* ---------- Util ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtKg = kg => kg < 1 ? `${Math.round(kg * 1000)} g` : `${kg.toFixed(2)} kg`;
  const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
  const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const haversine = (a, b) => {   // meter
    const R = 6371000, r = x => x * Math.PI / 180;
    const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const geoErr = e => e && e.code === 1
    ? 'Izin lokasi ditolak. Aktifkan lokasi di pengaturan browser, lalu coba lagi.'
    : 'Lokasi tidak tersedia. Pastikan GPS aktif dan halaman dibuka lewat HTTPS/localhost.';
  const refOf = body => r => body.querySelector(`[data-ref="${r}"]`);
  const setStatus = (el, msg, type) => { el.textContent = msg; el.className = 'qv-status' + (type ? ' qv-' + type : ''); };

  /* ---------- Bubble chat AI di atas pet (.speech / #sp) ---------- */
  function showSpeech(res) {
    const sp = document.getElementById('sp'), ps = document.getElementById('ps');
    if (!sp) return;
    sp.classList.add('qv-rich');
    sp.classList.toggle('qv-fail', !res.ok);
    sp.innerHTML = `<div class="qv-speech-body"><strong>🐾 ${esc(res.title)}</strong><ul>${
      res.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div><i></i>`;
    const card = sp.parentElement;
    if (ps && card) {      // letakkan tepat di atas pet
      const pr = ps.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const w = sp.offsetWidth, h = sp.offsetHeight, petX = pr.left + pr.width / 2 - cr.left;
      const left = Math.min(Math.max(petX, w / 2 + 8), cr.width - w / 2 - 8);
      sp.style.left = left + 'px';
      sp.style.top = Math.max(44, pr.top - cr.top - h - 14) + 'px';
      const tip = sp.querySelector('i');
      if (tip) tip.style.left = Math.min(Math.max(petX - (left - w / 2), 16), w - 32) + 'px';
    }
    sp.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- Modal (memakai kelas .modal-backdrop / .game-modal milikmu) ---------- */
  let closeActive = null;
  function openModal(title, tplId, setup) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'modal-backdrop';
      wrap.innerHTML = `<section class="game-modal" role="dialog" aria-modal="true"><header><div><p class="eyebrow">ECO-PET</p><h2>${esc(title)}</h2></div><button type="button" data-qv-close aria-label="Batalkan">✕</button></header><div class="modal-body qv"></div></section>`;
      const body = wrap.querySelector('.modal-body');
      body.appendChild(document.getElementById(tplId).content.cloneNode(true));
      document.body.appendChild(wrap);
      let cleanup = () => {};
      const close = res => { cleanup(); wrap.remove(); closeActive = null; resolve(res || null); };
      closeActive = close;
      wrap.querySelector('[data-qv-close]').addEventListener('click', () => close(null));
      cleanup = setup(body, close) || cleanup;
    });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && closeActive) closeActive(null); });

  /* ================= 1. BOTOL MINUM (KAMERA) ================= */
  let cocoModel = null;
  async function findBottle(canvas) {          // COCO-SSD (sudah dimuat di index.html)
    if (typeof cocoSsd === 'undefined') return null;          // tidak tersedia -> lewati
    cocoModel = cocoModel || await cocoSsd.load();
    const preds = await cocoModel.detect(canvas);
    return preds.some(p => (p.class === 'bottle' || p.class === 'cup') && p.score >= 0.35);
  }

  /**
   * Bedakan botol plastik sekali pakai vs reusable lewat AI NVIDIA (VLM) di BACKEND-mu.
   * JANGAN taruh API key di JS browser. Backend menerima POST JSON { image: "data:image/jpeg;base64,..." }
   * dan membalas JSON { label: "reusable" | "plastic" | "none", confidence: 0..1 }.
   * Mengembalikan null bila endpoint belum diisi.
   */
  async function classifyBottle(dataUrl) {
    if (!CFG.bottleEndpoint) return null;
    const res = await fetch(CFG.bottleEndpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl })
    });
    if (!res.ok) throw new Error('Server AI membalas ' + res.status);
    return res.json();
  }

  function bottleResult(label, conf) {
    const pct = conf ? ` (keyakinan ${Math.round(conf * 100)}%)` : '';
    if (label === 'reusable') {
      return { ok: true, title: 'Botol reusable terdeteksi!', co2: EF.bottle, lines: [
        `✅ Ini botol minum reusable${pct}.`,
        `🌍 Emisi berkurang ±${fmtKg(EF.bottle)} CO₂e (1 botol plastik sekali pakai dihindari).`,
        '🙂 Untukmu: hemat ±Rp3.000–5.000 dan lebih sedikit paparan mikroplastik.'
      ] };
    }
    if (label === 'plastic') {
      return { ok: false, title: 'Itu botol plastik sekali pakai', lines: [
        `❌ Terdeteksi botol plastik sekali pakai${pct}.`,
        'Coba lagi dengan tumbler atau botol isi ulang untuk dapat XP.'
      ] };
    }
    return { ok: false, title: 'Botol minum tidak terlihat', lines: [
      `❌ Aku tidak menemukan botol minum di foto${pct}.`, 'Foto ulang dengan botol terlihat jelas ya.'
    ] };
  }

  function setupBottle(body, done) {
    const q = refOf(body);
    const video = body.querySelector('#qv-video'), photo = body.querySelector('#qv-photo'), canvas = body.querySelector('#qv-canvas');
    const status = q('status');
    let stream = null, dataUrl = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        .then(s => { stream = s; video.srcObject = s; })
        .catch(() => setStatus(status, 'Kamera tidak bisa diakses. Izinkan kamera dan buka lewat HTTPS/localhost.', 'err'));
    } else setStatus(status, 'Browser tidak mendukung kamera.', 'err');

    q('snap').onclick = () => {
      if (!video.videoWidth) return setStatus(status, 'Kamera belum siap.', 'err');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      photo.src = dataUrl; photo.hidden = false; video.hidden = true;
      q('snap').hidden = true; q('retake').hidden = false; q('verify').hidden = false;
      setStatus(status, '');
    };
    q('retake').onclick = () => {
      photo.hidden = true; video.hidden = false;
      q('snap').hidden = false; q('retake').hidden = true; q('verify').hidden = true;
      q('demo').hidden = true; setStatus(status, '');
    };
    q('verify').onclick = async () => {
      q('verify').disabled = true; setStatus(status, 'AI sedang menganalisis foto…');
      try {
        const found = await findBottle(canvas);
        if (found === false) return done(bottleResult('none'));          // COCO-SSD: tidak ada botol
        const r = await classifyBottle(dataUrl);
        if (r !== null) return done(bottleResult(r.label, r.confidence));
        if (CFG.demo) {                                                  // belum ada AI NVIDIA
          setStatus(status, 'Mode uji coba aktif.'); q('demo').hidden = false;
        } else {
          setStatus(status, 'Verifikasi AI belum aktif. Isi bottleEndpoint di QV_CONFIG.', 'err');
        }
      } catch (err) {
        setStatus(status, 'Gagal menghubungi AI. Coba lagi.', 'err');
      } finally { q('verify').disabled = false; }
    };
    body.querySelectorAll('[data-demo]').forEach(b =>
      b.addEventListener('click', () => done(bottleResult(b.dataset.demo, 0.9))));

    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }

  /* ================= 2 & 6. GPS (TRANSPORTASI UMUM / JALAN KAKI) ================= */
  const setupGps = kind => (body, done) => {
    const q = refOf(body), isWalk = kind === 'walk', status = q('status');
    const maxSpeed = isWalk ? 4 : 40;      // m/s, untuk membuang lonjakan GPS
    let t0 = 0, dist = 0, last = null, rejects = 0, watchId = null, timer = null;

    q('intro').textContent = isWalk
      ? `Aktifkan lokasi, tekan Start, lalu berjalanlah. Langkah dihitung dari jarak GPS (target ${CFG.stepGoal.toLocaleString('id-ID')} langkah).`
      : 'Aktifkan lokasi, tekan Start saat naik transportasi umum, lalu tekan Selesai saat turun.';
    if (isWalk) q('modeWrap').hidden = true; else { q('stepsBox').hidden = true; q('progWrap').hidden = true; }
    if (CFG.demo) { q('start').disabled = false; q('locate').hidden = true; setStatus(status, 'Mode uji coba: GPS disimulasikan.'); }

    q('locate').onclick = () => {
      if (!navigator.geolocation) return setStatus(status, 'Browser tidak mendukung GPS.', 'err');
      setStatus(status, 'Meminta izin lokasi…');
      navigator.geolocation.getCurrentPosition(p => {
        q('locate').hidden = true; q('start').disabled = false;
        setStatus(status, `Lokasi aktif (akurasi ±${Math.round(p.coords.accuracy)} m). Tekan Start.`, 'ok');
      }, e => setStatus(status, geoErr(e), 'err'), { enableHighAccuracy: true, timeout: 15000 });
    };

    const onPos = p => {
      const { latitude: lat, longitude: lon, accuracy } = p.coords;
      if (accuracy > 40) return;
      const cur = { lat, lon, t: p.timestamp };
      if (last) {
        const d = haversine(last, cur), dt = (cur.t - last.t) / 1000;
        if (d < 3) return;                                              // jitter saat diam
        if (dt > 0 && d / dt > maxSpeed) {                              // lonjakan mustahil
          if (++rejects >= 5) { last = cur; rejects = 0; }
          return;
        }
        dist += d / 1000;
      }
      rejects = 0; last = cur;
    };

    const minutes = () => (Date.now() - t0) / 60000;
    const steps = () => Math.round(dist * 1000 / CFG.strideM);

    const tick = () => {
      if (CFG.demo && !last) dist += (isWalk ? 15 : 20) / 1000;         // simulasi
      q('time').textContent = mmss((Date.now() - t0) / 1000);
      q('dist').textContent = dist.toFixed(2);
      if (isWalk) {
        const s = steps(), ok = s >= CFG.stepGoal;
        q('steps').textContent = s.toLocaleString('id-ID');
        q('prog').style.width = Math.min(100, s / CFG.stepGoal * 100) + '%';
        q('finish').disabled = !ok;
        setStatus(status, ok ? 'Target tercapai! Tekan Selesai.' : `Kurang ${(CFG.stepGoal - s).toLocaleString('id-ID')} langkah lagi.`, ok ? 'ok' : '');
      } else {
        const ok = CFG.demo || (minutes() >= CFG.minTripMinutes && dist >= CFG.minTripKm);
        q('finish').disabled = !ok;
        setStatus(status, ok ? 'Perjalanan cukup untuk dihitung. Tekan Selesai saat turun.'
          : `Minimal ${CFG.minTripMinutes} menit & ${CFG.minTripKm} km agar tercatat.`, ok ? 'ok' : '');
      }
    };

    const stop = () => {
      clearInterval(timer); timer = null;
      if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
      watchId = null;
    };

    q('start').onclick = () => {
      t0 = Date.now(); dist = 0; last = null;
      q('start').disabled = true; q('locate').hidden = true;
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(onPos, e => setStatus(status, geoErr(e), 'err'),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
      }
      timer = setInterval(tick, 1000); tick();
    };

    q('finish').onclick = () => {
      const min = minutes(), d = dist, s = steps();
      stop();
      if (isWalk) {
        const co2 = d * EF.avgPrivate, kcal = Math.round(s * EF.kcalPerStep);
        return done({ ok: true, title: 'Target langkah tercapai!', co2, km: d, lines: [
          `👟 ${s.toLocaleString('id-ID')} langkah ≈ ${d.toFixed(2)} km dalam ${Math.round(min)} menit.`,
          `🌍 Emisi berkurang ±${fmtKg(co2)} CO₂e dibanding naik kendaraan pribadi.`,
          `🙂 Untukmu: ±${kcal} kkal terbakar, jantung dan mood ikut senang. Hemat bensin ±${rp(d * 1000)}.`
        ] });
      }
      const speed = d / (min / 60);
      if (!CFG.demo && speed < 8) {
        return done({ ok: false, title: 'Perjalanan belum valid', lines: [
          `❌ Kecepatan rata-rata ${speed.toFixed(1)} km/jam terlalu rendah untuk transportasi umum.`,
          'Coba lagi saat benar-benar naik kendaraan.'
        ] });
      }
      const opt = q('mode').selectedOptions[0], factor = parseFloat(opt.value);
      const co2 = Math.max(0, (EF.car - factor) * d);
      done({ ok: true, title: 'Perjalanan hijau tercatat!', co2, km: d, lines: [
        `🚌 ${opt.textContent}: ${Math.round(min)} menit, ${d.toFixed(2)} km.`,
        `🌍 Emisi berkurang ±${fmtKg(co2)} CO₂e dibanding mobil pribadi.`,
        `🙂 Untukmu: hemat bensin ±${rp(d * 1000)} dan tidak ikut stres di balik kemudi saat macet.`
      ] });
    };
    return stop;
  };

  /* ================= 3. PILAH SAMPAH ================= */
  function setupWaste(body, done) {
    const q = refOf(body);
    q('intro').textContent = 'Isi perkiraan berat sampah yang kamu pilah hari ini (gram). Kosongkan yang tidak ada.';
    q('list').innerHTML = WASTE.map(w => `<div class="qv-row"><label for="qvw-${w.k}">${w.label}</label>
      <input id="qvw-${w.k}" type="number" min="0" max="20000" step="10" inputmode="numeric" placeholder="gram"></div>`).join('');
    q('submit').onclick = () => {
      let co2 = 0, totalG = 0; const parts = [];
      WASTE.forEach(w => {
        const g = Math.max(0, parseFloat(body.querySelector(`#qvw-${w.k}`).value) || 0);
        if (g > 0) { co2 += g / 1000 * w.f; totalG += g; parts.push(`${w.label.split(' (')[0]} ${g} g`); }
      });
      if (totalG <= 0) return setStatus(q('status'), 'Isi minimal satu jenis sampah.', 'err');
      done({ ok: true, title: 'Sampah terpilah!', co2, lines: [
        `♻️ Dipilah: ${parts.join(', ')} (total ${totalG} g).`,
        `🌍 Emisi berkurang ±${fmtKg(co2)} CO₂e, setara mobil menempuh ±${(co2 / EF.car).toFixed(1)} km. Lebih sedikit sampah menumpuk di TPA, gas metana dan pencemaran pun berkurang.`,
        '🙂 Untukmu: lingkungan rumah lebih bersih, bau dan hama berkurang.'
      ] });
    };
  }

  /* ================= 4. MAKAN MENU NABATI ================= */
  function setupVegan(body, done) {
    const q = refOf(body);
    q('submit').onclick = () => {
      const raw = q('food').value.trim();
      if (raw.length < 3) return setStatus(q('status'), 'Tulis nama makanan dulu.', 'err');
      const t = raw.toLowerCase().replace(/tanpa\s+\S+/g, ' ').replace(/susu\s+(kedelai|almond|oat)/g, ' ');
      const meat = t.match(ANIMAL);
      if (meat) {
        return done({ ok: false, title: 'Belum menu nabati', lines: [
          `❌ "${raw}" mengandung bahan hewani (${meat[0]}).`,
          'Ganti dengan tempe, tahu, sayur, atau kacang-kacangan untuk dapat XP.'
        ] });
      }
      const hits = PLANT.filter(p => p.re.test(t));
      if (!hits.length) return setStatus(q('status'), 'Menu belum dikenali. Sebutkan bahan utamanya (mis. tempe, tahu, sayur).', 'err');
      const portion = parseInt(q('portion').value, 10) || 1, co2 = EF.plantMeal * portion;
      done({ ok: true, title: 'Menu nabati dicatat!', co2, lines: [
        `🥗 ${raw} × ${portion} porsi.`,
        `🌍 Emisi berkurang ±${fmtKg(co2)} CO₂e dibanding menu hewani umum; lahan dan air yang dipakai juga lebih sedikit.`,
        `🙂 Untukmu: ${hits.slice(0, 3).map(h => h.perk).join('; ')}.`
      ] });
    };
  }

  /* ================= 5. MATIKAN PERANGKAT SIAGA ================= */
  function setupStandby(body, done) {
    const q = refOf(body);
    q('intro').textContent = 'Centang perangkat yang kamu matikan/cabut, lalu isi berapa jam per hari ia biasanya siaga.';
    q('list').innerHTML = DEVICES.map(d => `<div class="qv-row"><label><input type="checkbox" id="qvd-${d.k}"> ${d.label}</label>
      <input id="qvh-${d.k}" type="number" min="1" max="24" value="8" aria-label="Jam siaga ${d.label}"> jam</div>`).join('');
    q('submit').onclick = () => {
      let wh = 0; const names = [];
      DEVICES.forEach(d => {
        if (body.querySelector(`#qvd-${d.k}`).checked) {
          const h = Math.min(24, Math.max(1, parseFloat(body.querySelector(`#qvh-${d.k}`).value) || 8));
          wh += d.w * h; names.push(d.label);
        }
      });
      if (!names.length) return setStatus(q('status'), 'Pilih minimal satu perangkat.', 'err');
      const kwh = wh / 1000, co2 = kwh * CFG.gridKgPerKwh, money = kwh * CFG.rpPerKwh;
      done({ ok: true, title: 'Perangkat siaga dimatikan!', co2, lines: [
        `🔌 Dimatikan: ${names.join(', ')}.`,
        `🌍 Hemat ±${Math.round(wh)} Wh → emisi berkurang ±${fmtKg(co2)} CO₂e. Jika rutin tiap hari: ±${(co2 * 365).toFixed(1)} kg CO₂e per tahun.`,
        `🙂 Untukmu: hemat ±${rp(money)} per hari (±${rp(money * 30)} per bulan), risiko korsleting berkurang, perangkat lebih awet.`
      ] });
    };
  }

  /* ================= 7. PELAJARI FAKTA ALAM ================= */
  function setupLearn(body, done) {
    const q = refOf(body), titleEl = q('title'), contentEl = q('content');
    const words = () => contentEl.value.trim().split(/\s+/).filter(Boolean);
    const update = () => {
      const n = words().length;
      q('count').textContent = n;
      q('count').parentElement.classList.toggle('qv-ok', n >= 100);
      q('submit').disabled = !(n >= 100 && titleEl.value.trim().length >= 3);
    };
    titleEl.addEventListener('input', update); contentEl.addEventListener('input', update);
    q('submit').onclick = () => {
      const w = words(), uniq = new Set(w.map(x => x.toLowerCase())).size;
      if (uniq / w.length < 0.4) return setStatus(q('status'), 'Isi terlalu berulang. Tulis dengan kalimat yang bervariasi.', 'err');
      done({ ok: true, title: 'Pengetahuan baru!', co2: 0, lines: [
        `📚 Kamu mempelajari “${titleEl.value.trim()}” (${w.length} kata).`,
        '🌍 Dampak tidak langsung: pengetahuan membantumu memilih tindakan rendah karbon yang lebih tepat (belum dihitung sebagai pengurangan emisi).',
        '🙂 Untukmu: wawasan bertambah dan kebiasaan belajar makin kuat.'
      ] });
    };
  }

  /* ================= PETA QUEST (id sesuai array Q di script.js) ================= */
  const FLOWS = {
    'bottle': () => openModal('Verifikasi botol minum', 'qv-tpl-bottle', setupBottle),
    'transport': () => openModal('Naik transportasi umum', 'qv-tpl-gps', setupGps('transit')),
    'sort-waste': () => openModal('Pilah sampah', 'qv-tpl-list', setupWaste),
    'plant-meal': () => openModal('Makan menu nabati', 'qv-tpl-vegan', setupVegan),
    'standby': () => openModal('Matikan perangkat siaga', 'qv-tpl-list', setupStandby),
    'walk': () => openModal('Jalan kaki', 'qv-tpl-gps', setupGps('walk')),
    'learn': () => openModal('Pelajari fakta alam', 'qv-tpl-learn', setupLearn)
  };

  function bonusResult(id) {
    const b = BONUS[id], q = Q.find(x => x[0] === id), co2 = q[5];
    return { ok: true, title: 'Bonus quest selesai!', co2, lines: [
      '🎁 Quest bonus: tanpa verifikasi.',
      `🌍 Emisi berkurang ±${fmtKg(co2)} CO₂e. ${b.env}`,
      `🙂 Untukmu: ${b.me}`
    ] };
  }

  /* ================= PENGHADANG KLIK "CATAT" ================= */
  let busy = false;

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-a="quest"]');
    if (!btn || typeof Q === 'undefined') return;
    const id = btn.dataset.v;
    if (!FLOWS[id] && !BONUS[id]) return;                         // quest lain: biarkan alur lama
    if (dn().some(x => x.k === id)) return;                       // sudah selesai: handler lama yang menolak
    e.preventDefault();
    e.stopImmediatePropagation();                                 // add() lama TIDAK jalan
    run(id);
  }, true);                                                       // capture = paling awal

  async function run(id) {
    if (busy) return;
    busy = true;
    try {
      const res = BONUS[id] ? bonusResult(id) : await FLOWS[id]();
      if (!res) return;                                           // dibatalkan
      if (res.ok) { const q = Q.find(x => x[0] === id); add(id, q[1], q[3], res.co2 || 0, res.km); }  // XP + token + catat
      speech = `${res.title} ${res.lines.join(' ')}`;             // teks polos cadangan untuk render berikutnya
      render();
      showSpeech(res);                                            // versi lengkap di bubble pet
    } finally { busy = false; }
  }
})();
