/* Kutup Bayrak Kaşifi — dokular, modeller ve sahne parçaları */
(function () {
  "use strict";
  const KBK = window.KBK;
  const U = KBK.util;
  const THREE = window.THREE;
  const TAU = Math.PI * 2;
  const Art = {};
  const FONT = '"Baloo 2", "Segoe UI", system-ui, sans-serif';

  /* ───────── Temalar ───────── */
  Art.themes = {
    dawn: {
      zenith: 0x2c4a8f, mid: 0xee9fa2, horizon: 0xffddb0, fog: 0xf3cdbd, fogNear: 70, fogFar: 240,
      hemiSky: 0xc4d6ff, hemiGround: 0xf0cdbb, hemiI: 0.66, sun: 0xffc49a, sunI: 0.82, sunPos: [-46, 30, -52],
      snow: 0xffffff, shade: 0xc7d6f3, shore: 0xa9e2f0, bed: 0x2a7896, ice: 0xbfeaff, water: 0x2a8fb5,
      peak: 0xf6e9ee, peakBase: 0x8fa4d6, stars: 0.35, aurora: 0, snowfall: 260, disc: 0xfff0c8
    },
    day: {
      zenith: 0x2f7fd8, mid: 0x8fc6f4, horizon: 0xe2f2ff, fog: 0xdbebf8, fogNear: 80, fogFar: 260,
      hemiSky: 0xd4e6ff, hemiGround: 0xc9d9ea, hemiI: 0.62, sun: 0xfffaf0, sunI: 0.5, sunPos: [38, 58, 30],
      snow: 0xffffff, shade: 0xc4d9f2, shore: 0xa9e2f0, bed: 0x2a7896, ice: 0xbfeaff, water: 0x2493bd,
      peak: 0xffffff, peakBase: 0x8db4e0, stars: 0, aurora: 0, snowfall: 160, disc: 0xffffff
    },
    sea: {
      zenith: 0x1b7fc4, mid: 0x7fd0ee, horizon: 0xe8f9ff, fog: 0xd3eef7, fogNear: 80, fogFar: 260,
      hemiSky: 0xd6efff, hemiGround: 0xc4dfe8, hemiI: 0.62, sun: 0xfffbf0, sunI: 0.5, sunPos: [-30, 56, 38],
      snow: 0xffffff, shade: 0xc2e0ee, shore: 0x9fe6ee, bed: 0x1f7f99, ice: 0xbfeaff, water: 0x1a9fbe,
      peak: 0xffffff, peakBase: 0x86c3dc, stars: 0, aurora: 0, snowfall: 120, disc: 0xffffff
    },
    aurora: {
      zenith: 0x050b26, mid: 0x0c2a4e, horizon: 0x1f6a78, fog: 0x123a55, fogNear: 70, fogFar: 250,
      hemiSky: 0x9fe6cf, hemiSky2: 0xb7a8f5, hemiGround: 0x2f558c, hemiI: 0.8, sun: 0xe6efff, sunI: 0.4, sunPos: [30, 52, -36],
      snow: 0xeaf4ff, shade: 0x86a6dc, shore: 0x7fd9e6, bed: 0x0f4a66, ice: 0xa9e2ff, water: 0x0f6a8c,
      peak: 0xc4dcf5, peakBase: 0x2a4f7d, stars: 1, aurora: 1, snowfall: 200, disc: 0xeaf2ff
    }
  };

  /* ───────── Türk bayrağı: yasal ölçülere göre (en G, boy 1,5 G) ───────── */
  Art.drawFlag = (ctx, x, y, length) => {
    const s = length / 1200;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = "#E30A17";
    ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(425, 400, 200, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#E30A17";
    ctx.beginPath();
    ctx.arc(475, 400, 160, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? 100 : 38.1966;
      const a = Math.PI + (i * Math.PI) / 5;
      const px = 683.334 + r * Math.cos(a);
      const py = 400 + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  let maxAniso = 1;
  const tex = {};
  Art.init = (renderer) => {
    maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    tex.flag = canvasTexture(600, 400, (ctx) => Art.drawFlag(ctx, 0, 0, 600));
    tex.blob = canvasTexture(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
      g.addColorStop(0, "rgba(10,30,60,0.55)");
      g.addColorStop(0.6, "rgba(10,30,60,0.25)");
      g.addColorStop(1, "rgba(10,30,60,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });
    tex.glow = canvasTexture(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.45)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });
    tex.water = canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 256, 256);
      const rnd = U.rng(7);
      ctx.lineCap = "round";
      for (let i = 0; i < 46; i += 1) {
        const x = rnd() * 256, y = rnd() * 256, w = 18 + rnd() * 46;
        ctx.strokeStyle = `rgba(190,235,250,${0.25 + rnd() * 0.4})`;
        ctx.lineWidth = 1.5 + rnd() * 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + w / 2, y - 5 + rnd() * 10, x + w, y);
        ctx.stroke();
      }
    });
    tex.water.wrapS = tex.water.wrapT = THREE.RepeatWrapping;
    tex.ice = canvasTexture(256, 256, (ctx) => {
      const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
      g.addColorStop(0, "#e9fbff");
      g.addColorStop(0.7, "#c2ecfb");
      g.addColorStop(1, "#8fd6ee");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      const rnd = U.rng(3);
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      for (let i = 0; i < 26; i += 1) {
        ctx.lineWidth = 0.8 + rnd() * 1.4;
        const x = rnd() * 256, y = rnd() * 256, a = rnd() * TAU, l = 20 + rnd() * 60;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
    });
  };
  Art.tex = tex;

  function canvasTexture(w, h, draw) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    draw(canvas.getContext("2d"), w, h);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = maxAniso;
    return texture;
  }

  function fitFont(ctx, text, weight, size, maxWidth) {
    let px = size;
    do {
      ctx.font = `${weight} ${px}px ${FONT}`;
      px -= 2;
    } while (ctx.measureText(text).width > maxWidth && px > 14);
  }

  /* Tabela / etiket dokusu */
  Art.labelTexture = (title, sub, style) => {
    const dark = style === "dark";
    return canvasTexture(512, sub ? 208 : 144, (ctx, w, h) => {
      ctx.fillStyle = dark ? "#0b2545" : "#fdf6e6";
      roundRect(ctx, 4, 4, w - 8, h - 8, 22);
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = dark ? "#ffc233" : "#7a5230";
      roundRect(ctx, 8, 8, w - 16, h - 16, 18);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dark ? "#ffffff" : "#0b2545";
      fitFont(ctx, title, 800, sub ? 58 : 62, w - 60);
      ctx.fillText(title, w / 2, sub ? h * 0.38 : h / 2 + 3);
      if (sub) {
        ctx.fillStyle = dark ? "#ffd772" : "#8a4a1c";
        fitFont(ctx, sub, 600, 36, w - 64);
        ctx.fillText(sub, w / 2, h * 0.72);
      }
    });
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  Art.roundRect = roundRect;

  /* Yuvarlak rozet (bayrak üstündeki ? / ✓ ve hedef simgeleri) */
  Art.badgeTexture = (glyph, bg, fg) =>
    canvasTexture(128, 128, (ctx) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(64, 64, 60, 0, TAU);
      ctx.fill();
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(64, 64, 51, 0, TAU);
      ctx.fill();
      ctx.fillStyle = fg;
      ctx.font = `800 78px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(glyph, 64, 70);
    });

  /* ───────── Malzeme ve geometri yardımcıları ───────── */
  const matCache = new Map();
  function lam(color, extra) {
    const key = color + "|" + (extra ? JSON.stringify(extra) : "");
    if (!matCache.has(key)) matCache.set(key, new THREE.MeshLambertMaterial(Object.assign({ color }, extra || {})));
    return matCache.get(key);
  }
  Art.lam = lam;

  function flat(geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.computeVertexNormals();
    return g;
  }
  Art.flat = flat;

  function M(geo, material, x, y, z, opts) {
    const mesh = new THREE.Mesh(geo, typeof material === "number" ? lam(material) : material);
    mesh.position.set(x || 0, y || 0, z || 0);
    const o = opts || {};
    if (o.rx) mesh.rotation.x = o.rx;
    if (o.ry) mesh.rotation.y = o.ry;
    if (o.rz) mesh.rotation.z = o.rz;
    if (o.s) mesh.scale.setScalar(o.s);
    if (o.scale) mesh.scale.set(o.scale[0], o.scale[1], o.scale[2]);
    mesh.castShadow = !o.noShadow;
    mesh.receiveShadow = Boolean(o.receive);
    return mesh;
  }

  function group(collider) {
    const g = new THREE.Group();
    if (collider) g.userData.collider = collider;
    return g;
  }

  function labelPlane(title, sub, width, style) {
    const texture = Art.labelTexture(title, sub, style);
    const ratio = texture.image.height / texture.image.width;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, width * ratio),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    mesh.userData.label = true;
    return mesh;
  }

  /* ───────── Modeller (Meshy çıktılarından üretilen hafif sürümler) ───────── */
  const models = {};
  const PIVOT = { flag: 0.345, cute: 0.5, bear: 0.5 }; /* gövdenin x ekseninde merkezi */

  function decode(str, Type) {
    const bin = window.atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new Type(bytes.buffer);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  Art.loadModels = () => {
    const data = window.KBK_MODELS || {};
    const jobs = Object.keys(data).map((key) => {
      const d = data[key];
      const p16 = decode(d.p, Uint16Array);
      const n8 = decode(d.nrm, Int8Array);
      const t16 = decode(d.uv, Uint16Array);
      const idx = decode(d.idx, d.i32 ? Uint32Array : Uint16Array);
      const pos = new Float32Array(d.n * 3);
      const nor = new Float32Array(d.n * 3);
      const uv = new Float32Array(d.n * 2);
      const cx = PIVOT[key] === undefined ? 0.5 : PIVOT[key];
      for (let i = 0; i < d.n; i += 1) {
        pos[i * 3] = (p16[i * 3] / 65535 - cx) * d.size[0];
        pos[i * 3 + 1] = (p16[i * 3 + 1] / 65535) * d.size[1];
        pos[i * 3 + 2] = (p16[i * 3 + 2] / 65535 - 0.5) * d.size[2];
        nor[i * 3] = n8[i * 3] / 127;
        nor[i * 3 + 1] = n8[i * 3 + 1] / 127;
        nor[i * 3 + 2] = n8[i * 3 + 2] / 127;
        uv[i * 2] = t16[i * 2] / 65535;
        uv[i * 2 + 1] = t16[i * 2 + 1] / 65535;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geometry.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geometry.setIndex(new THREE.BufferAttribute(idx, 1));
      geometry.computeBoundingSphere();
      geometry.userData.shared = true;
      return loadImage(d.tex).then((img) => {
        const texture = new THREE.Texture(img);
        texture.flipY = false;
        texture.anisotropy = maxAniso;
        texture.needsUpdate = true;
        const material = new THREE.MeshLambertMaterial({ map: texture, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: 0.2 });
        models[key] = { geometry, material };
      });
    });
    return Promise.all(jobs).catch(() => {}).then(() => models);
  };

  /* Model yüklenemezse (ya da doğal penguen kolonisi için) kullanılan sade penguen */
  Art.simplePenguin = (h) => {
    const g = new THREE.Group();
    const s = h || 1;
    g.add(M(new THREE.SphereGeometry(0.3, 12, 10), 0x1c2733, 0, 0.42, 0, { scale: [1, 1.35, 0.95] }));
    g.add(M(new THREE.SphereGeometry(0.24, 12, 10), 0xfafcff, 0, 0.38, 0.1, { scale: [0.95, 1.3, 0.75], noShadow: true }));
    g.add(M(new THREE.SphereGeometry(0.2, 12, 10), 0x1c2733, 0, 0.86, 0.02));
    g.add(M(new THREE.ConeGeometry(0.06, 0.16, 6), 0xf5a623, 0, 0.84, 0.22, { rx: Math.PI / 2, noShadow: true }));
    g.add(M(new THREE.SphereGeometry(0.035, 6, 6), 0xffffff, -0.08, 0.92, 0.17, { noShadow: true }));
    g.add(M(new THREE.SphereGeometry(0.035, 6, 6), 0xffffff, 0.08, 0.92, 0.17, { noShadow: true }));
    g.add(M(new THREE.SphereGeometry(0.1, 8, 6), 0x1c2733, -0.3, 0.5, 0, { scale: [0.45, 2.2, 1], rz: 0.35 }));
    g.add(M(new THREE.SphereGeometry(0.1, 8, 6), 0x1c2733, 0.3, 0.5, 0, { scale: [0.45, 2.2, 1], rz: -0.35 }));
    g.add(M(new THREE.SphereGeometry(0.09, 8, 6), 0xf5a623, -0.12, 0.03, 0.1, { scale: [1, 0.4, 1.5], noShadow: true }));
    g.add(M(new THREE.SphereGeometry(0.09, 8, 6), 0xf5a623, 0.12, 0.03, 0.1, { scale: [1, 0.4, 1.5], noShadow: true }));
    g.scale.setScalar(s);
    return g;
  };

  /* height: karakterin oyundaki boyu */
  Art.spawnModel = (key, height) => {
    const m = models[key];
    if (!m) {
      const fallback = Art.simplePenguin(height * (key === "bear" ? 1.1 : 0.95));
      return fallback;
    }
    const mesh = new THREE.Mesh(m.geometry, m.material);
    mesh.scale.setScalar(height);
    mesh.castShadow = true;
    const g = new THREE.Group();
    g.add(mesh);
    return g;
  };

  Art.blobShadow = (radius) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 2, radius * 2),
      new THREE.MeshBasicMaterial({ map: tex.blob, transparent: true, depthWrite: false, opacity: 0.9 })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 2;
    return mesh;
  };

  /* ───────── Bilgi bayrağı ───────── */
  const badgeCache = {};
  function badge(kind) {
    if (!badgeCache[kind]) {
      badgeCache[kind] = kind === "ok" ? Art.badgeTexture("✓", "#1fa97a", "#ffffff") : Art.badgeTexture("?", "#ffc233", "#0b2545");
    }
    return badgeCache[kind];
  }
  Art.badge = badge;

  Art.clothMesh = (width, height) => {
    const geo = new THREE.PlaneGeometry(width, height, 14, 6);
    geo.translate(width / 2, 0, 0);
    const mat = new THREE.MeshLambertMaterial({ map: tex.flag, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: tex.flag, emissiveIntensity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.userData.base = geo.attributes.position.array.slice();
    mesh.userData.width = width;
    return mesh;
  };

  Art.waveCloth = (mesh, time, phase) => {
    const pos = mesh.geometry.attributes.position;
    const base = mesh.userData.base;
    const width = mesh.userData.width;
    for (let i = 0; i < pos.count; i += 1) {
      const bx = base[i * 3], by = base[i * 3 + 1];
      const k = bx / width;
      const wave = Math.sin(bx * 2.6 - time * 5.2 + phase) * 0.16 + Math.sin(bx * 5.1 - time * 7.4 + phase * 1.7 + by * 1.5) * 0.05;
      pos.array[i * 3 + 2] = wave * k;
      pos.array[i * 3 + 1] = by + Math.sin(bx * 1.9 - time * 3.1 + phase) * 0.05 * k;
    }
    pos.needsUpdate = true;
  };

  Art.flagPole = () => {
    const g = group();
    g.add(M(new THREE.SphereGeometry(1.1, 12, 8), 0xffffff, 0, -0.1, 0, { scale: [1, 0.3, 1], noShadow: true, receive: true }));
    g.add(M(new THREE.CylinderGeometry(0.055, 0.075, 4.3, 8), 0xe8eef4, 0, 2.15, 0));
    g.add(M(new THREE.SphereGeometry(0.12, 10, 8), 0xffc233, 0, 4.36, 0, { noShadow: true }));
    const cloth = Art.clothMesh(2.4, 1.6);
    cloth.position.set(0.06, 3.38, 0);
    g.add(cloth);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 2.0, 48),
      new THREE.MeshBasicMaterial({ color: 0xffc233, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    g.add(ring);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 1.5, 12, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
    );
    beam.position.y = 6;
    g.add(beam);
    const mark = new THREE.Sprite(new THREE.SpriteMaterial({ map: badge("ask"), depthWrite: false }));
    mark.scale.set(1.25, 1.25, 1);
    mark.position.set(0, 5.5, 0);
    g.add(mark);
    g.userData = { cloth, ring, beam, mark };
    return g;
  };

  /* ───────── Sahne parçaları ───────── */
  const P = {};

  P.tent = (o) => {
    const g = group(2.1);
    const body = M(flat(new THREE.ConeGeometry(2.3, 2.5, 4)), o.color || 0xf2a23a, 0, 1.25, 0, { ry: Math.PI / 4 });
    g.add(body);
    g.add(M(new THREE.PlaneGeometry(0.9, 1.3), 0x3a2a22, 0, 0.66, 1.4, { rx: -0.5, noShadow: true }));
    g.add(M(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), 0xd9dde2, 0, 2.8, 0));
    return g;
  };

  P.domeTent = (o) => {
    const g = group(3.0);
    g.add(M(flat(new THREE.SphereGeometry(2.8, 10, 6, 0, TAU, 0, Math.PI / 2)), 0xf2a23a, 0, 0, 0));
    g.add(M(flat(new THREE.SphereGeometry(2.84, 10, 2, 0, TAU, 0.9, 0.34)), 0xffffff, 0, 0, 0, { noShadow: true }));
    g.add(M(flat(new THREE.CylinderGeometry(1.0, 1.0, 1.8, 8, 1, false, 0, Math.PI)), 0xe4572e, 0, 0, 2.7, { rz: Math.PI / 2, ry: Math.PI / 2 }));
    g.add(M(new THREE.CircleGeometry(0.72, 12), 0x2b1f1a, 0, 0.5, 3.62, { noShadow: true }));
    if (o.text) {
      const label = labelPlane(o.text, o.sub, 3.6, "dark");
      label.position.set(0, 3.6, 0.4);
      g.add(label);
    }
    return g;
  };

  P.module = (o) => {
    const g = group(3.2);
    const c = o.color || 0x2b78c5;
    [[-2, -1], [2, -1], [-2, 1], [2, 1]].forEach(([x, z]) => g.add(M(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 6), 0x8894a3, x, 0.5, z)));
    g.add(M(new THREE.BoxGeometry(5.2, 2.3, 2.8), c, 0, 2.1, 0));
    g.add(M(new THREE.BoxGeometry(5.5, 0.22, 3.1), 0xffffff, 0, 3.35, 0));
    g.add(M(new THREE.BoxGeometry(5.24, 0.3, 2.84), 0xffffff, 0, 1.3, 0, { noShadow: true }));
    [-1.6, 0.1].forEach((x) => g.add(M(new THREE.PlaneGeometry(0.95, 0.8), 0x10324f, x, 2.35, 1.41, { noShadow: true })));
    g.add(M(new THREE.PlaneGeometry(0.85, 1.6), 0xf4f7fa, 1.75, 1.95, 1.41, { noShadow: true }));
    g.add(M(new THREE.BoxGeometry(1.2, 0.14, 0.9), 0x8894a3, 1.75, 0.95, 1.85));
    g.add(M(new THREE.BoxGeometry(1.2, 0.14, 0.7), 0x8894a3, 1.75, 0.5, 2.5));
    g.add(M(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 5), 0xd9dde2, -2.2, 4.2, -0.9));
    if (o.text) {
      const label = labelPlane(o.text, o.sub, 4.2, "dark");
      label.position.set(0, 4.75, 0.2);
      g.add(label);
    }
    return g;
  };

  P.hut = () => {
    const g = group(2.7);
    g.add(M(new THREE.BoxGeometry(4.0, 2.3, 3.2), 0x8a5a3c, 0, 1.15, 0));
    g.add(M(new THREE.BoxGeometry(4.5, 0.35, 3.8), 0xffffff, 0, 2.5, 0, { rz: 0.06 }));
    g.add(M(new THREE.PlaneGeometry(0.9, 1.5), 0x4a2f20, -0.9, 0.8, 1.61, { noShadow: true }));
    g.add(M(new THREE.PlaneGeometry(0.9, 0.7), 0xffd772, 0.9, 1.35, 1.61, { noShadow: true }));
    g.add(M(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 6), 0x5c5f66, 1.3, 3.1, -0.6));
    g.add(M(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), 0xd9dde2, -1.6, 3.9, -1.1));
    return g;
  };

  P.rocks = (o) => {
    const s = o.s || 1;
    const g = group(1.9 * s);
    const rnd = U.rng(Math.round((o.x || 1) * 31 + (o.z || 1) * 17));
    for (let i = 0; i < 5; i += 1) {
      const r = (0.55 + rnd() * 0.75) * s;
      const x = (rnd() - 0.5) * 2.8 * s, z = (rnd() - 0.5) * 2.2 * s;
      const rock = M(flat(new THREE.DodecahedronGeometry(r, 0)), 0x6f7a8f, x, r * 0.55, z, { ry: rnd() * 3, scale: [1, 0.8 + rnd() * 0.5, 1] });
      g.add(rock);
      g.add(M(flat(new THREE.DodecahedronGeometry(r * 0.72, 0)), 0xffffff, x, r * 1.05, z, { ry: rnd() * 3, scale: [1, 0.35, 1], noShadow: true }));
    }
    return g;
  };

  P.ice = (o) => {
    const s = o.s || 1;
    const g = group(1.3 * s);
    const rnd = U.rng(Math.round((o.x || 1) * 13 + (o.z || 1) * 29));
    for (let i = 0; i < 4; i += 1) {
      const hgt = (1.6 + rnd() * 2.4) * s;
      g.add(M(flat(new THREE.ConeGeometry((0.5 + rnd() * 0.5) * s, hgt, 5)), i % 2 ? 0xcfefff : 0xa7dcf5, (rnd() - 0.5) * 1.8 * s, hgt / 2 - 0.1, (rnd() - 0.5) * 1.6 * s, { ry: rnd() * 3, rz: (rnd() - 0.5) * 0.3 }));
    }
    return g;
  };

  P.berg = (o) => {
    const s = o.s || 3;
    const g = group();
    const rnd = U.rng(Math.round((o.x || 1) * 7 + (o.z || 1) * 3));
    g.add(M(flat(new THREE.IcosahedronGeometry(1, 0)), 0xe6f6ff, 0, 0.5 * s, 0, { scale: [1.9 * s, 1.1 * s, 1.5 * s], ry: rnd() * 3 }));
    g.add(M(flat(new THREE.IcosahedronGeometry(1, 0)), 0xcdeaf8, 1.2 * s, 0.25 * s, 0.6 * s, { scale: [1.1 * s, 0.7 * s, 0.9 * s], ry: rnd() * 3 }));
    g.userData.float = true;
    g.userData.bob = { amp: 0.12, speed: 0.5 + rnd() * 0.3, phase: rnd() * 6 };
    return g;
  };

  P.sign = (o) => {
    const g = group(0.55);
    g.add(M(new THREE.CylinderGeometry(0.08, 0.09, 2.3, 6), 0x7a5230, -1.05, 1.15, 0));
    g.add(M(new THREE.CylinderGeometry(0.08, 0.09, 2.3, 6), 0x7a5230, 1.05, 1.15, 0));
    const label = labelPlane(o.text, o.sub, 3.3);
    label.position.set(0, 2.0, 0.06);
    g.add(label);
    g.add(M(new THREE.BoxGeometry(3.4, 0.16, 0.2), 0xffffff, 0, 2.72, 0, { noShadow: true }));
    return g;
  };

  P.crates = () => {
    const g = group(1.4);
    g.add(M(new THREE.BoxGeometry(1.2, 1.0, 1.2), 0xb8894f, -0.5, 0.5, 0, { ry: 0.2 }));
    g.add(M(new THREE.BoxGeometry(1.0, 0.9, 1.0), 0xe4572e, 0.65, 0.45, 0.2, { ry: -0.3 }));
    g.add(M(new THREE.BoxGeometry(0.9, 0.8, 0.9), 0xc79a5b, -0.2, 1.4, 0.05, { ry: 0.5 }));
    g.add(M(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 10), 0x2b78c5, 0.5, 0.45, -0.95));
    return g;
  };

  P.sled = () => {
    const g = group(1.3);
    [-0.45, 0.45].forEach((x) => g.add(M(new THREE.BoxGeometry(0.1, 0.1, 2.6), 0x7a5230, x, 0.12, 0)));
    g.add(M(new THREE.BoxGeometry(1.1, 0.1, 2.2), 0xb8894f, 0, 0.35, 0));
    g.add(M(new THREE.BoxGeometry(0.9, 0.6, 1.3), 0x2b78c5, 0, 0.72, -0.2));
    g.add(M(new THREE.BoxGeometry(0.94, 0.1, 0.2), 0xffc233, 0, 0.9, -0.2, { noShadow: true }));
    return g;
  };

  P.marker = () => {
    const g = group();
    g.add(M(new THREE.CylinderGeometry(0.035, 0.045, 2.4, 5), 0xc9a26b, 0, 1.2, 0));
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.75, 0.22);
    shape.lineTo(0, 0.44);
    const pennant = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshLambertMaterial({ color: 0xff8a1f, side: THREE.DoubleSide }));
    pennant.position.set(0.03, 1.9, 0);
    g.add(pennant);
    return g;
  };

  P.station = (o) => {
    const g = group(1.0);
    g.add(M(new THREE.CylinderGeometry(0.06, 0.08, 4.4, 6), 0xd9dde2, 0, 2.2, 0));
    [0, 2.1, 4.2].forEach((a) => g.add(M(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 5), 0xaab4c0, Math.cos(a) * 0.6, 1.0, Math.sin(a) * 0.6, { rz: Math.cos(a) * 0.5, rx: -Math.sin(a) * 0.5 })));
    g.add(M(new THREE.BoxGeometry(1.5, 0.06, 0.06), 0xd9dde2, 0, 3.6, 0));
    const spin = new THREE.Group();
    spin.position.set(0, 4.5, 0);
    for (let i = 0; i < 3; i += 1) {
      const a = (i / 3) * TAU;
      spin.add(M(new THREE.BoxGeometry(0.5, 0.03, 0.03), 0xd9dde2, Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25, { ry: -a, noShadow: true }));
      spin.add(M(new THREE.SphereGeometry(0.1, 8, 6), 0xe4572e, Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5, { noShadow: true }));
    }
    spin.userData.spin = 5;
    g.add(spin);
    g.add(M(new THREE.BoxGeometry(0.5, 0.6, 0.35), 0xffffff, 0.75, 3.3, 0));
    g.add(M(new THREE.BoxGeometry(0.9, 0.04, 0.6), 0x163a66, -0.7, 2.6, 0.1, { rx: 0.7 }));
    if (o.text) {
      const label = labelPlane(o.text, o.sub, 3.6, "dark");
      label.position.set(0, 5.9, 0);
      g.add(label);
    }
    return g;
  };

  P.tower = (o) => {
    const g = group(1.4);
    const legs = [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]];
    legs.forEach(([x, z]) => g.add(M(new THREE.CylinderGeometry(0.06, 0.09, 7.2, 5), 0xe4572e, x * 0.6, 3.6, z * 0.6, { rz: -x * 0.07, rx: z * 0.07 })));
    [1.6, 3.4, 5.2].forEach((y, i) => g.add(M(new THREE.BoxGeometry(1.5 - i * 0.28, 0.07, 1.5 - i * 0.28), 0xffffff, 0, y, 0)));
    g.add(M(new THREE.BoxGeometry(1.2, 0.5, 1.2), 0xffffff, 0, 7.3, 0));
    const lamp = M(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff3b30 }), 0, 7.85, 0, { noShadow: true });
    lamp.userData.blink = 1;
    g.add(lamp);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow, color: 0xff5a4a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(2.6, 2.6, 1);
    glow.position.set(0, 7.85, 0);
    glow.userData.blink = 1;
    g.add(glow);
    if (o.text) {
      const label = labelPlane(o.text, o.sub, 4.6, "dark");
      label.position.set(0, 9.6, 0);
      g.add(label);
    }
    return g;
  };

  P.board = (o) => {
    const g = group(1.2);
    g.add(M(new THREE.CylinderGeometry(0.1, 0.12, 3.6, 6), 0x7a5230, -2.1, 1.8, 0));
    g.add(M(new THREE.CylinderGeometry(0.1, 0.12, 3.6, 6), 0x7a5230, 2.1, 1.8, 0));
    g.add(M(new THREE.BoxGeometry(5.4, 2.5, 0.16), 0x0b2545, 0, 2.6, 0));
    const label = labelPlane(o.text, o.sub, 5.0, "dark");
    label.position.set(0, 2.6, 0.1);
    g.add(label);
    g.add(M(new THREE.BoxGeometry(5.6, 0.2, 0.4), 0xffffff, 0, 3.92, 0, { noShadow: true }));
    return g;
  };

  P.drill = () => {
    const g = group(1.5);
    [0, 2.1, 4.2].forEach((a) => g.add(M(new THREE.CylinderGeometry(0.06, 0.07, 4.4, 5), 0xe4572e, Math.cos(a) * 0.9, 2.0, Math.sin(a) * 0.9, { rz: Math.cos(a) * 0.42, rx: -Math.sin(a) * 0.42 })));
    const bit = M(new THREE.CylinderGeometry(0.16, 0.16, 3.4, 8), 0x9aa7b5, 0, 1.7, 0);
    bit.userData.spin = 3;
    g.add(bit);
    g.add(M(new THREE.BoxGeometry(0.7, 0.5, 0.7), 0x2b78c5, 0, 3.7, 0));
    [0, 0.42, 0.84].forEach((dz, i) => g.add(M(new THREE.CylinderGeometry(0.15, 0.15, 1.8, 10), new THREE.MeshLambertMaterial({ color: 0xbfeaff, emissive: 0x3aa8d8, emissiveIntensity: 0.25 }), 1.9, 0.25 + (i === 2 ? 0.26 : 0), 0.2 + (i === 2 ? 0.21 : dz) - 0.4, { rz: Math.PI / 2 })));
    return g;
  };

  P.camera = () => {
    const g = group(0.8);
    [0, 2.1, 4.2].forEach((a) => g.add(M(new THREE.CylinderGeometry(0.035, 0.04, 1.9, 5), 0x2a2f38, Math.cos(a) * 0.4, 0.9, Math.sin(a) * 0.4, { rz: Math.cos(a) * 0.42, rx: -Math.sin(a) * 0.42 })));
    g.add(M(new THREE.BoxGeometry(0.6, 0.45, 0.9), 0x2a2f38, 0, 1.95, 0));
    g.add(M(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 12), 0x10151c, 0, 1.95, 0.65, { rx: Math.PI / 2 }));
    g.add(M(new THREE.BoxGeometry(0.2, 0.2, 0.3), 0xe4572e, 0.18, 2.28, -0.1, { noShadow: true }));
    return g;
  };

  P.ship = () => {
    const g = group();
    const hull = new THREE.Shape();
    hull.moveTo(-9, 0);
    hull.lineTo(7, 0);
    hull.lineTo(10.5, 2.6);
    hull.lineTo(-9.4, 2.6);
    hull.closePath();
    const hullGeo = new THREE.ExtrudeGeometry(hull, { depth: 4.6, bevelEnabled: false });
    hullGeo.translate(0, 0, -2.3);
    g.add(M(hullGeo, 0xd4332b, 0, -0.5, 0));
    g.add(M(new THREE.BoxGeometry(19.4, 0.3, 4.7), 0xffffff, 0.3, 2.2, 0, { noShadow: true }));
    g.add(M(new THREE.BoxGeometry(6.5, 2.4, 3.6), 0xffffff, -3.2, 3.5, 0));
    g.add(M(new THREE.BoxGeometry(4.2, 1.6, 3.0), 0xffffff, -3.6, 5.5, 0));
    g.add(M(new THREE.BoxGeometry(4.3, 0.5, 3.1), 0x163a66, -3.6, 5.6, 0.02, { noShadow: true }));
    g.add(M(new THREE.CylinderGeometry(0.6, 0.7, 1.8, 10), 0xffc233, -5.4, 7.0, 0));
    g.add(M(new THREE.CylinderGeometry(0.07, 0.07, 4.6, 6), 0xd9dde2, 3.4, 4.6, 0));
    g.add(M(new THREE.BoxGeometry(2.6, 0.08, 0.08), 0xd9dde2, 3.4, 5.8, 0));
    g.add(M(new THREE.BoxGeometry(1.6, 1.3, 1.6), 0xf2a23a, 5.6, 2.9, 0));
    g.userData.float = true;
    g.userData.bob = { amp: 0.16, speed: 0.7, phase: 0, roll: 0.02 };
    return g;
  };

  P.sailboat = () => {
    const g = group();
    const hull = new THREE.Shape();
    hull.moveTo(-3.2, 0);
    hull.lineTo(2.4, 0);
    hull.lineTo(3.8, 1.1);
    hull.lineTo(-3.4, 1.1);
    hull.closePath();
    const hullGeo = new THREE.ExtrudeGeometry(hull, { depth: 2.0, bevelEnabled: false });
    hullGeo.translate(0, 0, -1.0);
    g.add(M(hullGeo, 0xffffff, 0, -0.25, 0));
    g.add(M(new THREE.BoxGeometry(7.0, 0.16, 2.06), 0xd4332b, 0.2, 0.55, 0, { noShadow: true }));
    g.add(M(new THREE.BoxGeometry(2.2, 0.7, 1.4), 0xf4f7fa, -0.8, 1.2, 0));
    g.add(M(new THREE.CylinderGeometry(0.06, 0.07, 7.2, 6), 0xd9dde2, 0.5, 4.4, 0));
    const sail = new THREE.Shape();
    sail.moveTo(0, 0);
    sail.lineTo(-3.2, 0);
    sail.lineTo(0, 5.6);
    const sailMesh = new THREE.Mesh(new THREE.ShapeGeometry(sail), new THREE.MeshLambertMaterial({ color: 0xfffaf0, side: THREE.DoubleSide }));
    sailMesh.position.set(0.4, 1.8, 0);
    sailMesh.castShadow = true;
    g.add(sailMesh);
    const jib = new THREE.Shape();
    jib.moveTo(0, 0);
    jib.lineTo(2.6, 0);
    jib.lineTo(0, 4.4);
    const jibMesh = new THREE.Mesh(new THREE.ShapeGeometry(jib), new THREE.MeshLambertMaterial({ color: 0xffe9c9, side: THREE.DoubleSide }));
    jibMesh.position.set(0.62, 1.6, 0);
    g.add(jibMesh);
    g.userData.float = true;
    g.userData.bob = { amp: 0.14, speed: 0.9, phase: 1, roll: 0.05 };
    return g;
  };

  P.colony = (o) => {
    const g = group();
    const rnd = U.rng(77);
    g.userData.penguins = [];
    for (let i = 0; i < (o.n || 6); i += 1) {
      const p = Art.simplePenguin(1.25 + rnd() * 0.5);
      p.position.set((rnd() - 0.5) * 8, 0, (rnd() - 0.5) * 6);
      p.rotation.y = rnd() * TAU;
      p.userData.phase = rnd() * 6;
      p.userData.local = true;
      g.add(p);
      g.userData.penguins.push(p);
    }
    return g;
  };

  P.bigflag = () => {
    const g = group(0.6);
    g.add(M(new THREE.CylinderGeometry(1.6, 1.9, 0.5, 16), 0xffffff, 0, 0.25, 0, { receive: true }));
    g.add(M(new THREE.CylinderGeometry(1.1, 1.3, 0.4, 16), 0xdfe9f3, 0, 0.7, 0));
    g.add(M(new THREE.CylinderGeometry(0.1, 0.14, 10.5, 10), 0xe8eef4, 0, 5.9, 0));
    g.add(M(new THREE.SphereGeometry(0.22, 12, 10), 0xffc233, 0, 11.25, 0, { noShadow: true }));
    const cloth = Art.clothMesh(5.1, 3.4);
    cloth.position.set(0.1, 9.3, 0);
    g.add(cloth);
    g.userData.cloth = cloth;
    return g;
  };

  /* Bölüm sonu görev noktası */
  P.finale = (o) => {
    const g = group();
    g.add(M(new THREE.CylinderGeometry(2.3, 2.6, 0.3, 24), 0xffffff, 0, 0.15, 0, { receive: true, noShadow: true }));
    g.add(M(new THREE.CylinderGeometry(1.7, 1.7, 0.12, 24), 0x0b2545, 0, 0.34, 0, { noShadow: true }));
    const arch = M(new THREE.TorusGeometry(2.1, 0.16, 8, 28, Math.PI), 0xffc233, 0, 0.3, 0);
    g.add(arch);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.8, 3.15, 56),
      new THREE.MeshBasicMaterial({ color: 0x8fb3d9, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    g.add(ring);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 2.6, 14, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffe39a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
    );
    beam.position.y = 7;
    g.add(beam);
    const star = new THREE.Sprite(new THREE.SpriteMaterial({ map: Art.badgeTexture("★", "#0b2545", "#ffc233"), depthWrite: false }));
    star.scale.set(1.5, 1.5, 1);
    star.position.set(0, 3.1, 0);
    g.add(star);
    const label = labelPlane(o.label, null, 3.8, "dark");
    label.position.set(0, 4.6, 0);
    g.add(label);
    g.userData = { ring, beam, star, arch, label };
    return g;
  };

  Art.props = P;

  /* ───────── Toplanabilirler ve engeller ───────── */
  let crystalMat = null;
  Art.crystal = () => {
    if (!crystalMat) crystalMat = new THREE.MeshPhongMaterial({ color: 0x9be8ff, emissive: 0x1f9ed0, emissiveIntensity: 0.55, shininess: 90, flatShading: true });
    const g = new THREE.Group();
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), crystalMat);
    gem.scale.set(1, 1.5, 1);
    g.add(gem);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow, color: 0x7fe3ff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(2.2, 2.2, 1);
    g.add(glow);
    g.userData.gem = gem;
    return g;
  };

  Art.snowball = (r) => {
    const mesh = new THREE.Mesh(flat(new THREE.IcosahedronGeometry(r, 1)), lam(0xf4f9ff));
    mesh.castShadow = true;
    return mesh;
  };

  Art.floe = (r, seed) => {
    const geo = new THREE.CylinderGeometry(r, r * 0.82, 0.75, 9, 1);
    const rnd = U.rng(seed);
    const pos = geo.attributes.position;
    const jitter = [];
    for (let i = 0; i < 9; i += 1) jitter.push(0.9 + rnd() * 0.16);
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i), z = pos.getZ(i);
      const rad = Math.hypot(x, z);
      if (rad > 0.01) {
        const a = Math.atan2(z, x);
        const k = jitter[((Math.round((a / TAU) * 9) % 9) + 9) % 9];
        pos.setX(i, x * k);
        pos.setZ(i, z * k);
      }
    }
    const mesh = new THREE.Mesh(flat(geo), lam(0xf6fcff));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const tileGeo = { v: null };
  Art.tile = (R) => {
    if (!tileGeo.v) {
      tileGeo.v = flat(new THREE.CylinderGeometry(R * 0.985, R * 0.9, 0.6, 6, 1));
      tileGeo.v.userData.shared = true;
    }
    const mesh = new THREE.Mesh(tileGeo.v, new THREE.MeshLambertMaterial({ color: 0xeaf6ff }));
    mesh.receiveShadow = true;
    mesh.userData.ownMat = true;
    return mesh;
  };

  /* ───────── Gökyüzü, dağlar, kuzey ışıkları ───────── */
  Art.sky = (theme) => {
    const geo = new THREE.SphereGeometry(520, 32, 20);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const zen = new THREE.Color(theme.zenith), mid = new THREE.Color(theme.mid), hor = new THREE.Color(theme.horizon);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const t = U.clamp(pos.getY(i) / 520, -0.2, 1);
      if (t < 0.02) c.copy(hor);
      else if (t < 0.3) c.copy(hor).lerp(mid, U.smooth(0.02, 0.3, t));
      else c.copy(mid).lerp(zen, U.smooth(0.3, 0.85, t));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    mesh.renderOrder = -10;
    return mesh;
  };

  Art.stars = (strength) => {
    const n = 420;
    const pos = new Float32Array(n * 3);
    const rnd = U.rng(99);
    for (let i = 0; i < n; i += 1) {
      const a = rnd() * TAU, e = 0.12 + rnd() * 1.3;
      pos[i * 3] = Math.cos(a) * Math.cos(e) * 480;
      pos[i * 3 + 1] = Math.sin(e) * 480;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 480;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.85 * strength, fog: false, depthWrite: false }));
  };

  Art.disc = (theme) => {
    const g = new THREE.Group();
    const dir = new THREE.Vector3(theme.sunPos[0], theme.sunPos[1], theme.sunPos[2]).normalize().multiplyScalar(440);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow, color: theme.disc, transparent: true, opacity: 0.9, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(150, 150, 1);
    glow.position.copy(dir);
    g.add(glow);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow, color: 0xffffff, transparent: true, depthWrite: false, fog: false }));
    core.scale.set(46, 46, 1);
    core.position.copy(dir);
    g.add(core);
    return g;
  };

  Art.mountains = (theme, seed) => {
    const g = new THREE.Group();
    const rnd = U.rng(seed * 7 + 1);
    const top = new THREE.Color(theme.peak), base = new THREE.Color(theme.peakBase);
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    for (let i = 0; i < 34; i += 1) {
      const a = (i / 34) * TAU + rnd() * 0.12;
      const dist = 150 + rnd() * 50;
      const hgt = 26 + rnd() * 44;
      const geo = flat(new THREE.ConeGeometry(22 + rnd() * 24, hgt, 5 + Math.floor(rnd() * 3), 3));
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const c = new THREE.Color();
      for (let v = 0; v < pos.count; v += 1) {
        c.copy(base).lerp(top, U.smooth(-0.15, 0.3, pos.getY(v) / hgt));
        colors[v * 3] = c.r;
        colors[v * 3 + 1] = c.g;
        colors[v * 3 + 2] = c.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(a) * dist, hgt / 2 - 6, Math.sin(a) * dist - 10);
      mesh.rotation.y = rnd() * 3;
      g.add(mesh);
    }
    return g;
  };

  Art.aurora = () => {
    const g = new THREE.Group();
    const material = new THREE.ShaderMaterial({
      uniforms: { t: { value: 0 }, k: { value: 1 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      fog: false,
      vertexShader: "varying vec2 vUv; uniform float t; void main(){ vUv = uv; vec3 p = position; p.z += sin(p.x * 0.035 + t * 0.25) * 14.0 + sin(p.x * 0.09 - t * 0.18) * 5.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
      fragmentShader: "varying vec2 vUv; uniform float t; uniform float k; void main(){ float band = 0.5 + 0.5 * sin(vUv.x * 46.0 + t * 0.7 + sin(vUv.x * 9.0 + t * 0.31) * 2.4); float rays = 0.6 + 0.4 * sin(vUv.x * 190.0 + t * 1.3); float a = smoothstep(0.0, 0.16, vUv.y) * (1.0 - smoothstep(0.25, 1.0, vUv.y)); float edge = smoothstep(0.0, 0.08, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x)); vec3 c = mix(vec3(0.15, 1.0, 0.55), vec3(0.55, 0.3, 1.0), smoothstep(0.1, 0.9, vUv.y)); gl_FragColor = vec4(c, a * edge * (0.18 + 0.62 * band) * rays * k); }"
    });
    [[0, 95, -260, 420, 90, 0], [-120, 120, -230, 300, 80, 0.5], [140, 110, -240, 320, 85, -0.4]].forEach(([x, y, z, w, h, ry]) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 60, 1), material);
      mesh.position.set(x, y, z);
      mesh.rotation.y = ry;
      mesh.renderOrder = -5;
      g.add(mesh);
    });
    g.userData.material = material;
    return g;
  };

  KBK.art = Art;
}());
