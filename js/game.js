/* Kutup Bayrak Kaşifi — oyun akışı, oyuncu kontrolü ve kamera */
(function () {
  "use strict";
  const KBK = window.KBK;
  const U = KBK.util;
  const A = KBK.audio;
  const UI = KBK.ui;
  const W = KBK.world;
  const Art = KBK.art;
  const THREE = window.THREE;
  const $ = (id) => document.getElementById(id);

  const SPEED = 9.2, JUMP = 10.6, GRAV = 30, PLAYER_H = 2.5, PAR_TIME = 240;
  const questions = {};
  const keys = { up: false, down: false, left: false, right: false };
  const G = { phase: "boot", paused: false, time: 0, profile: null, levelIndex: 0, L: null, run: null, shake: 0, introT: 9, lockQuality: false };
  const P = {
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, yaw: Math.PI, grounded: true, coyote: 0, jumpBuf: 0, platform: null,
    safeX: 0, safeZ: 0, stun: 0, invuln: 0, respawn: null, stepPhase: 0, stepIndex: 0, squash: 1, squashV: 0,
    slide: 0, onIce: false, celebrate: 0, idle: 0, groundY: 0, slideSound: 0
  };
  let rig = null, raf = 0, lastFrame = 0;
  const camPos = new THREE.Vector3(0, 14, 70), camLook = new THREE.Vector3(0, 2, 40), camWant = new THREE.Vector3(), lookWant = new THREE.Vector3();
  let frameAcc = 0, frameCount = 0;

  /* ───────── Başlangıç ───────── */
  function fatal(message) {
    const box = $("loading");
    box.hidden = false;
    box.classList.add("error");
    box.textContent = message;
  }

  function boot() {
    if (!THREE) { fatal("Oyun dosyaları yüklenemedi. Sayfayı yenileyip tekrar dene."); return; }
    const data = window.KUTUP_QUIZ_DATA || [];
    data.forEach((q) => { questions[q.id] = q; });
    const missing = [];
    KBK.levels.forEach((def) => def.questions.forEach((id) => { if (!questions[id]) missing.push(id); }));
    if (missing.length) { fatal("Soru dosyasında eksik var: " + missing.join(", ")); return; }

    G.profile = Object.assign({ name: "", char: "flag", sound: false, unlockAll: false, best: {} }, KBK.store.load());
    if (!KBK.cast[G.profile.char] || G.profile.char === "bear") G.profile.char = "flag";
    G.reduced = Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    W.reducedMotion = G.reduced;
    try {
      W.init($("stage"));
    } catch (error) {
      fatal("Bu cihazda 3B grafik başlatılamadı. Güncel bir tarayıcıyla tekrar dene.");
      return;
    }
    UI.init(handlers);
    UI.setSound(false);

    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const fonts = document.fonts && document.fonts.load
      ? Promise.race([Promise.all([document.fonts.load('800 40px "Baloo 2"'), document.fonts.load('700 20px "Nunito"')]).catch(() => {}), wait(2500)])
      : Promise.resolve();
    Promise.all([Art.loadModels(), fonts]).then(() => {
      buildPlayer(G.profile.char);
      loadScene(0);
      G.phase = "title";
      UI.showTitle(G.profile);
      UI.ready();
      startLoop();
    });
    window.addEventListener("resize", W.resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        raf = 0;
        A.suspend();
        clearKeys();
      } else {
        A.resume();
        startLoop();
      }
    });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
  }

  const otherChar = () => (G.profile.char === "flag" ? "cute" : "flag");

  function buildPlayer(charKey) {
    if (rig) {
      W.scene.remove(rig.root);
      W.scene.remove(rig.shadow);
    }
    const root = new THREE.Group(), tilt = new THREE.Group(), squash = new THREE.Group();
    squash.add(Art.spawnModel(charKey, PLAYER_H));
    tilt.add(squash);
    root.add(tilt);
    const shadow = Art.blobShadow(1.05);
    W.scene.add(root);
    W.scene.add(shadow);
    rig = { root, tilt, squash, shadow, char: charKey };
  }

  function loadScene(index) {
    const def = KBK.levels[index];
    G.levelIndex = index;
    G.L = W.build(def, { guide: otherChar() });
    P.x = def.spawn[0];
    P.z = def.spawn[1];
    P.y = G.L.height(P.x, P.z);
    P.groundY = P.y;
    P.vx = P.vy = P.vz = 0;
    P.yaw = Math.PI;
    P.grounded = true;
    P.platform = null;
    P.safeX = P.x;
    P.safeZ = P.z;
    P.stun = P.invuln = P.celebrate = P.slide = 0;
    P.respawn = null;
    P.squash = 1;
    P.squashV = 0;
    P.jumpBuf = 0;
    clearKeys();
  }

  /* ───────── Akış ───────── */
  function levelInfo() {
    const best = G.profile.best || {};
    let stars = 0, flags = 0, nextSet = false, allDone = true;
    const levels = KBK.levels.map((def, i) => {
      const b = best[def.id];
      const prev = i === 0 ? true : Boolean(best[KBK.levels[i - 1].id]);
      const open = Boolean(G.profile.unlockAll) || prev;
      const st = { done: Boolean(b), stars: b ? b.stars : 0, open, next: false };
      if (b) { stars += b.stars; flags += def.flags.length; } else allDone = false;
      if (!b && open && !nextSet) { st.next = true; nextSet = true; }
      return st;
    });
    return { levels, stars, flags, allDone };
  }

  function openMap() {
    G.phase = "map";
    G.paused = false;
    UI.showMap(G.profile, levelInfo());
  }

  function newRun() {
    return { flags: 0, firstTry: 0, mistakes: 0, crystals: 0, score: 0, time: 0, streak: 0, falls: 0, tips: {}, warn: 0, done: false };
  }

  function showVictory() {
    const best = G.profile.best || {};
    let stars = 0, score = 0;
    const levels = KBK.levels.map((def) => {
      const b = best[def.id] || { stars: 0, score: 0 };
      stars += b.stars;
      score += b.score;
      return { title: def.title, stars: b.stars };
    });
    G.phase = "victory";
    UI.showVictory({ name: G.profile.name || "Kaşif", date: U.fmtDateTR(new Date()), stars, score, levels });
    A.play("fanfare");
  }

  const handlers = {
    start(name, char) {
      const clean = name || "Kaşif";
      if ((G.profile.name || "") !== clean) G.profile.best = {};
      G.profile.name = clean;
      if (char !== G.profile.char || !rig || rig.char !== char) {
        G.profile.char = char;
        buildPlayer(char);
        loadScene(G.levelIndex);
      }
      KBK.store.save(G.profile);
      if (G.profile.sound) { A.setEnabled(true); UI.setSound(true); }
      A.play("start");
      openMap();
    },
    pickLevel(i) {
      loadScene(i);
      G.run = newRun();
      G.phase = "brief";
      UI.showBrief(KBK.levels[i], otherChar());
    },
    begin() {
      const def = KBK.levels[G.levelIndex];
      G.phase = "play";
      G.introT = 0;
      frameAcc = 0;
      frameCount = 0;
      UI.hudSetup(def);
      UI.view("play");
      A.play("start");
    },
    exitToMap() { openMap(); },
    next() {
      const info = levelInfo();
      if (G.levelIndex < KBK.levels.length - 1) handlers.pickLevel(G.levelIndex + 1);
      else if (info.allDone) showVictory();
      else openMap();
    },
    replay() { handlers.pickLevel(G.levelIndex); },
    certificate() { if (levelInfo().allDone) showVictory(); },
    switchPlayer() {
      G.phase = "title";
      UI.showTitle(G.profile);
    },
    toggleUnlock() {
      G.profile.unlockAll = !G.profile.unlockAll;
      KBK.store.save(G.profile);
      openMap();
    },
    toggleSound() {
      G.profile.sound = !A.enabled;
      A.setEnabled(G.profile.sound);
      UI.setSound(G.profile.sound);
      KBK.store.save(G.profile);
      A.play("start");
      UI.toast(G.profile.sound ? "Ses açıldı" : "Ses kapatıldı", "", 1300);
    },
    pause(on) { G.paused = on; if (on) clearKeys(); },
    jump() { if (G.phase === "play" && !G.paused) P.jumpBuf = 0.16; },
    announceDirection() { announceDirection(); },
    playerName() { return G.profile.name; }
  };

  function openQuiz(flag) {
    const def = G.L.def, run = G.run, total = def.flags.length;
    G.phase = "quiz";
    clearKeys();
    flag.state = "asking";
    UI.openQuiz({ q: questions[flag.qid], number: flag.index + 1, total, levelTitle: def.title }, {
      onWrong() {
        run.mistakes += 1;
        run.streak = 0;
        A.play("wrong");
      },
      onCorrect(tries) {
        let points = tries === 1 ? 100 : tries === 2 ? 60 : 30;
        if (tries === 1) {
          run.firstTry += 1;
          run.streak += 1;
          if (run.streak > 1) points += (run.streak - 1) * 20;
        } else run.streak = 0;
        run.score += points;
        run.flags += 1;
        W.collectFlag(flag);
        A.play(flag.build ? "build" : "correct");
        P.celebrate = 1.3;
        UI.hudStats(run, total);
        if (run.flags === total) W.unlockFinale();
      },
      onClose() {
        G.phase = "play";
        UI.view("play");
        if (run.flags === total) {
          A.play("unlock");
          UI.bubble(def.id === 4 ? "bear" : otherChar(), `Beş bayrak da tamam! Şimdi ışığı yanan ${def.finale.label} noktasına git.`);
        } else if (run.streak > 1) UI.toast(`${run.streak} soru üst üste ilk denemede! +${(run.streak - 1) * 20} puan`, "ok", 2200);
        else UI.toast(`${run.flags}/${total} bayrak toplandı`, "ok", 1700);
      }
    });
  }

  function openMini() {
    const def = G.L.def, run = G.run;
    G.phase = "mini";
    clearKeys();
    UI.openMini(def.finale.game, {
      onMistake() { run.mistakes += 1; },
      onDone() { finishLevel(); }
    });
  }

  function finishLevel() {
    const def = G.L.def, run = G.run;
    run.done = true;
    run.score += 150 + Math.max(0, Math.round(PAR_TIME - run.time));
    const stars = run.mistakes <= KBK.starRule.three ? 3 : run.mistakes <= KBK.starRule.two ? 2 : 1;
    const prev = (G.profile.best || {})[def.id];
    const best = !prev || run.score > prev.score;
    G.profile.best = G.profile.best || {};
    G.profile.best[def.id] = { stars: Math.max(stars, prev ? prev.stars : 0), score: Math.max(run.score, prev ? prev.score : 0), time: Math.round(run.time) };
    KBK.store.save(G.profile);
    const info = levelInfo();
    const last = G.levelIndex === KBK.levels.length - 1;
    G.phase = "result";
    W.finishFinale();
    P.celebrate = 3.2;
    W.burst("confetti", P.x, P.y + 3, P.z, 90);
    A.play("fanfare");
    UI.showResult({
      def, stars, firstTry: run.firstTry, total: def.flags.length, mistakes: run.mistakes, crystals: run.crystals,
      crystalTotal: def.crystals.length, time: run.time, score: run.score, best: best && Boolean(prev),
      nextLabel: last ? (info.allDone ? "Sertifikamı göster" : "Haritaya dön") : "Sonraki bölüm"
    });
  }

  /* ───────── Girdi ───────── */
  function clearKeys() {
    keys.up = keys.down = keys.left = keys.right = false;
  }
  function keyDir(key) {
    switch (key) {
      case "ArrowUp": case "w": case "W": return "up";
      case "ArrowDown": case "s": case "S": return "down";
      case "ArrowLeft": case "a": case "A": return "left";
      case "ArrowRight": case "d": case "D": return "right";
      default: return null;
    }
  }
  function onKeyDown(e) {
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (G.phase !== "play" || G.paused) return;
    const dir = keyDir(e.key);
    if (dir) {
      keys[dir] = true;
      e.preventDefault();
    } else if (e.key === " " || e.code === "Space") {
      if (!e.repeat) P.jumpBuf = 0.16;
      e.preventDefault();
    } else if ((e.key === "k" || e.key === "K") && !e.repeat) announceDirection();
  }
  function onKeyUp(e) {
    const dir = keyDir(e.key);
    if (dir) keys[dir] = false;
  }

  /* ───────── Zemin ve oyuncu fiziği ───────── */
  /* Yüzen buzlar daire, çatlayan karolar altıgen kabul edilir (petek boşluksuz döşenir). */
  function inside(p, x, z) {
    const dx = Math.abs(x - p.x), dz = Math.abs(z - p.z);
    if (p.kind === "tile") return dx < 1.84 && dz < 2.12 - dx * 0.5774;
    return dx * dx + dz * dz < p.r * p.r;
  }

  function groundAt(x, z) {
    const L = G.L;
    for (let i = 0; i < L.platforms.length; i += 1) {
      const p = L.platforms[i];
      if (p.solid && inside(p, x, z)) return { y: p.top, platform: p, water: false };
    }
    const h = L.height(x, z);
    if (h < L.water - 0.3) return { y: L.water - 0.55, platform: null, water: true };
    return { y: h, platform: null, water: false };
  }

  function inIce(x, z) {
    const zones = G.L.def.ice || [];
    for (let i = 0; i < zones.length; i += 1) {
      const a = zones[i];
      const dx = (x - a[0]) / a[2], dz = (z - a[1]) / a[3];
      if (dx * dx + dz * dz < 1) return true;
    }
    return false;
  }

  function fallInWater() {
    const run = G.run;
    A.play("splash");
    W.burst("splash", P.x, G.L.water + 0.1, P.z, 30);
    G.shake = Math.max(G.shake, 0.35);
    if (run) {
      run.falls += 1;
      run.score = Math.max(0, run.score - 5);
      UI.hudStats(run, G.L.def.flags.length);
      if (run.falls === 1 || run.falls % 4 === 0) UI.toast("Su buz gibi! Kıyıya geri zıpladın.", "", 1800);
    }
    P.respawn = { t: 0, dur: 0.75, fx: P.x, fy: G.L.water + 0.2, fz: P.z, tx: P.safeX, tz: P.safeZ };
    P.vx = P.vy = P.vz = 0;
    P.platform = null;
    P.grounded = false;
  }

  function updatePlayer(dt, control) {
    const L = G.L;
    P.stun = Math.max(0, P.stun - dt);
    P.invuln = Math.max(0, P.invuln - dt);
    P.jumpBuf = Math.max(0, P.jumpBuf - dt);
    P.coyote = Math.max(0, P.coyote - dt);

    if (P.respawn) {
      const r = P.respawn;
      r.t += dt / r.dur;
      const k = U.easeInOut(Math.min(1, r.t));
      const ty = L.height(r.tx, r.tz);
      P.x = U.lerp(r.fx, r.tx, k);
      P.z = U.lerp(r.fz, r.tz, k);
      P.y = U.lerp(r.fy, ty, k) + Math.sin(Math.min(1, r.t) * Math.PI) * 4.2;
      if (r.t >= 1) {
        P.respawn = null;
        P.y = ty;
        P.grounded = true;
        P.invuln = 1.1;
        P.squashV = -5;
        A.play("land");
        W.burst("snow", P.x, P.y, P.z, 10);
      }
      return;
    }

    let ix = 0, iz = 0;
    if (control && P.stun <= 0) {
      ix = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      iz = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      if (UI.joy.active) { ix += UI.joy.x; iz += UI.joy.z; }
      const len = Math.hypot(ix, iz);
      if (len > 1) { ix /= len; iz /= len; }
    }
    const moving = Math.hypot(ix, iz) > 0.05;
    P.onIce = P.grounded && !P.platform && inIce(P.x, P.z);
    const max = SPEED * (P.onIce ? 1.28 : 1);
    let accel;
    if (!P.grounded) accel = moving ? 4.2 : 0.6;
    else if (P.onIce) accel = moving ? 1.7 : 0.45;
    else accel = moving ? 13 : 17;
    if (P.stun > 0) accel = P.grounded ? 2.5 : 0.3;
    P.vx = U.damp(P.vx, ix * max, accel, dt);
    P.vz = U.damp(P.vz, iz * max, accel, dt);

    if (control && P.jumpBuf > 0 && (P.grounded || P.coyote > 0) && P.stun <= 0) {
      P.vy = JUMP;
      P.grounded = false;
      P.coyote = 0;
      P.jumpBuf = 0;
      P.platform = null;
      P.squashV = 5;
      A.play("jump");
      W.burst("snow", P.x, P.y, P.z, 6);
    }

    let nx = P.x + P.vx * dt, nz = P.z + P.vz * dt;
    if (P.platform && P.grounded) nx += P.platform.vx * dt;
    const b = L.bounds;
    if (nx < b.minX) { nx = b.minX; P.vx = Math.max(0, P.vx); } else if (nx > b.maxX) { nx = b.maxX; P.vx = Math.min(0, P.vx); }
    if (nz < b.minZ) { nz = b.minZ; P.vz = Math.max(0, P.vz); } else if (nz > b.maxZ) { nz = b.maxZ; P.vz = Math.min(0, P.vz); }
    for (let i = 0; i < L.colliders.length; i += 1) {
      const c = L.colliders[i];
      const dx = nx - c.x, dz = nz - c.z, min = c.r + 0.55;
      const d2 = dx * dx + dz * dz;
      if (d2 < min * min && d2 > 0.00001) {
        const d = Math.sqrt(d2);
        nx = c.x + (dx / d) * min;
        nz = c.z + (dz / d) * min;
      }
    }
    P.x = nx;
    P.z = nz;

    P.vy -= GRAV * dt;
    P.y += P.vy * dt;
    const g = groundAt(P.x, P.z);
    let touched = false;
    if (P.y <= g.y) {
      if (!P.grounded) {
        P.squashV = Math.max(-7, P.vy * 0.5);
        if (!g.water) {
          A.play("land");
          W.burst("snow", P.x, g.y, P.z, 8);
        }
      }
      touched = true;
    } else if (P.grounded) {
      if (P.y - g.y < 0.75 || g.water) touched = true;
      else {
        P.grounded = false;
        P.coyote = 0.11;
        P.platform = null;
      }
    }
    if (touched) {
      P.y = g.y;
      P.vy = 0;
      P.grounded = true;
      P.platform = g.platform;
      P.groundY = g.y;
      if (g.water) { fallInWater(); return; }
      if (g.platform) {
        const p = g.platform;
        if (p.kind === "floe") p.load = 1;
        else if (p.state === "solid" && control) {
          p.state = "crack";
          p.timer = 0.9;
          p.mesh.material.color.set(0x9fd4f2);
          A.play("crack");
        }
      } else if (g.y > L.water + 0.55) {
        P.safeX = P.x;
        P.safeZ = P.z;
      }
    }
  }

  /* ───────── Etkileşimler ───────── */
  function interactions(dt) {
    const L = G.L, run = G.run, def = L.def;
    if (P.respawn) return;

    for (let i = 0; i < L.crystals.length; i += 1) {
      const c = L.crystals[i];
      if (c.taken) continue;
      const dx = P.x - c.x, dz = P.z - c.z, dy = P.y + 1.1 - c.y;
      if (dx * dx + dz * dz < 2.0 && Math.abs(dy) < 1.9) {
        c.taken = true;
        c.mesh.visible = false;
        run.crystals += 1;
        run.score += 10;
        A.play("crystal");
        W.burst("spark", c.x, c.y, c.z, 14);
        UI.hudStats(run, def.flags.length);
      }
    }

    for (let i = 0; i < L.lanes.length; i += 1) {
      const lane = L.lanes[i];
      if (P.invuln > 0 || Math.abs(P.z - lane.z) > lane.r + 0.7) continue;
      for (let b = 0; b < lane.balls.length; b += 1) {
        const ball = lane.balls[b];
        if (!ball.active) continue;
        const dx = P.x - ball.x, dz = P.z - lane.z;
        if (dx * dx + dz * dz < (lane.r + 0.6) * (lane.r + 0.6) && P.y < lane.y + lane.r * 1.8) {
          P.vx = lane.dir * lane.speed * 0.95;
          P.vz = (dz >= 0 ? 1 : -1) * 4.5;
          P.vy = 7.5;
          P.grounded = false;
          P.platform = null;
          P.stun = 0.6;
          P.invuln = 1.4;
          G.shake = Math.max(G.shake, 0.6);
          run.score = Math.max(0, run.score - 5);
          A.play("bump");
          W.burst("snow", P.x, P.y + 1, P.z, 26);
          UI.hudStats(run, def.flags.length);
          UI.toast("Kartopu çarptı! Yolu kollayıp öyle geç.", "", 1700);
          break;
        }
      }
    }

    if (P.grounded && P.stun <= 0) {
      for (let i = 0; i < L.flags.length; i += 1) {
        const f = L.flags[i];
        if (f.state !== "ready") continue;
        const dx = P.x - f.x, dz = P.z - f.z;
        if (dx * dx + dz * dz < 2.7 * 2.7) { openQuiz(f); return; }
      }
      const fn = L.finale;
      const fd = Math.hypot(P.x - fn.x, P.z - fn.z);
      if (fd < 3.1) {
        if (run.flags >= def.flags.length) { openMini(); return; }
        if (G.time - run.warn > 3.5) {
          run.warn = G.time;
          UI.toast(`Önce ${def.flags.length} bilgi bayrağını topla (${run.flags}/${def.flags.length}).`, "", 2200);
        }
      }
    }

    for (let i = 0; i < def.tips.length; i += 1) {
      if (run.tips[i]) continue;
      const t = def.tips[i];
      if (Math.hypot(P.x - t.x, P.z - t.z) < t.r) {
        run.tips[i] = true;
        UI.bubble(t.who === "guide" ? otherChar() : t.who, t.text);
        break;
      }
    }
  }

  function target() {
    const L = G.L;
    let best = null, bd = 1e9;
    L.flags.forEach((f) => {
      if (f.state !== "ready") return;
      const d = Math.hypot(f.x - P.x, f.z - P.z);
      if (d < bd) { bd = d; best = { x: f.x, z: f.z, label: "Bayrak", d }; }
    });
    if (!best) best = { x: L.finale.x, z: L.finale.z, label: "Görev", d: Math.hypot(L.finale.x - P.x, L.finale.z - P.z) };
    return best;
  }

  function announceDirection() {
    if (G.phase !== "play") return;
    const t = target();
    const a = Math.atan2(t.x - P.x, -(t.z - P.z));
    const names = ["ileride", "ileride sağda", "sağda", "geride sağda", "geride", "geride solda", "solda", "ileride solda"];
    const idx = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    const text = `${t.label === "Bayrak" ? "En yakın bayrak" : G.L.def.finale.label} ${names[idx]}, ${Math.round(t.d)} metre.`;
    UI.announce(text);
    UI.toast(text, "", 2000);
  }

  /* ───────── Animasyon ───────── */
  function animatePlayer(dt) {
    const speed = Math.hypot(P.vx, P.vz);
    const s01 = U.clamp(speed / SPEED, 0, 1.3);
    if (speed > 0.7 && !P.respawn && P.stun <= 0) P.yaw = U.angleLerp(P.yaw, Math.atan2(P.vx, P.vz), 1 - Math.exp(-12 * dt));
    P.slide = U.damp(P.slide, P.onIce && P.grounded && speed > 4.2 ? 1 : 0, 7, dt);
    const walking = P.grounded && speed > 0.6 && !P.respawn;
    if (walking && P.slide < 0.5) {
      P.stepPhase += dt * (5 + s01 * 8.5);
      const idx = Math.floor(P.stepPhase / Math.PI);
      if (idx !== P.stepIndex) {
        P.stepIndex = idx;
        A.play("step");
        if (!P.platform && !G.reduced) W.burst("snow", P.x, P.y + 0.05, P.z, 2);
      }
    }
    if (P.slide > 0.5 && P.grounded) {
      P.slideSound -= dt;
      if (P.slideSound <= 0) { P.slideSound = 0.22; A.play("slide"); if (!G.reduced) W.burst("ice", P.x, P.y + 0.1, P.z, 2); }
    }
    P.idle = speed < 0.4 && P.grounded ? P.idle + dt : 0;

    P.squashV += (1 - P.squash) * 190 * dt;
    P.squashV *= Math.exp(-13 * dt);
    P.squash = U.clamp(P.squash + P.squashV * dt, 0.62, 1.4);

    const walk = P.grounded ? Math.min(1, s01) * (1 - P.slide) : 0;
    const roll = Math.sin(P.stepPhase) * 0.17 * walk;
    let bob = Math.abs(Math.sin(P.stepPhase)) * 0.14 * walk;
    const pitchMax = rig.char === "cute" ? 1.2 : 0.3;
    let lean = 0.1 * Math.min(1, s01) + P.slide * pitchMax;
    if (!P.grounded && !P.respawn) lean += U.clamp(-P.vy * 0.014, -0.2, 0.25);
    let spin = 0, look = 0;
    if (P.celebrate > 0) {
      P.celebrate = Math.max(0, P.celebrate - dt);
      if (!G.reduced) spin = P.celebrate * 5.2;
      bob += Math.abs(Math.sin(P.celebrate * 8)) * 0.55 * Math.min(1, P.celebrate);
    } else if (P.idle > 2.5) look = Math.sin((P.idle - 2.5) * 1.2) * 0.45 * U.smooth(2.5, 3.5, P.idle);
    if (P.respawn) spin = P.respawn.t * Math.PI * 2;
    const breathe = 1 + Math.sin(G.time * 2.1) * 0.013;
    const sq = P.squash * breathe;
    const wide = 1 / Math.sqrt(sq);
    rig.root.position.set(P.x, P.y + bob + P.slide * (rig.char === "cute" ? 0.5 : 0.06), P.z);
    rig.root.rotation.y = P.yaw + spin + look;
    rig.tilt.rotation.x = lean;
    rig.tilt.rotation.z = roll + (P.stun > 0 ? Math.sin(P.stun * 22) * 0.45 : 0);
    rig.squash.scale.set(wide, sq, wide);
    rig.root.visible = !(P.invuln > 0 && Math.floor(G.time * 14) % 2 === 0);
    const gy = P.respawn ? G.L.height(P.x, P.z) : P.grounded ? P.y : groundAt(P.x, P.z).y;
    const lift = U.clamp(1 - (P.y - gy) / 7, 0.4, 1);
    rig.shadow.position.set(P.x, Math.max(gy, G.L.water) + 0.07, P.z);
    rig.shadow.scale.setScalar(lift);
    rig.shadow.material.opacity = 0.9 * lift;
  }

  function updateCamera(dt) {
    const cam = W.camera;
    const k = cam.aspect < 0.8 ? 1.42 : cam.aspect < 1.3 ? 1.16 : 1;
    let rate = 5.5;
    if (G.phase === "title" || G.phase === "map" || G.phase === "victory") {
      const a = G.reduced ? 0.6 : 0.2 + Math.sin(G.time * 0.1 + 0.5) * 0.9; /* güneyde kalan yavaş bir salınım */
      camWant.set(P.x + Math.sin(a) * 15 * k, P.y + 6.2, P.z + Math.cos(a) * 15 * k + 1);
      lookWant.set(P.x, P.y + 2.4, P.z - 3);
      rate = 1.6;
      P.yaw = U.angleLerp(P.yaw, Math.atan2(camPos.x - P.x, camPos.z - P.z), 1 - Math.exp(-3 * dt));
    } else if (G.phase === "brief") {
      camWant.set(0, 46 * k, P.z + 26);
      lookWant.set(0, 0, P.z - 44);
      rate = 1.5;
    } else if (G.phase === "result") {
      /* oyuncu kartın solunda kalsın diye bakış noktası sağa kaydırılır */
      const side = cam.aspect > 1.5 ? 7.0 : 0;
      camWant.set(P.x + side + 2.5, P.y + 3.6, P.z + 10.5 * k);
      lookWant.set(P.x + side, P.y + 2.0, P.z);
      rate = 2.4;
      P.yaw = U.angleLerp(P.yaw, Math.atan2(camPos.x - P.x, camPos.z - P.z), 1 - Math.exp(-4 * dt));
    } else {
      G.introT += dt;
      const L = G.L;
      let hazard = Boolean(P.platform);
      if (!hazard) {
        for (let d = 2; d <= 14 && !hazard; d += 4) hazard = L.height(P.x, P.z - d) < L.water - 0.3;
        for (let i = 0; i < L.lanes.length && !hazard; i += 1) hazard = P.z - L.lanes[i].z > -3 && P.z - L.lanes[i].z < 11;
      }
      G.camHigh = U.damp(G.camHigh || 0, hazard ? 1 : 0, 1.5, dt);
      const tx = P.x * 0.9 + P.vx * 0.18, tz = P.z - 3.4 + P.vz * 0.14;
      const ty = P.groundY + 1.7 + Math.max(0, P.y - P.groundY) * 0.35;
      lookWant.set(tx, ty, tz);
      camWant.set(tx * 0.94, ty + U.lerp(6.9, 11.0, G.camHigh) * k, tz + U.lerp(18.6, 15.0, G.camHigh) * k);
      rate = G.introT < 1.6 ? 2.0 : 5.5;
    }
    camPos.lerp(camWant, 1 - Math.exp(-rate * dt));
    camLook.lerp(lookWant, 1 - Math.exp(-rate * 1.25 * dt));
    cam.position.copy(camPos);
    if (G.shake > 0.001 && !G.reduced) {
      cam.position.x += (Math.random() - 0.5) * G.shake;
      cam.position.y += (Math.random() - 0.5) * G.shake;
      G.shake *= Math.exp(-7 * dt);
    } else G.shake = 0;
    cam.lookAt(camLook);
  }

  /* ───────── Döngü ───────── */
  function step(dt) {
    G.time += dt;
    const playing = G.phase === "play";
    if (playing) G.run.time += dt;
    updatePlayer(dt, playing);
    if (playing && G.phase === "play") {
      interactions(dt);
      UI.hudTime(G.run.time);
      const t = target();
      UI.compass(Math.atan2(t.x - P.x, -(t.z - P.z)), t.d, t.label);
    }
    animatePlayer(dt);
    W.update(dt, G.time, P.x, P.y, P.z);
    updateCamera(dt);
  }

  function frame(now) {
    raf = window.requestAnimationFrame(frame);
    const raw = (now - lastFrame) / 1000;
    lastFrame = now;
    const dt = Math.min(0.05, Math.max(0, raw));
    if (!G.paused) step(dt);
    W.render();
    if (G.phase === "play" && !G.paused && !G.lockQuality && raw < 0.5) {
      frameAcc += raw;
      frameCount += 1;
      if (frameCount >= 110) {
        if (frameAcc / frameCount > 0.036 && W.quality > 0) W.setQuality(W.quality - 1);
        frameAcc = 0;
        frameCount = 0;
      }
    }
  }

  function startLoop() {
    if (raf) return;
    lastFrame = window.performance.now();
    raf = window.requestAnimationFrame(frame);
  }

  /* Test ve hata ayıklama için küçük bir arayüz */
  KBK.debug = {
    G, P, handlers, step: (dt, n) => { for (let i = 0; i < (n || 1); i += 1) step(dt); },
    tp: (x, z) => { P.x = x; P.z = z; P.y = G.L.height(x, z); P.vx = P.vy = P.vz = 0; P.grounded = true; P.platform = null; P.respawn = null; },
    keys, groundAt, inside
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}());
