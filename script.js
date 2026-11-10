(() => {
  const BANK = {
    easy: "the and you for are not but all can had her was one our out day get has him his how man new now old see two way who boy did its let put say she too use sun run fast key code link grid byte data wire chip node neon beam core zone loop port".split(
      " ",
    ),
    normal:
      "network signal system pattern digital engine quantum vector circuit machine program sensor memory kernel buffer packet matrix cipher binary shadow plasma reactor module syntax thread stream cursor laser orbit hacker neural static drive pixel render server window sector input output".split(
        " ",
      ),
    hard: "synchronization cybernetic holographic encryption algorithmic neuromancer architecture infrastructure transistor electromagnetic bandwidth asynchronous decentralized recursion amplitude fingerprint biometric simulation interface overclocked mainframe protocol quantization semiconductor virtualization firmware polymorphic latency artificial gigahertz blockchain".split(
      " ",
    ),
  };
  // Color themes: [color 1, color 2, color 3] as hex. Add your own here.
  const THEMES = {
    cyber: ["#22d3ee", "#a855f7", "#ec4899"],
    sunset: ["#fb923c", "#f43f5e", "#facc15"],
    matrix: ["#34d399", "#84cc16", "#2dd4bf"],
    candy: ["#f472b6", "#c084fc", "#7dd3fc"],
  };
  const MIN_T = 5,
    MAX_T = 600;

  const $ = (id) => document.getElementById(id);
  const inp = $("inp"),
    wordsEl = $("words"),
    card = $("card"),
    customTime = $("customTime");
  let dur = 60,
    diff = "normal",
    text = "",
    spans = [],
    typed = "",
    started = false,
    done = false,
    t0 = 0,
    timer = null,
    total = 0,
    good = 0,
    colors = THEMES.cyber;

  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const fmt = (s) =>
    s >= 60
      ? Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0")
      : String(s);

  /* ---------- theme ---------- */
  const rgb = (h) =>
    [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)).join(" ");
  const pickers = [$("p1"), $("p2"), $("p3")];
  function setTheme(cols) {
    colors = cols;
    cols.forEach((h, i) => {
      document.documentElement.style.setProperty("--c" + (i + 1), rgb(h));
      pickers[i].value = h;
    });
    document
      .querySelectorAll(".sw")
      .forEach((b) =>
        b.classList.toggle("on", THEMES[b.dataset.t].join() === cols.join()),
      );
    try {
      localStorage.setItem("synapse-theme", JSON.stringify(cols));
    } catch (e) {}
  }
  Object.entries(THEMES).forEach(([name, c]) => {
    const b = document.createElement("button");
    b.className = "sw";
    b.dataset.t = name;
    b.title = name;
    b.setAttribute("aria-label", name + " theme");
    b.style.background = `linear-gradient(135deg,${c[0]},${c[1]},${c[2]})`;
    b.onclick = () => setTheme(c);
    $("swatches").appendChild(b);
  });
  pickers.forEach((p) =>
    p.addEventListener("input", () => setTheme(pickers.map((x) => x.value))),
  );

  /* ---------- text ---------- */
  function addWords(n) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const w = rand(BANK[diff]),
        wEl = document.createElement("span");
      wEl.className = "word";
      [...w, " "].forEach((c, k, arr) => {
        const s = document.createElement("span");
        s.className = "ch" + (k === arr.length - 1 ? " sp" : "");
        s.textContent = c;
        wEl.appendChild(s);
        spans.push(s);
      });
      frag.appendChild(wEl);
      text += w + " ";
    }
    wordsEl.appendChild(frag);
  }
  function paint() {
    const n = typed.length;
    for (let i = 0; i < spans.length; i++) {
      const st = i < n ? (typed[i] === text[i] ? "ok" : "bad") : "";
      const c =
        "ch" +
        (spans[i].classList.contains("sp") ? " sp" : "") +
        (st ? " " + st : "") +
        (i === n ? " cur" : "");
      if (spans[i].className !== c) spans[i].className = c;
    }
    const cur = spans[n];
    if (cur) {
      const lh = parseFloat(getComputedStyle(wordsEl).lineHeight);
      const line = Math.round(cur.offsetTop / lh);
      wordsEl.style.transform = `translateY(${-Math.max(0, line - 1) * lh}px)`;
    }
  }

  /* ---------- game ---------- */
  function stats() {
    const el = started ? Math.max((performance.now() - t0) / 1000, 1) : 1;
    let ok = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) ok++;
    return {
      wpm: started ? Math.round(ok / 5 / (el / 60)) : 0,
      acc: total ? Math.round((good / total) * 100) : 100,
      ok,
    };
  }
  function tick() {
    const left = Math.max(0, dur - (performance.now() - t0) / 1000);
    $("time").textContent = fmt(Math.ceil(left));
    $("ring").style.strokeDashoffset = 276.5 * (1 - left / dur);
    const s = stats();
    $("wpm").textContent = s.wpm;
    $("acc").textContent = s.acc;
    if (left <= 0) finish();
  }
  function onInput() {
    if (done) return;
    if (!started) {
      started = true;
      t0 = performance.now();
      timer = setInterval(tick, 100);
      $("hint").style.opacity = 0;
    }
    const v = inp.value;
    while (text.length - v.length < 80) addWords(15);
    for (let i = typed.length; i < v.length; i++) {
      total++;
      if (v[i] === text[i]) good++;
    }
    typed = v;
    paint();
    tick();
  }
  function finish() {
    done = true;
    clearInterval(timer);
    inp.blur();
    const s = stats(),
      tw = typed.split(" "),
      xw = text.split(" ");
    let cw = 0;
    tw.forEach((w, i) => {
      if (w && w === xw[i]) cw++;
    });
    const wpm = Math.round(s.ok / 5 / (dur / 60));
    let best = 0;
    try {
      best = +localStorage.getItem("synapse-best") || 0;
    } catch (e) {}
    const isBest = wpm > best && wpm > 0;
    if (isBest) {
      best = wpm;
      try {
        localStorage.setItem("synapse-best", wpm);
      } catch (e) {}
    }
    $("best").textContent = best;
    $("mWpm").textContent = wpm;
    $("mAcc").textContent = s.acc + "%";
    $("mWords").textContent = cw;
    $("mTitle").textContent =
      wpm >= 90
        ? "Ghost in the wire"
        : wpm >= 60
          ? "Netrunner"
          : wpm >= 35
            ? "Console cowboy"
            : "Fresh recruit";
    $("mBest").textContent = isBest
      ? "New personal best!"
      : "Personal best: " + best + " WPM";
    $("modal").classList.add("show");
    confetti();
    setTimeout(() => $("again").focus(), 50);
  }
  function confetti() {
    const cols = [...colors, "#4ade80", "#facc15"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("i");
      c.className = "conf";
      const col = rand(cols);
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = col;
      c.style.boxShadow = "0 0 10px " + col;
      c.style.setProperty("--dx", Math.random() * 200 - 100 + "px");
      c.style.setProperty("--r", Math.random() * 900 - 450 + "deg");
      c.style.setProperty("--t", 2.2 + Math.random() * 2 + "s");
      c.style.setProperty("--d", Math.random() * 0.6 + "s");
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5000);
    }
  }
  function reset() {
    clearInterval(timer);
    started = done = false;
    typed = text = "";
    total = good = 0;
    spans = [];
    wordsEl.innerHTML = "";
    wordsEl.style.transform = "";
    inp.value = "";
    $("modal").classList.remove("show");
    $("hint").style.opacity = 1;
    $("time").textContent = fmt(dur);
    $("ring").style.strokeDashoffset = 0;
    $("wpm").textContent = 0;
    $("acc").textContent = 100;
    addWords(45);
    paint();
    inp.focus();
  }

  /* ---------- time selection ---------- */
  function setDuration(v) {
    dur = Math.min(MAX_T, Math.max(MIN_T, Math.round(+v) || 60));
    customTime.value = dur;
    $("timeOpts")
      .querySelectorAll(".btn")
      .forEach((b) => b.classList.toggle("on", +b.dataset.v === dur));
    reset();
  }
  $("timeOpts").addEventListener("click", (e) => {
    const b = e.target.closest(".btn");
    if (b) setDuration(b.dataset.v);
  });
  customTime.addEventListener("change", () => setDuration(customTime.value));
  customTime.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      setDuration(customTime.value);
    }
    e.stopPropagation();
  });

  $("diffOpts").addEventListener("click", (e) => {
    const b = e.target.closest(".btn");
    if (!b) return;
    $("diffOpts")
      .querySelectorAll(".btn")
      .forEach((x) => x.classList.toggle("on", x === b));
    diff = b.dataset.v;
    reset();
  });

  /* ---------- events ---------- */
  inp.addEventListener("input", onInput);
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    if (e.key === "Tab" && (t === inp || t === document.body)) {
      e.preventDefault();
      reset();
    } else if (e.key === "Escape" && done) reset();
    else if (!done && !e.ctrlKey && !e.metaKey && !t.closest(".btn,input"))
      inp.focus();
  });
  document.addEventListener("click", (e) => {
    if (!done && !e.target.closest(".btn,input,label")) inp.focus();
  });
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".btn");
    if (!b) return;
    const r = b.getBoundingClientRect(),
      s = document.createElement("span");
    s.className = "rip";
    s.style.left = e.clientX - r.left + "px";
    s.style.top = e.clientY - r.top + "px";
    b.appendChild(s);
    setTimeout(() => s.remove(), 650);
  });
  $("restart").addEventListener("click", reset);
  $("again").addEventListener("click", reset);

  // 3D tilt
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
  });
  card.addEventListener("mouseleave", () => (card.style.transform = ""));

  /* ---------- init ---------- */
  try {
    $("best").textContent = +localStorage.getItem("synapse-best") || 0;
  } catch (e) {}
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem("synapse-theme"));
  } catch (e) {}
  setTheme(Array.isArray(saved) && saved.length === 3 ? saved : THEMES.cyber);
  reset();
})();
