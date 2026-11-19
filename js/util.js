/* Kutup Bayrak Kaşifi — yardımcılar, kayıt ve ses */
(function () {
  "use strict";
  const KBK = (window.KBK = window.KBK || {});

  /* ── Matematik ── */
  const U = {};
  U.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  U.smooth = (a, b, x) => {
    const t = U.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  U.rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.angleLerp = (a, b, t) => {
    const TAU = Math.PI * 2;
    const d = ((((b - a) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
    return a + d * t;
  };
  U.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  U.easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  U.easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  U.easeOutElastic = (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  };
  U.distSeg = (px, pz, ax, az, bx, bz) => {
    const dx = bx - ax, dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const t = U.clamp(((px - ax) * dx + (pz - az) * dz) / len2, 0, 1);
    return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
  };
  U.shuffle = (list, rnd) => {
    const a = list.slice();
    const r = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.fmtTime = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  U.fmtDateTR = (date) =>
    String(date.getDate()).padStart(2, "0") + "." + String(date.getMonth() + 1).padStart(2, "0") + "." + date.getFullYear();
  KBK.util = U;

  /* ── Kayıt: yalnızca bu cihazda, tarayıcı belleğinde ── */
  const KEY = "kutup-bayrak-kasifi-v2";
  KBK.store = {
    load() {
      try {
        return JSON.parse(window.localStorage.getItem(KEY)) || {};
      } catch (error) {
        return {};
      }
    },
    save(data) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(data));
      } catch (error) {
        /* kayıt yoksa oyun yine çalışır */
      }
    }
  };

  /* ── Ses: dosya gerektirmeyen küçük bir sentezleyici ── */
  const A = { enabled: false, ctx: null, master: null, wind: null, windGain: null };

  A.ensure = () => {
    if (!A.enabled) return false;
    if (!A.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return false;
      try {
        A.ctx = new Ctor();
      } catch (error) {
        return false;
      }
      A.master = A.ctx.createGain();
      A.master.gain.value = 0.34;
      A.master.connect(A.ctx.destination);
      startWind();
    }
    if (A.ctx.state === "suspended") A.ctx.resume().catch(() => {});
    return true;
  };

  function noiseBuffer(seconds) {
    const length = Math.floor(A.ctx.sampleRate * seconds);
    const buffer = A.ctx.createBuffer(1, length, A.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function startWind() {
    if (A.wind) return;
    const source = A.ctx.createBufferSource();
    source.buffer = noiseBuffer(2.5);
    source.loop = true;
    const filter = A.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    const gain = A.ctx.createGain();
    gain.gain.value = 0.03;
    source.connect(filter).connect(gain).connect(A.master);
    source.start();
    A.wind = source;
    A.windGain = gain;
  }

  A.setEnabled = (on) => {
    A.enabled = Boolean(on);
    if (A.enabled) {
      A.ensure();
      if (A.master) A.master.gain.setTargetAtTime(0.34, A.ctx.currentTime, 0.04);
    } else if (A.master) {
      A.master.gain.setTargetAtTime(0.0001, A.ctx.currentTime, 0.04);
    }
  };

  A.suspend = () => { if (A.ctx && A.ctx.state === "running") A.ctx.suspend().catch(() => {}); };
  A.resume = () => { if (A.enabled && A.ctx && A.ctx.state === "suspended") A.ctx.resume().catch(() => {}); };

  function tone(freq, delay, dur, type, vol, slideTo) {
    const t0 = A.ctx.currentTime + delay;
    const osc = A.ctx.createOscillator();
    const gain = A.ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(A.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }

  function noise(delay, dur, freq, q, vol, sweepTo, kind) {
    const t0 = A.ctx.currentTime + delay;
    const source = A.ctx.createBufferSource();
    source.buffer = noiseBuffer(dur + 0.05);
    const filter = A.ctx.createBiquadFilter();
    filter.type = kind || "bandpass";
    filter.frequency.setValueAtTime(freq, t0);
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
    filter.Q.value = q || 1;
    const gain = A.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.2, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    source.connect(filter).connect(gain).connect(A.master);
    source.start(t0);
    source.stop(t0 + dur + 0.05);
  }

  const SOUNDS = {
    click: () => tone(660, 0, 0.06, "triangle", 0.06),
    start: () => { tone(330, 0, 0.12); tone(494, 0.11, 0.16); tone(659, 0.23, 0.22); },
    step: () => noise(0, 0.07, 900 + Math.random() * 500, 0.8, 0.05, 300),
    jump: () => tone(300, 0, 0.16, "sine", 0.09, 620),
    land: () => { noise(0, 0.12, 500, 0.7, 0.12, 120, "lowpass"); tone(110, 0, 0.09, "sine", 0.08, 70); },
    slide: () => noise(0, 0.25, 2400, 1.2, 0.035, 1200),
    crystal: () => { tone(1320, 0, 0.09, "sine", 0.08); tone(1976, 0.06, 0.16, "sine", 0.07); },
    correct: () => { tone(523, 0, 0.12); tone(659, 0.09, 0.13); tone(784, 0.18, 0.24); },
    wrong: () => { tone(220, 0, 0.18, "triangle", 0.11); tone(174, 0.12, 0.24, "triangle", 0.11); },
    pick: () => tone(520, 0, 0.07, "triangle", 0.07),
    pair: () => { tone(660, 0, 0.09); tone(880, 0.07, 0.14); },
    splash: () => { noise(0, 0.45, 1800, 0.6, 0.22, 300, "lowpass"); tone(420, 0, 0.2, "sine", 0.06, 120); },
    bump: () => { noise(0, 0.18, 300, 0.8, 0.26, 90, "lowpass"); tone(140, 0, 0.16, "square", 0.05, 60); },
    crack: () => { noise(0, 0.09, 3200, 2, 0.12, 1400); noise(0.07, 0.12, 2200, 2, 0.09, 700); },
    build: () => { noise(0, 0.3, 700, 0.7, 0.14, 200, "lowpass"); tone(392, 0.12, 0.12); tone(587, 0.22, 0.2); },
    unlock: () => { tone(587, 0, 0.1); tone(784, 0.09, 0.1); tone(1175, 0.18, 0.26); },
    star: () => { tone(988, 0, 0.1, "sine", 0.09); tone(1319, 0.07, 0.22, "sine", 0.08); },
    fanfare: () => {
      [[392, 0], [523, 0.14], [659, 0.28], [784, 0.42], [1047, 0.62]].forEach(([f, d], i) => tone(f, d, i === 4 ? 0.6 : 0.2, "triangle", 0.1));
      [[262, 0.62], [330, 0.62]].forEach(([f, d]) => tone(f, d, 0.6, "sine", 0.06));
    }
  };

  A.play = (name) => {
    if (!A.enabled || !A.ensure()) return;
    const fn = SOUNDS[name];
    if (fn) {
      try {
        fn();
      } catch (error) {
        /* ses kartı hazır değilse sessiz devam et */
      }
    }
  };

  KBK.audio = A;
}());
