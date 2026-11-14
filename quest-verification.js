cat > quest-verification.js << 'EOF'
/* global Q, add, render, dn, cocoSsd */
(() => {
  'use strict';

  const CFG = Object.assign({
    demo: false,
    bottleEndpoint: '',
    minTripMinutes: 3, minTripKm: 0.5,
    strideM: 0.75, stepGoal: 2000,
    gridKgPerKwh: 0.87, rpPerKwh: 1444
  }, window.QV_CONFIG || {});

  const EF = { car: 0.192, avgPrivate: 0.15, bottle: 0.083, plantMeal: 1.2, kcalPerStep: 0.04 };

  const WASTE = [
    { k: 'plastik', label: 'Plastik (botol, kemasan)', f: 1.5 },
    { k: 'kertas', label: 'Kertas / koran', f: 1.0 },
    { k: 'kardus', label: 'Kardus', f: 0.9 },
    { k: 'logam', label: 'Kaleng / logam', f: 4.0 },
    { k: 'kaca', label: 'Kaca / botol kaca', f: 0.3 },
    { k: 'organik', label: 'Sisa makanan (dikompos)', f: 0.5 }
  ];
  const DEVICES = [
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

  const BONUS = {
    compost: { env: 'Sisa buah yang dikompos tidak membusuk tanpa oksigen di TPA, jadi gas metana (jauh lebih kuat dari CO₂) berkurang.',
               me: 'Kamu dapat pupuk gratis untuk tanaman dan sampah dapur berkurang.' },
    local: { env: 'Produk lokal menempuh jarak distribusi lebih pendek, jadi emisi angkutan dan pendinginan lebih rendah.',
             me: 'Biasanya lebih segar dan uangmu berputar di ekonomi sekitar.' },
    shower: { env: 'Mandi di bawah 5 menit menghemat ±30 L air bersih beserta energi untuk memompa dan memanaskannya.',
              me: 'Tagihan air turun dan kulit tidak terlalu kering.' }
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtKg = kg => kg < 1 ? `${Math.round(kg * 1000)} g` : `${kg.toFixed(2)} kg`;
  const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
  const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const haversine = (a, b) => {
    const R = 6371000, r = x => x * Math.PI / 180;
    const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const geoErr = e => e && e.code === 1
    ? 'Izin lokasi ditolak. Aktifkan lokasi di pengaturan browser, lalu coba lagi.'
    : 'Lokasi tidak tersedia. Pastikan GPS aktif dan halaman dibuka lewat HTTPS/localhost.';
  const refOf = body => r => body.querySelector(`[data-ref="${r}"]`);
  const setStatus = (el, msg, type) => { el.textContent = msg; el.className = 'qv-status' + (type ? ' qv-' + type : ''); };

  function showSpeech(res) {
    const sp = document.getElementById('sp'), ps = document.getElementById('ps');
    if (!sp) return;
    sp.classList.add('qv-rich');
    sp.classList.toggle('qv-fail', !res.ok);
    sp.innerHTML = `<div class="qv-speech-body"><strong>🐾 ${esc(res.title)}</strong><ul>${
      res.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div><i></i>`;
    const card = sp.parentElement;
    if (ps && card) {
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

  let cocoModel = null;
  async function findBottle(canvas) {
    if (typeof cocoSsd === 'undefined') return null;
    cocoModel = cocoModel || await cocoSsd.load();
    const preds = await cocoModel.detect(canvas);
    return preds.some(p => (p.class === 'bottle' || p.class === 'cup') && p.score >= 0.35);
  }

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
        if (found === false) return done(bottleResult('none'));
        const r = await classifyBottle(dataUrl);
        if (r !== null) return done(bottleResult(r.label, r.confidence));
        if (CFG.demo) {
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

  const setupGps = kind => (body, done) => {
    const q = refOf(body), isWalk = kind === 'walk', status = q('status');
    const maxSpeed = isWalk ? 4 : 40;
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
        if (d < 3) return;
        if (dt > 0 && d / dt > maxSpeed) {
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
      if (CFG.demo && !last) dist += (isWalk ? 15 : 20) / 1000;
      q('time').textContent = mmss((Date.now() - t0) / 1000);
      q('dist').textContent = dist.toFixed(2);
      if (isWalk) {
        const s = steps(), ok = s >= CFG.stepGoal;
        q('steps').textContent = s.toLocaleString('id-ID');
        q('prog').style.width =
