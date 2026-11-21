/* =========================================================
   Dados do jogo.
   - Sem configuração do Firebase: modo demonstração, tudo fica só neste aparelho.
   - Com Firebase: login anônimo + Firestore. As regras em firestore.rules
     validam cada gravação no servidor; o app nunca confia só no cliente.
   Privacidade: câmera, microfone e localização bruta ficam no aparelho.
   Só vai para o feed o que a pessoa posta: apelido, foto reduzida, XP, km,
   e o trajeto resumido sem os primeiros e últimos metros.
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
  const KINDS = ["mission", "expedition", "place"];

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
    if (Array.isArray(p.route) && p.route.length >= 4) o.route = p.route.slice(0, 240).map(x => Math.round(num(x, -180, 180) * 1e4) / 1e4);
    if (p.club && CLUB.test(p.club)) { o.club = p.club; o.clubName = str(p.clubName, 24) || "Clube"; }
    return o;
  }

  DB.addPost = async function (p) {
    const last = LS.get("lastPost", 0);
    if (Date.now() - last < MIN_GAP_MS) throw new Error("rate");
    const o = cleanPost(p);
    LS.set("lastPost", Date.now());
    if (DB.mode === "firebase") {
      const ts = fv().serverTimestamp();
      const userRef = DB.fs.doc("users/" + DB.uid), postRef = DB.fs.collection("posts").doc();
      const commit = async withStats => {
        const b = DB.fs.batch();
        b.set(userRef, { nick: o.nick, lastPostAt: ts }, { merge: true });
        b.set(postRef, Object.assign({ uid: DB.uid, createdAt: ts }, o));
        if (withStats) b.update(DB.fs.doc("stats/city"), { photos: fv().increment(1) });
        await b.commit();
      };
      try { await commit(true); } catch (_) { await commit(false); }
      return Object.assign({ id: postRef.id, uid: DB.uid, createdAt: Date.now() }, o);
    }
    const post = Object.assign({ id: "p" + Date.now(), uid: DB.uid, createdAt: Date.now() }, o);
    let all = [post].concat(LS.get("posts", [])).slice(0, 15);
    while (!LS.set("posts", all) && all.length > 1) all = all.slice(0, -1); // espaço do aparelho
    LS.set("cityPhotos", LS.get("cityPhotos", 0) + 1);
    return post;
  };

  function readPost(id, x) {
    return { id, uid: x.uid, kind: KINDS.includes(x.kind) ? x.kind : "mission", nick: cleanNick(x.nick), missionId: SLUG.test(x.missionId || "") ? x.missionId : null,
      missions: Array.isArray(x.missions) ? x.missions.filter(v => SLUG.test(v)) : [], title: str(x.title, 60), pet: x.pet, pets: Array.isArray(x.pets) ? x.pets.filter(v => SLUG.test(v)) : [],
      xp: x.xp | 0, km: num(x.km, 0, 100), mins: x.mins | 0, places: x.places | 0, claps: x.claps | 0,
      photo: typeof x.photo === "string" && PHOTO.test(x.photo) ? x.photo : null, route: Array.isArray(x.route) ? x.route.filter(v => typeof v === "number") : null,
      club: CLUB.test(x.club || "") ? x.club : null, clubName: str(x.clubName, 24), createdAt: toMs(x.createdAt) };
  }
  DB.listPosts = async function (n) {
    if (DB.mode === "firebase") {
      const s = await DB.fs.collection("posts").orderBy("createdAt", "desc").limit(n || 60).get();
      return s.docs.map(d => readPost(d.id, d.data()));
    }
    return LS.get("posts", []).map(x => readPost(x.id, x));
  };
  DB.deletePost = async function (id) {
    if (DB.mode === "firebase") { if (DOCID.test(id)) await DB.fs.doc("posts/" + id).delete(); return; }
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
    const o = { store: str(store, 60), model: models.includes(model) ? model : "foto", subject: str(subject, 60), gift: str(gift, 60), pet: SLUG.test(pet) ? pet : "sabia", status: "pending" };
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
  DB.addOrder = async function (missionId) {
    const code = randId(6), o = { code, missionId, createdAt: Date.now() };
    if (DB.mode === "firebase" && SLUG.test(missionId)) {
      await DB.fs.collection("orders").add({ uid: DB.uid, code, missionId, createdAt: fv().serverTimestamp() });
    }
    const all = LS.get("orders", []); all.unshift(o); LS.set("orders", all.slice(0, 20));
    return o;
  };

  /* Contato de lojista (dado de empresa, com consentimento). Ninguém lê pelo app. */
  DB.addLead = async function ({ store, contact, consent }) {
    store = str(store, 60); contact = str(contact, 60);
    if (!store || !contact || consent !== true) throw new Error("invalid");
    if (DB.mode === "firebase") await DB.fs.collection("leads").add({ store, contact, consent: true, createdAt: fv().serverTimestamp() });
    else { const all = LS.get("leads", []); all.unshift({ store, contact, createdAt: Date.now() }); LS.set("leads", all.slice(0, 20)); }
  };

  /* LGPD: apagar tudo desta pessoa, no servidor e no aparelho. */
  DB.deleteMine = async function () {
    if (DB.mode === "firebase") {
      try {
        for (const col of ["posts", "orders", "places"]) {
          const s = await DB.fs.collection(col).where("uid", "==", DB.uid).get();
          for (const d of s.docs) await d.ref.delete();
        }
        await DB.fs.doc("users/" + DB.uid).delete();
        if (firebase.auth().currentUser) await firebase.auth().currentUser.delete();
      } catch (e) { console.warn("Falha ao apagar no servidor", e && e.message); throw e; }
    }
    LS.clear();
  };

  window.DB = DB;
})();
