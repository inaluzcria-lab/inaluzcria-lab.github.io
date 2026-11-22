/* =========================================================
   Dados do jogo.
   - Sem configuração do Firebase: modo demonstração, tudo fica só neste aparelho.
   - Com Firebase: login anônimo + Firestore. As regras em firestore.rules
     validam cada gravação no servidor; o app nunca confia só no cliente.
   Privacidade: câmera, microfone e localização bruta ficam no aparelho.
   Versão pública: jogar não exige conta. Publicar (posts e lugares) exige conta Google
   E maioridade verificada por fonte confiável (claim "ageVerified" gravada por backend;
   o app nunca grava isso). Sem essa integração, publicar fica bloqueado aqui e nas regras.
   Post público (posts/{id}, v: 2): só apelido, missão, XP, km, tempo e lugares.
   Dono, foto e trajeto ficam em posts_private/{id}, que só o dono lê.
   ========================================================= */
(function () {
  "use strict";
  const V = "10.12.2", CDN = "https://www.gstatic.com/firebasejs/" + V + "/";
  const PREFIX = "exp_";
  const LS = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(PREFIX + k)); return v === null ? d : v; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); return true; } catch (_) { return false; } },
    clear() { try { Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k)); } catch (_) {} }
  };
  const SLUG = /^[a-z0-9-]{2,24}$/, CLUB = /^[A-Z2-9]{6}$/, DOCID = /^[A-Za-z0-9]{6,40}$/;
  const PHOTO = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
  const MIN_GAP_MS = 30000;
  /* checkin: expedição com menos de 200 m (sem trilha); encounter: ave virtual num lugar (foto ou aviso);
     sighting: foto de ave de verdade, com a marca real ("Vi na vida real"). */
  const KINDS = ["mission", "expedition", "place", "checkin", "encounter", "sighting"];

  function load(src) {
    return new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous"; s.referrerPolicy = "no-referrer";
      s.onload = ok; s.onerror = () => no(new Error("falha ao carregar " + src));
      document.head.appendChild(s);
    });
  }
  const str = (s, n) => String(s == null ? "" : s).normalize("NFC").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n);
  function cleanNick(s) { return String(s || "").normalize("NFC").replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim().slice(0, 20); }
  function cleanName(s, n) { return String(s || "").normalize("NFC").replace(/[^\p{L}\p{N} '’.-]/gu, "").replace(/\s+/g, " ").trim().slice(0, n || 40); }
  function randId(n) {
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", a = new Uint8Array(n);
    crypto.getRandomValues(a); return Array.from(a, x => abc[x % abc.length]).join("");
  }
  const toMs = t => (t && typeof t.toMillis === "function") ? t.toMillis() : (typeof t === "number" ? t : Date.now());
  const num = (v, lo, hi) => (typeof v === "number" && isFinite(v)) ? Math.max(lo, Math.min(hi, v)) : 0;
  const fv = () => firebase.firestore.FieldValue;

  const DB = { mode: "demo", uid: null, fs: null, LS, cleanNick, cleanName, randId };
  const user = () => (DB.mode === "firebase" && firebase.auth().currentUser) || null;
  const hasGoogle = u => !!u && !u.isAnonymous && u.providerData.some(p => p && p.providerId === "google.com");

  DB.init = async function () {
    DB.uid = LS.get("uid", null) || ("local" + randId(10));
    LS.set("uid", DB.uid);
    const cfg = window.CONFIG && window.CONFIG.firebase;
    if (!cfg) return DB.mode;
    try {
      await load(CDN + "firebase-app-compat.js");
      await load(CDN + "firebase-auth-compat.js");
      await load(CDN + "firebase-firestore-compat.js");
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const cred = firebase.auth().currentUser ? { user: firebase.auth().currentUser } : await firebase.auth().signInAnonymously();
      DB.uid = cred.user.uid; DB.fs = firebase.firestore(); DB.mode = "firebase";
    } catch (e) {
      console.warn("Firebase indisponível; seguindo em modo demonstração.", e && e.message);
      DB.mode = "demo";
    }
    return DB.mode;
  };

  /* Limpa e valida um post antes de gravar (o servidor valida de novo). */
  function cleanPost(p) {
    const kind = KINDS.includes(p.kind) ? p.kind : "mission";
    const o = { kind, nick: cleanNick(p.nick) || "Jogador", pet: p.pet, xp: Math.round(num(p.xp, 0, 2000)), claps: 0 };
    if (!SLUG.test(o.pet)) throw new Error("invalid");
    if (p.missionId) { if (!SLUG.test(p.missionId)) throw new Error("invalid"); o.missionId = p.missionId; }
    if (p.title) o.title = str(p.title, 60);
    if (Array.isArray(p.missions)) o.missions = p.missions.filter(x => SLUG.test(x)).slice(0, 20);
    if (Array.isArray(p.pets)) o.pets = p.pets.filter(x => SLUG.test(x)).slice(0, 10);
    if (p.km) o.km = Math.round(num(p.km, 0, 100) * 100) / 100;
    if (p.mins) o.mins = Math.round(num(p.mins, 0, 1440));
    if (p.places) o.places = Math.round(num(p.places, 0, 50));
    if (typeof p.photo === "string" && p.photo.length <= 160000 && PHOTO.test(p.photo)) o.photo = p.photo;
    if (Array.isArray(p.photos)) { const ph = p.photos.filter(x => typeof x === "string" && x.length <= 100000 && PHOTO.test(x)).slice(0, 3); if (ph.length) o.photos = ph; }
    if (kind === "sighting") o.real = p.real === true;
    if (kind !== "checkin" && Array.isArray(p.route) && p.route.length >= 4) o.route = p.route.slice(0, 240).map(x => Math.round(num(x, -180, 180) * 1e4) / 1e4);
    if (p.club && CLUB.test(p.club)) { o.club = p.club; o.clubName = str(p.clubName, 24) || "Clube"; }
    return o;
  }

  /* ---------- conta e permissão para publicar ---------- */
  /* Pode publicar? Só com Google + claim ageVerified (gravada por backend confiável, nunca pelo app). */
  DB.publishStatus = async function () {
    if (DB.mode !== "firebase") return { mode: DB.mode, google: false, verified: false, ok: false, reason: "offline" };
    const u = user(), google = hasGoogle(u);
    let verified = false;
    if (google) { try { const t = await u.getIdTokenResult(true); verified = t.claims.ageVerified === true; } catch (_) {} }
    return { mode: DB.mode, google, verified, ok: google && verified, reason: !google ? "google" : !verified ? "age" : null };
  };
  /* Entra com Google só quando a pessoa tenta publicar. Conta anônima: vincula (mesmo UID, mantém os posts).
     Resultado: { ok } | { cancelled } | { conflict, credential, email } | { error } */
  DB.linkGoogle = async function () {
    if (DB.mode !== "firebase") return { error: "offline" };
    const provider = new firebase.auth.GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" });
    const u = user();
    try {
      if (u && u.isAnonymous) await u.linkWithPopup(provider);
      else if (!hasGoogle(u)) await firebase.auth().signInWithPopup(provider);
      DB.uid = user().uid; return { ok: true };
    } catch (e) {
      const code = e && e.code || "";
      if (["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"].includes(code)) return { cancelled: true };
      if (code === "auth/credential-already-in-use" || code === "auth/email-already-in-use")
        return { conflict: true, credential: firebase.auth.GoogleAuthProvider.credentialFromError ? firebase.auth.GoogleAuthProvider.credentialFromError(e) : e.credential, email: (e.customData && e.customData.email) || e.email || "" };
      if (code === "auth/popup-blocked") return { error: "popup" };
      return { error: code || "erro" };
    }
  };
  /* Conflito: a conta Google já pertence a outro UID. Só troca de conta se a pessoa escolher.
     Nada é mesclado nem apagado: o perfil anônimo anterior continua existindo no servidor. */
  DB.switchToGoogle = async function (credential) {
    if (DB.mode !== "firebase" || !credential) return { error: "invalid" };
    try { const r = await firebase.auth().signInWithCredential(credential); DB.uid = r.user.uid; return { ok: true }; }
    catch (e) { return { error: (e && e.code) || "erro" }; }
  };
  DB.account = function () { const u = user(); return { mode: DB.mode, anonymous: !u || u.isAnonymous, google: hasGoogle(u) }; };
  /* O feed público só abre quando a equipe grava config/public { feedOpen: true } (moderação pronta). */
  DB.feedOpen = async function () {
    if (DB.mode !== "firebase") return false;
    try { const d = await DB.fs.doc("config/public").get(); return d.exists && d.data().feedOpen === true; } catch (_) { return false; }
  };

  DB.addPost = async function (p) {
    const st = await DB.publishStatus();
    if (!st.ok) throw new Error("blocked");
    const last = LS.get("lastPost", 0);
    if (Date.now() - last < MIN_GAP_MS) throw new Error("rate");
    const o = cleanPost(p);
    LS.set("lastPost", Date.now());
    const ts = fv().serverTimestamp();
    const userRef = DB.fs.doc("users/" + DB.uid), postRef = DB.fs.collection("posts").doc(), privRef = DB.fs.doc("posts_private/" + postRef.id);
    const pub = Object.assign({}, o); delete pub.photo; delete pub.photos; delete pub.route;
    const priv = { uid: DB.uid, createdAt: ts }; if (o.photo) priv.photo = o.photo; if (o.photos) priv.photos = o.photos; if (o.route) priv.route = o.route;
    const commit = async withStats => {
      const b = DB.fs.batch();
      b.set(userRef, { nick: o.nick, lastPostAt: ts, lastPostId: postRef.id }, { merge: true });
      b.set(postRef, Object.assign({ v: 2, createdAt: ts }, pub));
      b.set(privRef, priv);
      if (withStats) b.update(DB.fs.doc("stats/city"), { photos: fv().increment(1) });
      await b.commit();
    };
    try { await commit(true); } catch (_) { await commit(false); }
    return Object.assign({ id: postRef.id, uid: DB.uid, mine: true, createdAt: Date.now() }, o);
  };

  function readPost(id, x, priv) {
    priv = priv || {};
    const photo = priv.photo || x.photo, route = priv.route || x.route;
    return { id, mine: !!priv.uid || (!!x.uid && x.uid === DB.uid), uid: priv.uid || x.uid || null, kind: KINDS.includes(x.kind) ? x.kind : "mission", nick: cleanNick(x.nick), missionId: SLUG.test(x.missionId || "") ? x.missionId : null,
      missions: Array.isArray(x.missions) ? x.missions.filter(v => SLUG.test(v)) : [], title: str(x.title, 60), pet: x.pet, pets: Array.isArray(x.pets) ? x.pets.filter(v => SLUG.test(v)) : [],
      xp: x.xp | 0, km: num(x.km, 0, 100), mins: x.mins | 0, places: x.places | 0, claps: x.claps | 0,
      photo: typeof photo === "string" && PHOTO.test(photo) ? photo : null, route: Array.isArray(route) ? route.filter(v => typeof v === "number") : null,
      photos: Array.isArray(priv.photos) ? priv.photos.filter(v => typeof v === "string" && PHOTO.test(v)).slice(0, 3) : [], real: x.real === true,
      club: CLUB.test(x.club || "") ? x.club : null, clubName: str(x.clubName, 24), createdAt: toMs(x.createdAt) };
  }
  /* Meus posts (novos e antigos), com foto e trajeto que só eu posso ler. */
  async function myPosts() {
    const out = new Map();
    const ps = await DB.fs.collection("posts_private").where("uid", "==", DB.uid).limit(60).get();
    for (const d of ps.docs) { try { const pd = await DB.fs.doc("posts/" + d.id).get(); if (pd.exists) out.set(d.id, readPost(d.id, pd.data(), d.data())); } catch (_) {} }
    try { const old = await DB.fs.collection("posts").where("uid", "==", DB.uid).limit(60).get(); old.docs.forEach(d => out.set(d.id, readPost(d.id, d.data()))); } catch (_) {}
    return [...out.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
  /* Feed fechado: só os meus. Feed aberto: posts públicos v2 (sem dono, foto e trajeto) + os meus completos. */
  DB.listPosts = async function (n) {
    if (DB.mode === "firebase") {
      const mine = await myPosts().catch(() => []);
      if (!(await DB.feedOpen())) return mine;
      const s = await DB.fs.collection("posts").where("v", "==", 2).orderBy("createdAt", "desc").limit(n || 60).get();
      const byId = new Map(mine.map(p => [p.id, p]));
      return s.docs.map(d => byId.get(d.id) || readPost(d.id, d.data())).concat(mine.filter(p => !s.docs.some(d => d.id === p.id)));
    }
    return LS.get("posts", []).map(x => Object.assign(readPost(x.id, x), { mine: true }));
  };
  /* Apaga um post meu: aplausos dele, a parte privada e a pública. Sempre permitido ao dono. */
  DB.deletePost = async function (id) {
    if (DB.mode === "firebase") {
      if (!DOCID.test(id)) return;
      const ref = DB.fs.doc("posts/" + id);
      try { const cs = await ref.collection("claps").get(); for (const c of cs.docs) await c.ref.delete(); } catch (_) {}
      const b = DB.fs.batch(); b.delete(DB.fs.doc("posts_private/" + id)); b.delete(ref); await b.commit();
      return;
    }
    LS.set("posts", LS.get("posts", []).filter(p => p.id !== id));
  };
  DB.report = async function (postId, reason) {
    const reasons = ["pessoa", "ofensivo", "perigo", "outro"];
    if (!reasons.includes(reason)) reason = "outro";
    if (DB.mode === "firebase" && DOCID.test(postId)) await DB.fs.collection("reports").add({ postId, reason, uid: DB.uid, createdAt: fv().serverTimestamp() });
    const hidden = LS.get("hidden", []); hidden.push(postId); LS.set("hidden", hidden.slice(-200));
  };

  /* Aplauso: um por pessoa por post, garantido pelas regras (documento claps/{uid}). */
  DB.clap = async function (postId, on) {
    if (DB.mode !== "firebase" || !DOCID.test(postId)) return;
    const postRef = DB.fs.doc("posts/" + postId), clapRef = postRef.collection("claps").doc(DB.uid);
    const b = DB.fs.batch();
    b.update(postRef, { claps: fv().increment(on ? 1 : -1) });
    if (on) b.set(clapRef, { at: fv().serverTimestamp() }); else b.delete(clapRef);
    await b.commit();
  };

  DB.cityCount = async function () {
    const C = window.CONFIG;
    if (DB.mode === "firebase") {
      try { const d = await DB.fs.doc("stats/city").get(); return d.exists ? (d.data().photos | 0) : 0; } catch (_) { return 0; }
    }
    return (C.cityBase | 0) + LS.get("cityPhotos", 0);
  };

  /* ---------- lugares marcados pelos jogadores ---------- */
  function readPlace(id, x) {
    const C = window.CONFIG;
    return { id, uid: x.uid, nick: cleanNick(x.nick), name: cleanName(x.name), type: C.placeTypes[x.type] ? x.type : "praca",
      lat: num(x.lat, -90, 90), lng: num(x.lng, -180, 180), confirms: x.confirms | 0,
      photo: typeof x.photo === "string" && PHOTO.test(x.photo) ? x.photo : null, createdAt: toMs(x.createdAt) };
  }
  DB.listPlaces = async function () {
    const C = window.CONFIG, limit = Date.now() - C.placeDays * 864e5;
    let all;
    if (DB.mode === "firebase") {
      const s = await DB.fs.collection("places").orderBy("createdAt", "desc").limit(200).get();
      all = s.docs.map(d => readPlace(d.id, d.data()));
    } else all = LS.get("places", []).map(x => readPlace(x.id, x));
    return all.filter(p => p.confirms >= C.placeConfirmations || p.createdAt >= limit);
  };
  DB.addPlace = async function ({ nick, name, type, lat, lng, photo }) {
    const C = window.CONFIG;
    if (DB.mode === "firebase" && !(await DB.publishStatus()).ok) throw new Error("blocked");
    name = cleanName(name, 40);
    if (name.length < 2 || !C.placeTypes[type]) throw new Error("invalid");
    const o = { nick: cleanNick(nick) || "Jogador", name, type, lat: Math.round(num(lat, -90, 90) * 1e4) / 1e4, lng: Math.round(num(lng, -180, 180) * 1e4) / 1e4, confirms: 1 };
    if (typeof photo === "string" && photo.length <= 120000 && PHOTO.test(photo)) o.photo = photo;
    if (DB.mode === "firebase") {
      const ts = fv().serverTimestamp(), ref = DB.fs.collection("places").doc(), b = DB.fs.batch();
      b.set(DB.fs.doc("users/" + DB.uid), { nick: o.nick, lastPlaceAt: ts }, { merge: true });
      b.set(ref, Object.assign({ uid: DB.uid, createdAt: ts }, o));
      b.set(ref.collection("visits").doc(DB.uid), { at: ts });
      await b.commit();
      return Object.assign({ id: ref.id, uid: DB.uid, createdAt: Date.now() }, o);
    }
    const p = Object.assign({ id: "l" + Date.now(), uid: DB.uid, createdAt: Date.now() }, o);
    let all = [p].concat(LS.get("places", [])).slice(0, 30);
    while (!LS.set("places", all) && all.length > 1) all = all.slice(0, -1);
    return p;
  };
  /* Confirma a visita: uma por pessoa por lugar (documento visits/{uid}). */
  DB.visitPlace = async function (id, demoFriend) {
    if (DB.mode === "firebase") {
      if (!DOCID.test(id)) throw new Error("invalid");
      const ref = DB.fs.doc("places/" + id), b = DB.fs.batch();
      b.update(ref, { confirms: fv().increment(1) });
      b.set(ref.collection("visits").doc(DB.uid), { at: fv().serverTimestamp() });
      await b.commit(); return;
    }
    const visits = LS.get("visits", []), key = id + (demoFriend ? ":" + randId(4) : "");
    if (!demoFriend && visits.includes(id)) throw new Error("already");
    visits.push(key); LS.set("visits", visits.slice(-300));
    LS.set("places", LS.get("places", []).map(p => p.id === id ? Object.assign(p, { confirms: (p.confirms | 0) + 1 }) : p));
  };
  DB.hasVisited = async function (id) {
    if (DB.mode === "firebase") { try { return (await DB.fs.doc("places/" + id + "/visits/" + DB.uid).get()).exists; } catch (_) { return false; } }
    const p = LS.get("places", []).find(x => x.id === id);
    return (p && p.uid === DB.uid) || LS.get("visits", []).includes(id);
  };

  /* "Este lugar é meu?": pedido do dono, conferido pela equipe antes de valer. */
  DB.addClaim = async function ({ placeId, store, contact, plan, consent }) {
    store = str(store, 60); contact = str(contact, 60);
    if (!store || !contact || consent !== true || !["gratis", "parceiro"].includes(plan)) throw new Error("invalid");
    const o = { placeId: String(placeId || "").slice(0, 40), store, contact, plan, consent: true };
    if (DB.mode === "firebase") await DB.fs.collection("claims").add(Object.assign({ createdAt: fv().serverTimestamp() }, o));
    else { const all = LS.get("claims", []); all.unshift(Object.assign({ createdAt: Date.now() }, o)); LS.set("claims", all.slice(0, 20)); }
  };
  /* Missão criada pela loja: entra como "pendente" e só aparece depois da aprovação da equipe. */
  DB.addStoreMission = async function ({ store, model, subject, gift, pet }) {
    const models = ["foto", "visitas", "sabado", "dupla"];
    const o = { store: str(store, 60), model: models.includes(model) ? model : "foto", subject: str(subject, 60), gift: str(gift, 60), pet: SLUG.test(pet) ? pet : "surucua", status: "pending" };
    if (!o.store || !o.subject) throw new Error("invalid");
    if (DB.mode === "firebase") await DB.fs.collection("storeMissions").add(Object.assign({ uid: DB.uid, createdAt: fv().serverTimestamp() }, o));
    else { const all = LS.get("storeMissions", []); all.unshift(Object.assign({ createdAt: Date.now() }, o)); LS.set("storeMissions", all.slice(0, 20)); }
  };
  DB.listStoreMissions = async function () {
    if (DB.mode !== "firebase") return [];
    try { const s = await DB.fs.collection("storeMissions").where("status", "==", "ok").limit(30).get(); return s.docs.map(d => Object.assign({ docId: d.id }, d.data())); }
    catch (_) { return []; }
  };

  /* Pedido de impressão: só um código. A foto é mostrada no balcão, nunca enviada. */
  /* Descoberta compartilhada: quando alguém encontra a própria ave num lugar, a comida daquela espécie
     passa a aparecer ali para as outras pessoas. Guarda só lugar, espécie e hora (nada de quem achou). */
  const SPAWN_DAYS = 7;
  DB.markFound = async function (place, species) {
    if (!SLUG.test(place) || !SLUG.test(species)) return;
    if (DB.mode !== "firebase") { const all = LS.get("spawns", {}); all[place + "_" + species] = { place, species, at: Date.now() }; LS.set("spawns", all); return; }
    await DB.fs.doc("spawns/" + place + "_" + species).set({ place, species, at: fv().serverTimestamp() });
  };
  DB.listSpawns = async function (place) {
    if (!SLUG.test(place)) return [];
    const since = Date.now() - SPAWN_DAYS * 864e5;
    if (DB.mode !== "firebase") return Object.values(LS.get("spawns", {})).filter(x => x.place === place && x.at >= since && SLUG.test(x.species)).map(x => x.species);
    const s = await DB.fs.collection("spawns").where("place", "==", place).limit(20).get();
    return s.docs.map(d => d.data()).filter(x => SLUG.test(x.species || "") && toMs(x.at) >= since).map(x => x.species);
  };

  DB.addOrder = async function (missionId) {
    const code = randId(6), o = { code, missionId, createdAt: Date.now() };
    if (DB.mode === "firebase" && SLUG.test(missionId)) {
      await DB.fs.collection("orders").add({ uid: DB.uid, code, missionId, createdAt: fv().serverTimestamp() });
    }
    const all = LS.get("orders", []); all.unshift(o); LS.set("orders", all.slice(0, 20));
    return o;
  };

  /* Contato de lojista (dado de empresa, com consentimento). Ninguém lê pelo app. */
  DB.addLead = async function ({ store, contact, consent, birdChoice, birdName }) {
    store = str(store, 60); contact = str(contact, 60);
    if (!store || !contact || consent !== true) throw new Error("invalid");
    const choices = ["surucua", "tucano", "other"];
    const o = { store, contact, consent: true };
    if (choices.includes(birdChoice)) {
      o.birdChoice = birdChoice;
      if (birdChoice === "other") {
        o.birdName = str(birdName, 60);
        if (!o.birdName) throw new Error("invalid");
      }
    } else if (birdChoice != null) {
      throw new Error("invalid");
    }
    if (DB.mode === "firebase") await DB.fs.collection("leads").add(Object.assign({ createdAt: fv().serverTimestamp() }, o));
    else { const all = LS.get("leads", []); all.unshift(Object.assign({ createdAt: Date.now() }, o)); LS.set("leads", all.slice(0, 20)); }
  };

  /* Apagar meus dados. Primeiro o servidor; o aparelho só é limpo depois que TUDO no servidor deu certo.
     Cada etapa pode ser repetida com segurança (apagar o que já sumiu não dá erro).
     opts.clapped: ids de posts que eu aplaudi (para tirar meus aplausos).
     Retorna { ok: true } ou { ok: false, done: [...etapas], failed: "etapa", code }. */
  DB.deleteMine = async function (opts) {
    opts = opts || {};
    const done = [];
    const step = async (name, fn) => { await fn(); done.push(name); };
    if (DB.mode === "firebase") {
      try {
        await step("aplausos", async () => {
          for (const id of (opts.clapped || []).filter(x => DOCID.test(x))) {
            const pr = DB.fs.doc("posts/" + id), cr = pr.collection("claps").doc(DB.uid);
            try { if (!(await cr.get()).exists) continue; } catch (_) { continue; }
            const b = DB.fs.batch(); b.update(pr, { claps: fv().increment(-1) }); b.delete(cr); await b.commit();
          }
        });
        await step("posts", async () => { for (const p of await myPosts()) await DB.deletePost(p.id); });
        await step("lugares", async () => {
          const s = await DB.fs.collection("places").where("uid", "==", DB.uid).get();
          for (const d of s.docs) { const vs = await d.ref.collection("visits").get(); for (const v of vs.docs) await v.ref.delete(); await d.ref.delete(); }
        });
        await step("pedidos", async () => { const s = await DB.fs.collection("orders").where("uid", "==", DB.uid).get(); for (const d of s.docs) await d.ref.delete(); });
        await step("perfil", async () => { await DB.fs.doc("users/" + DB.uid).delete(); });
        await step("conta", async () => {
          const u = user(); if (!u) return;
          try { await u.delete(); }
          catch (e) {
            if (e && e.code === "auth/requires-recent-login" && hasGoogle(u)) { await u.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider()); await u.delete(); }
            else throw e;
          }
        });
      } catch (e) {
        console.warn("Exclusão incompleta", e && e.code);
        return { ok: false, done, failed: ["aplausos", "posts", "lugares", "pedidos", "perfil", "conta"][done.length], code: (e && e.code) || "erro" };
      }
    }
    LS.clear();
    return { ok: true, done };
  };

  window.DB = DB;
})();
