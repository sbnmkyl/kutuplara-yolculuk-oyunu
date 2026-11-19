/* Kutup Bayrak Kaşifi — 3B sahne: arazi, su, bölüm kurulumu, parçacıklar */
(function () {
  "use strict";
  const KBK = window.KBK;
  const U = KBK.util;
  const Art = KBK.art;
  const THREE = window.THREE;
  const TAU = Math.PI * 2;
  const WATER = -1.0;
  const W = { WATER, level: null, quality: 2, reducedMotion: false };

  let renderer, scene, camera, hemi, sun, root, backdrop;
  let snowPoints, snowData, snowCount = 0;
  const tmpColor = new THREE.Color();

  /* ───────── Kurulum ───────── */
  W.init = (container) => {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 1, 0.5, 1500);
    camera.position.set(0, 14, 70);

    hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -36;
    sun.shadow.camera.right = 36;
    sun.shadow.camera.top = 36;
    sun.shadow.camera.bottom = -36;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 170;
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.04;
    scene.add(sun);
    scene.add(sun.target);

    Art.init(renderer);
    initParticles();
    initSnow();
    W.renderer = renderer;
    W.scene = scene;
    W.camera = camera;
    W.resize();
    return W;
  };

  W.resize = () => {
    const el = renderer.domElement.parentElement;
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 60 : 52;
    camera.updateProjectionMatrix();
    updatePointScale();
  };

  /* kalite: 2 = gölgeli, 1 = gölgesiz, 0 = düşük çözünürlük */
  W.setQuality = (q) => {
    W.quality = q;
    sun.castShadow = q >= 2;
    const base = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(q >= 2 ? base : q === 1 ? Math.min(base, 1.25) : Math.min(base, 0.85));
    W.resize();
  };

  /* ───────── Arazi yüksekliği ───────── */
  function makeHeight(def) {
    const T = def.terrain;
    const p1 = T.seed * 0.37, p2 = T.seed * 0.91, p3 = T.seed * 1.73;
    const sea = def.rim === "sea";
    return (x, z) => {
      let h = 0.5 * Math.sin(x * 0.12 + p1) * Math.cos(z * 0.1 + p2) + 0.28 * Math.sin(x * 0.27 + z * 0.19 + p3) + 0.15 * Math.cos(z * 0.33 - x * 0.11 + p1) + 0.42;
      for (let i = 0; i < T.hills.length; i += 1) {
        const a = T.hills[i];
        const d2 = ((x - a[0]) * (x - a[0]) + (z - a[1]) * (z - a[1])) / (a[2] * a[2]);
        if (d2 < 6) h += a[3] * Math.exp(-d2 * 1.6);
      }
      for (let i = 0; i < T.flats.length; i += 1) {
        const a = T.flats[i];
        const d = Math.hypot((x - a[0]) / a[2], (z - a[1]) / a[3]);
        if (d < 1.25) h = U.lerp(h, a[4], 1 - U.smooth(0.8, 1.22, d));
      }
      for (let i = 0; i < T.tracks.length; i += 1) {
        const a = T.tracks[i];
        const d = Math.abs(z - a[0]);
        if (d < a[1] + 1.8) h = U.lerp(h, a[2], 1 - U.smooth(a[1], a[1] + 1.7, d));
      }
      const ax = Math.abs(x);
      if (sea) {
        h = U.lerp(h, -4.4, U.smooth(26.5, 32, ax));
        h = U.lerp(h, -4.4, Math.max(U.smooth(61, 68, z), U.smooth(-84, -91, z)));
      } else {
        const e = Math.max(0, ax - 30) + Math.max(0, z - 71) + Math.max(0, -84.5 - z);
        if (e > 0) h += Math.min(19, e * e * 0.34) * (0.55 + 0.3 * Math.abs(Math.sin(z * 0.23 + x * 0.17 + p2)) + 0.15 * Math.abs(Math.sin(z * 0.61 - x * 0.43 + p1)));
      }
      for (let i = 0; i < T.pools.length; i += 1) {
        const a = T.pools[i];
        const d = Math.hypot((x - a[0]) / a[2], (z - a[1]) / a[3]);
        if (d < 1.15) h = U.lerp(h, -3.6, 1 - U.smooth(0.72, 1.1, d));
      }
      for (let i = 0; i < T.bands.length; i += 1) {
        const a = T.bands[i];
        const d = U.distSeg(x, z, a[0], a[1], a[2], a[3]);
        if (d < a[4] + a[5]) h = U.lerp(h, -3.6, 1 - U.smooth(a[4] - a[5], a[4] + a[5], d));
      }
      return h;
    };
  }

  function buildTerrain(def, theme, height) {
    const X0 = -62, X1 = 62, Z0 = -118, Z1 = 92, SX = 88, SZ = 316;
    const geo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, SX, SZ);
    geo.rotateX(-Math.PI / 2);
    geo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const snow = new THREE.Color(theme.snow), shade = new THREE.Color(theme.shade), shore = new THREE.Color(theme.shore), bed = new THREE.Color(theme.bed);
    const packed = new THREE.Color(theme.shade).lerp(snow, 0.35);
    const rnd = U.rng(def.terrain.seed);
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = height(x, z);
      pos.setY(i, h);
      tmpColor.copy(shade).lerp(snow, U.smooth(-0.35, 1.3, h));
      for (let t = 0; t < def.terrain.tracks.length; t += 1) {
        const tr = def.terrain.tracks[t];
        const d = Math.abs(z - tr[0]);
        if (d < tr[1] + 0.6 && Math.abs(x) < 31) tmpColor.lerp(packed, 1 - U.smooth(tr[1] - 0.4, tr[1] + 0.6, d));
      }
      if (h < -0.4) tmpColor.lerp(shore, U.smooth(-0.4, -1.0, h));
      if (h < WATER) tmpColor.lerp(bed, U.smooth(-1.0, -2.8, h));
      const n = 0.972 + rnd() * 0.028;
      colors[i * 3] = tmpColor.r * n;
      colors[i * 3 + 1] = tmpColor.g * n;
      colors[i * 3 + 2] = tmpColor.b * n;
    }
    geo.computeVertexNormals();
    /* dik yamaçlar buz mavisine döner: uçurumlar ve tepeler belirginleşir */
    const nrm = geo.attributes.normal;
    const wall = new THREE.Color(theme.shade).lerp(snow, 0.12);
    for (let i = 0; i < pos.count; i += 1) {
      const k = U.smooth(0.1, 0.55, 1 - nrm.getY(i)) * 0.8;
      if (k > 0 && pos.getY(i) > WATER) {
        colors[i * 3] = U.lerp(colors[i * 3], wall.r, k);
        colors[i * 3 + 1] = U.lerp(colors[i * 3 + 1], wall.g, k);
        colors[i * 3 + 2] = U.lerp(colors[i * 3 + 2], wall.b, k);
      }
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    mesh.receiveShadow = true;
    return mesh;
  }

  /* ───────── Bölüm kurulumu ───────── */
  function disposeRoot(node) {
    node.traverse((o) => {
      if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
      if (o.userData && o.userData.label && o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      } else if (o.userData && o.userData.ownMat && o.material) o.material.dispose();
    });
  }

  W.build = (def, opts) => {
    if (root) {
      scene.remove(root);
      disposeRoot(root);
    }
    if (backdrop) {
      scene.remove(backdrop);
      disposeRoot(backdrop);
    }
    const options = opts || {};
    const theme = Art.themes[def.theme];
    root = new THREE.Group();
    backdrop = new THREE.Group();
    scene.add(root);
    scene.add(backdrop);
    scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);
    renderer.setClearColor(theme.fog);
    hemi.color.set(theme.hemiSky);
    hemi.groundColor.set(theme.hemiGround);
    hemi.intensity = theme.hemiI;
    sun.color.set(theme.sun);
    sun.intensity = theme.sunI;
    W.sunOffset = new THREE.Vector3(theme.sunPos[0], theme.sunPos[1], theme.sunPos[2]).normalize().multiplyScalar(80);

    backdrop.add(Art.sky(theme));
    backdrop.add(Art.disc(theme));
    if (theme.stars > 0) backdrop.add(Art.stars(theme.stars));
    let aurora = null;
    if (theme.aurora) {
      aurora = Art.aurora();
      backdrop.add(aurora);
    }
    const mountains = Art.mountains(theme, def.terrain.seed);
    mountains.position.z = -10;
    root.add(mountains);

    const height = makeHeight(def);
    const sea = def.rim === "sea";
    const L = {
      def, theme, height, water: WATER, aurora,
      bounds: sea ? { minX: -25.5, maxX: 25.5, minZ: -82, maxZ: 59 } : { minX: -29.5, maxX: 29.5, minZ: -82, maxZ: 59.5 },
      flags: [], crystals: [], lanes: [], platforms: [], colliders: [], npcs: [],
      spinners: [], blinkers: [], bobbers: [], cloths: [], builds: [], colony: [], finale: null
    };

    root.add(buildTerrain(def, theme, height));

    const waterMap = Art.tex.water;
    waterMap.repeat.set(46, 46);
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(460, 460),
      new THREE.MeshPhongMaterial({ color: theme.water, map: waterMap, transparent: true, opacity: 0.9, shininess: 70, specular: 0x7fc4d8 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, WATER, -12);
    water.receiveShadow = true;
    root.add(water);
    L.waterMap = waterMap;

    (def.ice || []).forEach((z) => {
      const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(1, 48),
        new THREE.MeshPhongMaterial({ map: Art.tex.ice, color: theme.ice, shininess: 120, specular: 0xffffff, transparent: true, opacity: 0.94 })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.set(z[2], z[3], 1);
      mesh.position.set(z[0], height(z[0], z[1]) + 0.06, z[1]);
      mesh.receiveShadow = true;
      root.add(mesh);
    });

    function register(g, x, z) {
      if (g.userData.collider) L.colliders.push({ x, z, r: g.userData.collider });
      if (g.userData.bob) L.bobbers.push(g);
      if (g.userData.cloth) L.cloths.push({ mesh: g.userData.cloth, phase: x * 0.3 });
      g.traverse((o) => {
        if (o.userData.spin) L.spinners.push(o);
        if (o.userData.blink) L.blinkers.push(o);
      });
    }

    function place(p) {
      const make = Art.props[p.type];
      if (!make) return null;
      const g = make(p);
      const y = g.userData.float ? WATER : height(p.x, p.z);
      g.position.set(p.x, y, p.z);
      g.rotation.y = p.rot || 0;
      root.add(g);
      register(g, p.x, p.z);
      if (g.userData.penguins) {
        g.userData.penguins.forEach((pg) => {
          pg.position.y = height(p.x + pg.position.x, p.z + pg.position.z) - y;
          pg.userData.baseY = pg.position.y;
          L.colony.push(pg);
        });
      }
      return g;
    }
    def.props.forEach(place);

    /* Bilgi bayrakları */
    def.flags.forEach((f, i) => {
      const g = Art.flagPole();
      g.position.set(f.x, height(f.x, f.z), f.z);
      root.add(g);
      const flag = {
        index: i, x: f.x, z: f.z, y: g.position.y, qid: def.questions[i], state: "ready", group: g,
        cloth: g.userData.cloth, ring: g.userData.ring, beam: g.userData.beam, mark: g.userData.mark, phase: i * 1.7, pop: 0, build: null
      };
      L.cloths.push({ mesh: flag.cloth, phase: flag.phase });
      if (f.build) {
        const b = Art.props[f.build.type](f.build);
        const by = height(f.build.x, f.build.z);
        b.position.set(f.build.x, by, f.build.z);
        b.rotation.y = f.build.rot || 0;
        b.visible = false;
        root.add(b);
        const site = new THREE.Mesh(
          new THREE.RingGeometry(3.0, 3.35, 4, 1),
          new THREE.MeshBasicMaterial({ color: 0xffc233, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
        );
        site.rotation.x = -Math.PI / 2;
        site.rotation.z = Math.PI / 4 + (f.build.rot || 0);
        site.position.set(f.build.x, by + 0.12, f.build.z);
        root.add(site);
        const stakes = new THREE.Group();
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
          const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 5), Art.lam(0xff8a1f));
          stake.position.set(sx * 2.2, 0.55, sz * 2.2);
          stakes.add(stake);
        });
        stakes.position.set(f.build.x, by, f.build.z);
        stakes.rotation.y = f.build.rot || 0;
        root.add(stakes);
        flag.build = { def: f.build, group: b, site, stakes, t: -1 };
      }
      L.flags.push(flag);
    });

    /* Kristaller */
    (def.crystals || []).forEach((c, i) => {
      const mesh = Art.crystal();
      const y = Math.max(height(c[0], c[1]), WATER + 0.45) + 1.05 + (c[2] || 0) * 1.25;
      mesh.position.set(c[0], y, c[1]);
      root.add(mesh);
      L.crystals.push({ x: c[0], z: c[1], y, mesh, taken: false, phase: i * 0.9 });
    });

    /* Kartopu yolları */
    (def.lanes || []).forEach((ld, li) => {
      const lane = { z: ld.z, dir: ld.dir, speed: ld.speed, every: ld.every, r: ld.r, timer: 0.4 + li * 0.5, balls: [], y: height(0, ld.z) };
      for (let i = 0; i < 5; i += 1) {
        const mesh = Art.snowball(ld.r);
        mesh.visible = false;
        root.add(mesh);
        lane.balls.push({ mesh, x: 0, active: false });
      }
      [-1, 1].forEach((side) => {
        const mound = new THREE.Mesh(new THREE.SphereGeometry(3.4, 12, 8), Art.lam(0xffffff));
        mound.scale.set(1, 0.9, 1.25);
        mound.position.set(side * 32.5, lane.y + 0.2, ld.z);
        root.add(mound);
        if (side === -ld.dir) {
          const mouth = new THREE.Mesh(new THREE.CircleGeometry(1.9, 16), new THREE.MeshBasicMaterial({ color: 0x14304f }));
          mouth.position.set(side * 29.6, lane.y + 1.5, ld.z);
          mouth.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
          root.add(mouth);
        }
      });
      L.lanes.push(lane);
    });

    /* Yüzen buzlar */
    (def.floes || []).forEach((row, ri) => {
      row.homes.forEach((home, hi) => {
        const mesh = Art.floe(row.r, ri * 17 + hi * 5 + 3);
        root.add(mesh);
        L.platforms.push({
          kind: "floe", home, x: home, z: row.z, r: row.r * 0.93, top: WATER + 0.42, amp: row.amp, w: row.w,
          phase: hi * 1.9 + ri * 0.8, vx: 0, vz: 0, solid: true, mesh, tilt: 0, load: 0
        });
      });
    });

    /* Çatlayan buz karoları */
    (def.tiles || []).forEach((field) => {
      const R = 2.0, dx = Math.sqrt(3) * R;
      const rnd = U.rng(field.seed);
      field.zs.forEach((z, r) => {
        for (let c = 0; c < field.cols; c += 1) {
          const edge = r === 0 || r === field.zs.length - 1;
          const keep = field.pattern === "stripes" ? (c + r) % 3 < 2 : rnd() > (edge ? 0.06 : 0.2);
          if (!keep) continue;
          const x = field.x0 + c * dx + (r % 2 ? dx / 2 : 0);
          const mesh = Art.tile(R);
          mesh.position.set(x, WATER + 0.1, z);
          root.add(mesh);
          L.platforms.push({ kind: "tile", x, z, r: 1.92, top: WATER + 0.4, vx: 0, vz: 0, solid: true, state: "solid", timer: 0, mesh, baseY: WATER + 0.1 });
        }
      });
    });

    /* Rehber ve konuk karakterler */
    (def.npcs || []).forEach((n, i) => {
      const key = n.who === "bear" ? "bear" : options.guide || "cute";
      const tall = n.who === "bear" ? 3.5 : 2.3;
      const body = Art.spawnModel(key, tall);
      const g = new THREE.Group();
      g.add(body);
      const shadow = Art.blobShadow(n.who === "bear" ? 1.5 : 1.0);
      shadow.position.y = 0.08;
      g.add(shadow);
      const y = height(n.x, n.z);
      g.position.set(n.x, y, n.z);
      g.rotation.y = n.face || 0;
      root.add(g);
      const collider = { x: n.x, z: n.z, r: n.who === "bear" ? 1.2 : 0.8 };
      L.colliders.push(collider);
      L.npcs.push({ who: n.who, group: g, body, x: n.x, z: n.z, y, face: n.face || 0, phase: i * 2.1, def: n, moved: false, collider });
    });

    /* Bölüm sonu görev noktası */
    const fg = Art.props.finale(def.finale);
    fg.position.set(def.finale.x, height(def.finale.x, def.finale.z), def.finale.z);
    root.add(fg);
    L.finale = { x: def.finale.x, z: def.finale.z, y: fg.position.y, group: fg, ring: fg.userData.ring, beam: fg.userData.beam, star: fg.userData.star, label: fg.userData.label, unlocked: false, glow: 0 };

    setSnow(theme.snowfall);
    W.level = L;
    return L;
  };

  /* Bayrak toplandığında */
  W.collectFlag = (flag) => {
    flag.state = "done";
    flag.pop = 1;
    flag.ring.material.color.set(0x1fa97a);
    flag.beam.visible = false;
    flag.mark.material = new THREE.SpriteMaterial({ map: Art.badge("ok"), depthWrite: false });
    W.burst("confetti", flag.x, flag.y + 3.2, flag.z, 46);
    if (flag.build) {
      flag.build.t = 0;
      flag.build.group.visible = true;
      flag.build.group.scale.setScalar(0.001);
      flag.build.site.visible = false;
      flag.build.stakes.visible = false;
      const L = W.level;
      L.colliders.push({ x: flag.build.def.x, z: flag.build.def.z, r: flag.build.group.userData.collider || 2 });
      flag.build.group.traverse((o) => {
        if (o.userData.spin) L.spinners.push(o);
        if (o.userData.blink) L.blinkers.push(o);
      });
      W.burst("dust", flag.build.def.x, flag.build.group.position.y + 0.4, flag.build.def.z, 40);
    }
  };

  /* bölüm bitince görev noktası sadeleşir: kutlama sahnesi kapanmasın */
  W.finishFinale = () => {
    const f = W.level.finale;
    f.unlocked = false;
    f.label.visible = false;
    f.star.visible = false;
    f.ring.visible = false;
  };

  W.unlockFinale = () => {
    const f = W.level.finale;
    f.unlocked = true;
    f.ring.material.color.set(0xffc233);
  };

  /* ───────── Her karede güncelleme ───────── */
  W.update = (dt, t, px, py, pz) => {
    const L = W.level;
    if (!L) return;
    backdrop.position.copy(camera.position);
    if (L.aurora) {
      L.aurora.userData.material.uniforms.t.value = t;
      /* kuzey ışıkları karı yeşilden mora yavaşça boyar */
      hemi.color.set(L.theme.hemiSky).lerp(tmpColor.set(L.theme.hemiSky2), 0.5 + 0.5 * Math.sin(t * 0.4));
    }
    L.waterMap.offset.x = t * 0.004;
    L.waterMap.offset.y = Math.sin(t * 0.25) * 0.01;

    for (let i = 0; i < L.cloths.length; i += 1) Art.waveCloth(L.cloths[i].mesh, t, L.cloths[i].phase);

    for (let i = 0; i < L.flags.length; i += 1) {
      const f = L.flags[i];
      const pulse = 1 + Math.sin(t * 3.2 + f.phase) * 0.07;
      if (f.state === "ready") {
        f.ring.scale.set(pulse, pulse, 1);
        f.mark.position.y = 5.5 + Math.sin(t * 2.2 + f.phase) * 0.16;
        f.beam.material.opacity = 0.1 + Math.sin(t * 2 + f.phase) * 0.03;
      } else if (f.pop > 0) {
        f.pop = Math.max(0, f.pop - dt * 1.6);
        const k = 1 + Math.sin((1 - f.pop) * Math.PI) * 0.35;
        f.mark.scale.set(1.25 * k, 1.25 * k, 1);
        f.ring.scale.set(1 + (1 - f.pop) * 0.25, 1 + (1 - f.pop) * 0.25, 1);
        f.ring.material.opacity = 0.35 + f.pop * 0.6;
      }
      if (f.build && f.build.t >= 0 && f.build.t < 1) {
        f.build.t = Math.min(1, f.build.t + dt / 0.95);
        const s = U.easeOutBack(f.build.t);
        f.build.group.scale.set(s, Math.max(0.001, U.easeOutElastic(f.build.t)), s);
      }
    }

    for (let i = 0; i < L.crystals.length; i += 1) {
      const c = L.crystals[i];
      if (c.taken) continue;
      c.mesh.rotation.y = t * 1.6 + c.phase;
      c.mesh.position.y = c.y + Math.sin(t * 2.4 + c.phase) * 0.14;
    }

    for (let i = 0; i < L.spinners.length; i += 1) L.spinners[i].rotation.y += L.spinners[i].userData.spin * dt;
    const blinkOn = Math.sin(t * 4.2) > -0.2;
    for (let i = 0; i < L.blinkers.length; i += 1) L.blinkers[i].visible = blinkOn;
    for (let i = 0; i < L.bobbers.length; i += 1) {
      const b = L.bobbers[i], o = b.userData.bob;
      b.position.y = WATER + Math.sin(t * o.speed + o.phase) * o.amp;
      if (o.roll) b.rotation.z = Math.sin(t * o.speed * 0.8 + o.phase) * o.roll;
    }
    for (let i = 0; i < L.colony.length; i += 1) {
      const p = L.colony[i];
      p.position.y = p.userData.baseY + Math.abs(Math.sin(t * 2.2 + p.userData.phase)) * 0.07;
      p.rotation.z = Math.sin(t * 2.2 + p.userData.phase) * 0.08;
    }

    /* kartopları */
    for (let i = 0; i < L.lanes.length; i += 1) {
      const lane = L.lanes[i];
      lane.timer -= dt;
      if (lane.timer <= 0) {
        lane.timer = lane.every * (0.85 + Math.random() * 0.4);
        const ball = lane.balls.find((b) => !b.active);
        if (ball) {
          ball.active = true;
          ball.x = -lane.dir * 31;
          ball.mesh.visible = true;
        }
      }
      for (let b = 0; b < lane.balls.length; b += 1) {
        const ball = lane.balls[b];
        if (!ball.active) continue;
        ball.x += lane.dir * lane.speed * dt;
        ball.mesh.position.set(ball.x, lane.y + lane.r - 0.05, lane.z);
        ball.mesh.rotation.z -= (lane.dir * lane.speed * dt) / lane.r;
        if (ball.x * lane.dir > 30.5) {
          ball.active = false;
          ball.mesh.visible = false;
          W.burst("snow", ball.x, lane.y + 1, lane.z, 14);
        }
      }
    }

    /* yüzen buzlar ve karolar */
    for (let i = 0; i < L.platforms.length; i += 1) {
      const p = L.platforms[i];
      if (p.kind === "floe") {
        const a = t * p.w + p.phase;
        p.x = p.home + p.amp * Math.sin(a);
        p.vx = p.amp * p.w * Math.cos(a);
        p.tilt = U.damp(p.tilt, p.load, 6, dt);
        p.mesh.position.set(p.x, WATER + 0.045 + Math.sin(t * 1.3 + p.phase) * 0.04 - p.tilt * 0.12, p.z);
        p.mesh.rotation.x = Math.sin(t * 0.9 + p.phase) * 0.02 + p.tilt * 0.03;
        p.mesh.rotation.y = p.phase;
        p.load = 0;
      } else {
        if (p.state === "crack") {
          p.timer -= dt;
          p.mesh.position.x = p.x + (Math.random() - 0.5) * 0.1;
          p.mesh.position.y = p.baseY - (1 - Math.max(0, p.timer) / 0.9) * 0.12;
          if (p.timer <= 0) {
            p.state = "sink";
            p.timer = 0.5;
            W.burst("splash", p.x, WATER + 0.1, p.z, 12);
          }
        } else if (p.state === "sink") {
          p.timer -= dt;
          p.mesh.position.y = p.baseY - 0.12 - (1 - Math.max(0, p.timer) / 0.5) * 1.3;
          p.mesh.rotation.z = (1 - Math.max(0, p.timer) / 0.5) * 0.25;
          if (p.timer < 0.3) p.solid = false;
          if (p.timer <= 0) {
            p.state = "gone";
            p.timer = 5.5;
            p.mesh.visible = false;
          }
        } else if (p.state === "gone") {
          p.timer -= dt;
          if (p.timer <= 0) {
            p.state = "rise";
            p.timer = 0.7;
            p.mesh.visible = true;
            p.mesh.rotation.z = 0;
            p.mesh.position.x = p.x;
            p.mesh.material.color.set(0xeaf6ff);
          }
        } else if (p.state === "rise") {
          p.timer -= dt;
          p.mesh.position.y = p.baseY - Math.max(0, p.timer / 0.7) * 1.4;
          if (p.timer <= 0) {
            p.state = "solid";
            p.solid = true;
            p.mesh.position.y = p.baseY;
          }
        }
      }
    }

    /* rehberler */
    for (let i = 0; i < L.npcs.length; i += 1) {
      const n = L.npcs[i];
      if (n.def.relocateZ !== undefined && !n.moved && pz < n.def.relocateZ) {
        n.moved = true;
        n.x = n.def.to[0];
        n.z = n.def.to[1];
        n.y = L.height(n.x, n.z);
        n.face = n.def.toFace || 0;
        n.group.position.set(n.x, n.y, n.z);
        n.collider.x = n.x;
        n.collider.z = n.z;
      }
      const d = Math.hypot(px - n.x, pz - n.z);
      const want = d < 16 ? Math.atan2(px - n.x, pz - n.z) : n.face;
      n.group.rotation.y = U.angleLerp(n.group.rotation.y, want, 1 - Math.exp(-4 * dt));
      const excited = d < 9 ? 1 : 0.35;
      const hop = Math.abs(Math.sin(t * (2.2 + excited * 2.4) + n.phase));
      n.body.position.y = hop * 0.22 * excited;
      n.body.scale.set(1 + (1 - hop) * 0.04 * excited, 1 - (1 - hop) * 0.05 * excited, 1 + (1 - hop) * 0.04 * excited);
      n.body.rotation.z = Math.sin(t * 2.3 + n.phase) * 0.05;
    }

    /* görev noktası */
    const f = L.finale;
    f.glow = U.damp(f.glow, f.unlocked ? 1 : 0, 3, dt);
    f.beam.material.opacity = f.glow * (0.2 + Math.sin(t * 2.4) * 0.05);
    const fp = 1 + Math.sin(t * 3) * (f.unlocked ? 0.08 : 0.02);
    f.ring.scale.set(fp, fp, 1);
    f.star.position.y = 3.1 + Math.sin(t * 2) * 0.18;
    f.star.material.rotation = Math.sin(t * 1.4) * 0.18;

    /* ışık oyuncuyu izler */
    sun.target.position.set(px, py, pz - 6);
    sun.position.set(px + W.sunOffset.x, py + W.sunOffset.y, pz - 6 + W.sunOffset.z);

    updateParticles(dt);
    updateSnow(dt, px, py, pz);
  };

  W.render = () => renderer.render(scene, camera);

  /* ───────── Parçacıklar ───────── */
  const PN = 720;
  let pGeo, pMat, pPoints, pCursor = 0;
  const pp = {
    pos: new Float32Array(PN * 3), vel: new Float32Array(PN * 3), col: new Float32Array(PN * 3),
    alpha: new Float32Array(PN), size: new Float32Array(PN), base: new Float32Array(PN),
    life: new Float32Array(PN), max: new Float32Array(PN), grav: new Float32Array(PN), drag: new Float32Array(PN)
  };

  function initParticles() {
    pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pp.pos, 3));
    pGeo.setAttribute("aColor", new THREE.BufferAttribute(pp.col, 3));
    pGeo.setAttribute("aAlpha", new THREE.BufferAttribute(pp.alpha, 1));
    pGeo.setAttribute("aSize", new THREE.BufferAttribute(pp.size, 1));
    pMat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 600 } },
      transparent: true,
      depthWrite: false,
      vertexShader: "attribute vec3 aColor; attribute float aAlpha; attribute float aSize; uniform float uScale; varying vec3 vColor; varying float vAlpha; void main(){ vColor = aColor; vAlpha = aAlpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / max(0.1, -mv.z); gl_Position = projectionMatrix * mv; }",
      fragmentShader: "varying vec3 vColor; varying float vAlpha; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5 || vAlpha < 0.01) discard; gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.3, d)); }"
    });
    pPoints = new THREE.Points(pGeo, pMat);
    pPoints.frustumCulled = false;
    pPoints.renderOrder = 5;
    scene.add(pPoints);
  }

  function updatePointScale() {
    if (!pMat) return;
    const size = new THREE.Vector2();
    renderer.getDrawingBufferSize(size);
    pMat.uniforms.uScale.value = (size.y * 0.5) / Math.tan((camera.fov * Math.PI) / 360);
  }

  function emit(x, y, z, vx, vy, vz, life, size, grav, drag, r, g, b) {
    const i = pCursor;
    pCursor = (pCursor + 1) % PN;
    pp.pos[i * 3] = x; pp.pos[i * 3 + 1] = y; pp.pos[i * 3 + 2] = z;
    pp.vel[i * 3] = vx; pp.vel[i * 3 + 1] = vy; pp.vel[i * 3 + 2] = vz;
    pp.col[i * 3] = r; pp.col[i * 3 + 1] = g; pp.col[i * 3 + 2] = b;
    pp.life[i] = life; pp.max[i] = life; pp.base[i] = size; pp.grav[i] = grav; pp.drag[i] = drag;
  }

  const CONFETTI = [[0.89, 0.04, 0.09], [1, 1, 1], [1, 0.76, 0.2], [0.12, 0.66, 0.48], [0.2, 0.62, 0.9]];
  W.burst = (kind, x, y, z, count) => {
    const n = W.reducedMotion ? Math.ceil(count / 3) : count;
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * TAU, s = Math.random();
      if (kind === "snow") emit(x + Math.cos(a) * 0.3, y + 0.1, z + Math.sin(a) * 0.3, Math.cos(a) * (1 + s * 2.2), 1.2 + s * 2.4, Math.sin(a) * (1 + s * 2.2), 0.5 + s * 0.4, 0.34 + s * 0.3, 7, 2.2, 1, 1, 1);
      else if (kind === "splash") emit(x + Math.cos(a) * 0.5, y, z + Math.sin(a) * 0.5, Math.cos(a) * (1.5 + s * 3), 4 + s * 5, Math.sin(a) * (1.5 + s * 3), 0.6 + s * 0.5, 0.22 + s * 0.28, 16, 0.6, 0.78, 0.93, 1);
      else if (kind === "spark") emit(x, y, z, Math.cos(a) * (1 + s * 2.5), 2 + s * 3.5, Math.sin(a) * (1 + s * 2.5), 0.5 + s * 0.5, 0.2 + s * 0.22, 5, 1.6, 0.62, 0.92, 1);
      else if (kind === "dust") emit(x + Math.cos(a) * 2.2, y, z + Math.sin(a) * 2.2, Math.cos(a) * (2 + s * 3), 0.8 + s * 2.6, Math.sin(a) * (2 + s * 3), 0.7 + s * 0.6, 0.5 + s * 0.6, 2.5, 2.4, 1, 1, 1);
      else if (kind === "ice") emit(x, y, z, Math.cos(a) * (2 + s * 3), 3 + s * 4, Math.sin(a) * (2 + s * 3), 0.5 + s * 0.4, 0.2 + s * 0.2, 14, 0.6, 0.7, 0.92, 1);
      else {
        const c = CONFETTI[i % CONFETTI.length];
        emit(x, y, z, Math.cos(a) * (2 + s * 4.5), 4 + Math.random() * 6, Math.sin(a) * (2 + s * 4.5), 1.1 + s * 0.9, 0.24 + s * 0.2, 9, 1.1, c[0], c[1], c[2]);
      }
    }
  };

  function updateParticles(dt) {
    for (let i = 0; i < PN; i += 1) {
      if (pp.life[i] <= 0) {
        if (pp.alpha[i] !== 0) pp.alpha[i] = 0;
        continue;
      }
      pp.life[i] -= dt;
      const k = Math.max(0, 1 - pp.drag[i] * dt);
      pp.vel[i * 3] *= k;
      pp.vel[i * 3 + 2] *= k;
      pp.vel[i * 3 + 1] -= pp.grav[i] * dt;
      pp.pos[i * 3] += pp.vel[i * 3] * dt;
      pp.pos[i * 3 + 1] += pp.vel[i * 3 + 1] * dt;
      pp.pos[i * 3 + 2] += pp.vel[i * 3 + 2] * dt;
      const f = Math.max(0, pp.life[i] / pp.max[i]);
      pp.alpha[i] = Math.min(1, f * 2.2);
      pp.size[i] = pp.base[i] * (0.55 + 0.45 * f);
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.aAlpha.needsUpdate = true;
    pGeo.attributes.aSize.needsUpdate = true;
    pGeo.attributes.aColor.needsUpdate = true;
  }

  /* ───────── Kar yağışı ───────── */
  const SNOW_MAX = 320;
  function initSnow() {
    snowData = { pos: new Float32Array(SNOW_MAX * 3), speed: new Float32Array(SNOW_MAX) };
    for (let i = 0; i < SNOW_MAX; i += 1) {
      snowData.pos[i * 3] = (Math.random() - 0.5) * 80;
      snowData.pos[i * 3 + 1] = Math.random() * 34;
      snowData.pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      snowData.speed[i] = 1.6 + Math.random() * 2.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(snowData.pos, 3));
    snowPoints = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.42, map: Art.tex.glow, transparent: true, opacity: 0.9, depthWrite: false, sizeAttenuation: true }));
    snowPoints.frustumCulled = false;
    scene.add(snowPoints);
  }

  function setSnow(count) {
    snowCount = Math.min(SNOW_MAX, W.reducedMotion ? Math.floor(count / 3) : count);
    snowPoints.geometry.setDrawRange(0, snowCount);
  }

  function updateSnow(dt, px, py, pz) {
    const pos = snowData.pos;
    const cz = pz - 8;
    for (let i = 0; i < snowCount; i += 1) {
      pos[i * 3] += (1.1 + Math.sin(i) * 0.6) * dt;
      pos[i * 3 + 1] -= snowData.speed[i] * dt;
      if (pos[i * 3 + 1] < py - 3) pos[i * 3 + 1] += 34;
      if (pos[i * 3] > px + 40) pos[i * 3] -= 80;
      else if (pos[i * 3] < px - 40) pos[i * 3] += 80;
      if (pos[i * 3 + 2] > cz + 40) pos[i * 3 + 2] -= 80;
      else if (pos[i * 3 + 2] < cz - 40) pos[i * 3 + 2] += 80;
      if (pos[i * 3 + 1] > py + 34) pos[i * 3 + 1] -= 34;
    }
    snowPoints.geometry.attributes.position.needsUpdate = true;
  }

  KBK.world = W;
}());
