/* =========================================================
   Expedições de Miguel Pereira · protótipo (MVP)
   Segurança: nenhum dado do usuário é inserido como HTML (só textContent);
   fotos, câmera, microfone e localização ficam no aparelho.
   ========================================================= */
(function () {
  "use strict";
  /* Contra clickjacking: no GitHub Pages não dá para mandar o cabeçalho frame-ancestors. */
  if (window.top !== window.self) { document.documentElement.textContent = "Abra o jogo pelo endereço oficial: " + location.origin; try { window.top.location = location.href; } catch (_) {} return; }
  const C = window.CONFIG, $ = id => document.getElementById(id);
  const MISS = C.missions, SP = C.species, PETS = Object.keys(SP);
  const byId = id => MISS.find(m => m.id === id);
  const HOUR = 36e5;
  const CARE_THRESHOLDS = Object.assign({ hunger: 40, love: 30, sleep: 30, joy: 30 }, C.careThresholds || {});
  const CARE_LEVELS = [
    { key: "hunger", label: "Fome", phrase: "Tá com fome", icon: "🍓", color: "#c8322f" },
    { key: "love", label: "Carinho", phrase: "Quer carinho", icon: "💛", color: "#e66fa0" },
    { key: "sleep", label: "Sono", phrase: "Tá com sono", icon: "🌙", color: "#3b7fc4" },
    { key: "joy", label: "Alegria", phrase: "Quer brincar", icon: "🎈", color: "#8dc63f" }
  ];

  /* ---------- DOM seguro ---------- */
  const PROPS = new Set(["src", "alt", "href", "type", "value", "id", "role", "title", "name", "placeholder", "maxLength", "checked", "disabled", "target", "rel", "download", "htmlFor", "autocomplete", "inputMode", "colSpan", "width", "height"]);
  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k === "on") for (const ev in v) e.addEventListener(ev, v[ev]);
      else if (k === "style") Object.assign(e.style, v);
      else if (k.startsWith("aria-") || k.startsWith("data-")) e.setAttribute(k, v);
      else if (PROPS.has(k)) e[k] = v;
    }
    for (const c of kids.flat(3)) if (c != null && c !== false) e.append(c.nodeType ? c : String(c));
    return e;
  }
  /* Ícones: textos fixos do próprio código (nunca dados de usuário). */
  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="4"/><path d="M8.5 7l1.5-3h4l1.5 3"/></svg>',
    garden: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/><path d="M5 21h14"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/></svg>',
    paw: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="15" r="4"/><circle cx="6.5" cy="10" r="2"/><circle cx="10" cy="6.5" r="2"/><circle cx="14" cy="6.5" r="2"/><circle cx="17.5" cy="10" r="2"/></svg>',
    nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-8-8 18-2-8z"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 010 6"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>',
    cookie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/><circle cx="10" cy="15" r="1" fill="currentColor"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><rect x="6" y="14" width="12" height="7"/></svg>',
    tree: '<svg class="tree" viewBox="0 0 60 60"><path d="M30 4l-14 22h7l-11 16h9l-9 12h36l-9-12h9L37 26h7z" fill="#8dc63f"/><circle cx="30" cy="6" r="4" fill="#f2b632"/></svg>'
  };
  const put = (el, ...k) => el.replaceChildren(...k.flat(3).filter(x => x != null && x !== false));
  const tpl = document.createElement("template");
  function icon(n) { tpl.innerHTML = ICONS[n]; return tpl.content.firstChild.cloneNode(true); }

  /* ---------- utilidades ---------- */
  const dayKey = (d = new Date()) => d.toLocaleDateString("sv-SE");
  const pinNo = m => MISS.filter(x => !x.anywhere).indexOf(m) + 1;
  const accFor = m => (m.accNight && isNight() ? m.accNight : m.acc);
  const isNight = () => { const hr = new Date().getHours(); return hr >= C.nightFrom || hr < 5; };
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
  const petName = id => (SP[id] ? SP[id].name : id);
  const level = xp => 1 + Math.floor(xp / 150);
  const rnd = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  function ago(ms) { const m = Math.max(0, (Date.now() - ms) / 6e4 | 0); return m < 1 ? "agora" : m < 60 ? "há " + m + " min" : m < 1440 ? "há " + (m / 60 | 0) + " h" : "há " + (m / 1440 | 0) + " d"; }
  function colorOf(s) { let x = 0; for (const ch of String(s)) x = (x * 31 + ch.charCodeAt(0)) | 0; return ["#c0587e", "#2f6b3f", "#3b7fc4", "#c8322f", "#8a5a00", "#4b2a7b"][Math.abs(x) % 6]; }
  const fmtKm = km => (km || 0).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " km";
  const fmtMin = m => m < 60 ? m + " min" : (m / 60 | 0) + " h " + String(m % 60).padStart(2, "0");
  function weekId(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); }
  function hav(a, b) { const R = 6371e3, r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]); const q = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(q)); }
  /* Foto reduzida para o feed (JPEG pequeno). A original fica no aparelho. */
  async function thumbOf(blob, maxW, maxLen) {
    try {
      const img = await createImageBitmap(blob), s = Math.min(1, maxW / img.width), cv = h("canvas", { width: Math.round(img.width * s), height: Math.round(img.height * s) });
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      for (const q of [.72, .6, .5, .4]) { const d = cv.toDataURL("image/jpeg", q); if (d.length <= maxLen) return d; }
    } catch (_) {}
    return null;
  }
  let toastT; function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }
  function shareUrl() { const base = C.siteUrl || (location.origin + location.pathname); return base + "?c=" + encodeURIComponent(S.code); }

  /* ---------- estado (só no aparelho) ---------- */
  const newPet = () => ({ hunger: 80, love: 70, sleep: 90, joy: 80, t: Date.now(), seen: Date.now(), away: false, bond: 1 });
  function fresh() {
    const names = ["Saíra", "Sabiá", "Tiê", "Quati", "Jabuti", "Surucuá", "Tucano"];
    return { v: 1, nick: names[rnd() * names.length | 0] + " " + (1000 + (rnd() * 9000 | 0)), code: DB.randId(6), xp: 0, big: false, voice: true, onb: false,
      pets: { surucua: newPet() }, sel: "surucua", acc: [], eq: {}, food: { frutinhas: 1 }, boxes: 1, done: {}, ever: {}, photos: 0,
      streak: { last: "", n: 0 }, daily: { day: "", fed: 0, visit: 0, claps: 0, claimed: [] }, clapped: [], gold: false, enfeites: 0, ref: null,
      exp: null, club: null, clubs: [], week: { id: "", places: [] }, shield: "", talk: {}, myPlaces: [] };
  }
  let S = fresh();
  function loadState() {
    const s = DB.LS.get("state", null);
    if (s && typeof s === "object" && s.v === 1) {
      S = Object.assign(fresh(), s);
      S.nick = DB.cleanNick(S.nick) || fresh().nick;
      for (const k of Object.keys(S.pets)) if (!SP[k]) delete S.pets[k];
      if (!S.pets.surucua) S.pets = { surucua: S.pets.tucano || newPet() };
      S.sel = "surucua"; if (!Array.isArray(S.acc)) S.acc = []; if (!S.eq || typeof S.eq !== "object") S.eq = {};
      for (const [k, v] of Object.entries(S.eq)) if (!C.slots[k] || !S.acc.includes(v)) delete S.eq[k];
      S.clapped = Array.isArray(S.clapped) ? S.clapped.slice(-300) : [];
    }
  }
  const save = () => DB.LS.set("state", S);

  /* Pets como tamagotchi: as barras caem com o tempo; se esquecido por 48 h, o pet sai para passear. */
  function tickPets() {
    const now = Date.now(), night = isNight();
    for (const [id, p] of Object.entries(S.pets)) {
      const hrs = Math.min(72, (now - p.t) / HOUR);
      p.hunger = clamp(p.hunger - 6 * hrs); p.love = clamp(p.love - 3 * hrs); p.joy = clamp(p.joy - 4 * hrs);
      p.sleep = clamp(p.sleep + (night ? 10 : -2) * hrs); p.t = now;
      if (now - p.seen > 48 * HOUR) p.away = true;
      if (now - p.seen > 24 * HOUR) p.bond = Math.max(1, (p.bond || 1) - hrs / 48);
    }
  }
  function newDay() {
    const d = dayKey();
    if (S.daily.day === d) return;
    S.daily = { day: d, fed: 0, visit: 0, claps: 0, claimed: [] };
    const y = dayKey(new Date(Date.now() - 864e5));
    S.streak.n = S.streak.last === y ? S.streak.n + 1 : 1; S.streak.last = d;
    if (S.streak.n > 1) { S.boxes++; setTimeout(() => toast("Voltou! +1 Caixinha de Natal"), 800); }
  }
  function addXp(n) { const before = level(S.xp); S.xp += n; if (level(S.xp) > before) setTimeout(() => toast("Subiu para o nível " + level(S.xp) + "!"), 900); }

  /* ---------- voz do guia ---------- */
  function speak(text, pitch) {
    if (!S.voice || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "pt-BR"; u.rate = 1.05; u.pitch = pitch || 1.3;
      const v = speechSynthesis.getVoices().find(x => /pt(-|_)BR/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  /* ---------- miniaturas dos pets ---------- */
  let T = {};
  function makeThumbs() {
    try { T = Object.assign({}, Pets.thumbs(PETS, { eq: S.eq })); } catch (_) { T = {}; }
    for (const p of PETS) if (!T[p]) T[p] = "assets/surucua.png";
    const logo = document.querySelector(".hdr .logo img"); if (logo) logo.src = T.surucua;
  }

  /* ---------- navegação ---------- */
  let cur = "feed";
  const TABS = [["feed", "Início", "home"], ["map", "Mapa", "map"], ["cam", "", "cam"], ["garden", "Jardim", "garden"], ["profile", "Perfil", "user"]];
  function renderTabs() {
    put($("tabbar"), ...TABS.map(([k, l, ic]) => k === "cam"
      ? h("button", { "aria-label": "Câmera: fazer uma missão", on: { click: pickMission } }, h("span", { class: "cam" }, icon("cam")))
      : h("button", { "aria-current": String(k === cur), class: k === "garden" && Object.keys(S.pets).some(needs) ? "hasdot" : "", on: { click: () => show(k) } }, icon(ic), l)));
  }
  function renderBox() {
    put($("boxbtn"), icon("gift"), S.boxes > 0 ? h("span", { class: "badge", text: String(S.boxes) }) : null);
  }
  function show(k) {
    if (cur === "garden" && k !== "garden") stopGarden();
    cur = k;
    for (const v of document.querySelectorAll(".view")) v.classList.toggle("on", v.id === "v-" + k);
    renderTabs(); renderBox();
    ({ feed: renderFeed, map: renderMap, garden: renderGarden, profile: renderProfile, partner: renderPartner })[k]();
    $("main").scrollTop = 0;
  }

  /* ---------- sheet (folha de baixo) ---------- */
  function openSheet(...kids) { put($("sheetbody"), h("div", { class: "grab" }), ...kids); $("sheet").classList.add("on"); }
  function closeSheet() { $("sheet").classList.remove("on"); }
  $("sheet").addEventListener("click", e => { if (e.target.id === "sheet") closeSheet(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); if ($("v-cam").classList.contains("on")) closeCam(); } });

  /* =========================================================
     INÍCIO: stories, árvore da cidade, passe, feed com fim
     ========================================================= */
  let feedTab = "feed", lastPosts = [];
  async function renderFeed() {
    const v = $("v-feed");
    const list = h("div", { class: "wrap" }, h("p", { class: "demo", text: "Carregando expedições…" }));
    const meter = h("span", { style: { width: "0%" } }), count = h("div", { style: { fontSize: ".82rem", opacity: ".9" } });
    const d = S.daily, doneTasks = C.daily.filter(t => d[t.id] >= t.goal).length;
    const seg = (k, l) => h("button", { class: "btn" + (feedTab === k ? "" : " alt"), style: { minHeight: "2.4rem" }, on: { click: () => { feedTab = k; renderFeed(); } } }, l);
    put(v,
      h("div", { class: "stories" }, MISS.map(m => h("button", { class: "story", on: { click: () => openCam(m) } },
        h("span", { class: "ring" + (S.done[m.id] === dayKey() ? " done" : "") }, h("span", { style: { backgroundImage: "url(" + T[m.pet] + ")" } })),
        m.partner.replace("Prefeitura de Miguel Pereira", "Prefeitura").replace(" Bom de Minas", "").replace(" Espetaria", "")))),
      h("div", { class: "hero" }, icon("tree"), h("div", { style: { flex: "1" } }, h("b", { text: "Árvore da cidade" }), count, h("div", { class: "meter" }, meter))),
      h("div", { class: "row", style: { padding: "0 .9rem .7rem" } }, seg("feed", "Feed"), seg("clubes", "Clubes")),
      feedTab === "feed" ? h("div", { class: "wrap" },
        C.flash ? h("div", { class: "flash" }, h("i"), h("span", { text: C.flash.text })) : null,
        h("button", { class: "card passcard", on: { click: openPass } },
          h("b", { text: "Passe de Natal · missões de hoje" }),
          h("small", { text: doneTasks + " de " + C.daily.length + " feitas · nível " + level(S.xp) }),
          h("div", { class: "meter lightmeter" }, h("span", { style: { width: (doneTasks / C.daily.length * 100) + "%" } })))) : null,
      list);
    DB.cityCount().then(n => { count.textContent = n.toLocaleString("pt-BR") + " de " + C.cityGoal.toLocaleString("pt-BR") + " fotos para acender"; meter.style.width = Math.min(100, n / C.cityGoal * 100) + "%"; });
    try { lastPosts = await DB.listPosts(100); } catch (_) { lastPosts = []; }
    const hidden = DB.LS.get("hidden", []);
    let posts = lastPosts.filter(p => !hidden.includes(p.id));
    if (DB.mode === "demo" && posts.length < 3) posts = posts.concat(examplePosts());
    if (feedTab === "clubes") return put(list, clubsView(posts));
    put(list, posts.slice(0, 30).map(postCard),
      h("div", { class: "endfeed" }, h("b", { text: "Você viu tudo de hoje" }), h("button", { class: "btn alt", on: { click: () => show("garden") } }, "Bora cuidar do jardim")));
  }
  function examplePosts() {
    const n = Date.now(), c = [-22.4565, -43.4685], route = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; route.push(+(c[0] + .004 * Math.sin(t * 3.2) - .002 * t).toFixed(4), +(c[1] + .009 * t + .0015 * Math.sin(t * 9)).toFixed(4)); }
    return [{ id: "ex1", kind: "mission", nick: "Lia", missionId: "cheirin", pet: "surucua", pets: ["surucua"], xp: 80, places: 3, km: 1.8, claps: 42, createdAt: n - 2 * HOUR, photo: "assets/chocolatissimo.jpg", example: true },
            { id: "ex2", kind: "expedition", nick: "Seu Jorge", title: "Rota das luzes de Natal", missions: ["pinheiros", "agape", "cheirin"], pet: "surucua", pets: ["surucua"], xp: 230, km: 2.1, mins: 48, places: 3, claps: 28, createdAt: n - 5 * HOUR, route, example: true },
            { id: "ex3", kind: "mission", nick: "Bia", missionId: "pinheiros", pet: "surucua", pets: ["surucua"], xp: 100, places: 1, claps: 57, createdAt: n - 26 * HOUR, club: "ESCOLA", clubName: "Escola Municipal", example: true }];
  }
  function postCard(p) {
    const m = p.missionId ? byId(p.missionId) : null;
    if ((p.kind === "mission" && !m) || !SP[p.pet]) return null;
    let on = S.clapped.includes(p.id), n = (p.claps | 0) + (p.example && on ? 1 : 0);
    const cnt = h("span", { text: n + " aplausos" });
    const btn = h("button", { class: "pillbtn" + (on ? " on" : ""), "aria-pressed": String(on) }, icon("paw"), cnt);
    btn.addEventListener("click", async () => {
      on = !on; btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", String(on));
      n = Math.max(0, n + (on ? 1 : -1)); cnt.textContent = n + " aplausos";
      if (on) { S.clapped.push(p.id); if (S.daily.claps < 99) S.daily.claps++; } else S.clapped = S.clapped.filter(x => x !== p.id);
      save();
      if (!p.example) DB.clap(p.id, on).catch(() => toast("Não deu para aplaudir agora"));
    });
    const title = p.kind === "mission" ? m.name + " com o " + petName(p.pet) : (p.title || "Expedição") + (p.kind === "place" ? " com o " + petName(p.pet) : "");
    const where = p.kind === "mission" ? m.partner : p.kind === "place" ? "Lugar marcado" : C.city;
    const pets = p.pets && p.pets.length ? p.pets : [p.pet];
    const stats = [[String(p.xp), "XP"], [String(p.places || 1), (p.places || 1) === 1 ? "lugar" : "lugares"], [String(pets.length), pets.length === 1 ? "pet" : "pets"]];
    if (p.km > 0) stats.push([fmtKm(p.km), "no centro"]);
    if (p.mins > 0) stats.push([fmtMin(p.mins), "tempo"]);
    const media = p.photo ? h("img", { class: "shot", src: p.photo, alt: "Foto da expedição", loading: "lazy" })
      : p.route && p.route.length >= 4 ? routeCanvas(p.route) : h("div", { class: "postrow" }, h("img", { src: T[p.pet], alt: petName(p.pet) }));
    return h("div", { class: "card" },
      h("div", { class: "who" }, h("span", { class: "av", style: { background: colorOf(p.nick) }, text: (p.nick || "?").slice(0, 1).toUpperCase() }),
        h("div", { style: { flex: "1" } }, h("b", { text: p.nick + (p.example ? " (exemplo)" : "") }), h("small", { text: where + " · " + ago(p.createdAt) + (p.clubName ? " · " + p.clubName : "") })),
        h("button", { class: "morebtn", "aria-label": "Mais opções", on: { click: () => postMenu(p) } }, "⋯")),
      h("button", { class: "ptitle linkish", on: { click: () => postDetail(p) } }, title),
      h("div", { class: "stats" }, stats.map(([b, l]) => h("div", null, h("b", { text: b }), h("span", { text: l })))),
      media,
      p.photo && p.route && p.route.length >= 4 ? routeCanvas(p.route) : null,
      h("div", { class: "acts" }, btn, h("button", { class: "pillbtn", on: { click: () => { show("map"); if (m) selectPlace(m); } } }, icon("nav"), "Fazer esta rota")));
  }
  /* Detalhe estilo Strava: rota, tempo, lugares e pets. */
  function postDetail(p) {
    const pets = p.pets && p.pets.length ? p.pets : [p.pet];
    const names = (p.missions || (p.missionId ? [p.missionId] : [])).map(byId).filter(Boolean).map(m => m.partner);
    openSheet(h("div", { class: "who" }, h("span", { class: "av", style: { background: colorOf(p.nick) }, text: (p.nick || "?").slice(0, 1).toUpperCase() }),
        h("div", null, h("b", { text: p.nick }), h("small", { text: new Date(p.createdAt).toLocaleString("pt-BR", { weekday: "long", hour: "2-digit", minute: "2-digit" }) + " · " + C.city }))),
      h("h2", { text: p.title || (byId(p.missionId) ? byId(p.missionId).name : "Expedição") }),
      h("div", { class: "stats" }, [[p.km > 0 ? fmtKm(p.km) : "—", "distância"], [p.mins > 0 ? fmtMin(p.mins) : "—", "tempo"], [String(p.places || 1), "lugares"], [String(p.xp), "XP"]].map(([b, l]) => h("div", null, h("b", { text: b }), h("span", { text: l })))),
      p.route && p.route.length >= 4 ? routeCanvas(p.route) : null,
      p.photo ? h("img", { class: "shot", src: p.photo, alt: "", style: { marginTop: ".6rem" } }) : null,
      h("div", { class: "petrow" }, pets.map(x => h("img", { src: T[x], alt: petName(x), title: petName(x) })), h("small", { text: pets.length + (pets.length === 1 ? " pet" : " pets") })),
      names.length ? h("p", { class: "demo", style: { textAlign: "left" }, text: "Lugares: " + names.join(", ") }) : null,
      p.route ? h("p", { class: "demo", style: { textAlign: "left" }, text: "O trajeto aparece sem o começo e o fim, para proteger quem postou." }) : null,
      p.uid && p.uid === DB.uid && (p.km > 0 || p.route) ? h("button", { class: "btn red", style: { marginTop: ".6rem" }, on: { click: () => shareExp(p) } }, icon("share"), "Compartilhar expedição") : null);
  }
  function postMenu(p) {
    const mine = p.uid && p.uid === DB.uid;
    if (mine) return openSheet(h("h2", { text: "Seu post" }), h("button", { class: "btn red", on: { click: async () => {
      try { await DB.deletePost(p.id); closeSheet(); toast("Post apagado"); renderFeed(); } catch (_) { toast("Não deu para apagar agora"); } } } }, "Apagar post"));
    const why = [["pessoa", "Mostra alguém sem permissão"], ["ofensivo", "Ofensivo ou impróprio"], ["perigo", "Coloca alguém em risco"], ["outro", "Outro motivo"]];
    openSheet(h("h2", { text: "Denunciar post" }), h("p", { class: "demo", style: { textAlign: "left" }, text: "O post some para você agora, e a equipe analisa." }),
      why.map(([k, l]) => h("button", { class: "opt", on: { click: async () => { try { await DB.report(p.id, k); } catch (_) {} closeSheet(); toast("Obrigado. Vamos analisar."); renderFeed(); } } }, l)));
  }
  /* Desenha o trajeto (sem mapa de fundo, só a forma da rota). */
  function routeCanvas(route) {
    const W = 640, H = 400, cv = h("canvas", { width: W, height: H, class: "routecv", "aria-label": "Trajeto da expedição", role: "img" }), c = cv.getContext("2d");
    const pts = []; for (let i = 0; i + 1 < route.length; i += 2) pts.push([route[i], route[i + 1]]);
    c.fillStyle = "#eef1e6"; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(78,130,70,.22)"; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc((i * 137) % W, (i * 89) % H, 18 + (i % 4) * 7, 0, 7); c.fill(); }
    if (pts.length < 2) return cv;
    const k = Math.cos(pts[0][0] * Math.PI / 180), xs = pts.map(q => q[1] * k), ys = pts.map(q => q[0]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), sc = Math.min((W - 80) / Math.max(1e-6, x1 - x0), (H - 80) / Math.max(1e-6, y1 - y0));
    const P = q => [W / 2 + (q[1] * k - (x0 + x1) / 2) * sc, H / 2 - (q[0] - (y0 + y1) / 2) * sc];
    c.strokeStyle = "#f39a2b"; c.lineWidth = 9; c.lineJoin = c.lineCap = "round"; c.beginPath();
    pts.forEach((q, i) => { const [x, y] = P(q); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
    [[pts[0], "#2f6b3f"], [pts[pts.length - 1], "#c8322f"]].forEach(([q, col]) => { const [x, y] = P(q); c.fillStyle = col; c.beginPath(); c.arc(x, y, 13, 0, 7); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 4; c.stroke(); });
    return cv;
  }

  /* =========================================================
     COMPARTILHAR A EXPEDIÇÃO (estilo Strava)
     Imagens geradas no próprio aparelho. O trajeto já vem sem o começo e o fim.
     Formatos: Resumo (mapa + foto), Foto com dados, Adesivo transparente (PNG), Só o mapa.
     ========================================================= */
  const pace = (km, mins) => { if (!(km >= .2) || !(mins > 0)) return "—"; const s = Math.round(mins * 60 / km); return (s / 60 | 0) + ":" + String(s % 60).padStart(2, "0") + " /km"; };
  const routePts = r => { const a = []; if (r) for (let i = 0; i + 1 < r.length; i += 2) a.push([r[i], r[i + 1]]); return a; };
  const merc = (lat, lng, z) => { const n = 512 * 2 ** z, s = Math.sin(lat * Math.PI / 180); return [(lng + 180) / 360 * n, (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n]; };
  const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const tileCache = new Map(); let shareNoTiles = false;
  function tile(z, x, y) {
    const n = 2 ** z; x = ((x % n) + n) % n;
    const k = z + "/" + x + "/" + y;
    if (!tileCache.has(k)) tileCache.set(k, Promise.race([loadImg(C.map.tiles.replace("{z}", z).replace("{x}", x).replace("{y}", y).replace("{s}", "a")),
      new Promise((_, no) => setTimeout(() => no(new Error("timeout")), 5000))]).catch(e => { tileCache.delete(k); throw e; }));
    return tileCache.get(k);
  }
  /* Desenha o mapa (OpenStreetMap; se não carregar, um fundo ilustrado) e o trajeto dentro da caixa. */
  async function drawRouteMap(c, pts, bx, by, bw, bh, opt) {
    opt = opt || {};
    c.save(); c.beginPath(); c.rect(bx, by, bw, bh); c.clip();
    let P = null;
    const center = pts.length ? null : C.map.center;
    let z = 17;
    if (pts.length) for (; z > 11; z--) { const ps = pts.map(q => merc(q[0], q[1], z)), xs = ps.map(q => q[0]), ys = ps.map(q => q[1]);
      if (Math.max(...xs) - Math.min(...xs) <= bw * .78 && Math.max(...ys) - Math.min(...ys) <= bh * .72) break; }
    else z = 15;
    const ps = pts.length ? pts.map(q => merc(q[0], q[1], z)) : [merc(center[0], center[1], z)];
    const xs = ps.map(q => q[0]), ys = ps.map(q => q[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const ox = cx - bw / 2, oy = cy - bh / 2;
    P = q => { const m = merc(q[0], q[1], z); return [bx + m[0] - ox, by + m[1] - oy]; };
    let tiles = !opt.noMap && location.protocol !== "file:" && tilesOk !== false && !shareNoTiles;
    if (tiles) {
      try {
        const jobs = [];
        for (let tx = Math.floor(ox / 512); tx * 512 < ox + bw; tx++) for (let ty = Math.floor(oy / 512); ty * 512 < oy + bh; ty++)
          jobs.push(tile(z + 1, tx, ty).then(img => [img, tx, ty]));
        const got = await Promise.all(jobs);
        got.forEach(([img, tx, ty]) => c.drawImage(img, bx + tx * 512 - ox, by + ty * 512 - oy, 512, 512));
        c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(bx, by, bw, bh);
      } catch (_) { tiles = false; shareNoTiles = true; }
    }
    if (!tiles && !opt.noMap) {
      c.fillStyle = "#eef1e6"; c.fillRect(bx, by, bw, bh);
      c.fillStyle = "rgba(78,130,70,.2)"; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(bx + (i * 137) % bw, by + (i * 89) % bh, 26 + (i % 4) * 10, 0, 7); c.fill(); }
    }
    if (pts.length >= 2) {
      c.lineJoin = c.lineCap = "round";
      if (opt.halo !== false) { c.strokeStyle = opt.halo || "rgba(255,255,255,.9)"; c.lineWidth = (opt.w || 12) + 8; line(c, pts, P); }
      c.strokeStyle = opt.color || "#f2611d"; c.lineWidth = opt.w || 12; line(c, pts, P);
    }
    c.restore();
    if (!opt.noMap) {
      c.font = "500 20px system-ui"; c.fillStyle = "rgba(0,0,0,.55)";
      const a = tiles ? "© OpenStreetMap" : "Mapa ilustrativo"; c.fillText(a, bx + bw - c.measureText(a).width - 14, by + bh - 14);
      if (pts.length >= 2) { c.font = "600 24px system-ui"; const t = "Início e final ocultos", tw = c.measureText(t).width;
        c.fillStyle = "rgba(255,255,255,.95)"; roundRect(c, bx + 20, by + 20, tw + 32, 48, 10); c.fill(); c.fillStyle = "#222"; c.fillText(t, bx + 36, by + 52); }
    }
    return tiles;
  }
  function line(c, pts, P) { c.beginPath(); pts.forEach((q, i) => { const [x, y] = P(q); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); }
  /* Só a forma do trajeto, para usar por cima da foto ou no adesivo. */
  function drawShape(c, pts, bx, by, bw, bh, color, w) {
    if (pts.length < 2) return;
    const k = Math.cos(pts[0][0] * Math.PI / 180), xs = pts.map(q => q[1] * k), ys = pts.map(q => q[0]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), sc = Math.min(bw / Math.max(1e-6, x1 - x0), bh / Math.max(1e-6, y1 - y0));
    const P = q => [bx + bw / 2 + (q[1] * k - (x0 + x1) / 2) * sc, by + bh / 2 - (q[0] - (y0 + y1) / 2) * sc];
    c.lineJoin = c.lineCap = "round"; c.strokeStyle = color; c.lineWidth = w; line(c, pts, P);
  }
  function coverBox(c, img, x, y, w, hh) {
    const iw = img.width || img.videoWidth, ih = img.height || img.videoHeight, s = Math.max(w / iw, hh / ih);
    c.save(); c.beginPath(); c.rect(x, y, w, hh); c.clip(); c.drawImage(img, x + (w - iw * s) / 2, y + (hh - ih * s) / 2, iw * s, ih * s); c.restore();
  }
  function statsRow(c, items, x, y, w, col, sub, big) {
    const cw = w / items.length;
    items.forEach(([v, l], i) => {
      const xx = x + i * cw;
      if (i) { c.fillStyle = sub; c.globalAlpha = .35; c.fillRect(xx - 18, y - big * .9 - 4, 2, big * 1.55); c.globalAlpha = 1; }
      c.fillStyle = sub; c.font = "500 " + Math.round(big * .42) + "px system-ui"; c.fillText(l, xx, y - big * .95 + 4);
      c.fillStyle = col; fit(c, v, xx, y + big * .35, cw - 34, big, 600);
    });
  }
  function brand(c, x, y, col, size) {
    const s = size || 40;
    if (T.surucua) try { c.drawImage(brandImg, x, y - s * .85, s * 1.1, s * 1.1); } catch (_) {}
    c.fillStyle = col; c.font = "700 " + Math.round(s * .6) + "px system-ui"; c.fillText("Expedições de " + C.city, x + s * 1.25, y);
  }
  let brandImg = null;
  async function renderShare(p, fmt, size, photo) {
    if (!brandImg && T.surucua) try { brandImg = await loadImg(T.surucua); } catch (_) {}
    const W = 1080, H = size === "story" ? 1920 : 1080, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d"), pts = routePts(p.route);
    const title = p.title || "Expedição", when = new Date(p.createdAt || Date.now()).toLocaleString("pt-BR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " às");
    const km2 = p.km > 0 ? p.km.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " km" : "—";
    const stats = [[km2, "Distância"], [p.mins > 0 ? fmtMin(p.mins) : "—", "Tempo"], [pace(p.km, p.mins), "Ritmo"], [String(p.places || 0), "Lugares"]];
    if (fmt === "adesivo") {
      /* fundo transparente: a pessoa cola por cima da própria foto no Instagram */
      const hasR = pts.length >= 2, big = size === "story" ? 120 : 92, row = big * 1.75, rh = hasR ? (size === "story" ? 360 : 230) : 0;
      const total = row * 3 + (hasR ? rh + 50 : 0) + 90; let y = (H - total) / 2 + big * .45;
      c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 12; c.textAlign = "center"; c.fillStyle = "#fff";
      [[stats[0][1], stats[0][0]], [stats[2][1], stats[2][0]], [stats[1][1], stats[1][0]]].forEach(([l, v]) => {
        c.font = "600 " + Math.round(big * .4) + "px system-ui"; c.fillText(l, W / 2, y);
        c.font = "800 " + big + "px system-ui"; c.fillText(v, W / 2, y + big * 1.02); y += row;
      });
      c.textAlign = "left";
      if (hasR) { drawShape(c, pts, W / 2 - rh * .8, y - big * .3, rh * 1.6, rh, "#f2611d", 14); y += rh + 50; }
      c.font = "700 " + Math.round(44 * .6) + "px system-ui"; const bw = c.measureText("Expedições de " + C.city).width + 44 * 1.25;
      brand(c, W / 2 - bw / 2, y, "#fff", 44);
      c.shadowBlur = 0; return cv;
    }
    if (fmt === "foto") {
      if (photo) coverBox(c, photo, 0, 0, W, H); else { c.fillStyle = "#1f4a2e"; c.fillRect(0, 0, W, H); }
      const g = c.createLinearGradient(0, H * .45, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.78)"); c.fillStyle = g; c.fillRect(0, H * .45, W, H * .55);
      const g2 = c.createLinearGradient(0, 0, 0, 260); g2.addColorStop(0, "rgba(0,0,0,.45)"); g2.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g2; c.fillRect(0, 0, W, 260);
      brand(c, 56, 96, "#fff", 52);
      if (pts.length >= 2) { c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 10; drawShape(c, pts, W - 360, 150, 300, 260, "#fff", 10); c.shadowBlur = 0; }
      c.fillStyle = "#fff"; fit(c, title, 60, H - 300, W - 120, 64, 800);
      c.globalAlpha = .85; c.font = "500 32px system-ui"; c.fillText(when + " · " + C.city, 60, H - 248); c.globalAlpha = 1;
      statsRow(c, stats, 60, H - 100, W - 120, "#fff", "rgba(255,255,255,.85)", 66);
      return cv;
    }
    /* "resumo" e "mapa": cartão claro com cabeçalho e dados, como no feed */
    c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
    const nick = p.nick || S.nick, av = 92;
    c.fillStyle = colorOf(nick); c.beginPath(); c.arc(60 + av / 2, 60 + av / 2, av / 2, 0, 7); c.fill();
    c.fillStyle = "#fff"; c.font = "700 46px system-ui"; c.textAlign = "center"; c.fillText(nick.slice(0, 1).toUpperCase(), 60 + av / 2, 60 + av / 2 + 16); c.textAlign = "left";
    c.fillStyle = "#222"; c.font = "600 36px system-ui"; c.fillText(nick, 176, 96);
    c.fillStyle = "#666"; fit(c, when + " · " + C.city, 176, 140, W - 236, 28, 400);
    c.fillStyle = "#222"; fit(c, title, 60, 240, W - 120, 56, 600);
    statsRow(c, stats, 60, 352, W - 120, "#222", "#666", 56);
    const top = 410, bot = H - 110, gap = 14;
    const showPhoto = fmt === "resumo" && photo;
    if (!showPhoto) await drawRouteMap(c, pts, 40, top, W - 80, bot - top);
    else if (size === "story") { const mh = (bot - top - gap) * .5; await drawRouteMap(c, pts, 40, top, W - 80, mh); coverBox(c, photo, 40, top + mh + gap, W - 80, bot - top - mh - gap); }
    else { const mw = (W - 80 - gap) / 2; await drawRouteMap(c, pts, 40, top, mw, bot - top); coverBox(c, photo, 40 + mw + gap, top, mw, bot - top); }
    brand(c, 60, H - 40, "#1f4a2e", 50);
    c.fillStyle = "#888"; c.font = "500 26px system-ui"; const code = "Jogue comigo: " + S.code; c.fillText(code, W - 60 - c.measureText(code).width, H - 46);
    return cv;
  }
  async function shareExp(p) {
    let fmt = "resumo", size = "square", photo = null, cv = null, busy = false;
    if (p.photo) try { photo = await loadImg(p.photo); } catch (_) {}
    const prev = h("img", { class: "sharepv", alt: "Prévia da imagem para compartilhar" });
    const FMTS = [["resumo", "Resumo"], ["foto", "Foto com dados"], ["adesivo", "Adesivo"], ["mapa", "Só o mapa"]];
    const fchips = h("div", { class: "chips" }), schips = h("div", { class: "chips" });
    const file = h("input", { type: "file", accept: "image/*", style: { display: "none" } });
    const hint = h("p", { class: "demo", style: { textAlign: "left" } });
    async function draw() {
      put(fchips, FMTS.map(([k, l]) => h("button", { class: "chip" + (fmt === k ? " on" : ""), on: { click: () => { fmt = k; draw(); } } }, l)));
      put(schips, [["square", "Post 1:1"], ["story", "Story 9:16"]].map(([k, l]) => h("button", { class: "chip" + (size === k ? " on" : ""), on: { click: () => { size = k; draw(); } } }, l)));
      hint.textContent = fmt === "adesivo" ? "Fundo transparente: no Instagram, cole por cima de qualquer foto sua (Stories › adesivo da galeria)."
        : fmt === "foto" && !photo ? "Escolha uma foto para pôr os dados por cima." : "O trajeto aparece sem o começo e o fim, para proteger onde você mora.";
      prev.classList.toggle("transp", fmt === "adesivo");
      const my = {}; busy = my; cv = await renderShare(p, fmt, size, photo); if (busy !== my) return;
      prev.src = cv.toDataURL(fmt === "adesivo" ? "image/png" : "image/jpeg", .85);
    }
    file.addEventListener("change", async () => { const f = file.files[0]; if (!f || !/^image\//.test(f.type) || f.size > 25e6) return;
      try { photo = await createImageBitmap(f); if (fmt === "mapa" || fmt === "adesivo") fmt = "foto"; draw(); } catch (_) { toast("Não deu para abrir essa foto"); } });
    async function out(mode) {
      if (!cv) return;
      const png = fmt === "adesivo", blob = await new Promise(ok => cv.toBlob(ok, png ? "image/png" : "image/jpeg", .92));
      const f = new File([blob], "expedicao-" + fmt + (png ? ".png" : ".jpg"), { type: blob.type });
      if (mode === "share" && navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], text: (p.title || "Expedição") + " em " + C.city + " · " + shareUrl() }); } catch (_) {} }
      else { download(blob, f.name); toast(png ? "Adesivo salvo na galeria" : "Imagem salva"); }
    }
    openSheet(h("h2", { text: "Compartilhar expedição" }), prev, h("div", { class: "sec" }, "Formato"), fchips, schips, hint,
      h("button", { class: "btn alt", on: { click: () => file.click() } }, photo ? "Trocar a foto" : "Escolher foto da galeria"), file,
      h("div", { class: "row", style: { marginTop: ".5rem" } },
        h("button", { class: "btn red", on: { click: () => out("share") } }, icon("share"), "Compartilhar"),
        h("button", { class: "btn alt", on: { click: () => out("save") } }, "Baixar")));
    draw();
  }

  /* Clubes, desafio da semana e guardiões (sem chat: só aplausos). */
  function clubsView(posts) {
    const wk = Date.parse(weekId() + "T00:00:00"), month = Date.now() - 30 * 864e5;
    const visited = p => p.missions && p.missions.length ? p.missions : p.missionId ? [p.missionId] : [];
    const rank = {};
    posts.filter(p => p.createdAt >= wk).forEach(p => { const s = rank[p.nick] || (rank[p.nick] = new Set()); visited(p).forEach(x => s.add(x)); });
    rank[S.nick + " (você)"] = new Set(S.week.id === weekId() ? S.week.places : []);
    const top = Object.entries(rank).map(([n, s]) => [n, s.size]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const guard = MISS.map(m => { const c = {}; posts.filter(p => p.createdAt >= month && visited(p).includes(m.id)).forEach(p => c[p.nick] = (c[p.nick] || 0) + 1);
      const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return best ? [m, best[0], best[1]] : null; }).filter(Boolean);
    const clubStat = code => { const ps = posts.filter(p => p.club === code); return [new Set(ps.map(p => p.nick)).size, ps.length]; };
    const known = {}; posts.forEach(p => { if (p.club && p.clubName) known[p.club] = p.clubName; });
    return [
      h("div", { class: "card challenge" }, h("b", { style: { fontSize: "1.05rem" }, text: "Desafio da semana" }),
        h("div", { style: { fontSize: ".82rem", opacity: ".9", marginBottom: ".5rem" }, text: "Visitar os " + MISS.length + " lugares de Natal" }),
        top.map(([n, v], i) => h("div", { class: "rankrow" }, h("span", { text: (i + 1) + ". " + n }), h("b", { text: v + "/" + MISS.length })))),
      h("div", { class: "sec" }, "Guardiões do mês", h("small", { text: "quem mais volta" })),
      guard.length ? guard.map(([m, n, c]) => h("div", { class: "card who", style: { padding: ".6rem .8rem", marginBottom: ".5rem" } },
        h("img", { src: "assets/medal-trophy.png", alt: "", style: { width: "2.4rem" } }), h("span", { class: "av", style: { background: colorOf(n) }, text: n.slice(0, 1).toUpperCase() }),
        h("div", { style: { flex: "1" } }, h("b", { text: "Guardião: " + m.partner.replace("Prefeitura de Miguel Pereira", "Pinheiros") }), h("small", { text: n + " · " + c + (c === 1 ? " visita" : " visitas") }))))
        : h("p", { class: "demo", text: "Ainda sem guardiões este mês. Quem voltar mais vira guardião do lugar." }),
      h("div", { class: "sec" }, "Clubes", h("small", { text: "entrem juntos" })),
      S.clubs.map(cl => { const [mem, ph] = clubStat(cl.code); return h("div", { class: "card who", style: { padding: ".6rem .8rem", marginBottom: ".5rem" } },
        h("span", { class: "av", style: { background: colorOf(cl.code) }, text: cl.name.slice(0, 1).toUpperCase() }),
        h("div", { style: { flex: "1" } }, h("b", { text: cl.name }), h("small", { text: Math.max(1, mem) + " membros · " + ph + " fotos · código " + cl.code })),
        h("button", { class: "pillbtn" + (S.club === cl.code ? " on" : ""), style: { flex: "none", padding: "0 .8rem" }, on: { click: () => { S.club = S.club === cl.code ? null : cl.code; save(); renderFeed(); } } }, S.club === cl.code ? "Ativo" : "Usar")); }),
      h("div", { class: "row" }, h("button", { class: "btn alt", on: { click: () => clubForm("criar") } }, "Criar clube"), h("button", { class: "btn alt", on: { click: () => clubForm("entrar", known) } }, "Entrar com código")),
      h("p", { class: "demo", text: "Clubes não têm chat: só aplausos e figurinhas. Suas expedições contam para o clube ativo." })];
  }
  function clubForm(mode, known) {
    const inp = h("input", { type: "text", maxLength: mode === "criar" ? 24 : 6, placeholder: mode === "criar" ? "Nome do clube (ex.: Família Sousa)" : "Código de 6 letras", autocomplete: "off" });
    openSheet(h("h2", { text: mode === "criar" ? "Criar clube" : "Entrar em um clube" }), inp,
      h("button", { class: "btn", style: { marginTop: ".6rem" }, on: { click: () => {
        if (mode === "criar") { const name = DB.cleanName(inp.value, 24); if (name.length < 2) return toast("Escolha um nome"); const code = DB.randId(6); S.clubs.push({ code, name }); S.club = code; save(); closeSheet(); toast("Clube criado! Código " + code); renderFeed(); return; }
        const code = inp.value.trim().toUpperCase(); if (!/^[A-Z2-9]{6}$/.test(code)) return toast("Código inválido");
        if (!S.clubs.some(c => c.code === code)) S.clubs.push({ code, name: (known && known[code]) || "Clube " + code });
        S.club = code; save(); closeSheet(); renderFeed(); } } }, mode === "criar" ? "Criar" : "Entrar"));
  }
  /* =========================================================
     MAPA (vovó sabe): pinos grandes, lista e "Como chegar"
     ========================================================= */
  let mapMode = "mapa", sel = MISS[0];
  function selectPlace(m) { sel = m; if (cur === "map") renderMap(); }
  function renderMap() {
    const v = $("v-map"), today = dayKey();
    const lightsAll = MISS.filter(m => m.lights), lightsDone = lightsAll.filter(m => S.done[m.id] === today).length;
    const seg = (k, l) => h("button", { class: "btn" + (mapMode === k ? "" : " alt"), style: { minHeight: "2.4rem" }, on: { click: () => { mapMode = k; renderMap(); } } }, l);
    const top = h("div", { class: "row", style: { padding: ".7rem .9rem" } }, seg("mapa", "Mapa"), seg("lista", "Lista"),
      h("button", { class: "btn alt", style: { minHeight: "2.4rem", flex: "none", width: "3.2rem" }, "aria-label": "Letra grande", on: { click: toggleBig } }, "A+"));
    const route = h("div", { class: "card routecard" },
      h("b", { text: "Rota do pisca-pisca" }),
      h("div", { class: "dots" }, lightsAll.map(m => h("i", { class: S.done[m.id] === today ? "on" : "", title: m.name }))),
      h("small", { text: lightsDone + " de " + lightsAll.length + " luzes hoje" + (isNight() ? " · agora vale XP em dobro" : " · depois das " + C.nightFrom + "h vale o dobro") }));
    const placesBox = h("div", null, h("p", { class: "demo", text: "Carregando lugares…" }));
    const lower = h("div", { class: "wrap" }, expCard(), route,
      h("div", { class: "sec" }, "Lugares marcados", h("small", { text: "pela galera" })),
      h("button", { class: "btn alt", style: { marginBottom: ".7rem" }, on: { click: markPlace } }, icon("map"), "Marcar um lugar"), placesBox);
    if (mapMode === "lista") put(v, top, h("div", { class: "wrap" }, MISS.map((m, i) => placeCard(m, i))), lower);
    else if (window.L && tilesOk !== false) {
      const box = h("div", { class: "lmap" });
      put(v, top, box, h("div", { class: "wrap", style: { paddingTop: ".8rem" } }, mapCards()), lower);
      initMap(box);
    }
    else {
      const cv = h("canvas", { width: 700, height: 700 });
      const box = h("div", { class: "mapbox" }, cv,
        MISS.map((m, i) => m.anywhere ? null : h("button", { class: "pin" + (S.done[m.id] === today ? " done" : ""), style: { left: m.mapX * 100 + "%", top: m.mapY * 100 + "%" }, "aria-label": m.name, on: { click: () => selectPlace(m) } },
          h("span", { text: m.partner.replace("Prefeitura de Miguel Pereira", "Pinheiros").replace(" Bom de Minas", "") }), h("i", null, h("b", { text: String(pinNo(m)) })))),
        C.flash ? h("div", { class: "pin flashp", style: { left: C.flash.mapX * 100 + "%", top: (C.flash.mapY * 100 + 6) + "%" } }, h("span", { text: C.flash.name }), h("i", null, h("b", { text: "★" }))) : null);
      put(v, top, box, h("div", { class: "wrap", style: { paddingTop: ".8rem" } }, mapCards()), lower);
      drawMap(cv);
      loadPlaces().then(list => { if (!C.mapBounds) return; const B = C.mapBounds;
        list.forEach(pl => { const x = (pl.lng - B.west) / (B.east - B.west), y = (B.north - pl.lat) / (B.north - B.south); if (x < 0 || x > 1 || y < 0 || y > 1) return;
          box.append(h("button", { class: "pin" + (pl.confirms >= C.placeConfirmations ? "" : " pend"), style: { left: x * 100 + "%", top: y * 100 + "%" }, "aria-label": pl.name, on: { click: () => placeDetail(pl) } }, h("span", { text: pl.name }), h("i", null, h("b", { text: "•" })))); }); });
    }
    loadPlaces().then(list => put(placesBox, list.length ? list.slice(0, 12).map(placeRow) : h("p", { class: "demo", text: "Ninguém marcou lugares ainda. Seja o primeiro!" })));
  }
  /* Embaixo do mapa: as missões que valem na cidade toda + o lugar tocado no mapa. */
  function mapCards() {
    return [MISS.filter(m => m.anywhere).map(m => placeCard(m, MISS.indexOf(m))), sel && !sel.anywhere ? placeCard(sel, MISS.indexOf(sel)) : null];
  }
  let lmap = null;
  function pinEl(label, num, cls) { return h("div", { class: "pin " + (cls || "") }, h("span", { text: label }), h("i", null, h("b", { text: num }))); }
  function initMap(el) {
    if (lmap) { lmap.remove(); lmap = null; }
    lmap = L.map(el, { zoomControl: true });
    const all = MISS.filter(m => m.lat != null).map(m => [m.lat, m.lng]).concat(C.flash && C.flash.lat != null ? [[C.flash.lat, C.flash.lng]] : []);
    if (sel && sel.lat != null) lmap.setView([sel.lat, sel.lng], C.map.zoom);
    else if (all.length > 1) lmap.fitBounds(all, { padding: [40, 40], maxZoom: C.map.zoom });
    else lmap.setView(C.map.center, C.map.zoom);
    L.tileLayer(C.map.tiles, { maxZoom: C.map.maxZoom, attribution: C.map.attribution, referrerPolicy: "strict-origin-when-cross-origin", crossOrigin: false }).addTo(lmap);
    checkTiles();
    const today = dayKey();
    const mk = (lat, lng, node, click) => L.marker([lat, lng], { icon: L.divIcon({ html: node, className: "lpin", iconSize: [0, 0] }) }).addTo(lmap).on("click", click);
    MISS.forEach((m, i) => { if (m.lat != null && !m.anywhere) mk(m.lat, m.lng, pinEl(m.partner.replace("Prefeitura de Miguel Pereira", "Pinheiros").replace(" Bom de Minas", ""), S.done[m.id] === today ? "✓" : String(pinNo(m)), S.done[m.id] === today ? "done" : ""), () => selectPlace(m)); });
    if (C.flash && C.flash.lat != null) mk(C.flash.lat, C.flash.lng, pinEl(C.flash.name, "★", "flashp"), () => toast(C.flash.text));
    if (S.exp && S.exp.pts.length > 1) L.polyline(S.exp.pts, { color: "#f39a2b", weight: 6 }).addTo(lmap);
    loadPlaces().then(list => { if (!lmap) return; list.forEach(pl => mk(pl.lat, pl.lng, pinEl(pl.name, "•", confirmed(pl) ? "" : "pend"), () => placeDetail(pl))); });
    const Locate = L.Control.extend({ onAdd: () => h("button", { class: "locbtn", "aria-label": "Onde estou", on: { click: async e => {
      e.stopPropagation();
      try { const p = await getPos(); L.circleMarker([p.latitude, p.longitude], { radius: 9, color: "#fff", weight: 3, fillColor: "#3b7fc4", fillOpacity: 1 }).addTo(lmap); lmap.setView([p.latitude, p.longitude], 17); }
      catch (_) { toast("Ative a localização para ver onde você está"); } } } }, "📍") });
    new Locate({ position: "topright" }).addTo(lmap);
    setTimeout(() => lmap && lmap.invalidateSize(), 60);
  }
  /* Se o servidor do mapa recusar (ex.: 403 do OpenStreetMap), volta para o mapa ilustrado. */
  let tilesOk = null;
  async function checkTiles() {
    if (tilesOk !== null || location.protocol === "file:") { if (location.protocol === "file:") tilesBlocked("abra por https"); return; }
    const z = C.map.zoom, la = C.map.center[0] * Math.PI / 180, n = 2 ** z;
    const x = Math.floor((C.map.center[1] + 180) / 360 * n), y = Math.floor((1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2 * n);
    const url = C.map.tiles.replace("{s}", "a").replace("{z}", z).replace("{x}", x).replace("{y}", y);
    try {
      const r = await fetch(url, { mode: "cors", referrerPolicy: "strict-origin-when-cross-origin", cache: "default" });
      tilesOk = r.ok; if (!r.ok) tilesBlocked("erro " + r.status);
    } catch (_) { /* sem resposta legível (rede ou CORS): mantém o mapa */ }
  }
  function tilesBlocked(why) {
    tilesOk = false;
    toast("Mapa real bloqueado (" + why + "). Usando o mapa ilustrado.");
    if (cur === "map") renderMap();
  }
  function placeCard(m, i) {
    const done = S.done[m.id] === dayKey(), xp = m.xp * (m.lights && isNight() ? 2 : 1);
    if (m.anywhere) {
      const prize = C.accessories[accFor(m)];
      return h("div", { class: "card" },
        h("div", { class: "place" + (done ? " done" : "") }, h("span", { class: "num", text: done ? "✓" : "🎄" }),
          h("div", { class: "t" }, h("b", { text: m.name + " pela cidade" }), h("br"),
            h("small", { text: "Estão espalhados pela cidade toda: vale qualquer um. +" + xp + " XP" + (done ? " · feita hoje" : prize ? " · prêmio: " + prize.label : "") }))),
        m.accNight ? h("p", { class: "demo", style: { textAlign: "left", margin: ".4rem 0 0" }, text: isNight() ? "Agora é noite: o prêmio é o " + C.accessories[m.accNight].label.toLowerCase() + "." : "Depois das " + C.nightFrom + "h o prêmio vira o " + C.accessories[m.accNight].label.toLowerCase() + "." }) : null,
        h("button", { class: "btn", style: { marginTop: ".6rem" }, on: { click: () => openCam(m) } }, icon("cam"), "Achei um pinheiro"));
    }
    const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(m.address || (m.lat != null ? m.lat + "," + m.lng : m.partner + ", " + C.city + " RJ"));
    return h("div", { class: "card" },
      h("div", { class: "place" + (done ? " done" : "") }, h("span", { class: "num", text: done ? "✓" : String(pinNo(m)) }),
        h("div", { class: "t" }, h("b", { text: m.partner }), h("br"), h("small", { text: m.task + " · +" + xp + " XP" + (done ? " · feita hoje" : "") }))),
      h("div", { class: "row", style: { marginTop: ".6rem" } },
        h("a", { class: "btn alt", href: maps, target: "_blank", rel: "noopener noreferrer" }, icon("nav"), "Como chegar"),
        h("button", { class: "btn", on: { click: () => openCam(m) } }, icon("cam"), "Fazer missão")),
      m.lat != null ? h("button", { class: "btn alt", style: { marginTop: ".5rem" }, on: { click: () => openSeek(m) } }, "🧭 Procurar com a câmera") : null);
  }
  function drawMap(cv) {
    const m = cv.getContext("2d"), W = 700, H = 700;
    m.fillStyle = "#4c7a2a"; m.fillRect(0, 0, W, H);
    m.fillStyle = "rgba(255,255,255,.12)"; for (let i = 0; i < 24; i++) { m.beginPath(); m.arc((i * 97) % W, (i * 61) % H, 18, 0, 7); m.fill(); }
    m.fillStyle = "#6fb3d6"; m.beginPath(); m.ellipse(W * .62, H * .12, W * .15, H * .07, .3, 0, 7); m.fill();
    m.strokeStyle = "rgba(255,255,255,.9)"; m.lineCap = "round"; m.lineWidth = 9;
    [[[0, .4], [.25, .38], [.45, .45], [.7, .42], [1, .5]], [[.2, 1], [.25, .7], [.32, .45], [.3, .2], [.4, 0]], [[.5, 1], [.55, .75], [.6, .55], [.75, .3], [.9, 0]], [[0, .8], [.3, .72], [.6, .78], [1, .7]]]
      .forEach(p => { m.beginPath(); p.forEach(([x, y], i) => i ? m.lineTo(x * W, y * H) : m.moveTo(x * W, y * H)); m.stroke(); });
  }

  /* =========================================================
     EXPEDIÇÃO (estilo Strava): distância, tempo, lugares, pets e rota
     A rota publicada perde o começo e o fim (privacidade) e tem precisão reduzida.
     ========================================================= */
  let watchId = null, expTick = null;
  function expCard() {
    if (!S.exp) return h("div", { class: "card expcard" }, h("b", { text: "Expedição" }),
      h("small", { text: "Marque distância, tempo, lugares e pets do seu passeio, como no Strava." }),
      h("button", { class: "btn", on: { click: expBegin } }, icon("nav"), "Iniciar expedição"));
    const e = S.exp, mins = Math.round((Date.now() - e.t0) / 6e4);
    return h("div", { class: "card expcard live" }, h("b", { text: "Expedição em andamento" }),
      h("div", { class: "stats" }, [[fmtKm(e.dist / 1000), "distância"], [fmtMin(mins), "tempo"], [String(e.places.length), "lugares"], [String(e.xp), "XP"]].map(([b, l]) => h("div", null, h("b", { text: b }), h("span", { text: l })))),
      h("small", { text: "Com " + petName(S.sel) + (watchId === null ? " · sem localização: conta tempo e lugares" : "") }),
      h("button", { class: "btn red", on: { click: expEnd } }, "Encerrar expedição"));
  }
  function expBegin() {
    S.exp = { t0: Date.now(), dist: 0, pts: [], places: [], missions: [], pets: [], xp: 0, photo: null, lastT: 0 };
    save(); expWatch(); toast("Expedição começou! Bom passeio."); renderMap();
  }
  function expWatch() {
    if (!S.exp) return;
    clearInterval(expTick); expTick = setInterval(() => { if (cur === "map") renderMap(); }, 30000);
    if (!navigator.geolocation || watchId !== null) return;
    watchId = navigator.geolocation.watchPosition(onPos, () => { watchId = null; }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 });
  }
  function onPos(p) {
    const e = S.exp; if (!e || p.coords.accuracy > 40) return;
    const pt = [p.coords.latitude, p.coords.longitude], now = Date.now(), last = e.pts[e.pts.length - 1];
    if (last) {
      const d = hav(last, pt), dt = (now - e.lastT) / 1000;
      if (d < 6) return;
      if (dt > 0 && d / dt > 12) { e.lastT = now; return; } // rápido demais: carro, não conta
      e.dist += d;
    }
    e.pts.push([+pt[0].toFixed(5), +pt[1].toFixed(5)]); e.lastT = now;
    if (e.pts.length > 1500) e.pts = e.pts.filter((_, i) => i % 2 === 0);
    if (e.pts.length % 5 === 0) save();
  }
  function privateRoute(pts) {
    const cut = C.routePrivacyMeters;
    const trim = arr => { let acc = 0, i = 0; while (i < arr.length - 1 && acc < cut) { acc += hav(arr[i], arr[i + 1]); i++; } return arr.slice(i); };
    let r = trim(trim(pts).reverse()).reverse();
    const step = Math.max(1, Math.ceil(r.length / 110)); r = r.filter((_, i) => i % step === 0);
    return r.length >= 2 ? r.flatMap(q => [+q[0].toFixed(4), +q[1].toFixed(4)]) : null;
  }
  function autoTitle(e) {
    const lights = e.missions.filter(id => (byId(id) || {}).lights).length;
    if (lights >= 2) return "Rota das luzes de Natal";
    const d = new Date(), wd = d.toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", ""), hr = d.getHours();
    return "Expedição de " + wd + (hr < 12 ? " de manhã" : hr < 18 ? " à tarde" : " à noite") + " no Centro";
  }
  async function expEnd() {
    const e = S.exp; if (!e) return;
    if (watchId !== null) navigator.geolocation.clearWatch(watchId); watchId = null; clearInterval(expTick);
    const mins = Math.max(1, Math.round((Date.now() - e.t0) / 6e4)), km = e.dist / 1000;
    S.exp = null; save();
    if (!e.places.length && km < .1) { toast("Expedição curta demais: nada foi postado"); return renderMap(); }
    const post = { kind: "expedition", nick: S.nick, title: autoTitle(e), missions: e.missions, pet: e.pets[0] || S.sel, pets: e.pets.length ? e.pets : [S.sel],
      xp: e.xp, km, mins, places: e.places.length, photo: e.photo, route: privateRoute(e.pts), club: S.club, clubName: clubName() };
    let saved = post;
    try { saved = await DB.addPost(post); } catch (err) { if (err.message === "rate") { LS_wait(); try { saved = await DB.addPost(post); } catch (_) {} } }
    renderMap(); postDetail(Object.assign({ uid: DB.uid, createdAt: Date.now(), claps: 0 }, saved));
  }
  function LS_wait() { DB.LS.set("lastPost", 0); }
  function companionSheet(cb, label) {
    const own = PETS.filter(p => S.pets[p] && !S.pets[p].away);
    openSheet(h("h2", { text: "Quem vai com você hoje?" }), h("p", { class: "demo", style: { textAlign: "left" }, text: "Escolha o companheiro da expedição. Todo poder vem de algo verdadeiro sobre a espécie." }),
      own.map(p => h("button", { class: "opt" + (p === S.sel ? " sel" : ""), "aria-pressed": String(p === S.sel), on: { click: () => { S.sel = p; save(); companionSheet(cb, label); } } },
        h("img", { src: T[p], alt: "", style: { width: "3rem", height: "3rem", objectFit: "contain" } }),
        h("span", { style: { flex: "1" } }, h("b", { text: SP[p].name }), h("br"), h("small", { text: SP[p].skill })),
        p === S.sel ? h("span", { class: "tagdark", text: "Comigo" }) : null)),
      cb ? h("button", { class: "btn", on: { click: () => { closeSheet(); cb(); } } }, label || "Pronto") : null);
  }

  /* =========================================================
     LUGARES MARCADOS PELOS JOGADORES
     ========================================================= */
  let placesCache = null, placesAt = 0;
  async function loadPlaces(force) {
    if (!force && placesCache && Date.now() - placesAt < 60000) return placesCache;
    try { placesCache = await DB.listPlaces(); } catch (_) { placesCache = placesCache || []; }
    placesAt = Date.now(); return placesCache;
  }
  const confirmed = pl => pl.confirms >= C.placeConfirmations;
  function placeRow(pl) {
    const ok = confirmed(pl);
    return h("button", { class: "card placerow", on: { click: () => placeDetail(pl) } },
      h("span", { class: "pdot" + (ok ? "" : " pend") }),
      h("span", { style: { flex: "1", textAlign: "left" } }, h("b", { text: pl.name }), h("br"),
        h("small", { text: C.placeTypes[pl.type].label + " · " + (ok ? "confirmado" : "em descoberta " + pl.confirms + "/" + C.placeConfirmations) + " · por " + pl.nick })),
      h("img", { src: T[C.placeTypes[pl.type].pet], alt: "", style: { width: "2.6rem", filter: ok ? "none" : "brightness(0) opacity(.25)" } }));
  }
  function getPos() {
    return new Promise((ok, no) => { if (!navigator.geolocation) return no(new Error("geo"));
      navigator.geolocation.getCurrentPosition(p => ok(p.coords), no, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }); });
  }
  async function markPlace() {
    let pos;
    try { pos = await getPos(); } catch (_) { return toast("Ative a localização para marcar um lugar"); }
    if (pos.accuracy > 50) return toast("GPS fraco aqui. Tente num lugar aberto.");
    const here = [pos.latitude, pos.longitude], list = await loadPlaces(true);
    const near = list.map(pl => [pl, hav(here, [pl.lat, pl.lng])]).filter(x => x[1] <= 40).sort((a, b) => a[1] - b[1])[0];
    if (near) return openSheet(h("h2", { text: "Esse lugar já existe?" }),
      h("p", { text: "Já existe " + near[0].name + " a " + Math.round(near[1]) + " m daqui. É o mesmo lugar?" }),
      h("div", { class: "row" }, h("button", { class: "btn alt", on: { click: () => placeDetail(near[0]) } }, "É esse"), h("button", { class: "btn", on: { click: () => placeForm(here) } }, "É outro")));
    placeForm(here);
  }
  function placeForm(here) {
    let type = null, photo = null;
    const chips = h("div", { class: "chips" }, Object.entries(C.placeTypes).map(([k, t]) => h("button", { class: "chip", "data-k": k, on: { click: e => { type = k; chips.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.k === k)); } } }, t.label)));
    const name = h("input", { type: "text", maxLength: 40, placeholder: "Nome do lugar (ex.: Deck do Javary)", autocomplete: "off" });
    const prev = h("div", { class: "photoslot", text: "Toque para tirar a foto do lugar" });
    const file = h("input", { type: "file", accept: "image/*", style: { display: "none" } }); file.setAttribute("capture", "environment");
    file.addEventListener("change", async () => { const f = file.files[0]; if (!f || !/^image\//.test(f.type) || f.size > 15e6) return; photo = await thumbOf(f, 480, 110000); if (photo) put(prev, h("img", { src: photo, alt: "" })); });
    prev.addEventListener("click", () => file.click());
    openSheet(h("h2", { text: "Marcar um lugar" }),
      h("div", { class: "card okbar" }, h("b", { text: "✓ Você está aqui" }), h("small", { text: " GPS confirmado" })),
      prev, file, h("div", { class: "sec" }, "Que tipo de lugar é?"), chips, h("div", { class: "sec" }, "Nome do lugar"), name,
      h("button", { class: "btn", style: { marginTop: ".7rem" }, on: { click: async () => {
        const n = DB.cleanName(name.value, 40);
        if (!photo) return toast("Tire a foto do lugar");
        if (!type) return toast("Escolha o tipo de lugar");
        if (n.length < 2) return toast("Dê um nome ao lugar");
        if (C.placeBlocked.some(w => n.toLowerCase().includes(w))) return toast("Não dá para marcar casa, escola ou lugar de pessoas");
        try {
          const pl = await DB.addPlace({ nick: S.nick, name: n, type, lat: here[0], lng: here[1], photo });
          S.myPlaces.push(pl.id); addXp(20); save(); placesCache = null;
          placeDetail(pl); if (cur === "map") renderMap();
        } catch (_) { toast("Não deu para marcar agora. Espere um pouco e tente de novo."); }
      } } }, "Marcar lugar"),
      h("p", { class: "demo", text: "Não dá para marcar casa, escola nem pessoa. A localização é arredondada (cerca de 10 m)." }));
  }
  async function placeDetail(pl) {
    const ok = confirmed(pl), t = C.placeTypes[pl.type], visited = await DB.hasVisited(pl.id), mine = pl.uid === DB.uid;
    const m = { id: "pl" + pl.id.toLowerCase(), place: true, ptype: pl.type, name: pl.name, partner: pl.name, task: "Foto no lugar", xp: 30, pet: t.pet, food: "sementes", lights: false, lat: pl.lat, lng: pl.lng,
      tip: "Que lugar bonito! Me deixa aparecer na foto com " + pl.name + "." };
    const confirmBtn = h("button", { class: "btn", on: { click: async () => {
      let pos; try { pos = await getPos(); } catch (_) { return toast("Ative a localização para confirmar"); }
      if (hav([pos.latitude, pos.longitude], [pl.lat, pl.lng]) > 60) return toast("Chegue mais perto de " + pl.name + " para confirmar");
      try { await DB.visitPlace(pl.id); addXp(10); save(); toast("Visita confirmada!"); placesCache = null; closeSheet(); if (cur === "map") renderMap(); }
      catch (_) { toast("Você já confirmou este lugar"); } } } }, "Confirmar visita");
    openSheet(pl.photo ? h("img", { class: "shot", src: pl.photo, alt: "", style: { aspectRatio: "16/10" } }) : null,
      h("h2", { style: { display: "flex", gap: ".5rem", alignItems: "center" } }, h("span", { class: "pdot" + (ok ? "" : " pend") }), pl.name),
      h("small", { style: { color: "var(--mute)" }, text: t.label + " · " + (ok ? "lugar confirmado" : "em descoberta") }),
      ok ? null : h("div", { class: "card", style: { marginTop: ".6rem" } }, h("b", { text: pl.confirms + " de " + C.placeConfirmations + " visitas para confirmar" }),
        h("div", { class: "meter lightmeter" }, h("span", { style: { width: Math.min(100, pl.confirms / C.placeConfirmations * 100) + "%" } }))),
      h("div", { class: "card who", style: { padding: ".6rem .8rem" } }, h("img", { src: "assets/medal-trophy.png", alt: "", style: { width: "2.2rem" } }),
        h("div", null, h("b", { text: "Descoberto por " + pl.nick }), h("small", { text: "Primeiro Guardião do lugar" }))),
      h("div", { class: "card who", style: { padding: ".6rem .8rem" } }, h("img", { src: T[t.pet], alt: "", style: { width: "3rem", filter: ok ? "none" : "brightness(0) opacity(.3)" } }),
        h("small", { text: ok ? "O surucuá visita este lugar. Faça a missão aqui!" : "Quando o lugar for confirmado, o surucuá passa a visitar." })),
      ok ? h("button", { class: "btn", on: { click: () => openCam(m) } }, icon("cam"), "Fazer missão aqui · +30 XP") : (visited || mine ? h("p", { class: "demo", text: "Você já conta como visita. Chame amigos para confirmar!" }) : confirmBtn),
      !ok ? h("button", { class: "btn red", style: { marginTop: ".5rem" }, on: { click: () => invite() } }, icon("share"), "Chamar amigos para confirmar") : null,
      !ok && DB.mode === "demo" ? h("button", { class: "linkbtn", on: { click: async () => { await DB.visitPlace(pl.id, true); placesCache = null; closeSheet(); renderMap(); } } }, "Simular visita de um amigo (só no modo demonstração)") : null,
      ok && pl.type === "comercio" ? h("button", { class: "btn alt", style: { marginTop: ".5rem" }, on: { click: () => claimSheet(pl) } }, "Este lugar é meu?") : null,
      h("p", { class: "demo", text: "Se ninguém confirmar em " + C.placeDays + " dias, o lugar some." }));
  }
  /* "Este lugar é meu?": o dono pede o lugar; a equipe confere por telefone ou nota antes de valer. */
  function claimSheet(pl) {
    let plan = "parceiro";
    const opts = [["gratis", "Grátis", "Seu nome certo no mapa e 1 missão simples"], ["parceiro", "Parceiro · [R$ __] por mês", "Um bicho mora na sua loja, ponto de comidinha, destaque no mapa, painel e fotos impressas"]];
    const box = h("div");
    const draw = () => put(box, opts.map(([k, t, d]) => h("button", { class: "opt", "aria-pressed": String(plan === k), on: { click: () => { plan = k; draw(); } } }, h("span", { class: "dot" }), h("span", { style: { textAlign: "left" } }, h("b", { text: t }), h("br"), h("small", { text: d })))));
    draw();
    const contact = h("input", { type: "text", maxLength: 60, placeholder: "WhatsApp ou e-mail da loja", autocomplete: "off" });
    const consent = h("input", { type: "checkbox", id: "claimok" });
    openSheet(h("h2", { text: pl.name }), h("p", { class: "demo", style: { textAlign: "left" }, text: "Marcado por jogadores · " + pl.confirms + " visitas" }),
      h("div", { class: "card okbar" }, "Você é o dono? Assuma o lugar para ver quem visita e escolher o bicho que mora aqui."), box, contact,
      h("label", { class: "consent", htmlFor: "claimok" }, consent, h("span", { text: "Autorizo o contato da equipe para confirmar que sou o dono. Posso pedir a exclusão a qualquer momento." })),
      h("button", { class: "btn", style: { marginTop: ".6rem" }, on: { click: async () => {
        if (!consent.checked) return toast("Marque a autorização");
        try { await DB.addClaim({ placeId: pl.id, store: pl.name, contact: contact.value, plan, consent: true }); closeSheet(); toast("Pedido enviado! Vamos confirmar com você."); }
        catch (_) { toast("Preencha o contato da loja"); } } } }, "Este lugar é meu"),
      h("p", { class: "demo", text: "Confirmação por telefone ou nota fiscal da loja." }));
  }

  /* =========================================================
     CÂMERA EM RA (Three.js sobre o vídeo)
     ========================================================= */
  let camM = null, stream = null, bgImg = null, ar = null;
  function pickMission() {
    const today = dayKey(), next = MISS.find(m => S.done[m.id] !== today);
    openSheet(h("h2", { text: "Qual missão?" }), MISS.map(m => h("button", { class: "opt", on: { click: () => { closeSheet(); openCam(m); } } },
      h("img", { src: T[m.pet], alt: "", style: { width: "2.6rem", height: "2.6rem" } }),
      h("span", { style: { flex: "1" } }, h("b", { text: m.name }), h("br"), h("small", { text: m.partner + (S.done[m.id] === today ? " · feita hoje" : "") })),
      m === next ? h("span", { class: "coupon", style: { margin: "0" }, text: "Próxima" }) : null)));
  }
  async function openCam(m, free) {
    camM = m; bgImg = null; closeSheet();
    if (m.tag && !free && window.THREE) return startTag(m);
    const xp = m.xp * (m.lights && isNight() ? 2 : 1);
    $("camlabel").textContent = m.name + " · +" + xp + " XP" + (m.lights && isNight() ? " 🌙" : "");
    $("camxp").textContent = S.done[m.id] === dayKey() ? "Já valeu hoje" : "";
    $("camhint").textContent = "Um " + petName(m.pet) + " apareceu! Arraste para posicionar e tire a foto.";
    const speakBtn = h("button", { class: "speak", on: { click: () => speak(m.tip) } }, icon("speaker"), "Ouvir o " + C.guideName);
    put($("chat"), h("div", { class: "bubble" },
      h("b", { style: { display: "flex", alignItems: "center", gap: ".35rem" } }, h("img", { src: T.surucua, alt: "", class: "bubav" }), C.guideName + ", seu guia"),
      m.tip, h("div", { class: "meta", text: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) })), speakBtn);
    $("v-cam").classList.add("on");
    drawFallback();
    startAR(m.pet);
    speak(m.tip);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("sem câmera");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      if (!$("v-cam").classList.contains("on")) return stopStream();
      const vid = $("vid"); vid.srcObject = stream; await vid.play().catch(() => {});
      $("fallback").style.display = "none";
    } catch (_) {
      $("fallback").style.display = "block";
      toast("Sem câmera: use a Galeria ou permita a câmera");
    }
  }
  /* =========================================================
     MODO TAG (MindAR): a câmera reconhece a mandala impressa no balcão e o surucuá pousa nela.
     A biblioteca só é carregada quando este modo abre.
     ========================================================= */
  let tag = null, mindLoading = null;
  function loadMind() {
    if (window.MindARThree) return Promise.resolve();
    return mindLoading || (mindLoading = new Promise((ok, no) => { const s = document.createElement("script"); s.src = "vendor/mindar.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); }));
  }
  async function startTag(m) {
    stopAR(); stopStream();
    const vc = $("v-cam"); vc.classList.add("on", "tagmode");
    $("camlabel").textContent = m.name + " · +" + m.xp + " XP";
    $("camxp").textContent = S.done[m.id] === dayKey() ? "Já valeu hoje" : "";
    put($("chat"), h("div", { class: "bubble" }, h("b", { style: { display: "flex", alignItems: "center", gap: ".35rem" } }, h("img", { src: T.surucua, alt: "", class: "bubav" }), C.guideName + ", seu guia"),
      "Procura a minha tag no balcão de " + m.partner + "! Aponta a câmera pra ela que eu pouso lá."),
      h("button", { class: "speak", on: { click: () => { stopTag(); openCam(m, true); } } }, "Estou sem a tag"));
    $("camhint").textContent = "Carregando a câmera da tag…";
    $("fallback").style.display = "none"; $("arcv").style.display = "none";
    const box = h("div", { class: "tagbox" }); vc.prepend(box);
    tag = { box, mt: null, pet: null, found: false, landed: false, m };
    speak("Procura a minha tag no balcão! Aponta a câmera pra ela que eu pouso lá.");
    try {
      await loadMind();
      if (!tag || tag.box !== box) return;
      const mt = new window.MindARThree({ container: box, imageTargetSrc: "assets/tag.mind", uiScanning: "no", uiLoading: "no", uiError: "no", filterMinCF: .0001, filterBeta: .001 });
      tag.mt = mt; Pets.lights(mt.scene);
      const anchor = mt.addAnchor(0), pet = Pets.make("surucua", { eq: S.eq });
      pet.scale.setScalar(.55); pet.rotation.x = 1.0; pet.position.y = -.15; pet.visible = false; anchor.group.add(pet); tag.pet = pet;
      anchor.onTargetFound = () => { if (!tag) return; tag.found = true; pet.visible = true; $("camhint").textContent = "O surucuá pousou na tag! Toque nele para ouvir o canto.";
        if (!tag.landed) { tag.landed = true; Pets.play(pet, "pouso"); } };
      anchor.onTargetLost = () => { if (!tag) return; tag.found = false; $("camhint").textContent = "Aponte de novo para a tag."; };
      await mt.start();
      if (!tag || tag.mt !== mt) { try { mt.stop(); } catch (_) {} return; }
      $("camhint").textContent = "Aponte a câmera para a tag do surucuá.";
      mt.renderer.setAnimationLoop(() => { Pets.tick(pet, performance.now()); mt.renderer.render(mt.scene, mt.camera); });
      box.addEventListener("click", () => { if (tag && tag.found) sing(pet); });
    } catch (_) {
      toast("A câmera da tag não abriu aqui. Seguindo sem a tag.");
      stopTag(); openCam(m, true);
    }
  }
  function stopTag() {
    if (!tag) return;
    const t = tag; tag = null;
    try { if (t.mt) { t.mt.renderer.setAnimationLoop(null); t.mt.stop(); t.mt.renderer.dispose(); } } catch (_) {}
    t.box.remove(); $("v-cam").classList.remove("tagmode"); $("arcv").style.display = "";
  }

  /* =========================================================
     MODO PROCURAR (LocAR.js): o surucuá voa na direção do lugar, pela bússola e pelo GPS.
     ========================================================= */
  let seek = null;
  async function openSeek(m) {
    if (!window.LocAR || !window.THREE) return toast("Modo Procurar indisponível neste aparelho");
    closeSheet(); closeCam(); camM = m;
    const vc = $("v-cam"); vc.classList.add("on", "seek");
    $("camlabel").textContent = "Procurar · " + m.partner;
    $("camxp").textContent = "";
    const info = h("div", { class: "seekinfo", text: "Procurando o sinal do GPS…" });
    put($("chat"), h("div", { class: "bubble" }, h("b", { style: { display: "flex", alignItems: "center", gap: ".35rem" } }, h("img", { src: T.surucua, alt: "", class: "bubav" }), C.guideName + ", seu guia"),
      "Me segue! Vou voando na direção de " + m.partner + ". Olhe em volta com o celular até me achar."), info);
    $("camhint").textContent = "Segure o celular em pé e gire devagar.";
    $("fallback").style.display = "none";
    startVideoOnly();
    const cv = freshCanvas("arcv"); cv.style.display = "block";
    try {
      const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
      r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(cv.clientWidth, cv.clientHeight, false);
      const sc = new THREE.Scene(); Pets.lights(sc);
      const camera = new THREE.PerspectiveCamera(60, cv.clientWidth / cv.clientHeight, .1, 2000);
      const locar = new LocAR.LocAR(sc, camera, { gpsMinDistance: 3, gpsMinAccuracy: 60 });
      const controls = new LocAR.DeviceOrientationControls(camera, { enablePermissionDialog: true, preferConfirmDialog: true });
      controls.on("deviceorientationgranted", e => e.target.connect());
      controls.on("deviceorientationerror", () => { info.textContent = "Sem bússola neste aparelho: use o mapa para chegar."; });
      controls.init();
      const pet = Pets.make("surucua", { eq: S.eq }); pet.scale.setScalar(2.4); sc.add(pet); Pets.play(pet, "voo");
      const fwd = new THREE.Vector3();
      seek = { r, locar, controls, pet, raf: 0, user: null, dir: null, m };
      locar.on("gpsupdate", ev => { const c = ev.position.coords; seek.user = [c.latitude, c.longitude]; placeSeek(); });
      locar.on("gpserror", () => { info.textContent = "Ative a localização para procurar."; });
      locar.startGps().catch(() => { info.textContent = "Ative a localização para procurar."; });
      const loop = t => {
        if (!seek) return; seek.raf = requestAnimationFrame(loop);
        controls.update();
        pet.position.y = (seek.y0 || 0); Pets.tick(pet, t);
        if (seek.dir) {
          camera.getWorldDirection(fwd);
          const a = Math.atan2(fwd.x * seek.dir[1] - fwd.z * seek.dir[0], fwd.x * seek.dir[0] + fwd.z * seek.dir[1]);
          $("camhint").textContent = Math.abs(a) < .5 ? "Isso! Siga o surucuá." : a > 0 ? "Gire para a direita ➡" : "⬅ Gire para a esquerda";
        }
        r.render(sc, camera);
      };
      seek.raf = requestAnimationFrame(loop);
    } catch (_) { info.textContent = "Não deu para abrir o modo Procurar aqui."; }
  }
  function placeSeek() {
    const s = seek; if (!s || !s.user) return;
    const m = s.m, [ux, uz] = s.locar.lonLatToWorldCoords(s.user[1], s.user[0]), [tx, tz] = s.locar.lonLatToWorldCoords(m.lng, m.lat);
    const dx = tx - ux, dz = tz - uz, len = Math.hypot(dx, dz) || 1, k = Math.min(14, len);
    s.dir = [dx / len, dz / len]; s.y0 = 1.5;
    s.pet.position.x = ux + s.dir[0] * k; s.pet.position.z = uz + s.dir[1] * k; s.pet.rotation.y = Math.atan2(-s.dir[0], -s.dir[1]);
    const d = Math.round(hav(s.user, [m.lat, m.lng])), info = document.querySelector(".seekinfo");
    if (!info) return;
    if (d <= 40 && !s.landed) { s.landed = true; Pets.play(s.pet, "pouso"); }
    if (d <= 40) put(info, h("b", { text: "Você chegou em " + m.partner + "! 🎉" }), h("button", { class: "btn", style: { marginTop: ".4rem" }, on: { click: () => { stopSeek(); openCam(m); } } }, icon("cam"), "Tirar a foto"));
    else info.textContent = m.partner + " · " + (d >= 1000 ? (d / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " km" : d + " m");
  }
  function stopSeek() {
    if (!seek) return;
    cancelAnimationFrame(seek.raf);
    try { seek.locar.stopGps(); } catch (_) {}
    try { seek.controls.disconnect(); } catch (_) {}
    try { seek.r.dispose(); seek.r.forceContextLoss(); } catch (_) {}
    seek = null; $("v-cam").classList.remove("seek");
  }
  async function startVideoOnly() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      const vid = $("vid"); vid.srcObject = stream; await vid.play().catch(() => {});
    } catch (_) { $("fallback").style.display = "block"; drawFallback(); }
  }
  function stopStream() { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; $("vid").srcObject = null; }
  function closeCam() { stopTag(); stopSeek(); stopStream(); stopAR(); $("v-cam").classList.remove("on"); try { speechSynthesis.cancel(); } catch (_) {} }
  function drawFallback() {
    const cv = $("fallback"), c = cv.getContext("2d"), W = cv.width, H = cv.height;
    if (bgImg) { cover(c, bgImg, W, H); return; }
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b1226"); g.addColorStop(1, "#1a1430"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = "#14121c"; c.fillRect(0, H * .7, W, H * .3);
    const cols = ["#ffd36b", "#ff6b5b", "#fff4d6", "#8fd9ff"];
    for (let a = 0; a < 3; a++) for (let i = 0; i <= 20; i++) {
      const u = i / 20, w = W * (.8 - a * .2), x = W / 2 - w / 2 + u * w, y = H * .7 - Math.sin(u * Math.PI) * H * (.35 - a * .08);
      c.fillStyle = cols[(i + a) % 4]; c.shadowColor = c.fillStyle; c.shadowBlur = 14; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill();
    }
    c.shadowBlur = 0;
  }
  function cover(c, img, W, H) {
    const iw = img.videoWidth || img.width, ih = img.videoHeight || img.height, s = Math.max(W / iw, H / ih);
    c.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
  }
  function freshCanvas(id) { const old = $(id), n = old.cloneNode(false); old.replaceWith(n); return n; }
  function startAR(petId) {
    stopAR();
    const cv = freshCanvas("arcv");
    try {
      if (!window.THREE) throw new Error("sem three");
      const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true });
      r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(cv.clientWidth, cv.clientHeight, false);
      const sc = new THREE.Scene(); Pets.lights(sc);
      const camera = new THREE.PerspectiveCamera(45, cv.clientWidth / cv.clientHeight, .1, 50); camera.position.set(0, 1.2, 5); camera.lookAt(0, .6, 0);
      const pet = Pets.make(petId, { eq: S.eq }); pet.position.set(0, -.6, 0); sc.add(pet);
      ar = { r, sc, camera, pet, raf: 0, hop: 0, base: pet.rotation.y }; Pets.play(pet, "pouso");
      const loop = t => {
        ar.raf = requestAnimationFrame(loop);
        const hop = ar.hop > 0 ? Math.sin((1 - ar.hop) * Math.PI) * .5 : 0; ar.hop = Math.max(0, ar.hop - .04);
        pet.position.y = ar.y0 + hop; Pets.tick(pet, t);
        r.render(sc, camera);
      };
      ar.y0 = -.6; ar.raf = requestAnimationFrame(loop);
      let drag = null;
      cv.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY, px: pet.position.x, py: ar.y0, moved: false }; cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => { if (!drag) return; const k = 6 / cv.clientHeight; pet.position.x = Math.max(-1.8, Math.min(1.8, drag.px + (e.clientX - drag.x) * k)); ar.y0 = Math.max(-1.6, Math.min(1.2, drag.py - (e.clientY - drag.y) * k)); drag.moved = drag.moved || Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8; };
      cv.onpointerup = () => { if (drag && !drag.moved) sing(pet); drag = null; };
      cv.style.display = "block";
    } catch (_) {
      ar = { img: h("img", { src: T[petId], alt: petName(petId), class: "arimg" }) };
      cv.style.display = "none"; $("v-cam").append(ar.img);
    }
  }
  function stopAR() {
    if (!ar) return;
    if (ar.raf) cancelAnimationFrame(ar.raf);
    if (ar.r) { ar.r.dispose(); ar.r.forceContextLoss && ar.r.forceContextLoss(); }
    if (ar.img) ar.img.remove();
    ar = null;
  }
  $("camclose").addEventListener("click", closeCam);
  $("campick").addEventListener("click", () => $("filepick").click());
  $("filepick").addEventListener("change", async e => {
    const f = e.target.files && e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) || f.size > 15e6) return toast("Escolha uma foto JPG ou PNG de até 15 MB");
    try { bgImg = await createImageBitmap(f); stopStream(); $("fallback").style.display = "block"; drawFallback(); }
    catch (_) { toast("Não deu para abrir essa foto"); }
  });
  $("camshoot").addEventListener("click", shoot);
  $("boxbtn").addEventListener("click", openBox);

  /* Valida a presença no lugar só quando a missão tem coordenadas. A posição não é salva nem enviada. */
  function nearEnough(m) {
    if (m.lat == null || m.lng == null || m.coordsOk === false || !navigator.geolocation) return Promise.resolve(true);
    return new Promise(ok => navigator.geolocation.getCurrentPosition(p => {
      const R = 6371e3, r = x => x * Math.PI / 180, dLa = r(m.lat - p.coords.latitude), dLo = r(m.lng - p.coords.longitude);
      const a = Math.sin(dLa / 2) ** 2 + Math.cos(r(p.coords.latitude)) * Math.cos(r(m.lat)) * Math.sin(dLo / 2) ** 2;
      ok(2 * R * Math.asin(Math.sqrt(a)) <= C.radiusMeters);
    }, () => ok(false), { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }));
  }
  let shooting = false;
  async function shoot() {
    if (!camM || shooting) return;
    shooting = true;
    try {
      if (!(tag && tag.found) && !(await nearEnough(camM))) { toast("Chegue mais perto de " + camM.partner + " para valer"); return; }
      const vw = innerWidth, vh = innerHeight, W = 1080, H = Math.min(1920, Math.round(W * vh / vw));
      const cv = h("canvas", { width: W, height: H }), c = cv.getContext("2d");
      const vid = $("vid");
      if (tag && tag.found) {
        const tv = tag.box.querySelector("video"); if (tv && tv.videoWidth) cover(c, tv, W, H);
        tag.mt.renderer.render(tag.mt.scene, tag.mt.camera); c.drawImage(tag.mt.renderer.domElement, 0, 0, W, H);
      } else if (tag) { toast("Aponte para a tag do surucuá primeiro"); return; }
      else if (stream && vid.videoWidth) cover(c, vid, W, H); else cover(c, bgImg || $("fallback"), W, H);
      if (tag) { /* já desenhado acima */ }
      else if (ar && ar.r) { ar.r.render(ar.sc, ar.camera); c.drawImage($("arcv"), 0, 0, W, H); }
      else if (ar && ar.img && ar.img.complete) { const s = W * .45; c.drawImage(ar.img, (W - s) / 2, H * .6, s, s); }
      const blob = await new Promise(ok => cv.toBlob(ok, "image/jpeg", .86));
      const m = camM; closeCam(); complete(m, blob);
    } finally { shooting = false; }
  }

  /* ---------- missão concluída ---------- */
  let lastPhoto = null;
  function complete(m, blob) {
    if (lastPhoto) URL.revokeObjectURL(lastPhoto.url);
    lastPhoto = blob ? { blob, url: URL.createObjectURL(blob), m } : null;
    const already = S.done[m.id] === dayKey();
    let xp = 0, isNew = false;
    const back = [], acc = accFor(m);
    if (!already) {
      xp = m.xp * (m.lights && isNight() ? 2 : 1);
      if (S.sel === "sabia" && new Date().getHours() < 9) xp += 10;
      if (S.sel === "surucua" && m.ptype === "mata") xp += 20;
      addXp(xp); S.done[m.id] = dayKey(); S.ever[m.id] = true; S.photos++; S.boxes++; S.daily.visit++;
      S.food[m.food] = (S.food[m.food] || 0) + 2;
      if (S.week.id !== weekId()) S.week = { id: weekId(), places: [] };
      if (!m.place && !S.week.places.includes(m.id)) S.week.places.push(m.id);
      if (acc && C.accessories[acc] && !S.acc.includes(acc)) { S.acc.push(acc); S.eq[C.accessories[acc].slot] = acc; isNew = true; makeThumbs(); }
      for (const [id, p] of Object.entries(S.pets)) if (p.away) { p.away = false; p.love = clamp(p.love + 10); p.seen = Date.now(); back.push(id); }
      S.pets[m.pet].seen = Date.now(); S.pets[S.sel].seen = Date.now();
      save();
      if (cur === "garden") refreshBars();
      publishMission(m, xp, blob);
    }
    renderBox();
    const sp = SP[m.pet];
    openSheet(h("div", { class: "reward" },
      lastPhoto ? h("img", { class: "storyprev", src: lastPhoto.url, alt: "Sua foto" }) : h("img", { class: "pet", src: T[m.pet], alt: "" }),
      h("div", { class: "xp", text: already ? "Foto salva" : "+" + xp + " XP" }),
      already ? h("p", { text: "Esta missão já valeu hoje. Volte amanhã para ganhar de novo." }) : null,
      h("p", { style: { margin: ".2rem 0", fontWeight: "700" }, text: isNew ? "Novo acessório: " + C.accessories[acc].label + "!" : "O surucuá está com você" }),
      h("p", { class: "realtag", text: "Espécie real da Serra ✓" + (sp.review ? " · lista em revisão" : "") }),
      back.length ? h("p", { text: back.map(petName).join(", ") + " voltou do passeio!" }) : null,
      m.gift && !already ? h("div", null, h("span", { class: "coupon", text: "Presente do " + m.partner + ": " + m.gift }), h("p", { class: "demo", text: "Mostre esta tela no balcão. Não precisa comprar nada para ganhar a missão." })) : null,
      !already ? h("p", { style: { color: "var(--mute)", fontSize: ".85rem" }, text: "+1 Caixinha de Natal · +2 " + C.foods[m.food].label }) : null,
      h("div", { style: { display: "grid", gap: ".5rem", marginTop: ".6rem" } },
        lastPhoto ? h("button", { class: "btn red", on: { click: () => shareStory(m) } }, icon("share"), "Postar nos Stories") : null,
        lastPhoto ? h("button", { class: "btn alt", on: { click: () => download(lastPhoto.blob, "expedicao-" + m.id + ".jpg") } }, "Baixar foto") : null,
        lastPhoto ? h("button", { class: "btn alt", on: { click: () => orderPrint(m) } }, icon("print"), "Imprimir minha foto · " + C.printPrice) : null,
        h("button", { class: "btn alt", on: { click: () => { closeSheet(); show("garden"); } } }, "Ver no jardim"))));
    if (cur === "feed") renderFeed();
  }
  function clubName() { const c = S.clubs.find(x => x.code === S.club); return c ? c.name : ""; }
  async function publishMission(m, xp, blob) {
    const photo = blob ? await thumbOf(blob, 540, 150000) : null;
    if (S.exp) {
      const e = S.exp; if (!e.places.includes(m.id)) e.places.push(m.id); if (!e.pets.includes(m.pet)) e.pets.push(m.pet);
      if (!m.place && !e.missions.includes(m.id)) e.missions.push(m.id); e.xp += xp; if (photo) e.photo = photo; save(); return;
    }
    const base = { nick: S.nick, pet: m.pet, pets: [m.pet], xp, places: 1, photo, club: S.club, clubName: clubName() };
    const post = m.place ? Object.assign(base, { kind: "place", title: m.name }) : Object.assign(base, { kind: "mission", missionId: m.id });
    DB.addPost(post).then(() => { if (cur === "feed") renderFeed(); }).catch(e => { if (e.message !== "rate") toast("Não deu para postar no feed agora"); });
  }
  function download(blob, name) {
    const a = h("a", { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* Story 1080×1920 com a foto, o selo da missão e o QR de convite. Gerado no aparelho. */
  async function shareStory(m) {
    if (!lastPhoto) return;
    const W = 1080, H = 1920, cv = h("canvas", { width: W, height: H }), c = cv.getContext("2d");
    c.fillStyle = "#f7f2e5"; c.fillRect(0, 0, W, H);
    const img = await createImageBitmap(lastPhoto.blob);
    c.save(); c.translate(W / 2, 820); c.rotate(-.03);
    c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(-430, -600, 880, 1220); c.fillStyle = "#fff"; c.fillRect(-440, -610, 880, 1220);
    c.save(); c.beginPath(); c.rect(-400, -570, 800, 1040); c.clip();
    const s = Math.max(800 / img.width, 1040 / img.height); c.drawImage(img, -img.width * s / 2, -570 + (1040 - img.height * s) / 2, img.width * s, img.height * s); c.restore();
    c.fillStyle = "#1f4a2e"; c.font = "700 44px system-ui"; c.fillText(C.season + " · " + C.city, -400, 545); c.restore();
    c.fillStyle = "#1f4a2e"; roundRect(c, 60, 1560, W - 120, 300, 44); c.fill();
    const url = shareUrl(), qr = qrcode(0, "M"); qr.addData(url); qr.make();
    const n = qr.getModuleCount(), q = 220, cell = q / n;
    c.fillStyle = "#fff"; roundRect(c, 100, 1600, q + 40, q + 40, 24); c.fill(); c.fillStyle = "#111";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) c.fillRect(120 + x * cell, 1620 + y * cell, Math.ceil(cell), Math.ceil(cell));
    c.fillStyle = "#fff";
    fit(c, S.done[m.id] === dayKey() ? "+" + m.xp + " XP" : "Expedição", 400, 1655, 580, 64, 700);
    fit(c, m.name, 400, 1715, 580, 40, 500);
    fit(c, "com o " + petName(m.pet), 400, 1765, 580, 40, 500);
    c.globalAlpha = .85; fit(c, "Jogue comigo: " + S.code, 400, 1822, 580, 34, 500); c.globalAlpha = 1;
    const blob = await new Promise(ok => cv.toBlob(ok, "image/jpeg", .9));
    const file = new File([blob], "story-" + m.id + ".jpg", { type: "image/jpeg" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: "Bora jogar comigo em " + C.city + "! " + url });
      else { download(blob, file.name); toast("Story salvo. Poste no Instagram!"); }
    } catch (_) {}
  }
  function fit(c, t, x, y, max, size, w) { do { c.font = w + " " + size + "px system-ui"; size -= 2; } while (c.measureText(t).width > max && size > 18); c.fillText(t, x, y); }
  function roundRect(c, x, y, w, hh, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  async function orderPrint(m) {
    try {
      const o = await DB.addOrder(m.id);
      openSheet(h("h2", { text: "Pedido de impressão" }), h("div", { class: "code", text: o.code }),
        h("p", { text: "Mostre este código e a foto no balcão de " + C.pickupPoints.join(" ou ") + ". O pagamento de " + C.printPrice + " é feito na retirada." }),
        h("p", { class: "demo", text: "Sua foto não é enviada para ninguém: ela fica no seu celular." }),
        h("button", { class: "btn", on: { click: closeSheet } }, "Entendi"));
    } catch (_) { toast("Não deu para registrar agora. Tente de novo."); }
  }

  /* =========================================================
     JARDIM: cuidar como tamagotchi, falar e ouvir a própria voz
     ========================================================= */
  let G = null;
  function renderGarden() {
    stopGarden(); tickPets(); save();
    const v = $("v-garden"), p = S.pets[S.sel];
    const careRows = CARE_LEVELS.map(level => h("div", { class: "cb", "data-care": level.key },
      h("span", { text: level.label }),
      h("div", { class: "care-meter", role: "meter", "aria-label": level.label, "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(p[level.key]) },
        h("i", { class: "care-fill", style: { width: p[level.key] + "%", background: level.color } })),
      h("b", { class: "care-value", text: p[level.key] + "%" })));
    const carePanel = h("section", { class: "carepanel", "aria-label": "Níveis de cuidado" },
      h("div", { class: "carepanel-head" }, h("b", { text: "Como estão os níveis?" }),
        h("button", { class: "care-close", "aria-label": "Fechar níveis", on: { click: () => setCarePanel(false) } }, "×")),
      h("div", { class: "carelevels" }, careRows));
    const careNotice = h("button", { class: "care-notice", type: "button", "aria-controls": "garden-care-panel",
      "aria-expanded": "false", on: { click: () => setCarePanel(!G.careOpen) } });
    carePanel.id = "garden-care-panel";
    const say = h("div", { class: "bubble gsay", text: mood(S.sel) });
    const chips = h("div", { class: "petchips" }, Object.keys(S.pets).map(id => h("button", { class: "petchip" + (id === S.sel ? " on" : ""),
      "aria-label": petName(id) + (id === S.sel ? ", mostrar níveis de cuidado" : ""),
      "aria-expanded": String(id === S.sel && G && G.careOpen),
      on: { click: () => {
        if (id === S.sel) setCarePanel(!G.careOpen);
        else { S.sel = id; save(); renderGarden(); }
      } } },
      h("img", { src: T[id], alt: "" }), needs(id) ? h("i") : null)));
    const cv = h("canvas", { class: "gcv" });
    const garden = h("div", { class: "garden" }, cv, h("div", { class: "gtop" }, chips, h("div", { class: "gtools" },
      h("button", { class: "gchip", "aria-label": "Mensagens do pet", on: { click: () => chatSheet(S.sel) } }, "💬", needs(S.sel) ? h("i", { class: "reddot" }) : null),
      h("button", { class: "gchip", on: { click: wardrobe } }, "Vestir"),
      h("span", { class: "gchip", text: "❤ " + Math.floor(p.bond || 1) }))), careNotice, carePanel, say,
      h("div", { class: "gbar" },
        h("button", { on: { click: openFood } }, icon("cookie"), "Alimentar"),
        h("button", { on: { click: () => care("love") } }, icon("heart"), "Carinho"),
        h("button", { class: "mic", on: { click: talk } }, icon("mic"), "Falar")));
    if (p.away) {
      const home = MISS.find(m => m.pet === S.sel) || MISS[0];
      garden.append(h("div", { class: "awaycard" }, h("img", { src: T[S.sel], alt: "" }), h("h3", { text: "O " + petName(S.sel) + " foi passear" }),
        h("p", { text: "Ele deixou um bilhete: \"Tô perto de " + home.partner + " esperando você. Faz uma missão que eu volto!\"" }),
        h("button", { class: "btn", on: { click: () => { show("map"); selectPlace(home); } } }, icon("nav"), "Buscar no mapa")));
    }
    put(v, garden);
    G = { say, careNotice, carePanel, careRows, garden, careOpen: false };
    refreshCareNotice();
    G.careTimer = setInterval(() => {
      if (cur !== "garden") return;
      tickPets(); save(); refreshBars(); sayG(mood(S.sel));
    }, 30000);
    startGarden(cv);
  }
  function urgentNeeds(p) {
    return CARE_LEVELS.filter(level => p[level.key] < CARE_THRESHOLDS[level.key])
      .sort((a, b) => p[a.key] / CARE_THRESHOLDS[a.key] - p[b.key] / CARE_THRESHOLDS[b.key]);
  }
  function refreshCareNotice() {
    if (!G || !G.careNotice) return;
    const level = urgentNeeds(S.pets[S.sel])[0];
    G.careNotice.hidden = !level;
    G.garden.classList.toggle("has-need", !!level);
    G.careNotice.setAttribute("aria-expanded", String(G.careOpen));
    G.careNotice.setAttribute("aria-label", level ? level.phrase + ". Mostrar os quatro níveis." : "Mostrar os quatro níveis.");
    put(G.careNotice, h("span", { class: "care-icon", "aria-hidden": "true", text: level ? level.icon : "" }),
      h("span", { class: "care-text", text: level ? level.phrase : "" }),
      h("span", { class: "care-arrow", "aria-hidden": "true", text: "⌄" }));
    G.carePanel.classList.toggle("open", G.careOpen);
    G.carePanel.setAttribute("aria-hidden", String(!G.careOpen));
    G.garden.querySelectorAll(".petchip").forEach((chip, i) => chip.setAttribute("aria-expanded", String(i === Object.keys(S.pets).indexOf(S.sel) && G.careOpen)));
  }
  function setCarePanel(open) {
    if (!G) return;
    G.careOpen = open;
    refreshCareNotice();
    if (!open) {
      const selectedAvatar = G.garden.querySelector(".petchip.on");
      (G.careNotice.hidden ? selectedAvatar : G.careNotice).focus();
    }
  }
  function mood(id) {
    const p = S.pets[id];
    if (p.away) return "…";
    const low = [["hunger", "Tô com fome! Tem comidinha na mochila?"], ["love", "Me dá um carinho?"], ["sleep", "Tô com soninho…"], ["joy", "Bora passear no centro?"]].sort((a, b) => p[a[0]] - p[b[0]])[0];
    if (p[low[0]] < 50) return low[1];
    return (p.bond || 1) >= 5 && new Date().getMinutes() % 2 ? "♪ Tô cantando pra você! ♪" : "Oi, " + S.nick.split(" ")[0] + "! Tô feliz aqui.";
  }
  function startGarden(cv) {
    if (!window.THREE) return;
    try {
      const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
      r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(cv.clientWidth, cv.clientHeight, false);
      const sc = new THREE.Scene(); Pets.lights(sc);
      const cam = new THREE.PerspectiveCamera(40, cv.clientWidth / cv.clientHeight, .1, 50); cam.position.set(0, 1.8, 6); cam.lookAt(0, .8, 0);
      const ground = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshStandardMaterial({ color: 0x8dc63f })); ground.rotation.x = -Math.PI / 2; sc.add(ground);
      const tree = new THREE.Group();
      [[1.1, 1.2, .9], [.85, 1, 1.6], [.6, .8, 2.2]].forEach(([rr, hh, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(rr, hh, 20), new THREE.MeshStandardMaterial({ color: 0x2f8a4a })); c.position.y = y; tree.add(c); });
      for (let i = 0; i < 12 + S.enfeites * 3 && i < 40; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), new THREE.MeshBasicMaterial({ color: [0xffd36b, 0xff6b5b, 0x8fd9ff][i % 3] })); const a = i * 2.4, y = .5 + (i % 10) * .19; b.position.set(Math.cos(a) * (1 - y / 3), y, Math.sin(a) * (1 - y / 3)); tree.add(b); }
      tree.position.set(1.9, 0, -1.2); sc.add(tree);
      const pet = Pets.make(S.sel, { eq: S.eq }); pet.position.set(-.3, 0, 0); if (S.pets[S.sel].away) pet.visible = false; sc.add(pet);
      G.r = r; G.sc = sc; G.cam = cam; G.pet = pet; G.anim = { k: "idle", t: 0 }; G.base = pet.rotation.y; G.taps = [];
      const loop = t => {
        G.raf = requestAnimationFrame(loop);
        const a = G.anim, dt = t - a.t;
        pet.position.y = 0; pet.rotation.z = 0; pet.rotation.y = G.base; Pets.tick(pet, t);
        if (a.k === "feliz" && dt < 900) pet.position.y += Math.abs(Math.sin(dt / 900 * Math.PI * 2)) * .5;
        else if (a.k === "tonto" && dt < 1500) { pet.rotation.y = G.base + dt / 80; pet.rotation.z = Math.sin(dt / 90) * .2; }

        r.render(sc, cam);
      };
      G.anim = { k: "idle", t: performance.now() }; Pets.play(pet, "pouso");
      G.raf = requestAnimationFrame(loop);
      cv.addEventListener("pointerup", () => {
        if (G.dragging || G.feeding) return; // soltou a comidinha no pássaro: não conta como toque
        const now = performance.now(); G.taps = G.taps.filter(x => now - x < 2000).concat(now);
        if (G.taps.length >= 5) { G.taps = []; G.anim = { k: "tonto", t: now }; sayG("Ei, tô tonto!"); } else { sing(pet); sayG("♪ Escuta o meu canto! ♪"); }
      });
    } catch (_) { cv.replaceWith(h("img", { class: "gimg", src: T[S.sel], alt: petName(S.sel) })); }
  }
  /* Vínculo: o pet manda mensagens (no máximo 2 por dia) e vive na hora real. */
  function homeOf(id) { return MISS.find(m => m.pet === id) || MISS[0]; }
  function routine(id) {
    const hr = new Date().getHours(), home = homeOf(id);
    if (id === "tamandua") return hr < 17 ? "De dia eu fico descansando num galho perto de " + home.partner + "." : "De noite eu saio procurando formigas perto de " + home.partner + "!";
    return hr < 11 ? "De manhã eu fico na mata, procurando comida. Hoje tô perto de " + home.partner + " 🌿" : hr < 18 ? "À tarde eu fico na sombra perto de " + home.partner + "." : "À noite eu fico vendo o pisca-pisca perto de " + home.partner + " ✨";
  }
  function needs(id) { const p = S.pets[id]; return p && (p.away || urgentNeeds(p).length > 0 || Date.now() - p.seen > 24 * HOUR); }
  function chatSheet(id) {
    const p = S.pets[id], home = homeOf(id), msgs = [];
    const t = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (p.away) msgs.push("Saí pra passear! Tô perto de " + home.partner + ". Me busca lá?");
    else msgs.push(routine(id));
    if (Date.now() - p.seen > 24 * HOUR) msgs.push("Ontem você não veio… fiquei te esperando 😢");
    if (p.hunger < CARE_THRESHOLDS.hunger) msgs.push("Tô com fome! Traz " + C.foods[SP[id].fav].label.toLowerCase() + "?");
    const thread = h("div", { class: "wa" }, msgs.slice(0, 3).map(m => h("div", { class: "wamsg", text: m })));
    const reply = (txt, ans, bond, after) => h("button", { class: "qr", on: { click: () => {
      thread.append(h("div", { class: "wamsg me", text: txt }), h("div", { class: "wamsg", text: ans }));
      const day = dayKey(); if (S.talk[id] !== day) { S.talk[id] = day; p.bond = Math.min(10, (p.bond || 1) + bond); save(); }
      if (after) setTimeout(after, 700); } } }, txt);
    openSheet(h("div", { class: "wahead" }, h("img", { src: T[id], alt: "" }), h("div", { style: { flex: "1" } }, h("b", { text: petName(id) }), h("small", { text: p.away ? "passeando" : "online" })),
        h("span", { class: "bondtag", text: "❤ Vínculo " + Math.floor(p.bond || 1) })), thread,
      h("div", { class: "card", style: { display: "flex", gap: ".5rem", alignItems: "center" } }, h("span", { text: "🎁" }),
        h("small", null, (p.bond || 1) >= 5 ? "Vínculo 5 alcançado: o " + petName(id) + " canta no seu jardim e usa o poder dele." : "Vínculo 5 libera: o " + petName(id) + " canta no seu jardim e usa o poder dele.")),
      h("div", { class: "qrs" },
        reply("Tô indo!", "Oba! Te espero aqui! 🥰", .6, () => { closeSheet(); show("map"); selectPlace(home); }),
        reply("Mais tarde", "Tá bom, mas não esquece de mim!", .2),
        reply("Onde você tá?", routine(id), .3)),
      h("p", { class: "demo", text: "Os pets mandam no máximo 2 mensagens por dia. Responder e visitar aumenta o vínculo." }));
  }
  /* iPhone pode bloquear o áudio que toca sozinho: botão para ouvir com um toque. */
  function listenBtn(url) {
    if (!G || !G.say) return;
    put(G.say, h("button", { class: "qr", on: { click: () => { const a = new Audio(url); a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; a.playbackRate = 1.6;
      a.onended = () => URL.revokeObjectURL(url); a.play().then(() => anim("falar", 2500)).catch(() => {}); sayG("…"); } } }, "🔊 Toque para ouvir"));
  }
  function stopGarden() {
    if (!G) return;
    if (G.raf) cancelAnimationFrame(G.raf);
    if (G.careTimer) clearInterval(G.careTimer);
    if (G.r) { G.r.dispose(); G.r.forceContextLoss && G.r.forceContextLoss(); }
    G = null;
  }
  function sayG(t) { if (G && G.say) G.say.textContent = t; }
  function anim(k, d) { if (!G || !G.pet) return; if (k === "falar") Pets.play(G.pet, "fala", d || 1500); else G.anim = { k, t: performance.now(), d: d || 1200 }; }
  /* Canto do surucuá: gravação real; o peito infla no ritmo do som. */
  let song = null;
  function sing(pet) {
    Pets.play(pet, "canto");
    try { song = song || new Audio("assets/audio/canto.mp3"); song.currentTime = 0; song.play().catch(() => {}); } catch (_) {}
  }
  function care(k) {
    const p = S.pets[S.sel]; if (p.away) return toast("Ele foi passear. Busque no mapa!");
    if (k === "love") { p.love = clamp(p.love + 15); p.joy = clamp(p.joy + 5); p.bond = Math.min(10, (p.bond || 1) + .2); sayG("Ai, que bom!"); }
    p.seen = Date.now(); save(); anim("feliz"); refreshBars();
  }
  function refreshBars() {
    if (!G || !G.careRows) return;
    const p = S.pets[S.sel];
    CARE_LEVELS.forEach(level => {
      const row = G.careRows.find(el => el.dataset.care === level.key);
      row.querySelector(".care-fill").style.width = p[level.key] + "%";
      row.querySelector(".care-meter").setAttribute("aria-valuenow", String(p[level.key]));
      row.querySelector(".care-value").textContent = p[level.key] + "%";
    });
    refreshCareNotice();
  }
  /* Alimentar (estilo Talking Tom): a bandeja de comidinhas abre no jardim. Toque numa comidinha
     (ou arraste até o surucuá) e ela voa até a boca dele; ele bica e come. Só conta quando chega na boca. */
  function openFood() {
    const p = S.pets[S.sel]; if (p.away) return toast("Ele foi passear. Busque no mapa!");
    if (!G || !G.garden) return;
    if (G.tray) { G.tray.remove(); G.tray = null; return; }
    const fav = SP[S.sel].fav, any = Object.keys(C.foods).some(k => S.food[k] > 0);
    const items = Object.entries(C.foods).map(([k, f]) => {
      const n = S.food[k] || 0;
      const it = h("button", { class: "fooditem" + (n ? "" : " off"), disabled: !n, "aria-label": f.label + ", " + n + (k === fav ? ", favorita" : "") },
        h("span", { class: "fruit", style: { background: "radial-gradient(circle at 35% 30%, #fff8 0 12%, " + f.color + " 13% 100%)" } }),
        h("small", { text: f.label }), h("b", { class: "foodn", text: "×" + n }), k === fav ? h("i", { class: "favstar", text: "★" }) : null);
      if (n) it.addEventListener("pointerdown", e => grabFood(e, k, it));
      return it;
    });
    G.tray = h("div", { class: "foodtray", role: "dialog", "aria-label": "Comidinhas" },
      h("div", { class: "traytop" }, h("b", { text: any ? "Toque ou arraste até o surucuá" : "A mochila está vazia" }),
        h("button", { class: "care-close", "aria-label": "Fechar comidinhas", on: { click: () => { G.tray.remove(); G.tray = null; } } }, "×")),
      h("div", { class: "trayrow" }, items),
      h("p", { class: "traynote" }, "Só se ganha nas missões, nunca com dinheiro. Não alimente bichos de verdade. ",
        h("button", { class: "linkish", on: { click: () => { G.tray.remove(); G.tray = null; show("map"); } } }, "Onde conseguir")));
    G.garden.append(G.tray);
  }
  function mouthXY() {
    if (!G || !G.pet || !G.cam || !G.r) return null;
    const v = Pets.mouth(G.pet); if (!v) return null;
    v.project(G.cam); const rc = G.r.domElement.getBoundingClientRect();
    return { x: rc.left + (v.x + 1) / 2 * rc.width, y: rc.top + (1 - v.y) / 2 * rc.height };
  }
  function fruitEl(k, x, y) {
    const f = h("span", { class: "fruit flyfruit", "aria-hidden": "true", style: { background: "radial-gradient(circle at 35% 30%, #fff8 0 12%, " + C.foods[k].color + " 13% 100%)" } });
    f.style.left = x + "px"; f.style.top = y + "px"; document.body.append(f); return f;
  }
  /* Segura a comidinha: arrastar leva junto com o dedo; soltar perto da boca (ou só tocar) faz ela voar até a boca. */
  function grabFood(e, k, it) {
    if (G.feeding || !(S.food[k] > 0)) return;
    e.preventDefault();
    const r0 = it.querySelector(".fruit").getBoundingClientRect(), sx = r0.left + r0.width / 2, sy = r0.top + r0.height / 2;
    const fr = fruitEl(k, sx, sy); let moved = false, x = sx, y = sy; G.dragging = true;
    const move = ev => { x = ev.clientX; y = ev.clientY; if (Math.hypot(x - sx, y - sy) > 10) moved = true; if (moved) { fr.style.left = x + "px"; fr.style.top = y + "px"; } };
    const up = () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      setTimeout(() => { if (G) G.dragging = false; }, 0);
      const m = mouthXY();
      if (!moved || (m && y < (G.tray ? G.tray.getBoundingClientRect().top : innerHeight) - 10)) flyToMouth(k, fr, moved ? x : sx, moved ? y : sy);
      else { fr.classList.add("back"); setTimeout(() => fr.remove(), 250); }
    };
    addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
  }
  function flyToMouth(k, fr, x0, y0) {
    G.feeding = true; const t0 = performance.now(), T = 750; let pecked = false;
    const step = now => {
      const m = mouthXY(); if (!m || !G || !G.pet) { fr.remove(); if (G) G.feeding = false; return; }
      const q = Math.min(1, (now - t0) / T), e = 1 - (1 - q) ** 2;
      const x = x0 + (m.x - x0) * e, y = y0 + (m.y - y0) * e - Math.sin(q * Math.PI) * 90;
      fr.style.left = x + "px"; fr.style.top = y + "px"; fr.style.transform = "translate(-50%,-50%) scale(" + (1 - .45 * q) + ")";
      if (!pecked && q > .55) { pecked = true; Pets.play(G.pet, "comer"); }
      if (Math.hypot(x - m.x, y - m.y) < 8 || q >= 1) { fr.remove(); G.feeding = false; feed(k); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function feed(k) {
    const p = S.pets[S.sel]; if (!(S.food[k] > 0)) return;
    S.food[k]--; const fav = SP[S.sel].fav === k;
    p.hunger = clamp(p.hunger + (fav ? 45 : 30)); p.joy = clamp(p.joy + 5); p.seen = Date.now(); S.daily.fed++;
    save(); sayG(fav ? "Minha favorita! Nham, obrigado!" : "Nham, gostoso!"); refreshBars();
    if (G && G.tray) { const open = G.tray; G.tray = null; open.remove(); openFood(); }
  }
  /* Repete a voz da pessoa mais aguda (estilo Talking Tom). O áudio não sai do aparelho. */
  let rec = null;
  async function talk(e) {
    const btn = e.currentTarget;
    if (S.pets[S.sel].away) return toast("Ele foi passear. Busque no mapa!");
    if (rec) { rec.stop(); return; }
    if (!window.MediaRecorder || !navigator.mediaDevices) { speak("Oi! Fala comigo!", 2); anim("falar", 1500); return; }
    let ms;
    try { ms = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (_) { toast("Sem microfone: o pet fala sozinho"); speak("Oi! Fala comigo!", 2); anim("falar", 1500); return; }
    const chunks = []; rec = new MediaRecorder(ms);
    rec.ondataavailable = ev => ev.data.size && chunks.push(ev.data);
    rec.onstop = () => {
      ms.getTracks().forEach(t => t.stop()); btn.classList.remove("rec"); rec = null;
      const url = URL.createObjectURL(new Blob(chunks, { type: chunks[0] ? chunks[0].type : "audio/webm" }));
      const a = new Audio(url); a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; a.playbackRate = 1.6;
      a.onended = () => URL.revokeObjectURL(url);
      a.onloadedmetadata = () => { if (isFinite(a.duration)) anim("falar", a.duration / a.playbackRate * 1000); };
      a.play().then(() => anim("falar", 2500)).catch(() => { URL.revokeObjectURL(url); listenBtn(url); });
      const p = S.pets[S.sel]; p.joy = clamp(p.joy + 8); p.seen = Date.now(); save(); refreshBars();
    };
    rec.start(); btn.classList.add("rec"); sayG("Tô ouvindo…");
    setTimeout(() => rec && rec.state === "recording" && rec.stop(), 4000);
  }

  /* =========================================================
     CAIXINHA DE NATAL (sem compra, sem dinheiro, chances visíveis)
     ========================================================= */
  function openBox() {
    const reels = [0, 1, 2].map(i => h("div", { class: "reel" }, h("img", { src: [T.surucua, "assets/medal-photo.png", "assets/medal-trophy.png"][i], alt: "" })));
    const btn = h("button", { class: "btn red", disabled: S.boxes < 1 }, icon("gift"), S.boxes < 1 ? "Sem caixinhas agora" : "Abrir caixinha");
    const status = h("p", { style: { textAlign: "center", margin: 0, color: "var(--mute)" } }, "Você tem ", h("b", { style: { color: "var(--red)" }, text: S.boxes + " caixinha" + (S.boxes === 1 ? "" : "s") }));
    btn.addEventListener("click", () => {
      if (S.boxes < 1) return;
      S.boxes--; save(); renderBox(); btn.disabled = true;
      const total = C.prizes.reduce((a, p) => a + p.chance, 0); let x = rnd() * total, prize = C.prizes[0];
      for (const p of C.prizes) { if (x < p.chance) { prize = p; break; } x -= p.chance; }
      reels.forEach(r => r.classList.add("spin"));
      setTimeout(() => {
        reels.forEach(r => r.classList.remove("spin"));
        const msg = applyPrize(prize); save(); renderBox();
        put(status, h("b", { text: msg })); btn.disabled = S.boxes < 1;
        btn.lastChild.textContent = S.boxes < 1 ? "Sem caixinhas agora" : "Abrir outra";
      }, 1200);
    });
    openSheet(h("h2", { style: { textAlign: "center" }, text: "Caixinha de Natal" }), status, h("div", { class: "reels" }, reels), btn,
      h("table", { class: "odds" }, h("tr", null, h("td", { colSpan: 2 }, h("b", { text: "Chances" }), " (sempre ganha algo)")), C.prizes.map(p => h("tr", null, h("td", { text: p.label }), h("td", { text: p.chance + "%" })))),
      h("p", { class: "odds", text: "Ganhe caixinhas fazendo missões e voltando no dia seguinte. Não existe compra de caixinha, e nela não tem cupom nem dinheiro." }));
  }
  function applyPrize(p) {
    if (p.xp) { addXp(p.xp); return "Você ganhou " + p.label + "!"; }
    if (p.id === "enfeite") { S.enfeites++; return "Novo enfeite na árvore do jardim!"; }
    if (p.id === "gorro") { if (S.acc.includes("gorro_dourado")) { addXp(25); return "Você já tem o gorro dourado: +25 XP!"; } S.acc.push("gorro_dourado"); S.eq.cabeca = "gorro_dourado"; S.gold = true; makeThumbs(); return "Gorro dourado para o surucuá!"; }
    const ks = Object.keys(C.foods), k = ks[rnd() * ks.length | 0]; S.food[k] = (S.food[k] || 0) + 1; return "+1 " + C.foods[k].label + " na mochila!";
  }

  /* =========================================================
     PASSE DE NATAL (trilha grátis; trilha paga só com visual, em breve)
     ========================================================= */
  function openPass() {
    const d = S.daily;
    openSheet(h("h2", { text: "Passe de Natal no Centro" }), h("p", { class: "demo", style: { textAlign: "left" }, text: "Nível " + level(S.xp) + " · até " + C.seasonEnd }),
      h("div", { class: "card", style: { padding: ".2rem .8rem" } }, C.daily.map(t => {
        const prog = Math.min(t.goal, d[t.id] | 0), ok = prog >= t.goal, got = d.claimed.includes(t.id);
        return h("div", { class: "task" + (got ? " got" : "") }, h("span", { class: "tk", text: got ? "✓" : "" }),
          h("span", { style: { flex: "1" } }, t.label, h("small", { text: " " + prog + "/" + t.goal })),
          ok && !got ? h("button", { class: "pillbtn", style: { flex: "none", padding: "0 .8rem" }, on: { click: () => { d.claimed.push(t.id); addXp(t.xp); save(); openPass(); } } }, "Pegar +" + t.xp) : h("b", { style: { color: "var(--green)" }, text: "+" + t.xp }));
      })),
      h("div", { class: "card soon" }, h("b", { text: "Padrinho da Serra" }), h("p", { style: { margin: ".2rem 0 .6rem", fontSize: ".85rem" }, text: "Gorro dourado, cachecol de festa, moldura de Story e luzinhas. Só itens de visual: nenhuma vantagem no jogo." }),
        h("button", { class: "btn red", on: { click: () => toast("Em breve: o pagamento será por um provedor seguro, nunca pelo app.") } }, "Virar Padrinho da Serra · [R$ __]")),
      h("p", { class: "demo", text: "Preço a definir. O app nunca pede dados de cartão." }));
  }

  /* =========================================================
     PERFIL: nível, convite, almanaque, conquistas, privacidade
     ========================================================= */
  function renderProfile() {
    const v = $("v-profile"), lv = level(S.xp), into = S.xp - (lv - 1) * 150;
    const owned = PETS.filter(p => S.pets[p]).length, lightsAll = MISS.filter(m => m.lights);
    const ach = [["Primeira foto", "assets/medal-photo.png", S.photos >= 1], ["Rota das luzes", "assets/medal-trophy.png", lightsAll.every(m => S.done[m.id] === dayKey())],
                 ["Nível 2", "assets/medal-level.png", lv >= 2], ["Todos os lugares", "assets/medal-trophy.png", MISS.every(m => S.ever[m.id])], ["Guarda-roupa completo", "assets/medal-photo.png", Object.keys(C.accessories).every(k => S.acc.includes(k))], ["7 dias seguidos", "assets/medal-level.png", S.streak.n >= 7]];
    put(v, 
      h("div", { class: "prof" }, h("img", { class: "lv", src: "assets/medal-level.png", alt: "" }),
        h("h2", null, S.nick + " · Nível " + lv), h("button", { class: "linkbtn", on: { click: editNick } }, "Trocar apelido"),
        h("div", { class: "meter lightmeter", style: { maxWidth: "15rem", margin: ".4rem auto" } }, h("span", { style: { width: (into / 150 * 100) + "%" } })),
        h("small", { style: { color: "var(--mute)" }, text: S.xp + " XP · Sequência: " + S.streak.n + " dia" + (S.streak.n === 1 ? "" : "s") })),
      h("div", { class: "wrap" },
        h("div", { class: "invite" }, h("small", { text: "Seu código de convite" }), h("div", { class: "c", text: S.code }),
          h("small", { text: "Quem entrar pelo seu link ganha 1 Caixinha de Natal." }),
          h("div", { class: "row", style: { marginTop: ".6rem" } }, h("button", { class: "btn", style: { background: "#fff", color: "var(--forest)" }, on: { click: invite } }, icon("share"), "Convidar"))),
        h("div", { class: "sec" }, "Guarda-roupa", h("small", { text: S.acc.length + " de " + Object.keys(C.accessories).length })),
        h("div", { class: "card who", style: { padding: ".6rem .8rem" } }, h("img", { src: T.surucua, alt: "", style: { width: "4rem" } }),
          h("div", { style: { flex: "1" } }, h("b", { text: SP.surucua.name }), h("small", null, h("i", { text: SP.surucua.sci }))),
          h("button", { class: "pillbtn", style: { flex: "none", padding: "0 .8rem" }, on: { click: () => ficha("surucua") } }, "Ficha")),
        h("div", { class: "accgrid" }, Object.entries(C.accessories).map(([k, a]) => { const has = S.acc.includes(k), from = MISS.find(m => m.acc === k || m.accNight === k);
          return h("button", { class: "acccell" + (has ? "" : " off") + (Object.values(S.eq).includes(k) ? " on" : ""), on: { click: wardrobe } },
            h("span", { class: "accico", text: { gorro: "🎅", laco: "🎀", cachecol: "🧣", pisca: "✨", oculos: "⭐", gorro_dourado: "👑" }[k] || "🎁" }),
            h("b", { text: a.label }), h("small", { text: has ? C.slots[a.slot] : "Ganhe em " + (!from ? "Caixinha de Natal" : from.anywhere ? (from.accNight === k ? "pinheiros à noite" : "pinheiros de dia") : from.partner) })); })),
        h("div", { class: "sec" }, "Conquistas", h("small", { text: ach.filter(a => a[2]).length + " de " + ach.length })),
        h("div", { class: "grid3" }, ach.map(([l, src, on]) => h("div", { class: "ach" + (on ? "" : " off") }, h("img", { src, alt: "" }), l))),
        h("div", { class: "sec" }, "Ajustes"),
        h("label", { class: "switch" }, "Letra grande", h("input", { type: "checkbox", checked: S.big, on: { change: toggleBig } })),
        h("label", { class: "switch" }, "Voz do guia", h("input", { type: "checkbox", checked: S.voice, on: { change: e => { S.voice = e.target.checked; save(); } } })),
        installBtn(),
        h("button", { class: "btn alt", style: { marginTop: ".6rem" }, on: { click: () => show("partner") } }, "Tenho uma loja"),
        h("button", { class: "btn alt", style: { marginTop: ".6rem" }, on: { click: privacy } }, "Privacidade e dados"),
        h("p", { class: "demo", text: DB.mode === "demo" ? "Modo demonstração: seus dados ficam só neste aparelho." : "Conectado. Você joga com um apelido, sem cadastro." })));
  }
  function ficha(p) {
    const sp = SP[p], has = !!S.pets[p], where = MISS.find(m => m.pet === p);
    openSheet(h("div", { class: "reward" }, h("img", { class: "pet", src: T[p], alt: "", style: has ? null : { filter: "brightness(0) opacity(.2)" } }),
      h("h2", { text: has ? sp.name : "Ainda não encontrado" }),
      has ? h("p", null, h("i", { text: sp.sci })) : null,
      h("p", { text: has ? sp.fact : "Encontre em " + (where ? where.partner : "uma missão") + "." }),
      has ? h("p", null, h("b", { text: "Habilidade: " }), sp.skill) : null,
      h("p", { class: "demo", text: sp.review ? "Lista de espécies em revisão por especialista. Modelo 3D: Anny." : "Revisado por especialista. Modelo 3D: Anny." }),
      has && PETS.length > 1 ? h("button", { class: "btn", disabled: S.pets[p].away, on: { click: () => { S.sel = p; save(); closeSheet(); toast(sp.name + " vai com você!"); } } }, S.sel === p ? "Já está com você" : "Levar na expedição") : null));
  }
  /* Guarda-roupa: veste um acessório por parte do corpo. */
  function wardrobe() {
    const prev = h("img", { src: T.surucua, alt: "Surucuá vestido", class: "pet" });
    const body = h("div");
    const draw = () => put(body, Object.entries(C.slots).map(([slot, label]) => {
      const mine = S.acc.filter(k => C.accessories[k].slot === slot);
      return h("div", { class: "slotrow" }, h("b", { text: label }), h("div", { class: "chips" },
        h("button", { class: "chip" + (!S.eq[slot] ? " on" : ""), on: { click: () => { delete S.eq[slot]; refresh(); } } }, "Nenhum"),
        mine.map(k => h("button", { class: "chip" + (S.eq[slot] === k ? " on" : ""), on: { click: () => { S.eq[slot] = k; refresh(); } } }, C.accessories[k].label)),
        mine.length ? null : h("small", { style: { color: "var(--mute)", alignSelf: "center" }, text: "Ganhe nas missões" })));
    }));
    const refresh = () => { save(); makeThumbs(); prev.src = T.surucua; draw(); if (cur === "garden") renderGarden(); };
    draw();
    openSheet(h("h2", { text: "Vestir o surucuá" }), h("div", { class: "reward" }, prev), body,
      h("p", { class: "demo", text: "Cada missão dá um acessório de Natal. O gorro dourado vem da Caixinha." }));
  }
  function editNick() {
    const inp = h("input", { type: "text", value: S.nick, maxLength: 20, autocomplete: "off", "aria-label": "Apelido" });
    openSheet(h("h2", { text: "Seu apelido" }), h("p", { class: "demo", style: { textAlign: "left" }, text: "Use um apelido, não seu nome completo. Só letras, números e espaço." }), inp,
      h("button", { class: "btn", style: { marginTop: ".6rem" }, on: { click: () => { const n = DB.cleanNick(inp.value); if (!n) return toast("Escolha um apelido"); S.nick = n; save(); closeSheet(); renderProfile(); } } }, "Salvar"));
  }
  async function invite() {
    const url = shareUrl(), text = "Bora jogar comigo as Expedições de " + C.city + "! Entra pelo link e ganha uma Caixinha de Natal.";
    try { if (navigator.share) await navigator.share({ text, url }); else { await navigator.clipboard.writeText(url); toast("Link copiado!"); } } catch (_) {}
  }
  function privacy() {
    openSheet(h("h2", { text: "Privacidade e dados" }),
      h("ul", { class: "plist" },
        h("li", { text: "No mapa, as ruas vêm do OpenStreetMap: o celular pede as imagens do mapa direto para eles." }),
        h("li", { text: "A câmera e o microfone são usados só no seu celular. O áudio nunca é gravado nem enviado." }),
        h("li", { text: "A foto da missão vai para o feed em tamanho pequeno, com seu apelido. Você pode apagar o post quando quiser." }),
        h("li", { text: "Na expedição, o trajeto é publicado sem os primeiros e os últimos " + C.routePrivacyMeters + " m e com precisão reduzida, para não mostrar onde você mora." }),
        h("li", { text: "Posts de outras pessoas podem ser denunciados no botão ⋯." }),
        h("li", { text: "Não pedimos nome, e-mail nem telefone para jogar." }),
        h("li", { text: "Não tem anúncio montado a partir do seu perfil, nem compra de caixinha." })),
      h("button", { class: "btn red", on: { click: confirmDelete } }, "Apagar meus dados"));
  }
  function confirmDelete() {
    openSheet(h("h2", { text: "Apagar tudo?" }), h("p", { text: "Isso apaga seus pets, XP, posts e pedidos, neste aparelho e no servidor. Não dá para desfazer." }),
      h("div", { class: "row" }, h("button", { class: "btn alt", on: { click: closeSheet } }, "Cancelar"),
        h("button", { class: "btn red", on: { click: async () => { try { await DB.deleteMine(); location.reload(); } catch (_) { toast("Não deu para apagar no servidor. Tente de novo."); } } } }, "Apagar")));
  }
  let deferredInstall = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; });
  function installBtn() {
    if (matchMedia("(display-mode: standalone)").matches) return null;
    return h("button", { class: "btn alt", style: { marginTop: ".6rem" }, on: { click: async () => {
      if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; return; }
      openSheet(h("h2", { text: "Leve o " + C.guideName + " com você" }), h("div", { class: "card", style: { fontSize: ".9rem" } },
        h("p", null, h("b", { text: "No iPhone: " }), "toque em Compartilhar e depois em \"Adicionar à Tela de Início\"."),
        h("p", null, h("b", { text: "No Android: " }), "abra o menu do navegador e toque em \"Instalar app\".")), h("button", { class: "btn", on: { click: closeSheet } }, "Entendi"));
    } } }, "Instalar na tela inicial");
  }
  function toggleBig() { S.big = !S.big; document.documentElement.classList.toggle("big", S.big); save(); if (cur === "profile") renderProfile(); }

  /* =========================================================
     PARA LOJAS: contato com consentimento + painel de exemplo
     ========================================================= */
  function renderPartner() {
    const store = h("input", { type: "text", maxLength: 60, placeholder: "Nome da loja", autocomplete: "organization", "aria-label": "Nome da loja" });
    const contact = h("input", { type: "text", maxLength: 60, placeholder: "WhatsApp ou e-mail da loja", autocomplete: "off", "aria-label": "Contato" });
    const consent = h("input", { type: "checkbox", id: "consent" });
    const send = h("button", { class: "btn", style: { marginTop: ".6rem" } }, "Quero minha loja no jogo");
    send.addEventListener("click", async () => {
      if (!consent.checked) return toast("Marque a autorização de contato");
      send.disabled = true;
      try { await DB.addLead({ store: store.value, contact: contact.value, consent: true }); store.value = contact.value = ""; consent.checked = false; toast("Recebido! Vamos falar com você."); }
      catch (_) { toast("Preencha o nome e o contato da loja"); }
      send.disabled = false;
    });
    put($("v-partner"), h("div", { class: "wrap", style: { paddingTop: ".8rem" } },
      h("button", { class: "linkbtn", on: { click: () => show("profile") } }, "‹ Voltar"),
      h("h2", { class: "ptitle", style: { fontSize: "1.3rem" }, text: "Leve sua loja para o jogo" }),
      h("p", { text: "Um bicho da serra passa a morar na sua loja. Quem faz a missão posta a sua vitrine e volta para buscar comidinha para o pet." }),
      h("div", { class: "card" }, store, contact,
        h("label", { class: "consent", htmlFor: "consent" }, consent, h("span", { text: "Autorizo a equipe do jogo a entrar em contato sobre o Plano Parceiro. Posso pedir a exclusão a qualquer momento." })), send),
      storeMissionCard(),
      h("div", { class: "sec" }, "Como fica o seu painel"),
      h("div", { class: "tiles" }, [["186", "fotos na loja"], ["58", "presentes entregues"], ["7.300", "alcance nos Stories"], ["12", "fotos para imprimir"]].map(([b, s]) => h("div", { class: "tile" }, h("b", { text: b }), h("span", { text: s })))),
      h("p", { class: "demo", text: "Dados de exemplo." }),
      h("div", { class: "vr" }, h("b", { style: { fontSize: "1.1rem" }, text: "Leve o jardim para a realidade virtual" }),
        h("p", { style: { margin: ".3rem 0 0", fontSize: ".88rem", opacity: ".9" }, text: "Óculos VR na sua loja: o cliente visita o jardim do surucuá em 3D enquanto espera. Fale com a gente pelo formulário acima." }))));
  }

  function storeMissionCard() {
    const models = [["foto", "Foto com produto"], ["visitas", "3 visitas no mês"], ["sabado", "Venha no sábado"], ["dupla", "Missão em dupla"]];
    let model = "foto", pet = "sabia";
    const chips = h("div", { class: "chips" }, models.map(([k, l]) => h("button", { class: "chip" + (k === model ? " on" : ""), "data-k": k, on: { click: () => { model = k; chips.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.k === k)); } } }, l)));
    const store = h("input", { type: "text", maxLength: 60, placeholder: "Nome da loja", autocomplete: "organization" });
    const subject = h("input", { type: "text", maxLength: 60, placeholder: "O que aparece na foto (ex.: Chocolatíssimo na vitrine)", autocomplete: "off" });
    const gift = h("input", { type: "text", maxLength: 60, placeholder: "Presente certo (ex.: 10% no Chocolatíssimo)", autocomplete: "off" });
    const petBtn = h("button", { class: "card who petpick", on: { click: () => { const ids = PETS; pet = ids[(ids.indexOf(pet) + 1) % ids.length]; put(petBtn, h("img", { src: T[pet], alt: "", style: { width: "2.8rem" } }), h("div", { style: { flex: "1", textAlign: "left" } }, h("b", { text: "Bicho da sua loja" }), h("small", { text: SP[pet].name + " · toque para trocar" }))); } } },
      h("img", { src: T[pet], alt: "", style: { width: "2.8rem" } }), h("div", { style: { flex: "1", textAlign: "left" } }, h("b", { text: "Bicho da sua loja" }), h("small", { text: SP[pet].name + " · toque para trocar" })));
    return h("div", { class: "card" }, h("b", { style: { fontSize: "1.1rem", color: "var(--forest)" }, text: "Criar missão (a loja faz sozinha)" }),
      h("div", { class: "sec", style: { marginTop: ".5rem" } }, "Modelo"), chips, store, subject,
      h("div", { class: "card", style: { padding: ".55rem .8rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".85rem" } },
        h("span", null, h("b", { text: "Exige compra?" }), h("br"), h("small", { style: { color: "var(--mute)" }, text: "Missões nunca exigem compra" })), h("span", { class: "fakeswitch", "aria-label": "Desligado" })),
      gift,
      h("div", { class: "row" },
        h("button", { class: "btn alt", on: { click: printQR } }, icon("print"), "Imprimir QR"),
        h("a", { class: "btn alt", href: "assets/tag.png", download: "tag-surucua.png" }, "Baixar a tag"),
        h("button", { class: "btn", on: { click: async () => {
          try { await DB.addStoreMission({ store: store.value, model, subject: subject.value, gift: gift.value, pet }); toast("Enviado! A equipe confere e publica em até 1 dia."); store.value = subject.value = gift.value = ""; }
          catch (_) { toast("Preencha o nome da loja e o que aparece na foto"); } } } }, "Publicar")),
      h("p", { class: "demo", text: "A missão aparece no jogo depois que a equipe confere a loja." }));
  }
  /* QR do balcão: leva ao jogo. Gerado no aparelho, para imprimir. */
  async function printQR() {
    const url = C.siteUrl || (location.origin + location.pathname), qr = qrcode(0, "M"); qr.addData(url); qr.make();
    const n = qr.getModuleCount(), cell = 20, pad = 80, W = n * cell + pad * 2, cv = h("canvas", { width: W, height: W + 140 }), c = cv.getContext("2d");
    c.fillStyle = "#fff"; c.fillRect(0, 0, cv.width, cv.height); c.fillStyle = "#111";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) c.fillRect(pad + x * cell, pad + y * cell, cell, cell);
    c.fillStyle = "#1f4a2e"; c.font = "700 44px system-ui"; c.textAlign = "center"; c.fillText("Aponte a câmera e jogue!", W / 2, W + 70);
    const blob = await new Promise(ok => cv.toBlob(ok, "image/png")); download(blob, "qr-balcao.png");
  }

  /* =========================================================
     BOAS-VINDAS (3 passos) e convite por link
     ========================================================= */
  function onboarding() {
    const o = $("onb"); let step = 0;
    const nick = h("input", { type: "text", value: S.nick, maxLength: 20, autocomplete: "off", "aria-label": "Apelido" });
    const steps = [
      () => [h("img", { src: T.surucua, alt: "", class: "onbimg" }), h("h2", { text: "Oi! Eu sou o " + C.guideName }),
        h("p", { text: "Visite lugares de " + C.city + ", encontre bichos da serra em realidade aumentada e cuide deles no seu jardim." })],
      () => [h("h2", { text: "Seus dados ficam com você" }),
        h("ul", { class: "plist", style: { textAlign: "left" } }, h("li", { text: "Você joga com um apelido, sem cadastro." }), h("li", { text: "Você decide o que posta e pode apagar quando quiser." }), h("li", { text: "Seu trajeto aparece sem o começo e o fim." })),
        h("button", { class: "opt", "aria-pressed": String(S.big), on: { click: e => { toggleBig(); e.currentTarget.setAttribute("aria-pressed", String(S.big)); } } }, h("span", { class: "dot" }), "Usar letra grande")],
      () => [h("h2", { text: "Seu apelido" }), h("p", { text: "Ele aparece no feed. Use um apelido, não seu nome completo." }), nick,
        S.ref ? h("p", { class: "coupon", text: "Você veio por um convite: ganhou 1 Caixinha!" }) : null]
    ];
    const draw = () => {
      const last = step === steps.length - 1;
      put(o, ...steps[step](), h("div", { class: "dots" }, steps.map((_, i) => h("i", { class: i === step ? "on" : "" }))),
        h("button", { class: "btn", style: { maxWidth: "20rem", marginTop: "1rem" }, on: { click: () => {
          if (!last) { step++; return draw(); }
          S.nick = DB.cleanNick(nick.value) || S.nick; S.onb = true; save(); o.classList.remove("on"); show("feed");
        } } }, last ? "Começar" : "Próximo"));
    };
    o.classList.add("on"); draw();
  }
  function readInvite() {
    const c = new URLSearchParams(location.search).get("c");
    if (c && /^[A-Z2-9]{6}$/.test(c) && c !== S.code && !S.ref) { S.ref = c; S.boxes++; save(); }
    if (c) history.replaceState(null, "", location.pathname);
  }

  /* Missões criadas pelas lojas e aprovadas pela equipe (status 'ok' no Firestore). */
  async function loadStoreMissions() {
    const list = await DB.listStoreMissions();
    for (const d of list) {
      const id = ("sm-" + String(d.docId || "").toLowerCase().replace(/[^a-z0-9]/g, "")).slice(0, 24);
      if (byId(id) || typeof d.store !== "string" || typeof d.subject !== "string") continue;
      const x = typeof d.mapX === "number" ? Math.min(.95, Math.max(.05, d.mapX)) : .5, y = typeof d.mapY === "number" ? Math.min(.95, Math.max(.05, d.mapY)) : .5;
      MISS.push({ id, name: DB.cleanName(d.subject, 40), partner: DB.cleanName(d.store, 40), task: "Foto com " + DB.cleanName(d.subject, 40) + " (não precisa comprar)", xp: 60,
        pet: SP[d.pet] ? d.pet : "sabia", food: "sementes", lights: false, mapX: x, mapY: y, lat: typeof d.lat === "number" ? d.lat : null, lng: typeof d.lng === "number" ? d.lng : null,
        gift: typeof d.gift === "string" ? d.gift.slice(0, 60) : "", tip: "Chegamos em " + DB.cleanName(d.store, 40) + "! Me deixa aparecer na foto." });
    }
  }

  /* ---------- início ---------- */
  async function boot() {
    loadState();
    document.documentElement.classList.toggle("big", !!S.big);
    await DB.init();
    readInvite(); newDay(); tickPets(); save();
    await Pets.preload().catch(() => {});
    makeThumbs();
    loadStoreMissions();
    if (S.exp) expWatch();
    renderTabs(); renderBox();
    if (!S.onb) onboarding(); else show("feed");
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { save(); if ($("v-cam").classList.contains("on")) closeCam(); } });
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  boot();
})();
