/* Kutup Bayrak Kaşifi — arayüz: ekranlar, soru paneli, mini oyunlar, sertifika */
(function () {
  "use strict";
  const KBK = window.KBK;
  const U = KBK.util;
  const A = KBK.audio;
  const $ = (id) => document.getElementById(id);
  const LETTERS = ["A", "B", "C", "D"];
  const UI = { joy: { x: 0, z: 0, active: false } };
  let H = {};
  let toastTimer = 0, bubbleTimer = 0, modal = null, lastFocus = null, lastTime = -1;
  const held = new Set();
  let blocked = new Set();
  let quiz = null, mini = null;

  const PANELS = ["panel-brief", "panel-quiz", "panel-mini", "panel-result", "panel-victory"];
  const SCREENS = ["screen-title", "screen-map"];

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const svgUse = (id, cls) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (cls) svg.setAttribute("class", cls);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  };
  const strip = (text) => text.replace(/^[A-D]\)\s*/, "");

  /* ───────── Ekran yönetimi ───────── */
  function setModal(id) {
    if (id && !modal) lastFocus = document.activeElement;
    modal = id ? $(id) : null;
    $("ui").classList.toggle("has-modal", Boolean(modal));
  }

  function focusFirst(container, selector) {
    window.setTimeout(() => {
      const target = container.querySelector(selector || "button:not([disabled]):not([hidden]), input");
      if (target) target.focus({ preventScroll: true });
    }, 30);
  }

  UI.view = (name) => {
    SCREENS.concat(PANELS).forEach((id) => { $(id).hidden = true; });
    $("panel-help").hidden = true;
    $("panel-confirm").hidden = true;
    const inLevel = name === "play" || name === "quiz" || name === "mini";
    $("hud").hidden = !inLevel;
    $("ui").dataset.view = name;
    if (name !== "play") UI.hideBubble();
    setModal(null);
    if (name === "title") $("screen-title").hidden = false;
    else if (name === "map") $("screen-map").hidden = false;
    else if (name === "brief") { $("panel-brief").hidden = false; setModal("panel-brief"); focusFirst($("panel-brief"), "#btn-go"); }
    else if (name === "quiz") { $("panel-quiz").hidden = false; setModal("panel-quiz"); }
    else if (name === "mini") { $("panel-mini").hidden = false; setModal("panel-mini"); }
    else if (name === "result") { $("panel-result").hidden = false; setModal("panel-result"); focusFirst($("panel-result"), "#btn-next"); }
    else if (name === "victory") { $("panel-victory").hidden = false; setModal("panel-victory"); focusFirst($("panel-victory"), "#btn-cert-save"); }
    $("touch").classList.toggle("on", name === "play");
    if (name === "play") $("stage").focus({ preventScroll: true });
  };

  UI.ready = () => {
    $("loading").hidden = true;
    $("btn-start").disabled = false;
  };

  /* ───────── Bildirimler ───────── */
  UI.toast = (message, kind, ms) => {
    const t = $("toast");
    window.clearTimeout(toastTimer);
    t.textContent = message;
    t.className = "toast" + (kind ? " " + kind : "");
    t.hidden = false;
    toastTimer = window.setTimeout(() => { t.hidden = true; }, ms || 2200);
  };

  UI.announce = (message) => {
    const live = $("live");
    live.textContent = "";
    window.setTimeout(() => { live.textContent = message; }, 30);
  };

  UI.bubble = (who, text, ms) => {
    const c = KBK.cast[who] || KBK.cast.cute;
    $("bubble-avatar").src = c.avatar;
    $("bubble-name").textContent = c.name;
    $("bubble-text").textContent = text;
    const b = $("bubble");
    b.hidden = false;
    b.classList.remove("in");
    void b.offsetWidth;
    b.classList.add("in");
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(UI.hideBubble, ms || Math.max(5200, text.length * 62));
  };
  UI.hideBubble = () => {
    window.clearTimeout(bubbleTimer);
    $("bubble").hidden = true;
  };

  UI.setSound = (on) => {
    const b = $("btn-sound");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Sesi kapat" : "Sesi aç");
    b.title = on ? "Sesi kapat" : "Sesi aç";
    $("sound-use").setAttribute("href", on ? "#ic-sound-on" : "#ic-sound-off");
  };

  /* ───────── Açılış ve harita ───────── */
  UI.showTitle = (profile) => {
    $("player-name").value = profile.name || "";
    const radio = document.querySelector(`input[name="char"][value="${profile.char || "flag"}"]`);
    if (radio) radio.checked = true;
    UI.view("title");
  };

  function starRow(n, cls) {
    const wrap = el("span", cls || "stop-stars");
    for (let i = 0; i < 3; i += 1) wrap.appendChild(svgUse("ic-star", "star" + (i < n ? " on" : "")));
    return wrap;
  }

  UI.showMap = (profile, info) => {
    const c = KBK.cast[profile.char] || KBK.cast.flag;
    $("map-avatar").src = c.avatar;
    $("map-name").textContent = profile.name || "Kaşif";
    $("map-stars").textContent = String(info.stars);
    $("map-flags").textContent = String(info.flags);
    $("btn-cert").disabled = !info.allDone;
    $("btn-unlock").setAttribute("aria-pressed", String(Boolean(profile.unlockAll)));
    $("btn-unlock").textContent = profile.unlockAll ? "Öğretmen: bölümler açık (kilitle)" : "Öğretmen: tüm bölümleri aç";
    const route = $("map-route");
    route.textContent = "";
    KBK.levels.forEach((def, i) => {
      const st = info.levels[i];
      const li = el("li", "stop" + (st.done ? " done" : "") + (st.open ? "" : " locked") + (st.next ? " next" : ""));
      const card = el("button", "stop-card");
      card.type = "button";
      card.disabled = !st.open;
      card.dataset.level = String(i);
      card.appendChild(el("span", "stop-no", String(def.id)));
      const body = el("span", "stop-body");
      body.appendChild(el("small", "", def.lesson));
      body.appendChild(el("b", "", def.title));
      body.appendChild(el("em", "", def.mechanic));
      card.appendChild(body);
      card.appendChild(starRow(st.stars));
      const state = el("span", "stop-state");
      if (!st.open) {
        state.appendChild(svgUse("ic-lock", "lock"));
        state.appendChild(document.createTextNode("Önceki bölümü bitir"));
      } else {
        state.textContent = st.done ? "Tekrar oyna" : "Oyna";
      }
      card.appendChild(state);
      card.setAttribute("aria-label", `Bölüm ${def.id}: ${def.title}. ${st.open ? (st.done ? st.stars + " yıldız. Tekrar oyna." : "Oyna.") : "Kilitli."}`);
      card.addEventListener("click", () => { A.play("click"); H.pickLevel(i); });
      li.appendChild(card);
      route.appendChild(li);
    });
    UI.view("map");
    focusFirst(route, ".stop.next .stop-card, .stop-card:not([disabled])");
  };

  UI.showBrief = (def, guideKey) => {
    $("brief-no").textContent = "Bölüm " + def.id;
    $("brief-lesson").textContent = def.lesson;
    $("brief-title").textContent = def.title;
    $("brief-place").textContent = def.place;
    $("brief-avatar").src = (KBK.cast[def.id === 4 ? "bear" : guideKey] || KBK.cast.cute).avatar;
    $("brief-text").textContent = def.brief;
    const goals = $("brief-goals");
    goals.textContent = "";
    def.goals.forEach((g) => goals.appendChild(el("li", "", g)));
    UI.view("brief");
  };

  /* ───────── Oyun içi gösterge ───────── */
  UI.hudSetup = (def) => {
    $("hud-level-no").textContent = "Bölüm " + def.id;
    $("hud-level-title").textContent = def.title;
    const wrap = $("hud-flags");
    wrap.textContent = "";
    for (let i = 0; i < def.flags.length; i += 1) {
      const pip = el("span", "pip");
      pip.appendChild(svgUse("tr-flag"));
      wrap.appendChild(pip);
    }
    lastTime = -1;
    UI.hudStats({ flags: 0, crystals: 0, score: 0 }, def.flags.length);
    UI.hudTime(0);
  };

  UI.hudStats = (run, total) => {
    const pips = $("hud-flags").children;
    for (let i = 0; i < pips.length; i += 1) {
      const on = i < run.flags;
      if (on && !pips[i].classList.contains("on")) pips[i].classList.add("on", "pop");
      else if (!on) pips[i].classList.remove("on", "pop");
    }
    $("hud-flags").setAttribute("aria-label", `Toplanan bayrak: ${run.flags}/${total}`);
    $("hud-crystals").textContent = String(run.crystals);
    $("hud-score").textContent = String(run.score);
  };

  UI.hudTime = (sec) => {
    const s = Math.floor(sec);
    if (s === lastTime) return;
    lastTime = s;
    $("hud-time").textContent = U.fmtTime(s);
  };

  UI.compass = (angle, dist, label) => {
    $("compass-arrow").style.transform = `rotate(${angle.toFixed(2)}rad)`;
    $("compass-dist").textContent = dist < 0 ? "--" : Math.round(dist) + " m";
    $("compass-label").textContent = label;
  };

  /* ───────── Soru paneli ───────── */
  UI.openQuiz = (info, cb) => {
    quiz = { q: info.q, cb, locked: false, tries: 0, done: false };
    blocked = new Set(held);
    $("quiz-kicker").textContent = `Bilgi Bayrağı ${info.number}/${info.total}`;
    $("quiz-level").textContent = info.levelTitle;
    $("quiz-text").textContent = info.q.q;
    $("quiz-feedback").textContent = "";
    $("quiz-feedback").className = "feedback";
    $("quiz-note").hidden = true;
    $("btn-quiz-retry").hidden = true;
    $("btn-quiz-next").hidden = true;
    $("quiz-hint").hidden = false;
    const wrap = $("quiz-choices");
    wrap.textContent = "";
    info.q.opts.forEach((opt, i) => {
      const b = el("button", "choice");
      b.type = "button";
      b.appendChild(el("span", "letter", LETTERS[i]));
      b.appendChild(el("span", "text", strip(opt)));
      b.appendChild(el("span", "mark"));
      b.setAttribute("aria-label", `${LETTERS[i]} seçeneği: ${strip(opt)}`);
      b.addEventListener("click", () => answer(i));
      wrap.appendChild(b);
    });
    UI.view("quiz");
    $("panel-quiz").scrollTop = 0;
    /* Odak seçeneğe değil panele verilir: Boşluk'a (zıplama) basan oyuncu yanlışlıkla cevap seçmesin. */
    $("panel-quiz").focus({ preventScroll: true });
    UI.announce(`Bilgi bayrağı ${info.number}. ${info.q.q}`);
  };

  function answer(i) {
    if (!quiz || quiz.locked || quiz.done) return;
    const buttons = Array.from($("quiz-choices").children);
    if (!buttons[i]) return;
    quiz.locked = true;
    quiz.tries += 1;
    buttons.forEach((b) => { b.disabled = true; });
    const q = quiz.q;
    const fb = $("quiz-feedback");
    $("quiz-hint").hidden = true;
    if (i === q.ans) {
      quiz.done = true;
      buttons[i].classList.add("correct");
      buttons[i].querySelector(".mark").textContent = "✓";
      fb.textContent = quiz.tries === 1 ? "Doğru! İlk denemede bildin." : "Doğru! Bayrak senin.";
      fb.className = "feedback ok";
      $("quiz-answer").textContent = "";
      $("quiz-info").textContent = q.info;
      $("quiz-note").hidden = false;
      $("btn-quiz-next").hidden = false;
      focusFirst($("panel-quiz"), "#btn-quiz-next");
      UI.announce("Doğru cevap. " + q.info);
      quiz.cb.onCorrect(quiz.tries);
    } else {
      buttons[i].classList.add("wrong");
      buttons[i].querySelector(".mark").textContent = "×";
      buttons[q.ans].classList.add("reveal");
      buttons[q.ans].querySelector(".mark").textContent = "✓";
      fb.textContent = "Henüz değil. Bilim notunu oku, sonra yeniden dene.";
      fb.className = "feedback bad";
      $("quiz-answer").textContent = `Doğru cevap: ${LETTERS[q.ans]}) ${strip(q.opts[q.ans])}`;
      $("quiz-info").textContent = q.info;
      $("quiz-note").hidden = false;
      $("btn-quiz-retry").hidden = false;
      focusFirst($("panel-quiz"), "#btn-quiz-retry");
      UI.announce("Yanlış cevap. Doğru cevap ve bilim notu gösteriliyor.");
      quiz.cb.onWrong();
    }
  }

  function retryQuiz() {
    if (!quiz || quiz.done) return;
    quiz.locked = false;
    Array.from($("quiz-choices").children).forEach((b) => {
      b.disabled = false;
      b.classList.remove("wrong", "reveal", "correct");
      b.querySelector(".mark").textContent = "";
    });
    $("quiz-feedback").textContent = "";
    $("quiz-feedback").className = "feedback";
    $("quiz-note").hidden = true;
    $("btn-quiz-retry").hidden = true;
    $("quiz-hint").hidden = false;
    $("panel-quiz").focus({ preventScroll: true });
    UI.announce("Soru yeniden hazır.");
  }

  function closeQuiz() {
    if (!quiz || !quiz.done) return;
    const cb = quiz.cb;
    quiz = null;
    cb.onClose();
  }

  /* ───────── Mini oyunlar ───────── */
  UI.openMini = (game, cb) => {
    mini = { game, cb, miss: 0, done: false };
    $("mini-title").textContent = game.title;
    $("mini-prompt").textContent = game.prompt;
    $("mini-miss").textContent = "0";
    $("mini-feedback").textContent = "";
    $("mini-feedback").className = "feedback";
    $("mini-note").hidden = true;
    $("btn-mini-done").hidden = true;
    const body = $("mini-body");
    body.textContent = "";
    body.className = "mini-body " + game.type;
    if (game.type === "match") buildMatch(body, game);
    else buildOrder(body, game);
    UI.view("mini");
    $("panel-mini").scrollTop = 0;
    $("panel-mini").focus({ preventScroll: true });
    UI.announce(`${game.title}. ${game.prompt}`);
  };

  function miniMiss(nodes) {
    mini.miss += 1;
    $("mini-miss").textContent = String(mini.miss);
    nodes.forEach((n) => {
      n.classList.remove("shake");
      void n.offsetWidth;
      n.classList.add("shake");
    });
    A.play("wrong");
    mini.cb.onMistake();
  }

  function miniDone() {
    mini.done = true;
    const fb = $("mini-feedback");
    fb.textContent = mini.miss === 0 ? "Kusursuz! Hiç hata yapmadın." : "Tamamlandı!";
    fb.className = "feedback ok";
    $("mini-note-text").textContent = mini.game.note;
    $("mini-note").hidden = false;
    $("btn-mini-done").hidden = false;
    focusFirst($("panel-mini"), "#btn-mini-done");
    A.play("unlock");
    UI.announce("Görev tamamlandı. " + mini.game.note);
  }

  function buildMatch(body, game) {
    const left = el("div", "col left"), right = el("div", "col right");
    left.setAttribute("role", "group");
    left.setAttribute("aria-label", "Eşleştirilecekler");
    right.setAttribute("role", "group");
    right.setAttribute("aria-label", "Açıklamalar");
    const order = U.shuffle(game.pairs.map((_, i) => i));
    let derange = U.shuffle(order);
    if (derange.every((v, i) => v === order[i])) derange = derange.slice(1).concat(derange[0]);
    let pick = { left: null, right: null };
    let paired = 0;
    const make = (side, idx, text) => {
      const b = el("button", "tile");
      b.type = "button";
      b.textContent = text;
      b.dataset.pair = String(idx);
      b.addEventListener("click", () => {
        if (mini.done || b.disabled) return;
        if (pick[side]) pick[side].classList.remove("picked");
        pick[side] = b;
        b.classList.add("picked");
        A.play("pick");
        if (pick.left && pick.right) {
          const a = pick.left, c = pick.right;
          pick = { left: null, right: null };
          a.classList.remove("picked");
          c.classList.remove("picked");
          if (a.dataset.pair === c.dataset.pair) {
            paired += 1;
            [a, c].forEach((n) => {
              n.disabled = true;
              n.classList.add("paired", "k" + paired);
            });
            a.dataset.badge = c.dataset.badge = String(paired);
            A.play("pair");
            UI.announce("Doğru eşleşme.");
            if (paired === game.pairs.length) miniDone();
          } else {
            miniMiss([a, c]);
            UI.announce("Bu ikisi eşleşmiyor.");
          }
        }
      });
      return b;
    };
    order.forEach((i) => left.appendChild(make("left", i, game.pairs[i][0])));
    derange.forEach((i) => right.appendChild(make("right", i, game.pairs[i][1])));
    body.appendChild(left);
    body.appendChild(right);
  }

  function buildOrder(body, game) {
    const line = el("ol", "timeline");
    const pool = el("div", "pool");
    pool.setAttribute("role", "group");
    pool.setAttribute("aria-label", "Sıralanacak kartlar");
    const slots = game.items.map((item, i) => {
      const li = el("li", "slot");
      li.appendChild(el("span", "slot-no", String(i + 1)));
      li.appendChild(el("span", "slot-text", "?"));
      line.appendChild(li);
      return li;
    });
    let next = 0;
    U.shuffle(game.items.map((_, i) => i)).forEach((i) => {
      const b = el("button", "tile");
      b.type = "button";
      b.textContent = game.items[i].text;
      b.addEventListener("click", () => {
        if (mini.done || b.disabled) return;
        if (i === next) {
          b.disabled = true;
          b.classList.add("used");
          const slot = slots[next];
          slot.classList.add("filled");
          slot.querySelector(".slot-no").textContent = game.items[i].tag;
          slot.querySelector(".slot-text").textContent = game.items[i].text;
          next += 1;
          A.play("pair");
          UI.announce(`${game.items[i].tag}: ${game.items[i].text}`);
          if (next === game.items.length) miniDone();
          else focusFirst(pool, "button:not([disabled])");
        } else {
          miniMiss([b]);
          UI.announce("Sıradaki bu değil.");
        }
      });
      pool.appendChild(b);
    });
    body.appendChild(line);
    body.appendChild(pool);
  }

  /* ───────── Bölüm sonucu ───────── */
  UI.showResult = (r) => {
    $("result-kicker").textContent = `Bölüm ${r.def.id} tamamlandı`;
    $("result-title").textContent = r.stars === 3 ? "Kusursuz sefer!" : r.stars === 2 ? "Harika iş, kaşif!" : "Bölüm tamam!";
    const stars = $("result-stars");
    stars.textContent = "";
    stars.setAttribute("aria-label", `3 yıldızdan ${r.stars}`);
    for (let i = 0; i < 3; i += 1) {
      const s = svgUse("ic-star", "star big");
      stars.appendChild(s);
      if (i < r.stars) window.setTimeout(() => { s.classList.add("on", "pop"); A.play("star"); }, 450 + i * 380);
    }
    $("res-first").textContent = `${r.firstTry}/${r.total}`;
    $("res-miss").textContent = String(r.mistakes);
    $("res-crystal").textContent = `${r.crystals}/${r.crystalTotal}`;
    $("res-time").textContent = U.fmtTime(r.time);
    $("res-score").textContent = String(r.score) + (r.best ? "  · yeni rekor" : "");
    $("result-rule").textContent = r.stars === 3
      ? "En fazla 1 hatayla bitirdin: 3 yıldız!"
      : `3 yıldız için en fazla ${KBK.starRule.three} hata, 2 yıldız için en fazla ${KBK.starRule.two} hata yapmalısın.`;
    const next = $("btn-next");
    next.querySelector("span").textContent = r.nextLabel;
    UI.view("result");
  };

  /* ───────── Sertifika ───────── */
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "", row = 0;
    words.forEach((word) => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y + row * lineHeight);
        row += 1;
        line = word;
      } else line = test;
    });
    if (line) ctx.fillText(line, x, y + row * lineHeight);
  }

  function drawStar(ctx, cx, cy, r, fill) {
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const rr = i % 2 === 0 ? r : r * 0.45;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  UI.drawCertificate = (data) => {
    const canvas = $("cert-canvas");
    const ctx = canvas.getContext("2d");
    const Wd = canvas.width, Ht = canvas.height;
    const display = '"Baloo 2", "Segoe UI", sans-serif';
    const body = '"Nunito", "Segoe UI", sans-serif';
    ctx.fillStyle = "#f3f9fd";
    ctx.fillRect(0, 0, Wd, Ht);
    /* buz dokusu */
    const rnd = U.rng(42);
    for (let i = 0; i < 26; i += 1) {
      ctx.fillStyle = `rgba(20,147,184,${0.03 + rnd() * 0.04})`;
      ctx.beginPath();
      const x = rnd() * Wd, y = rnd() * Ht, s = 60 + rnd() * 180;
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y + s * 0.3);
      ctx.lineTo(x + s * 0.4, y + s);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = "#0b2545";
    ctx.lineWidth = 16;
    KBK.art.roundRect(ctx, 40, 40, Wd - 80, Ht - 80, 36);
    ctx.stroke();
    ctx.strokeStyle = "#ffc233";
    ctx.lineWidth = 6;
    KBK.art.roundRect(ctx, 66, 66, Wd - 132, Ht - 132, 24);
    ctx.stroke();

    /* bayrak: yasal ölçülerle, dikdörtgen */
    const fw = 210, fh = 140, fx = Wd / 2 - fw / 2, fy = 108;
    ctx.fillStyle = "rgba(11,37,69,0.18)";
    ctx.fillRect(fx + 5, fy + 7, fw, fh);
    KBK.art.drawFlag(ctx, fx, fy, fw);

    ctx.textAlign = "center";
    ctx.fillStyle = "#1493b8";
    ctx.font = `700 26px ${body}`;
    ctx.fillText("KUTUPLARDA TÜRKİYE'NİN İZLERİ", Wd / 2, 302);
    ctx.fillStyle = "#0b2545";
    ctx.font = `800 92px ${display}`;
    ctx.fillText("Kutup Elçisi", Wd / 2, 400);
    ctx.font = `700 44px ${display}`;
    ctx.fillText("Başarı Sertifikası", Wd / 2, 458);

    ctx.fillStyle = "#4a6583";
    ctx.font = `600 28px ${body}`;
    ctx.fillText("Bu belge", Wd / 2, 530);
    ctx.fillStyle = "#c2101c";
    const name = (data.name || "Kaşif").toLocaleUpperCase("tr-TR");
    let size = 72;
    do {
      ctx.font = `800 ${size}px ${display}`;
      size -= 3;
    } while (ctx.measureText(name).width > 1150 && size > 30);
    ctx.fillText(name, Wd / 2, 612);
    ctx.strokeStyle = "#ffc233";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(380, 640);
    ctx.lineTo(1220, 640);
    ctx.stroke();

    ctx.fillStyle = "#274564";
    ctx.font = `600 30px ${body}`;
    wrapText(ctx, "Türkiye'nin kutup araştırmaları konulu dört bölümlük keşif seferini tamamlayıp 20 bilgi bayrağını topladığı için verilmiştir.", Wd / 2, 700, 1080, 44);

    /* bölümler */
    const colW = 300, x0 = Wd / 2 - colW * 2 + colW / 2;
    data.levels.forEach((lv, i) => {
      const cx = x0 + i * colW;
      ctx.fillStyle = "#0b2545";
      ctx.font = `700 24px ${display}`;
      ctx.fillText(`${i + 1}. ${lv.title}`, cx, 842);
      for (let s = 0; s < 3; s += 1) drawStar(ctx, cx - 40 + s * 40, 882, 16, s < lv.stars ? "#ffc233" : "#c9d8e6");
    });

    ctx.fillStyle = "#4a6583";
    ctx.font = `700 26px ${body}`;
    ctx.textAlign = "left";
    ctx.fillText("Tarih: " + data.date, 130, 1010);
    ctx.textAlign = "center";
    ctx.fillText(`Toplam ${data.stars}/12 yıldız · ${data.score} puan`, Wd / 2, 1010);
    ctx.textAlign = "right";
    ctx.fillText("Kutup Bayrak Kaşifi", Wd - 130, 1010);
    canvas.setAttribute("aria-label", `Kutup Elçisi başarı sertifikası: ${data.name || "Kaşif"}, ${data.stars} yıldız`);
  };

  UI.showVictory = (data) => {
    UI.drawCertificate(data);
    $("cert-note").textContent = "";
    UI.view("victory");
  };

  function fileName(name) {
    const clean = (name || "Kasif")
      .replace(/ı/g, "i").replace(/İ/g, "I")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    return (clean || "Kasif") + "-Kutup-Elcisi-Sertifikasi.png";
  }

  function saveCertificate() {
    const canvas = $("cert-canvas");
    const name = fileName(H.playerName ? H.playerName() : "");
    canvas.toBlob((blob) => {
      if (!blob) return;
      const viaLink = () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 10000);
        $("cert-note").textContent = "Sertifika indirildi. İnmediyse ekran görüntüsü alabilirsin.";
      };
      const host = window.claude && typeof window.claude.use === "function" ? window.claude.use("downloads") : null;
      if (!host) { viaLink(); return; }
      Promise.resolve(host).then((downloads) => {
        if (!downloads) { viaLink(); return null; }
        return downloads.save({ filename: name, data: blob }).then(() => { $("cert-note").textContent = "Sertifika kaydedildi."; });
      }).catch((error) => {
        $("cert-note").textContent = error && error.code === "declined" ? "Kaydetme iptal edildi." : "Sertifika burada indirilemedi; ekran görüntüsü alabilirsin.";
      });
    }, "image/png");
  }

  /* ───────── Yardım ve çıkış onayı ───────── */
  let overlayBack = null;
  function openOverlay(id, focusSel) {
    overlayBack = { modal, focus: document.activeElement };
    $(id).hidden = false;
    modal = $(id);
    $("ui").classList.add("has-overlay");
    H.pause(true);
    focusFirst($(id), focusSel);
  }
  function closeOverlay(id) {
    if ($(id).hidden) return;
    $(id).hidden = true;
    $("ui").classList.remove("has-overlay");
    modal = overlayBack ? overlayBack.modal : null;
    H.pause(false);
    if (overlayBack && overlayBack.focus && overlayBack.focus.focus) overlayBack.focus.focus({ preventScroll: true });
    overlayBack = null;
  }
  UI.openHelp = () => openOverlay("panel-help", "#btn-help-ok");
  UI.closeHelp = () => closeOverlay("panel-help");
  UI.openConfirm = () => openOverlay("panel-confirm", "#btn-stay");
  UI.closeConfirm = () => closeOverlay("panel-confirm");
  UI.overlayOpen = () => !$("panel-help").hidden || !$("panel-confirm").hidden;

  /* ───────── Olaylar ───────── */
  function onKeyDown(e) {
    const key = e.key.length === 1 ? e.key.toLocaleLowerCase("tr-TR") : e.key;
    const wasHeld = held.has(key);
    held.add(key);
    if (e.key === "Escape") {
      if (!$("panel-help").hidden) { UI.closeHelp(); e.preventDefault(); return; }
      if (!$("panel-confirm").hidden) { UI.closeConfirm(); e.preventDefault(); return; }
    }
    if (e.key === "Tab" && modal) {
      const items = Array.from(modal.querySelectorAll("button:not([disabled]), input, [href]")).filter((n) => n.offsetParent !== null);
      if (items.length) {
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (UI.overlayOpen()) return;
    if (quiz && !$("panel-quiz").hidden && !e.repeat && !wasHeld && !blocked.has(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      if (!quiz.locked && map[key] !== undefined) { e.preventDefault(); answer(map[key]); }
    }
  }
  function onKeyUp(e) {
    const key = e.key.length === 1 ? e.key.toLocaleLowerCase("tr-TR") : e.key;
    held.delete(key);
    blocked.delete(key);
  }

  function bindStick() {
    const stick = $("stick"), knob = $("stick-knob");
    let id = null;
    const move = (e) => {
      const r = stick.getBoundingClientRect();
      const max = r.width * 0.36;
      let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy);
      if (len > max) { dx = (dx / len) * max; dy = (dy / len) * max; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const dead = 0.16;
      const nx = dx / max, nz = dy / max;
      UI.joy.x = Math.abs(nx) < dead ? 0 : nx;
      UI.joy.z = Math.abs(nz) < dead ? 0 : nz;
      UI.joy.active = true;
    };
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      knob.style.transform = "";
      UI.joy.x = 0;
      UI.joy.z = 0;
      UI.joy.active = false;
    };
    stick.addEventListener("pointerdown", (e) => {
      id = e.pointerId;
      try { stick.setPointerCapture(id); } catch (error) { /* yoksay */ }
      move(e);
      e.preventDefault();
    });
    stick.addEventListener("pointermove", (e) => { if (e.pointerId === id) { move(e); e.preventDefault(); } });
    stick.addEventListener("pointerup", end);
    stick.addEventListener("pointercancel", end);
    $("btn-jump").addEventListener("pointerdown", (e) => { e.preventDefault(); H.jump(); });
  }

  UI.enableTouch = () => { $("touch").hidden = false; };

  UI.init = (handlers) => {
    H = handlers;
    const on = (id, fn, quiet) => $(id).addEventListener("click", () => { if (!quiet) A.play("click"); fn(); });
    $("pass").addEventListener("submit", (e) => {
      e.preventDefault();
      const char = (document.querySelector('input[name="char"]:checked') || {}).value || "flag";
      H.start($("player-name").value.trim().replace(/\s+/g, " "), char);
    });
    on("btn-title-help", UI.openHelp);
    on("btn-map-help", UI.openHelp);
    on("btn-help", UI.openHelp);
    on("btn-help-x", UI.closeHelp);
    on("btn-help-ok", UI.closeHelp);
    on("btn-sound", () => H.toggleSound(), true);
    on("btn-exit", UI.openConfirm);
    on("btn-stay", UI.closeConfirm);
    on("btn-leave", () => { UI.closeConfirm(); H.exitToMap(); });
    on("btn-go", () => H.begin());
    on("btn-brief-back", () => H.exitToMap());
    on("btn-quiz-retry", retryQuiz);
    on("btn-quiz-next", closeQuiz);
    on("btn-mini-done", () => { if (mini && mini.done) { const cb = mini.cb; mini = null; cb.onDone(); } });
    on("btn-next", () => H.next());
    on("btn-replay", () => H.replay());
    on("btn-result-map", () => H.exitToMap());
    on("btn-cert", () => H.certificate());
    on("btn-switch", () => H.switchPlayer());
    on("btn-unlock", () => H.toggleUnlock());
    on("btn-cert-save", saveCertificate);
    on("btn-victory-map", () => H.exitToMap());
    on("btn-victory-new", () => H.switchPlayer());
    on("compass", () => H.announceDirection());
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", () => { held.clear(); });
    bindStick();
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) UI.enableTouch();
    window.addEventListener("touchstart", UI.enableTouch, { once: true, passive: true });
  };

  /* test ve klavye dışı kullanım için */
  UI._answer = answer;
  UI._state = () => ({ quiz, mini });

  KBK.ui = UI;
}());
