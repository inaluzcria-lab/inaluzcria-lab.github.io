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
  /* Modelo 3D da Anny (.glb). O arquivo veio sem textura utilizável e sem esqueleto:
     as cores seguem o concept (cabeça e costas azul-escuro, barriga amarela, bico claro, olho azul)
     e as animações são feitas aqui, deformando o próprio modelo (morph targets). */
  const GLB = {
    surucua: { url: "assets/models/surucua.glb", rotY: 0, paint: { bico: 0xe2c49a, Cube001: 0x353f5a, Cube001_1: 0x2b3b4f, patinhas: 0xd9a08c } }
  };
  /* Volume do canto real (gravação da Anny), a cada 50 ms: comanda o peito. */
  const ENV = [0.0, 0.0, 0.01, 0.01, 0.02, 0.03, 0.03, 0.03, 0.03, 0.04, 0.04, 0.06, 0.12, 0.19, 0.07, 0.07, 0.07, 0.07, 0.25, 0.31, 0.11, 0.08, 0.07, 0.23, 0.44, 0.14, 0.09, 0.09, 0.17, 0.53, 0.26, 0.13, 0.12, 0.1, 0.4, 0.39, 0.16, 0.1, 0.09, 0.45, 0.51, 0.17, 0.11, 0.11, 0.62, 0.6, 0.2, 0.11, 0.12, 0.62, 0.52, 0.19, 0.13, 0.13, 0.73, 0.64, 0.17, 0.12, 0.22, 0.91, 0.66, 0.19, 0.14, 0.21, 0.91, 0.59, 0.21, 0.14, 0.41, 1, 0.46, 0.19, 0.12, 0.53, 0.77, 0.48, 0.17, 0.12, 0.36, 0.93, 0.46, 0.19, 0.11, 0.24, 0.72, 0.44, 0.18, 0.12, 0.14, 0.67, 0.74, 0.21, 0.13, 0.12, 0.09, 0.09, 0.08, 0.07, 0.08, 0.07, 0.06, 0.05, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.01, 0.0];
  const FOLD = -1.18, UP = .8, DOWN = -.45; // ângulos das asas (rad)
  const models = {};
  /* Cria as deformações: asas (fechar, cima, baixo) e peito (inflar). */
  function rig(o) {
    let wing = null, body = null;
    o.traverse(m => { if (m.isMesh && m.name === "Cube001_1") wing = m; if (m.isMesh && m.name === "Cube001") body = m; });
    if (wing && body) {
      body.geometry.computeBoundingBox(); wing.geometry.computeBoundingBox();
      const bb = body.geometry.boundingBox, wb = wing.geometry.boundingBox;
      const sx = bb.max.x * .92, wy = (wb.min.y + wb.max.y) / 2, pos = wing.geometry.attributes.position;
      const rot = ang => { const d = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), k = Math.sign(x), ax = Math.abs(x);
          if (ax <= sx) continue; const dx = ax - sx, dy = y - wy;
          const nx = sx + dx * Math.cos(ang) - dy * Math.sin(ang), ny = wy + dx * Math.sin(ang) + dy * Math.cos(ang);
          d[i * 3] = k * nx - x; d[i * 3 + 1] = ny - y; }
        return new THREE.Float32BufferAttribute(d, 3); };
      wing.geometry.morphAttributes.position = [rot(FOLD), rot(UP), rot(DOWN)];
      wing.geometry.morphTargetsRelative = true; wing.updateMorphTargets();
      const bp = body.geometry.attributes.position, bn = body.geometry.attributes.normal, H = bb.max.y - bb.min.y;
      const yc = bb.min.y + H * .55, zmid = (bb.min.z + bb.max.z) / 2, d = new Float32Array(bp.count * 3);
      for (let i = 0; i < bp.count; i++) {
        const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
        const w = Math.exp(-((y - yc) ** 2) / (2 * (H * .14) ** 2) - (x * x) / (2 * (bb.max.x * .45) ** 2)) * Math.max(0, Math.min(1, (z - zmid) / ((bb.max.z - zmid) * .8)));
        const amp = H * .1 * w, rx = x * .6, ry = (y - yc) * .5, rz = z - zmid, rl = Math.hypot(rx, ry, rz) || 1; d[i * 3] = rx / rl * amp; d[i * 3 + 1] = ry / rl * amp; d[i * 3 + 2] = rz / rl * amp;
      }
      body.geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(d, 3)];
      /* Barriga amarela pintada no próprio corpo (frente, da metade do peito para baixo). */
      const navy = new THREE.Color(0x353f5a), yel = new THREE.Color(0xf0c030), col = new Float32Array(bp.count * 3), c = new THREE.Color();
      for (let i = 0; i < bp.count; i++) {
        const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
        const front = Math.max(0, Math.min(1, (z - zmid) / ((bb.max.z - zmid) * .35) - .6));
        const low = Math.max(0, Math.min(1, ((bb.min.y + H * .56) - y) / (H * .06)));
        const side = Math.max(0, Math.min(1, (bb.max.x * .82 - Math.abs(x)) / (bb.max.x * .15)));
        c.copy(navy).lerp(yel, front * low * side); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      body.geometry.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      body.material = mat(0xffffff, { vertexColors: true });
      body.geometry.morphTargetsRelative = true; body.updateMorphTargets();
    }
  }
  function preload() {
    if (!has() || !THREE.GLTFLoader) return Promise.resolve();
    const L = new THREE.GLTFLoader();
    return Promise.all(Object.entries(GLB).map(([id, cfg]) => new Promise(ok => L.load(cfg.url, g => {
      const o = g.scene;
      o.traverse(m => { if (m.isMesh) { const c = cfg.paint[m.name]; m.material = mat(c != null ? c : 0x9a8f7c); } });
      rig(o);
      const b = new THREE.Box3().setFromObject(o), size = b.getSize(new THREE.Vector3()), k = 1.5 / Math.max(size.x, size.y, size.z), ctr = b.getCenter(new THREE.Vector3());
      o.scale.setScalar(k); o.position.set(-ctr.x * k, -b.min.y * k, -ctr.z * k);
      const wrap = new THREE.Group(); wrap.add(o); wrap.userData.top = size.y * k;
      if (id === "surucua") {
        [-1, 1].forEach(s => { const e = new THREE.Group(); e.name = "eye";
          const ring = new THREE.Mesh(new THREE.SphereGeometry(.036, 16, 12), mat(0xf2c230)); e.add(ring);
          const iris = new THREE.Mesh(new THREE.SphereGeometry(.028, 16, 12), mat(0x3f6ee0, { roughness: .2 })); iris.position.z = .012; e.add(iris);
          const shine = new THREE.Mesh(new THREE.SphereGeometry(.008, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); shine.position.set(.01, .012, .036); e.add(shine);
          e.position.set(s * .105, .565, .155); e.rotation.y = s * .55; wrap.add(e); });
      }
      models[id] = wrap; ok();
    }, undefined, () => ok()))));
  }
  /* ---------- animações: pouso, idle, canto (peito), fala, voo ---------- */
  function parts(g) {
    if (g.userData.parts) return g.userData.parts;
    const p = { inner: g.children[0], wing: null, body: null, belly: null, lights: [] };
    g.traverse(m => { if (m.name === "Cube001_1" && m.isMesh) p.wing = m; if (m.name === "Cube001" && m.isMesh) p.body = m; if (m.name === "belly") p.belly = m; if (m.userData.light) p.lights.push(m); });
    return (g.userData.parts = p);
  }
  function play(g, name, ms) { g.userData.anim = { name, t0: performance.now(), ms: ms || 0 }; }
  function pose(p, fold, up, down, chest) {
    if (p.wing && p.wing.morphTargetInfluences) { const f = p.wing.morphTargetInfluences; f[0] = fold; f[1] = up; f[2] = down; }
    if (p.body && p.body.morphTargetInfluences) p.body.morphTargetInfluences[0] = chest;
    if (p.belly) p.belly.scale.z = .085 * (1 + chest * .9);
    const ang = fold * FOLD + up * UP + down * DOWN;
    p.lights.forEach(l => { const b = l.userData.base, k = Math.sign(b.x), sx = .2, wy = .33, dx = Math.abs(b.x) - sx, dy = b.y - wy;
      l.position.set(k * (sx + dx * Math.cos(ang) - dy * Math.sin(ang)), wy + dx * Math.sin(ang) + dy * Math.cos(ang), b.z); });
  }
  function tick(g, now) {
    if (!g || !g.userData.glb) return;
    const p = parts(g), A = g.userData.anim || { name: "idle", t0: now }, t = now - A.t0, inner = p.inner;
    inner.position.y = 0; inner.rotation.x = 0; inner.rotation.z = 0;
    const flap = s => { const v = Math.sin(t * s); return [Math.max(0, v), Math.max(0, -v)]; };
    if (A.name === "pouso") {
      const q = Math.min(1, t / 1600), e = 1 - (1 - q) ** 3, [u, d] = flap(.045);
      inner.position.y = (1 - e) * 2.2; inner.rotation.x = .3 * (1 - e);
      pose(p, q > .75 ? (q - .75) / .25 : 0, u * (1 - q), d * (1 - q), 0);
      if (q >= 1) play(g, "idle");
    } else if (A.name === "voo") {
      const [u, d] = flap(.03); inner.rotation.x = .28; inner.position.y = Math.sin(t / 250) * .05; pose(p, 0, u, d, 0);
    } else if (A.name === "canto") {
      const i = Math.floor(t / 50), lv = i < ENV.length ? ENV[i] : 0;
      inner.rotation.x = -.12 * Math.min(1, t / 400); pose(p, 1, 0, 0, lv);
      if (i >= ENV.length) play(g, "idle");
    } else if (A.name === "fala") {
      pose(p, 1, 0, 0, .35 + .35 * Math.abs(Math.sin(t / 90))); if (t > (A.ms || 1500)) play(g, "idle");
    } else {
      inner.position.y = Math.sin(now / 700) * .01; inner.rotation.y = GLB.surucua.rotY + Math.sin(now / 2600) * .25;
      pose(p, 1, 0, 0, .06 + .04 * Math.sin(now / 900));
    }
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
  /* eq = { cabeca, pescoco, asas, rosto } com ids de acessórios; só para o surucuá (.glb). */
  function dress(g, eq) {
    const inner = g.children[0]; if (!inner || !g.userData.glb) return;
    const old = inner.getObjectByName("acc"); if (old) inner.remove(old);
    const acc = new THREE.Group(); acc.name = "acc";
    const add = id => { if (id === "gorro") acc.add(ACC.gorro(false)); else if (id === "gorro_dourado") acc.add(ACC.gorro(true)); else if (ACC[id]) acc.add(ACC[id]()); };
    Object.values(eq || {}).forEach(add);
    inner.add(acc); g.userData.parts = null;
  }
  function make(id, opts) {
    opts = opts || {};
    if (models[id]) {
      const g = new THREE.Group(), m = models[id].clone(true); m.rotation.y = GLB[id].rotY; g.add(m);
      const sh = new THREE.Mesh(new THREE.CircleGeometry(.8, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22 }));
      sh.rotation.x = -Math.PI / 2; sh.position.y = .01; g.add(sh); g.userData.id = id; g.userData.glb = true;
      if (opts.eq) dress(g, opts.eq);
      g.userData.anim = { name: "idle", t0: 0 }; tick(g, 0);
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
  window.Pets = { NAMES, make, lights, thumbs, cache, has, preload, dress, play, tick, SONG_MS: ENV.length * 50 };
})();
