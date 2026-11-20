const POOL = window.QUESTIONS;
const ROUNDS = 8;
const IDLE_MS = 90000;

const $ = (id) => document.getElementById(id);
const screens = { start: $("startScreen"), quiz: $("quizScreen"), end: $("endScreen") };
const slider = $("slider");

let deck = [], idx = 0, totalStars = 0, touched = false, revealed = false, soundOn = true;

// Feste Bühne aufs Display skalieren (siehe css/style.css): passt immer, nie scrollen
const STAGE = { landscape: { w: 1000, h: 625 }, portrait: { w: 680, h: 1000 } };
const app = document.querySelector(".app");
function fit() {
  const vw = window.visualViewport ? visualViewport.width : innerWidth;
  const vh = window.visualViewport ? visualViewport.height : innerHeight;
  const portrait = vh > vw * 1.15;
  document.documentElement.classList.toggle("portrait", portrait);
  const st = portrait ? STAGE.portrait : STAGE.landscape;
  const s = Math.min(vw / st.w, vh / st.h);
  app.style.transform = `translate(${(vw - st.w * s) / 2}px, ${(vh - st.h * s) / 2}px) scale(${s})`;
}
fit();
addEventListener("resize", fit);
addEventListener("orientationchange", () => setTimeout(fit, 200));
window.visualViewport?.addEventListener("resize", fit);

function fmt(v, q) {
  if (q.unit === "year") return String(Math.round(v));
  const decimals = q.step < 1 ? (q.unit === "€" ? 2 : 1) : 0;
  const s = v.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return q.unit === "€" ? s + " €" : s + " " + q.unit;
}

