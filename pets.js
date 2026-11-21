/* Pets 3D (Three.js r128) no estilo dos modelos do Uaná Etê: formas redondas, cores fortes, gorro de Natal. */
(function () {
  const NAMES = { tucano: "Tucano", jabuti: "Jabuti", surucua: "Surucuá", tamandua: "Tamanduá-mirim", sabia: "Sabiá-laranjeira", tie: "Tiê-sangue" };
  const has = () => !!window.THREE;
  const mat = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .55, metalness: 0 }, o || {}));
  function sph(r, col, sx = 1, sy = 1, sz = 1) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), mat(col)); m.scale.set(sx, sy, sz); return m; }
  function eyes(g, y, z, dx, s) {
    [-1, 1].forEach(k => {
      const w = sph(.085 * s, 0xffffff); w.position.set(k * dx, y, z);
      const p = sph(.05 * s, 0x111111); p.position.set(k * dx, y, z + .055 * s);
      const h = sph(.018 * s, 0xffffff); h.position.set(k * dx + .02 * s, y + .025 * s, z + .09 * s);
      g.add(w, p, h);
    });
  }
  function hat(g, x, y, z, s, tilt, gold) {
    const h = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.2 * s, .42 * s, 24), mat(gold ? 0xf2b632 : 0xd8312f, gold ? { metalness: .5, roughness: .3 } : {}));
    cone.position.y = .21 * s; cone.rotation.z = -.35;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.19 * s, .06 * s, 12, 28), mat(0xffffff)); rim.rotation.x = Math.PI / 2;
    const ball = sph(.07 * s, 0xffffff); ball.position.set(.15 * s, .4 * s, 0);
    h.add(cone, rim, ball); h.position.set(x, y, z); h.rotation.z = tilt || 0; g.add(h); return h;
  }
  function bird(g, c) {
    const body = sph(.42, c.belly, .95, 1.1, .9); body.position.set(0, .62, .05); g.add(body);
    const back = sph(.43, c.back, .95, 1.1, .85); back.position.set(0, .66, -.1); g.add(back);
    const head = sph(.3, c.head); head.position.set(0, 1.12, 0); g.add(head);
    if (c.throat) { const t = sph(.26, c.throat, 1, .95, .7); t.position.set(0, .92, .2); g.add(t); }
    eyes(g, 1.17, .25, .11, 1.1);
    if (c.big) {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(.16, .7, 24), mat(c.beak)); beak.rotation.x = Math.PI / 2; beak.scale.set(1, 1, .8); beak.position.set(0, 1.06, .55); g.add(beak);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(.075, .2, 16), mat(0xe8453c)); tip.rotation.x = Math.PI / 2; tip.position.set(0, 1.06, .92); g.add(tip);
      [-1, 1].forEach(k => { const ring = new THREE.Mesh(new THREE.TorusGeometry(.09, .025, 8, 20), mat(c.eyeRing || 0x3fa9e0)); ring.position.set(k * .11, 1.17, .24); g.add(ring); });
    } else {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(.08, .2, 16), mat(c.beak)); beak.rotation.x = Math.PI / 2; beak.position.set(0, 1.08, .34); g.add(beak);
    }
    [-1, 1].forEach(k => { const w = sph(.22, c.wing, .45, 1, .9); w.position.set(k * .4, .7, -.05); w.rotation.z = k * .25; w.name = k < 0 ? "wingL" : "wingR"; g.add(w); });
    const tail = new THREE.Mesh(new THREE.BoxGeometry(.24, .6, .08), mat(c.wing)); tail.position.set(0, .25, -.45); tail.rotation.x = .5; g.add(tail);
    [-.12, .12].forEach(x => { const f = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .22, 8), mat(c.feet || 0xe8a13a)); f.position.set(x, .12, .05); g.add(f); });
    if (c.scarf) { const s = new THREE.Mesh(new THREE.TorusGeometry(.26, .07, 12, 30), mat(c.scarf)); s.rotation.x = Math.PI / 2; s.position.y = .88; g.add(s); }
    return 1.35;
  }
  /* Modelo 3D da Anny (.glb) com esqueleto, textura (SurucuaUV.png) e 4 animações feitas no Blender:
     pouso (primeira aparição), idle (livre), canto (só o peito, no ritmo da gravação) e voo (corrida).
     O arquivo-fonte editável está em assets/models/surucua.blend. */
  const GLB = { surucua: { url: "assets/models/surucua.glb" } };
  const SONG_MS = 5500; // duração da gravação do canto
  const models = {};
  function preload() {
    if (!has() || !THREE.GLTFLoader || !THREE.SkeletonUtils) return Promise.resolve();
    const L = new THREE.GLTFLoader();
    return Promise.all(Object.entries(GLB).map(([id, cfg]) => new Promise(ok => L.load(cfg.url, g => {
      const o = g.scene;
      o.traverse(m => { if (m.isMesh) { m.frustumCulled = false; const ms = Array.isArray(m.material) ? m.material : [m.material];
        ms.forEach(x => { x.roughness = .6; x.metalness = 0; if (x.map) x.map.anisotropy = 4; }); } });
      const b = new THREE.Box3().setFromObject(o), size = b.getSize(new THREE.Vector3()), k = 1.5 / Math.max(size.x, size.y, size.z), ctr = b.getCenter(new THREE.Vector3());
      models[id] = { scene: o, clips: g.animations, k, pos: new THREE.Vector3(-ctr.x * k, -b.min.y * k, -ctr.z * k), top: size.y * k };
      ok();
    }, undefined, () => ok()))));
  }
  const bone = (g, n) => g.userData.bones && (g.userData.bones[n] || g.userData.bones[n.replace(/\./g, "")]);
  /* Prende um objeto (em coordenadas do modelo normalizado) a um osso, com o esqueleto na pose de repouso. */
  function pin(g, obj, boneName) {
    const wrap = g.children[0], bn = bone(g, boneName); wrap.add(obj);
    if (!bn) return;
    g.userData.skel.forEach(s => s.pose()); g.updateMatrixWorld(true); bn.attach(obj);
    if (g.userData.mixer) { g.userData.mixer.update(0); }
  }
  /* ---------- animações (clipes do .glb) ---------- */
  function play(g, name, ms) {
    const u = g && g.userData; if (!u || !u.mixer) return;
    const clip = name === "fala" ? "canto" : name, next = u.acts[clip]; if (!next) return;
    const prev = u.cur; u.cur = next; u.anim = { name, t0: performance.now(), ms: ms || 0 };
    next.reset(); next.enabled = true; next.setEffectiveWeight(1);
    const once = name === "pouso" || name === "canto" || name === "comer";
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); next.clampWhenFinished = once;
    next.timeScale = name === "fala" ? 1.6 : 1;
    next.play(); if (prev && prev !== next) next.crossFadeFrom(prev, name === "pouso" ? 0 : .25, false);
  }
  function tick(g, now) {
    const u = g && g.userData; if (!u || !u.mixer) return;
    const dt = Math.min(.1, Math.max(0, (now - (u.last || now)) / 1000)); u.last = now;
    const A = u.anim || {};
    if ((A.name === "pouso" || A.name === "canto" || A.name === "comer") && !u.cur.isRunning()) play(g, "idle");
    else if (A.name === "fala" && now - A.t0 > (A.ms || 1500)) play(g, "idle");
    u.mixer.update(dt);
    if (u.lights) { const f = Math.floor(now / 350); u.lights.forEach((l, i) => { l.visible = (i + f) % 3 !== 0; }); }
  }
  /* Acessórios de Natal do surucuá, posicionados no modelo normalizado (altura ≈ 0,66). */
  const ACC = {
    gorro: (gold) => { const g = new THREE.Group();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(.11, .26, 24), mat(gold ? 0xf2b632 : 0xd8312f, gold ? { metalness: .5, roughness: .3 } : {})); cone.position.y = .13; cone.rotation.z = .35; g.add(cone);
      const brim = new THREE.Mesh(new THREE.TorusGeometry(.11, .035, 10, 24), mat(0xffffff)); brim.rotation.x = Math.PI / 2; g.add(brim);
      const pom = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 10), mat(0xffffff)); pom.position.set(-.09, .25, 0); g.add(pom);
      g.position.set(0, .64, .02); return g; },
    laco: () => { const g = new THREE.Group(), red = mat(0xd8312f);
      [-1, 1].forEach(k => { const w = new THREE.Mesh(new THREE.ConeGeometry(.045, .09, 12), red); w.rotation.z = k * Math.PI / 2; w.position.x = k * .045; g.add(w); });
      g.add(new THREE.Mesh(new THREE.SphereGeometry(.025, 10, 8), red)); g.position.set(.1, .63, .06); g.rotation.z = -.4; return g; },
    cachecol: () => { const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.19, .045, 12, 32), mat(0xd8312f)); ring.rotation.x = Math.PI / 2; g.add(ring);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(.07, .16, .03), mat(0xd8312f)); tail.position.set(.08, -.08, .19); tail.rotation.z = .2; g.add(tail);
      [-.04, .0, .04].forEach(y => { const st = new THREE.Mesh(new THREE.BoxGeometry(.072, .012, .032), mat(0xffffff)); st.position.set(.08, -.08 + y * 1.5, .192); st.rotation.z = .2; g.add(st); });
      g.position.set(0, .42, 0); return g; },
    pisca: () => { const g = new THREE.Group(), cols = [0xffd36b, 0xff6b5b, 0x8fd9ff, 0xb6ff7a];
      for (let i = 0; i < 14; i++) { const k = i < 7 ? -1 : 1, t = (i % 7) / 6, b = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 8), new THREE.MeshBasicMaterial({ color: cols[i % 4] }));
        b.position.set(k * (.26 + t * .45), .385 + Math.sin(t * Math.PI) * .02, .2 - t * .1); b.userData.light = true; b.userData.base = b.position.clone(); g.add(b); }
      g.userData.blink = true; return g; },
    oculos: () => { const g = new THREE.Group(), gold = mat(0xf2b632, { metalness: .5, roughness: .3 });
      [-1, 1].forEach(k => { const r = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 8, 5), gold); r.position.set(k * .07, .56, .25); g.add(r); });
      const br = new THREE.Mesh(new THREE.BoxGeometry(.05, .01, .01), gold); br.position.set(0, .57, .26); g.add(br); return g; }
  };
  /* eq = { cabeca, pescoco, asas, rosto } com ids de acessórios; cada um vai preso ao osso certo
     (gorro, laço e óculos na cabeça, cachecol no corpo, pisca-pisca nas asas) e acompanha as animações. */
  const ON = { gorro: "head", gorro_dourado: "head", laco: "head", oculos: "head", cachecol: "body" };
  function dress(g, eq) {
    if (!g || !g.userData.glb) return;
    (g.userData.accs || []).forEach(o => o.parent && o.parent.remove(o)); g.userData.accs = []; g.userData.lights = [];
    Object.values(eq || {}).forEach(id => {
      if (id === "pisca") {
        ACC.pisca().children.slice().forEach(l => { const k = l.position.x > 0 ? "L" : "R", tip = Math.abs(l.position.x) > .5;
          pin(g, l, (tip ? "wingtip." : "wing.") + k); g.userData.accs.push(l); g.userData.lights.push(l); });
        return;
      }
      const o = id === "gorro" ? ACC.gorro(false) : id === "gorro_dourado" ? ACC.gorro(true) : ACC[id] ? ACC[id]() : null;
      if (o) { pin(g, o, ON[id] || "body"); g.userData.accs.push(o); }
    });
  }
  function make(id, opts) {
    opts = opts || {};
    const M = models[id];
    if (M) {
      const g = new THREE.Group(), wrap = new THREE.Group(), o = THREE.SkeletonUtils.clone(M.scene);
      o.scale.setScalar(M.k); o.position.copy(M.pos); wrap.add(o); g.add(wrap); wrap.userData.top = M.top;
      const bones = {}, skel = [];
      o.traverse(n => { if (n.isBone) bones[n.name] = n; if (n.isSkinnedMesh && skel.indexOf(n.skeleton) < 0) skel.push(n.skeleton); });
      Object.assign(g.userData, { id, glb: true, bones, skel });
      const mixer = new THREE.AnimationMixer(o), acts = {};
      M.clips.forEach(c => { acts[c.name] = mixer.clipAction(c); });
      Object.assign(g.userData, { mixer, acts });
      const sh = new THREE.Mesh(new THREE.CircleGeometry(.8, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22 }));
      sh.rotation.x = -Math.PI / 2; sh.position.y = .01; g.add(sh);
      /* olhos azuis com anel amarelo (como no concept), presos na cabeça */
      [-1, 1].forEach(s => { const e = new THREE.Group(); e.name = "eye";
        const ring = new THREE.Mesh(new THREE.SphereGeometry(.036, 16, 12), mat(0xf2c230)); e.add(ring);
        const iris = new THREE.Mesh(new THREE.SphereGeometry(.028, 16, 12), mat(0x3f6ee0, { roughness: .2 })); iris.position.z = .012; e.add(iris);
        const shine = new THREE.Mesh(new THREE.SphereGeometry(.008, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); shine.position.set(.01, .012, .036); e.add(shine);
        e.position.set(s * .105, .565, .155); e.rotation.y = s * .55; pin(g, e, "head"); });
      /* ponto da boca (ponta do bico), preso na cabeça: a comida voa até aqui */
      g.updateMatrixWorld(true); let beak = null;
      o.traverse(n => { if (n.isMesh && [].concat(n.material).some(x => x && x.name === "bico")) beak = n; });
      const mouth = new THREE.Object3D(); mouth.name = "mouth";
      if (beak) { const bb = new THREE.Box3().setFromObject(beak), c = bb.getCenter(new THREE.Vector3()); mouth.position.set(c.x, c.y - (bb.max.y - bb.min.y) * .15, bb.max.z); }
      else mouth.position.set(0, .5, .3);
      pin(g, mouth, "head"); g.userData.mouth = mouth;
      if (opts.eq) dress(g, opts.eq);
      play(g, "idle"); mixer.update(0);
      return g;
    }
    const g = new THREE.Group(); let hatY = 1.35, hatX = 0, hatZ = 0, hatS = .9, hatT = .25;
    if (id === "tucano") hatY = bird(g, { belly: 0x1d1d24, back: 0x1d1d24, head: 0x1d1d24, wing: 0x2b2b30, beak: 0xb8d43a, throat: 0xe6e03a, big: 1, eyeRing: 0x5fd35a, feet: 0x8a9bb5 });
    if (id === "tucano") g.rotation.y = .75;
    if (id === "surucua") hatY = bird(g, { belly: 0xf2cf2b, back: 0x2a3f7a, head: 0x2d4aa0, wing: 0x22336a, beak: 0xf2cf2b, scarf: 0xf3f3f3 });
    if (id === "sabia") hatY = bird(g, { belly: 0xe08a3c, back: 0x8a7a62, head: 0x8a7a62, wing: 0x6e6150, beak: 0xe6b84a });
    if (id === "tie") hatY = bird(g, { belly: 0xd92a33, back: 0xc91f2b, head: 0xc91f2b, wing: 0x141414, beak: 0xd6dadd });
    if (id === "jabuti") {
      const shell = sph(.6, 0x7a4a24, 1, .62, 1); shell.position.y = .42; g.add(shell);
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, p = sph(.16, 0x5c3416, 1, .35, 1); p.position.set(Math.cos(a) * .38, .58 + (i % 2) * .05, Math.sin(a) * .38); p.lookAt(0, -1, 0); g.add(p); }
      const top = sph(.2, 0x5c3416, 1, .4, 1); top.position.y = .8; g.add(top);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.58, .06, 12, 40), mat(0xc9a14a)); rim.rotation.x = Math.PI / 2; rim.position.y = .3; g.add(rim);
      const head = sph(.27, 0xa5b04a); head.position.set(0, .5, .68); g.add(head); eyes(g, .58, .86, .11, 1.2);
      [[-.38, .38], [.38, .38], [-.38, -.38], [.38, -.38]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .3, 16), mat(0xa5b04a)); l.position.set(x, .15, z); g.add(l); });
      hatX = 0; hatY = .75; hatZ = .66; hatS = 1; hatT = .15;
    }
    if (id === "tamandua") {
      const body = sph(.45, 0x6b4426, 1.35, .85, .9); body.position.y = .55; g.add(body);
      const band = sph(.46, 0xe9d9b8, .6, .87, .92); band.position.set(.25, .57, 0); g.add(band);
      const head = sph(.24, 0xe9d9b8); head.position.set(.62, .7, 0); g.add(head);
      const snout = new THREE.Mesh(new THREE.CylinderGeometry(.05, .12, .45, 16), mat(0xbfa98a)); snout.rotation.z = Math.PI / 2 + .15; snout.position.set(.95, .64, 0); g.add(snout);
      const nose = sph(.05, 0x222222); nose.position.set(1.17, .6, 0); g.add(nose);
      [-1, 1].forEach(k => { const e = sph(.06, 0xffffff); e.position.set(.7, .78, k * .15); const p = sph(.035, 0x111111); p.position.set(.74, .79, k * .17); g.add(e, p); const ear = sph(.07, 0x6b4426); ear.position.set(.55, .92, k * .14); g.add(ear); });
      [[-.3, .22], [.3, .22], [-.3, -.22], [.3, -.22]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .32, 12), mat(0x4a2e18)); l.position.set(x, .16, z); g.add(l); });
      const tail = new THREE.Mesh(new THREE.ConeGeometry(.12, .7, 16), mat(0x6b4426)); tail.rotation.z = 1.9; tail.position.set(-.85, .6, 0); g.add(tail);
      hatX = .6; hatY = .92; hatZ = 0; hatS = .75; hatT = -.3; g.rotation.y = -.9;
    }
    hat(g, hatX, hatY, hatZ, hatS, hatT, opts.gold);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(.7, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .25 }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = .01; g.add(sh);
    g.userData.id = id;
    return g;
  }
  function lights(sc) {
    sc.add(new THREE.AmbientLight(0xffffff, 1.5));
    const d = new THREE.DirectionalLight(0xfff1d6, 2.4); d.position.set(2, 4, 5); sc.add(d);
    const r = new THREE.PointLight(0xffc96b, .5, 10); r.position.set(-3, 1, 2); sc.add(r);
  }
  const cache = {};
  function thumbs(ids, opts) {
    if (!has()) return cache;
    const tr = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    tr.setSize(256, 256); const ts = new THREE.Scene(); lights(ts); const tc = new THREE.PerspectiveCamera(35, 1, .1, 20);
    ids.forEach(id => {
      const p = make(id, opts); ts.add(p);
      const b = new THREE.Box3().setFromObject(p), c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()).length();
      tc.position.set(c.x, c.y + .2, size * 1.45); tc.lookAt(c.x, c.y, 0); tr.render(ts, tc);
      cache[id] = tr.domElement.toDataURL(); ts.remove(p);
    });
    tr.dispose();
    return cache;
  }
  /* Posição da boca no mundo (para a comida voar até ela). */
  function mouth(g) { const m = g && g.userData.mouth; return m ? m.getWorldPosition(new THREE.Vector3()) : null; }
  window.Pets = { NAMES, make, lights, thumbs, cache, has, preload, dress, play, tick, mouth, SONG_MS };
})();
