const PETS={turtle:{name:"Moss",label:"Kura-kura",color:"#53b175",habitat:"Kolam Lumut"},rabbit:{name:"Pip",label:"Kelinci",color:"#e8e0ce",habitat:"Kebun Wortel"},cat:{name:"Miko",label:"Kucing",color:"#f2a65a",habitat:"Rumah Pohon"},snake:{name:"Slink",label:"Ular",color:"#8dbf67",habitat:"Hutan Pakis"}};
const NAV=[["home","Habitat","home"],["report","Laporan","chart"],["social","Komunitas","users"],["token","Eco Token","token"],["world","Dunia","map"]];
const Q=[["bottle","Bawa botol minum","Kurangi plastik sekali pakai","waste","leaf",.08],["transport","Naik transportasi umum","Masukkan jarak dan durasi","transport","bolt",0],["sort-waste","Pilah sampah","Organik dan anorganik","waste","bag",.3],["plant-meal","Makan menu nabati","Satu kali makan tanpa daging","food","leaf",1.2],["standby","Matikan perangkat siaga","Hemat energi dua jam","energy","bolt",.15],["walk","Jalan kaki 2.000 langkah","Tubuh sehat, udara sehat","transport","map",.5],["learn","Pelajari fakta alam","Baca satu Eco Class","education","book",0],["compost","Mulai kompos mini","Simpan sisa buah hari ini","nature","leaf",.25],["local","Pilih produk lokal","Kurangi jarak distribusi","food","bag",.4],["shower","Mandi di bawah 5 menit","Hemat air bersih","energy","bolt",.2]];
const REG=[["Kampung Embun",0,"Bibit bunga","Tanam 5 bunga penyerbuk","Lebah membantu penyerbukan satu dari tiga suap makanan kita.","meadow"],["Hutan Berbisik",3,"Mahkota daun","Temukan 3 suara hutan","Hutan tropis menyimpan sekitar seperempat karbon daratan.","forest"],["Teluk Biru",6,"Habitat pantai","Bersihkan sampah teluk","Lamun menyerap karbon jauh lebih cepat dari banyak ekosistem darat.","ocean"],["Puncak Aurora",10,"Efek aurora","Nyalakan desa dengan energi bersih","Angin dan matahari menghasilkan listrik tanpa emisi operasional.","aurora"]];
const IC={"home": "<path d=\"M3 11 12 3l9 8\" /><path d=\"M5 10v10h14V10M9 20v-6h6v6\" />", "chart": "<path d=\"M4 19V9M10 19V5M16 19v-7M22 19H2\" />", "users": "<circle cx=\"9\" cy=\"8\" r=\"3\" /><circle cx=\"17\" cy=\"9\" r=\"2.5\" /><path d=\"M3 20v-2c0-3 2.5-5 6-5s6 2 6 5v2M15 14c3.5 0 6 1.5 6 4v2\" />", "token": "<circle cx=\"12\" cy=\"12\" r=\"9\" /><path d=\"m9 12 2 2 4-5M12 3v2M12 19v2\" />", "map": "<path d=\"m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15\" />", "check": "<path d=\"m5 12 4 4L19 6\" />", "bolt": "<path d=\"m13 2-8 12h7l-1 8 8-12h-7z\" />", "leaf": "<path d=\"M20 4C10 4 5 8 5 14c0 3 2 5 5 5 6 0 10-7 10-15Z\" /><path d=\"M4 21c2-6 6-9 12-12\" />", "arrow": "<path d=\"m9 18 6-6-6-6\" />", "bag": "<path d=\"M5 8h14l-1 13H6zM9 9V6a3 3 0 0 1 6 0v3\" />", "lock": "<rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"1\" /><path d=\"M8 10V7a4 4 0 0 1 8 0v3\" />", "camera": "<rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2\" /><path d=\"m8 6 1-3h6l1 3\" /><circle cx=\"12\" cy=\"13\" r=\"4\" />", "fire": "<path d=\"M12 22c4 0 7-3 7-7 0-5-4-8-7-13 0 5-7 7-7 13 0 4 3 7 7 7Zm0 0c-2 0-3-2-3-4s2-3 3-5c0 2 3 3 3 5s-1 4-3 4Z\" />", "closet": "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" /><path d=\"M12 3v18M9 12h1M14 12h1\" />", "book": "<path d=\"M3 5c4-2 7-1 9 1v15c-2-2-5-3-9-1zM21 5c-4-2-7-1-9 1v15c2-2 5-3 9-1z\" />", "chat": "<path d=\"M4 4h16v12H9l-5 4z\" /><path d=\"M8 9h8M8 12h5\" />", "star": "<path d=\"m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" />", "close": "<path d=\"M5 5l14 14M19 5 5 19\" />"};
const I=(n,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${IC[n]||IC.leaf}</svg>`;
function pet(type,size="large",accessory="none"){const color=PETS[type].color;return`<svg class="pixel-pet ${size}" viewBox="0 0 120 100" shape-rendering="crispEdges" aria-label="${PETS[type].label}"><ellipse cx="60" cy="91" rx="36" ry="5" fill="#2d4b3b" opacity=".22" />
      ${type==="turtle"?`
        <rect x="25" y="42" width="65" height="38" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <rect x="34" y="33" width="48" height="15" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <rect x="89" y="53" width="20" height="18" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <rect x="20" y="73" width="15" height="12" fill="${color}" stroke="#292c2b" stroke-width="1.5" /><rect x="78" y="73" width="15" height="12" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <path d="M40 45v33M60 36v42M80 45v33M28 59h60" stroke="#347c57" stroke-width="4" />
        <rect x="98" y="57" width="4" height="4" fill="#292c2b" />
      `:""}
      ${type==="rabbit"?`
        <rect x="39" y="16" width="14" height="40" fill="${color}" stroke="#292c2b" stroke-width="1.5" /><rect x="67" y="10" width="14" height="46" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <rect x="31" y="45" width="58" height="40" fill="${color}" stroke="#292c2b" stroke-width="1.5" /><rect x="22" y="75" width="22" height="13" fill="${color}" stroke="#292c2b" stroke-width="1.5" /><rect x="76" y="75" width="22" height="13" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <rect x="46" y="56" width="6" height="7" fill="#292c2b" /><rect x="72" y="56" width="6" height="7" fill="#292c2b" />
        <rect x="59" y="66" width="7" height="6" fill="#d87976" /><rect x="43" y="22" width="6" height="23" fill="#d9a4a1" /><rect x="71" y="17" width="6" height="26" fill="#d9a4a1" />
      `:""}
      ${type==="cat"?`
        <path d="M28 45V20l23 17h18l23-17v65H28Z" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <rect x="40" y="52" width="7" height="8" fill="#292c2b" /><rect x="73" y="52" width="7" height="8" fill="#292c2b" />
        <rect x="57" y="64" width="7" height="6" fill="#b96767" /><path d="M60 70v8m0-4-9 5m9-5 9 5" stroke="#292c2b" stroke-width="2" />
        <path d="M28 65H12m16 8H8m84-8h16M92 73h20" stroke="#292c2b" stroke-width="2" />
      `:""}
      ${type==="snake"?`
        <path d="M32 78h55V64H46V50h38V35H52V21h44v48H65v17H32Z" fill="${color}" stroke="#292c2b" stroke-width="1.5" />
        <rect x="86" y="28" width="21" height="18" fill="${color}" stroke="#292c2b" stroke-width="1.5" /><rect x="99" y="32" width="4" height="5" fill="#292c2b" />
        <path d="m107 42 10 4-10 4" stroke="#d34e4e" stroke-width="2" />
        <rect x="58" y="28" width="7" height="7" fill="#629346" /><rect x="65" y="57" width="7" height="7" fill="#629346" /><rect x="41" y="74" width="7" height="7" fill="#629346" />
      `:""}
      ${accessory==="Topi Petualang"?`<g class="pet-accessory"><path d="M35 25h50l-9-18H44Z" fill="#c89242" stroke="#292c2b" stroke-width="2" /><rect x="28" y="24" width="64" height="7" fill="#9c6b2f" stroke="#292c2b" stroke-width="2" /></g>`:""}
      ${accessory==="Mahkota Daun"?`<g class="pet-accessory"><path d="M38 29 34 9l18 12L61 5l10 16L88 9l-5 20Z" fill="#d3e75f" stroke="#292c2b" stroke-width="2" /><rect x="38" y="27" width="45" height="7" fill="#5fa35f" stroke="#292c2b" stroke-width="2" /></g>`:""}
      ${accessory==="Kacamata Pixel"?`<g class="pet-accessory"><rect x="31" y="48" width="24" height="14" fill="#71bdd0" stroke="#292c2b" stroke-width="3" /><rect x="65" y="48" width="24" height="14" fill="#71bdd0" stroke="#292c2b" stroke-width="3" /><path d="M55 53h10" stroke="#292c2b" stroke-width="3" /></g>`:""}</svg>`}
const $=document.getElementById("root"),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let DB=(()=>{try{return JSON.parse(localStorage.getItem("ecopet2"))||{accs:{},cur:null}}catch{return{accs:{},cur:null}}})();
const blank=()=>({acts:[],msgs:[]});let S=DB.cur&&DB.accs[DB.cur]?DB.accs[DB.cur]:blank();if(!DB.accs[DB.cur])DB.cur=null;
const save=()=>{try{localStorage.setItem("ecopet2",JSON.stringify(DB))}catch{}};
const hash=async p=>{try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch{return p}};
let mode="signup",err="",ob={step:1,name:"",pet:"turtle"},view="home",modal=null,speech="",pp={x:50,y:66},tm="bus";
const today=()=>new Date().toDateString(),dn=()=>S.acts.filter(a=>new Date(a.at).toDateString()===today());
const reply=t=>{t=t.toLowerCase();return /makan|lapar/.test(t)?"Aku mau makanan lokal yang segar!":/sampah|plastik/.test(t)?"Pilah sampahmu hari ini, ya. Aku semangati!":/halo|hai/.test(t)?`Halo ${S.user.displayName}! Aku senang kamu datang.`:"Aku sedang menjaga habitat. Selesaikan satu quest hijau, yuk!"};
const modalHtml=(t,b,w)=>`<div class="modal-backdrop" data-a="bd"><section class="game-modal ${w?"wide":""}"><header><div><p class="eyebrow">ECO-PET</p><h2>${t}</h2></div><button data-a="close" aria-label="Tutup">${I("close")}</button></header><div class="modal-body">${b}</div></section></div>`;
const stats=u=>`<div class="top-stats"><div class="profile-chip"><div class="avatar">${esc(u.displayName[0].toUpperCase())}</div><div><small>PENJAGA LEVEL ${u.level}</small><strong>${esc(u.displayName)}</strong></div></div><div class="level-progress"><div><span>Menuju level ${u.level+1}</span><b>${u.xp%500} / 500 XP</b></div><div class="progress-track"><i style="width:${u.xp%500/5}%"></i></div></div><div class="stat-pill">${I("leaf")}<span><small>TOTAL POIN</small><b>${u.points}</b></span></div><div class="stat-pill token">${I("token")}<span><small>ECO TOKEN</small><b>${u.ecoTokens}</b></span></div></div>`;
function home(){const u=S.user,p=u.selectedPet,d=dn().map(a=>a.k),sv=dn().reduce((s,a)=>s+a.kg,0);speech=speech||`Halo! Aku ${PETS[p].name}.`;
return`<div class="welcome-row"><div><p class="eyebrow">HALO, ${esc(u.displayName.toUpperCase())}!</p><h1>Habitat ${PETS[p].name} menunggumu.</h1></div><span class="streak-chip">${I("fire")}<b>${u.currentStreak} hari</b> streak</span></div>${stats(u)}<div class="dashboard-grid"><section class="pet-card"><div class="habitat-top"><span>${I("map",16)} ${PETS[p].habitat}</span><div class="habitat-actions"><button data-a="chat">${I("chat",15)} Chat (${S.msgs.length})</button></div></div><div class="speech" id="sp">${esc(speech)}<i></i></div><div class="habitat ${p}"><div class="sun"></div><div class="pixel-cloud a"></div><div class="pixel-cloud b"></div><div class="mountains"></div><button class="habitat-object food" data-a="feed" aria-label="Beri makan pet">${I("leaf",18)}</button><button class="habitat-object toy" data-a="play" aria-label="Ajak pet bermain">${I("star",17)}</button><div class="tree t1"></div><div class="tree t2"></div><div class="pond"></div><div class="move-hint">KLIK TANAH · MAKANAN · MAINAN</div><div class="pet-stage" id="ps" style="left:${pp.x}%;top:${pp.y}%">${pet(p,"large",u.equippedAccessory)}</div></div><form class="pet-chat" data-f="chat"><span>AI</span><input name="m" placeholder="Tanya ${PETS[p].name} sedang ngapain..."><button type="submit">${I("arrow",17)}</button></form></section><aside class="right-stack"><section class="emission-card"><div class="section-title"><div><p class="eyebrow">JEJAK HARI INI</p><h3>Karbon dihindari</h3></div><b class="good">DEMO</b></div><div class="emission-value"><strong>${sv.toFixed(2)}</strong><span>kg CO₂e<br><small>Estimasi dari aktivitasmu</small></span></div><p class="insight">${I("leaf",17)} Dibanding alternatif kendaraan pribadimu.</p></section><section class="quest-card"><div class="section-title"><div><p class="eyebrow">DAILY QUEST</p><h3>${Q.length} aksi tersedia</h3></div><span>${d.length}/${Q.length}</span></div><div class="quest-progress"><i style="width:${d.length/Q.length*100}%"></i></div><div class="quest-list quest-scroll">${Q.map(q=>`<button data-a="quest" data-v="${q[0]}" class="${d.includes(q[0])?"complete":""}"><span class="quest-icon">${I(d.includes(q[0])?"check":q[4],18)}</span><span><strong>${q[1]}</strong><small>${q[2]}</small></span><b>${d.includes(q[0])?"SELESAI":"CATAT"}</b></button>`).join("")}</div></section></aside></div>`}
function report(){const u=S.user,t=S.acts.reduce((s,a)=>s+a.kg,0),km=S.acts.reduce((s,a)=>s+(a.km||0),0);
return`<div class="page-content"><div class="page-heading"><div><p class="eyebrow">LAPORAN AKUN</p><h1>Perjalananmu tercatat.</h1><p>Semua angka berasal dari aktivitas yang kamu simpan di browser ini.</p></div></div><div class="report-grid"><section class="weekly-card"><div class="week-top"><div><small>SEJAK ${new Date(u.createdAt).toLocaleDateString("id-ID")}</small><h2>Eco Wrapped</h2></div></div><div class="wrapped-visual"><div class="big-number">${t.toFixed(1)}<small>KG CO₂ DIHINDARI</small></div><div class="pixel-planet">${I("leaf",50)}</div></div><div class="mini-stats"><div><b>${S.acts.length}</b><small>QUEST TERCATAT</small></div><div><b>${km.toFixed(1)} km</b><small>PERJALANAN</small></div><div><b>${u.points}</b><small>POIN DIDAPAT</small></div></div></section><section class="impact-card"><p class="eyebrow">DAMPAK AKUNMU</p><h3>Berdasarkan catatan nyata</h3><div class="impact-row"><span>${I("leaf")}</span><div><b>${(t/21).toFixed(2)} pohon-bulan</b><small>estimasi serapan pohon dewasa</small></div></div><div class="impact-row"><span>${I("bolt")}</span><div><b>${(t*4.2).toFixed(1)} kWh</b><small>perkiraan energi setara</small></div></div><div class="streak">${I("fire")}<div><b>${u.currentStreak} hari beruntun</b><small>Rekor: ${u.longestStreak} hari</small></div></div></section></div></div>`}
const social=()=>{const pr=Math.min(100,S.acts.filter(a=>a.type==="waste").length*5);return`<div class="page-content"><div class="page-heading"><div><p class="eyebrow">TUMBUH BERSAMA</p><h1>Komunitas Penjaga</h1><p>Di versi demo ini hanya aktivitasmu sendiri. Komunitas penuh butuh server.</p></div></div><div class="challenge-banner"><div><small>UPDATE DARI AKTIVITASMU</small><h2>7 Hari Bebas Plastik</h2><p>Setiap quest sampah menambah progres.</p><div class="challenge-bar"><i style="width:${pr}%"></i></div><b>${pr}% target</b></div><div class="banner-bottle">${I("leaf",48)}</div></div><div class="empty-card">${I("users")}<b>Belum ada aktivitas pengguna lain</b><p>Feed dan leaderboard aktif di versi dengan database.</p></div></div>`};
const token=()=>{const u=S.user;return`<div class="page-content"><div class="token-hero"><div><p class="eyebrow light">DOMPET ECO TOKEN</p><h1>${u.ecoTokens} <span>ET</span></h1><p>Saldo bertambah dari aktivitas yang kamu catat.</p></div><div class="coin-stack">${I("token",62)}</div><div class="token-history"><small>LEVEL AKUN</small><b>${u.level}</b></div></div><div class="shop-heading"><div><p class="eyebrow">PIXEL SHOP</p><h2>Koleksi habitat berikutnya</h2></div></div><div class="shop-grid">${[["Topi Petualang",80,"hat"],["Kacamata Pixel",70,"glasses"],["Kolam Teratai",150,"pond-item"]].map(i=>`<article class="shop-item"><div class="item-art ${i[2]}"><span></span></div><div><small>Terbuka lewat perk level</small><h3>${i[0]}</h3><button disabled>${I("lock",16)} ${i[1]} ET</button></div></article>`).join("")}</div></div>`};
const world=()=>{const L=S.user.level;return`<div class="world-page"><div class="world-heading"><p class="eyebrow light">PETA PETUALANGAN</p><h1>Dunia Eco-Pet · Level ${L}</h1><p>Wilayah terbuka mengikuti level akunmu.</p></div><div class="world-map"><div class="map-path"></div>${REG.map((r,i)=>{const o=L>=r[1];return`<button data-a="region" data-v="${i}" class="region r${i} ${r[5]} ${o?"open":"locked"}"><div class="region-island"><span class="region-icon">${I(o?"leaf":"lock",24)}</span></div><div class="region-label"><small>${o?`LEVEL ${r[1]} · JELAJAHI`:`TERBUKA LEVEL ${r[1]}`}</small><b>${r[0]}</b><span>PERK: ${r[2]}</span></div></button>`}).join("")}</div></div>`};
function auth(){const su=mode==="signup";return`<main class="auth-shell"><div class="auth-art"><div class="cloud cloud-one"></div><div class="cloud cloud-two"></div><div class="auth-brand"><span class="brand-pixel">${I("leaf",17)}</span> ECO-PET</div><div class="art-copy"><p class="eyebrow light">RAWAT BUMI, RAWAT TEMANMU</p><h1>Petualangan kecil.<br>Dampak yang besar.</h1><p>Temukan teman pixel-mu dan bangun habitat impian dari kebiasaan baik setiap hari.</p></div><div class="login-scene"><div class="login-tree"><span></span><span></span><span></span></div>${pet("turtle","large")}<div class="ground-details">✦　·　✦　·　✦</div></div></div><div class="auth-panel"><div class="mobile-brand"><span class="brand-pixel">${I("leaf",16)}</span> ECO-PET</div><div class="auth-card"><p class="eyebrow">SELAMAT DATANG, PENJAGA!</p><h2>${su?"Mulai petualanganmu":"Kembali ke habitat"}</h2><p class="muted">Satu aksi hijau membuat pet-mu semakin bahagia.</p><div class="auth-tabs"><button data-a="mode" data-v="login" class="${su?"":"active"}">Masuk</button><button data-a="mode" data-v="signup" class="${su?"active":""}">Daftar</button></div><form data-f="auth"><label>Email<input required type="email" name="e" placeholder="kamu@email.com"></label><label>Kata sandi<input required type="password" name="p" minlength="8" placeholder="Minimal 8 karakter"></label>${err?`<p class="form-error">${err}</p>`:""}<button class="primary-btn full" type="submit">${su?"Lanjut pilih pet":"Masuk"} ${I("arrow",18)}</button></form><p class="tiny-note">Mode demo: akun dan data hanya tersimpan di browser ini.</p></div></div></main>`}
function onboard(){const a=ob.step===1;return`<main class="onboarding-shell"><header class="simple-header"><div class="auth-brand dark"><span class="brand-pixel">${I("leaf",17)}</span> ECO-PET</div><span>LANGKAH ${ob.step} / 2</span></header><div class="step-dots"><i class="done"></i><i class="${a?"":"done"}"></i></div>${a?`<section class="onboard-card narrow"><span class="pixel-sun">${I("leaf",28)}</span><p class="eyebrow">KENALAN DULU</p><h1>Siapa nama penjaga baru kami?</h1><p class="muted">Pet-mu akan memanggilmu dengan nama ini.</p><input class="big-input" id="nm" value="${esc(ob.name)}" placeholder="Ketik namamu..." maxlength="16"><button class="primary-btn" id="nx" data-a="next" ${ob.name.trim()?"":"disabled"}>Lanjutkan ${I("arrow",18)}</button></section>`:`<section class="onboard-card pet-step"><p class="eyebrow">PILIH TEMAN PERTAMAMU</p><h1>Siapa yang akan tumbuh bersamamu?</h1><p class="muted">Tenang, kamu bisa bertemu pet lain saat menjelajah nanti.</p><div class="pet-grid">${Object.keys(PETS).map(k=>`<button class="pet-option ${ob.pet===k?"selected":""}" data-a="pick" data-v="${k}"><span class="select-check">${I("check",14)}</span>${pet(k,"small")}<strong>${PETS[k].name}</strong><small>${PETS[k].label}</small></button>`).join("")}</div><button class="primary-btn" data-a="finish">Bertemu ${PETS[ob.pet].name} ${I("arrow",18)}</button></section>`}</main>`}
function shell(){const v={home,report,social,token,world}[view]();let m="";
if(modal==="chat")m=modalHtml(`Chat dengan ${PETS[S.user.selectedPet].name}`,`<div class="chat-history">${S.msgs.length?S.msgs.map(x=>`<div class="chat-row ${x.s}"><small>${x.s==="user"?"Kamu":PETS[S.user.selectedPet].name}</small><p>${esc(x.t)}</p></div>`).join(""):'<p class="empty-state">Belum ada chat. Tanyakan pet-mu sedang apa.</p>'}</div><form class="modal-chat-form" data-f="chat2"><input name="m" placeholder="Ketik pesan..."><button class="primary-btn">Kirim</button></form>`);
if(modal==="transport")m=modalHtml("Catat perjalanan",`<form class="transport-form" data-f="trip"><div class="mode-grid">${[["bus","Bus"],["train","Kereta"],["walk","Jalan kaki"],["bicycle","Sepeda"]].map(x=>`<button type="button" data-a="tm" data-v="${x[0]}" class="${tm===x[0]?"active":""}">${I(x[0]==="walk"?"map":"bolt")}${x[1]}</button>`).join("")}</div><div class="form-two"><label>Jarak perjalanan (km)<input type="number" name="d" min=".1" max="200" step=".1" value="5"></label><label>Durasi (menit)<input type="number" name="t" min="1" value="25"></label></div><label>Alternatif jika tidak memilih moda ini<select name="a"><option value="car">Mobil pribadi</option><option value="motorcycle">Sepeda motor</option></select></label><div class="carbon-compare"><div><small>MODA DIPILIH</small><b id="c1"></b></div><span>vs</span><div><small>ALTERNATIF</small><b id="c2"></b></div><strong id="c3"></strong></div><button class="primary-btn full">Simpan perjalanan</button></form>`);
if(typeof modal==="number"){const r=REG[modal],o=S.user.level>=r[1];m=modalHtml(r[0],`<div class="region-adventure ${r[5]}"><div class="adventure-scene"><div class="adventure-sun"></div><div class="adventure-ground"></div><span class="tiny-tree a"></span><span class="tiny-tree b"></span><div class="adventure-badge">${I(o?"map":"lock",34)}</div></div><div class="adventure-copy"><span class="${o?"status-open":"status-lock"}">${o?`WILAYAH LEVEL ${r[1]}`:`TERKUNCI · LEVEL ${r[1]}`}</span><h3>${o?r[3]:"Level akunmu belum cukup."}</h3><p>${r[4]}</p><div class="reward-box">${I("star")}<div><small>PERK</small><b>${r[2]}</b></div></div></div></div>`,1)}
return`<div class="app-shell"><header class="app-header"><button class="logo-button" data-a="nav" data-v="home"><span class="brand-pixel">${I("leaf",17)}</span>ECO-PET</button><nav>${NAV.map(n=>`<button data-a="nav" data-v="${n[0]}" class="${view===n[0]?"active":""}">${I(n[2])}<span>${n[1]}</span></button>`).join("")}</nav><button class="header-avatar" data-a="logout" title="Keluar dari akun">${esc(S.user.displayName[0].toUpperCase())}<i></i></button></header><main class="app-main">${v}</main><nav class="mobile-nav">${NAV.map(n=>`<button data-a="nav" data-v="${n[0]}" class="${view===n[0]?"active":""}">${I(n[2])}<small>${n[1]}</small></button>`).join("")}</nav>${m}</div>`}
function render(){$.innerHTML=!DB.cur?auth():!S.user?onboard():shell();const f=document.querySelector('[data-f="trip"]');if(f)calc(f)}
function calc(f){const F={walk:0,bicycle:0,bus:.089,train:.041,car:.192,motorcycle:.103},d=+f.d.value||0,a=d*F[tm],b=d*F[f.a.value];f.querySelector("#c1").textContent=a.toFixed(2)+" kg";f.querySelector("#c2").textContent=b.toFixed(2)+" kg";f.querySelector("#c3").textContent="-"+Math.max(0,b-a).toFixed(2)+" kg CO₂e"}
function add(k,title,type,kg,km){const u=S.user,t=today();S.acts.push({k,title,type,kg,km,at:Date.now()});u.xp+=20;u.points+=20;u.ecoTokens+=2;u.level=Math.floor(u.xp/500);if(u.lastActiveDate!==t){const y=new Date(Date.now()-864e5).toDateString();u.currentStreak=u.lastActiveDate===y?u.currentStreak+1:1;u.lastActiveDate=t;u.longestStreak=Math.max(u.longestStreak,u.currentStreak)}speech="Quest tercatat! Habitatku terasa lebih sehat!";save()}
$.addEventListener("input",e=>{if(e.target.id==="nm"){ob.name=e.target.value;document.getElementById("nx").disabled=!ob.name.trim()}const f=e.target.closest('[data-f="trip"]');if(f)calc(f)});
$.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el){const h=e.target.closest(".habitat");if(h){const r=h.getBoundingClientRect();pp={x:Math.max(18,Math.min(82,(e.clientX-r.left)/r.width*100)),y:Math.max(44,Math.min(74,(e.clientY-r.top)/r.height*100))};const s=document.getElementById("ps");s.style.left=pp.x+"%";s.style.top=pp.y+"%"}return}
const a=el.dataset.a,v=el.dataset.v;if(a==="bd"&&e.target!==el)return;
if(a==="mode"){mode=v;err="";render()}else if(a==="next"){ob.step=2;render()}else if(a==="pick"){ob.pick=v;ob.pet=v;render()}
else if(a==="finish"){S.user={displayName:ob.name.trim(),selectedPet:ob.pet,level:0,xp:0,points:0,ecoTokens:0,currentStreak:0,longestStreak:0,createdAt:new Date().toISOString(),equippedAccessory:"none"};save();render()}
else if(a==="nav"){view=v;render()}else if(a==="logout"){DB.cur=null;S=blank();ob={step:1,name:"",pet:"turtle"};view="home";modal=null;speech="";save();render()}
else if(a==="quest"){const q=Q.find(x=>x[0]===v);if(dn().some(x=>x.k===v))return;if(q[3]==="transport"&&v==="transport"){modal="transport";render()}else{add(v,q[1],q[3],q[5]);render()}}
else if(a==="feed"){speech="Nyam! Terima kasih. Aku paling suka makanan lokal.";document.getElementById("sp").firstChild.textContent=speech}
else if(a==="play"){speech="Ayo bermain! Klik tempat lain supaya aku mengejarnya.";pp={x:70,y:67};render()}
else if(a==="chat"){modal="chat";render()}else if(a==="region"){modal=+v;render()}else if(a==="close"||a==="bd"){modal=null;render()}
else if(a==="tm"){tm=v;const f=document.querySelector('[data-f="trip"]');f.querySelectorAll(".mode-grid button").forEach(b=>b.classList.toggle("active",b.dataset.v===v));calc(f)}});
$.addEventListener("submit",async e=>{e.preventDefault();const f=e.target,k=f.dataset.f,g=n=>f.elements[n]&&f.elements[n].value;
if(k==="auth"){const em=g("e").trim().toLowerCase(),pw=await hash(g("p")),r=DB.accs[em];
if(mode==="signup"){if(r){err="Email ini sudah terdaftar. Pindah ke tab Masuk.";render();return}S=DB.accs[em]={email:em,pw,user:null,acts:[],msgs:[]};ob={step:1,name:"",pet:"turtle"}}
else{if(!r){err="Akun belum terdaftar di browser ini. Pindah ke tab Daftar dulu.";render();return}if(r.pw!==pw){err="Kata sandi salah.";render();return}S=r;view="home"}
DB.cur=em;err="";save();render()}
else if(k==="chat"||k==="chat2"){const t=g("m").trim();if(!t)return;S.msgs.push({s:"user",t});const r=reply(t);S.msgs.push({s:"pet",t:r});speech=r;save();if(k==="chat")modal="chat";render()}
else if(k==="trip"){const d=+g("d"),F={walk:0,bicycle:0,bus:.089,train:.041,car:.192,motorcycle:.103};add("transport","Perjalanan "+tm,"transport",Math.max(0,d*F[g("a")]-d*F[tm]),d);modal=null;render()}});
render();

/* =================================
   ROLE B - PET VISUAL INTERACTION
================================= */

// Simpan ekspresi normal pet
let originalPet = "";

// Fungsi mengubah ekspresi pet
function happyPet(message) {

  const petStage = document.getElementById("ps");
  const speechBubble = document.getElementById("sp");

  if (!petStage || !speechBubble) return;

  const petSVG = petStage.querySelector(".pixel-pet");

  if (!petSVG) return;

  // Simpan tampilan pet sebelum berubah
  if (!originalPet) {
    originalPet = petSVG.innerHTML;
  }

  // Ubah ekspresi mata dan mulut menjadi senang
  const eyes = petSVG.querySelectorAll("rect");

  eyes.forEach(eye => {
    if (eye.getAttribute("fill") === "#292c2b") {
      eye.setAttribute("fill", "#292c2b");
    }
  });

  // Tambahkan pipi merah muda
  if (!petSVG.querySelector(".happy-cheeks")) {
    const cheeks = document.createElementNS(
      "http://www.w3.org/2000/svg", "g"
    );

    cheeks.classList.add("happy-cheeks");

    cheeks.innerHTML = `
      <rect x="35" y="65" width="9" height="5" fill="#f28b82"/>
      <rect x="77" y="65" width="9" height="5" fill="#f28b82"/>
    `;

    petSVG.appendChild(cheeks);
  }

  // Tambahkan efek hati
  speechBubble.innerHTML =
    message + " 💚";

  // Efek pet sedikit membesar
  petStage.style.transform = "translate(-50%, -50%) scale(1.12)";
  petStage.style.transition = "transform 0.3s ease";

  // Kembalikan ukuran normal setelah 2 detik
  clearTimeout(window.petHappyTimer);

  window.petHappyTimer = setTimeout(() => {
    petStage.style.transform = "translate(-50%, -50%) scale(1)";
  }, 2000);
}


// Hubungkan dengan tombol makan dan bermain
document.addEventListener("click", function(e) {

  const button = e.target.closest("[data-a]");

  if (!button) return;

  if (button.dataset.a === "feed") {
    happyPet("Nyam! Aku senang sekali!");
  }

  if (button.dataset.a === "play") {
    happyPet("Horeee! Ayo bermain lagi!");
  }

});