function show(name) {
  for (const k in screens) screens[k].hidden = k !== name;
  $("homeBtn").hidden = name === "start";
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function startGame() {
  deck = shuffle(POOL.slice()).slice(0, ROUNDS);
  idx = 0; totalStars = 0;
  show("quiz");
  loadQuestion();
  try { navigator.wakeLock?.request("screen").catch(() => {}); } catch (e) {}
}

function loadQuestion() {
  const q = deck[idx];
  touched = false; revealed = false;
  $("qEmoji").textContent = q.emoji;
  $("qText").textContent = q.q;
  slider.min = q.min; slider.max = q.max; slider.step = q.step;
  slider.value = q.min;
  slider.disabled = false;
  $("minLabel").textContent = fmt(q.min, q);
  $("maxLabel").textContent = fmt(q.max, q);
  $("value").textContent = "?";
  $("value").classList.add("untouched");
  $("hint").textContent = "Schieb die Münze hin und her!";
  $("guessBtn").disabled = true;
  $("guessActions").hidden = false;
  $("reveal").classList.remove("show");
  $("answerPin").style.display = "none";
  $("jarMark").style.display = "none";
  $("minusBtn").disabled = $("plusBtn").disabled = false;
  $("progress").innerHTML = deck.map((_, i) => `<i class="${i < idx ? "done" : i === idx ? "now" : ""}"></i>`).join("");
  paint();
}

function frac(v, q) { return (v - q.min) / (q.max - q.min); }

function paint() {
  const q = deck[idx];
  const f = frac(+slider.value, q);
  slider.style.setProperty("--pct", (f * 100) + "%");
  $("jarFill").style.height = (f * 100) + "%";
  if (touched) {
    $("value").textContent = fmt(+slider.value, q);
    $("value").classList.remove("untouched");
  }
}

function onMove() {
  if (revealed) return;
  if (!touched) { touched = true; $("guessBtn").disabled = false; $("hint").textContent = "Passt? Dann tipp auf Fertig!"; }
  tick();
  paint();
  bumpIdle();
}

function nudge(dir) {
  if (revealed) return;
  const q = deck[idx];
  const v = Math.min(q.max, Math.max(q.min, +slider.value + dir * q.step));
  slider.value = Math.round(v / q.step) * q.step;
  onMove();
}

function scoreFor(guess, q) {
  const err = Math.abs(guess - q.answer) / (q.max - q.min);
  if (err <= 0.03) return 3;
  if (err <= 0.08) return 2;
  if (err <= 0.18) return 1;
  return 0;
}

const STAR = (on) => `<svg viewBox="0 0 24 24" class="${on ? "on" : ""}" aria-hidden="true"><path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3 6.2 20.4l1.2-6.5L2.6 9.4l6.5-.8z" fill="${on ? "#FFD23F" : "#DDEBFF"}" stroke="#1D2B5C" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

function reveal() {
  if (!touched || revealed) return;
  revealed = true;
  const q = deck[idx];
  const guess = +slider.value;
  const s = scoreFor(guess, q);
  totalStars += s;

  slider.disabled = true;
  $("minusBtn").disabled = $("plusBtn").disabled = true;
  $("guessActions").hidden = true;
  $("hint").textContent = "";

  // Pin the right answer on the track and the jar
  const f = frac(q.answer, q);
  const pin = $("answerPin");
  pin.style.left = `calc(30px + (100% - 60px) * ${f})`;
  pin.style.display = "block";
  $("pinLabel").textContent = "Richtig: " + fmt(q.answer, q);
  const mark = $("jarMark");
  mark.style.bottom = (f * 100) + "%";
  mark.style.display = "block";

  $("stars").innerHTML = [0, 1, 2].map((i) => STAR(i < s)).join("");
  const dir = guess > q.answer ? "Du hast etwas zu viel geschätzt." : guess < q.answer ? "Du hast etwas zu wenig geschätzt." : "";
  $("verdict").textContent = ["Knapp daneben ist auch vorbei!", "Nicht schlecht!", "Super, ganz nah dran!", "Wow, fast genau!"][s];
  $("truth").innerHTML = `Richtig ist ungefähr <b>${fmt(q.answer, q)}</b>. ${s === 3 ? "" : dir}`;
  $("fact").textContent = q.fact;
  $("nextBtn").textContent = idx === deck.length - 1 ? "Ergebnis anzeigen" : "Weiter";
  $("reveal").classList.add("show");

  chime(s);
  if (s === 3) confetti(90);
}

function next() {
  idx++;
  if (idx < deck.length) { loadQuestion(); return; }
  const max = deck.length * 3;
  const pct = totalStars / max;
  $("endStars").textContent = totalStars;
  $("endMax").textContent = max;
  const n = pct >= 0.75 ? 3 : pct >= 0.45 ? 2 : pct > 0.15 ? 1 : 0;
  $("endStarsRow").innerHTML = [0, 1, 2].map((i) => STAR(i < n)).join("");
  $("endTitle").textContent = ["Gut gemacht, du hast viel gelernt!", "Prima geschätzt!", "Toll, du kennst dich schon richtig gut aus!", "Du bist ein echter Geld-Profi!"][n];
  $("endText").textContent = "Komm beim Finance Club vorbei und erfahre noch mehr über Geld, Sparen und Wirtschaft.";
  show("end");
  chime(3);
  confetti(160);
}

// Sound (starts only after a tap)
let ctx;
function tone(freq, t0, dur, vol = 0.08) {
  if (!soundOn) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur);
  } catch (e) {}
}
let lastTick = 0;
function tick() { const now = performance.now(); if (now - lastTick > 70) { lastTick = now; tone(900 + Math.random() * 200, 0, 0.04, 0.03); } }
function chime(s) {
  if (s === 0) { tone(330, 0, .25); tone(262, .2, .35); return; }
  [523, 659, 784, 1047].slice(0, s + 1).forEach((f, i) => tone(f, i * 0.12, 0.3));
}

// Confetti in coin colors
const cv = $("confetti"), cx = cv.getContext("2d");
let parts = [], raf = 0;
function confetti(n) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  cv.width = innerWidth; cv.height = innerHeight;
  const cols = ["#FFD23F", "#F2A900", "#FF5D5D", "#22B07D", "#1D2B5C"];
  for (let i = 0; i < n; i++) parts.push({
    x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .45,
    vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 6,
    r: 6 + Math.random() * 8, c: cols[i % cols.length], a: Math.random() * 6, life: 0,
  });
  if (!raf) raf = requestAnimationFrame(step);
}
function step() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter((p) => p.y < cv.height + 40 && p.life < 240);
  for (const p of parts) {
    p.life++; p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += 0.15;
    cx.fillStyle = p.c;
    cx.beginPath(); cx.ellipse(p.x, p.y, p.r, p.r * Math.abs(Math.cos(p.a)) + 1, 0, 0, Math.PI * 2); cx.fill();
  }
  raf = parts.length ? requestAnimationFrame(step) : 0;
  if (!raf) cx.clearRect(0, 0, cv.width, cv.height);
}

// Back to the start screen when nobody plays for a while (next kid)
let idleTimer;
function bumpIdle() {
  clearTimeout(idleTimer);
  const wait = screens.end.hidden ? IDLE_MS : 25000;
  idleTimer = setTimeout(() => { if (screens.start.hidden) show("start"); }, wait);
}

$("startBtn").addEventListener("click", () => { tone(660, 0, .15); startGame(); bumpIdle(); });
$("againBtn").addEventListener("click", () => { startGame(); bumpIdle(); });
$("homeBtn").addEventListener("click", () => { show("start"); clearTimeout(idleTimer); });
$("guessBtn").addEventListener("click", () => { reveal(); bumpIdle(); });
$("nextBtn").addEventListener("click", () => { next(); bumpIdle(); });
$("minusBtn").addEventListener("click", () => nudge(-1));
$("plusBtn").addEventListener("click", () => nudge(1));
slider.addEventListener("input", onMove);
$("soundBtn").addEventListener("click", (e) => {
  soundOn = !soundOn;
  e.currentTarget.textContent = soundOn ? "Ton an" : "Ton aus";
  e.currentTarget.setAttribute("aria-pressed", soundOn);
});
document.addEventListener("pointerdown", bumpIdle, { passive: true });
document.addEventListener("dblclick", (e) => e.preventDefault());

// Offline-Support: funktioniert nur über http(s), nicht beim Öffnen per Doppelklick (file://)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
