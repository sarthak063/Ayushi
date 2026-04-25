// ─── State ──────────────────────────────────────
let chosenName = 'Ayushi';
let chosenSongFile = '';
let chosenImageNum = 1;
let srcImage = null;
let animRunning = false;
const audioEl = new Audio();
audioEl.loop = true;
audioEl.onerror = () => {}; // silent fail if no audio file yet

// ─── Theme Toggle ───────────────────────────────
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
// Restore saved theme
(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('theme-toggle').textContent = '☀️';
  }
})();

// ─── Starfield → cute sparkles ──────────────────
(() => {
  const c = document.getElementById('stars');
  const colors = ['#f9a8d4','#c084fc','#fbbf24','#f472b6','#a78bfa','#fcd34d','#e879f9'];
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('span');
    const sz = Math.random() * 3 + 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--dur:${(Math.random()*3+1.5).toFixed(2)}s;animation-delay:${(Math.random()*3).toFixed(2)}s;background:${color}`;
    c.appendChild(s);
  }
})();

// ─── Screen Navigation ─────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ─── Name Selection ─────────────────────────────
function chooseName(name) {
  chosenName = name;
  showScreen('screen-song');
}
function showThakurDialog() {
  document.getElementById('dialog-thakur').classList.add('active');
}

// ─── Song Selection ─────────────────────────────
function chooseSong(file) {
  chosenSongFile = file;
  showScreen('screen-photo');
}

// ─── Photo Selection ────────────────────────────
function choosePhoto(num) {
  chosenImageNum = num;
  showScreen('screen-player');
  preparePlayer();
}

// ─── Go Home (reset) ───────────────────────────
function goHome() {
  audioEl.pause();
  audioEl.currentTime = 0;
  animRunning = false;
  stopLyrics();
  // Reset player UI
  document.getElementById('loading-area').classList.remove('hidden');
  document.getElementById('play-btn').classList.add('hidden');
  document.getElementById('play-sub').classList.add('hidden');
  document.getElementById('stage').classList.remove('visible');
  document.getElementById('birthday-section').classList.remove('visible');
  document.getElementById('bottom-actions').classList.remove('visible');
  document.getElementById('progress-bar-container').classList.remove('visible');
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('lyrics-display').classList.add('hidden');
  // Remove leftover pencil cursors
  document.querySelectorAll('.pencil-cursor').forEach(p => p.remove());
  showScreen('screen-name');
}

// ─── Load Image Data Script Dynamically ─────────
const loadedScripts = {};
function ensureImageScript(num) {
  if (loadedScripts[num]) return Promise.resolve();
  const fname = num === 1 ? 'image_data.js' : `image_data_${num}.js`;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = fname;
    s.onload = () => { loadedScripts[num] = true; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function getImageB64(num) {
  switch (num) {
    case 1: return typeof IMAGE_B64 !== 'undefined' ? IMAGE_B64 : '';
    case 2: return typeof IMAGE_B64_2 !== 'undefined' ? IMAGE_B64_2 : '';
    case 3: return typeof IMAGE_B64_3 !== 'undefined' ? IMAGE_B64_3 : '';
    default: return '';
  }
}

function decodeImage(b64) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = e => { console.error('decode fail', e); reject(e); };
    img.src = 'data:image/png;base64,' + b64;
  });
}

// ─── Prepare Player ─────────────────────────────
async function preparePlayer() {
  const loadArea = document.getElementById('loading-area');
  const btn = document.getElementById('play-btn');
  const sub = document.getElementById('play-sub');
  loadArea.classList.remove('hidden');
  document.querySelector('.loader-text').textContent = 'Preparing something special…';
  btn.classList.add('hidden');
  sub.classList.add('hidden');

  try {
    const b64 = getImageB64(chosenImageNum);
    if (!b64) throw new Error('Image not available yet');
    srcImage = await decodeImage(b64);
    // Update name
    document.getElementById('bday-name-el').textContent = chosenName;
    // Ready
    loadArea.classList.add('hidden');
    btn.classList.remove('hidden');
    sub.classList.remove('hidden');
    btn.onclick = startAnimation;
  } catch (e) {
    document.querySelector('.loader-text').textContent = 'Image not available yet 😢';
    console.error(e);
  }
}

// ─── Lyrics (timestamp-synced) ──────────────────
const songLyrics = {
  'song1.mp3': {
    cycle: 25,
    lines: [
      { text: 'Kuch ne kaha yeh chaand hai', start: 0, end: 3 },
      { text: 'Kuch ne kaha chehra tera', start: 4, end: 7 },
      { text: 'Kal chaudvin ki raat thi', start: 8, end: 11 },
      { text: 'Hum bhi vahin maujood the', start: 16, end: 19 },
    ]
  },
  'song2.mp3': {
    cycle: 33,
    lines: [
      { text: 'Har shaks tera naam le', start: 0, end: 3 },
      { text: 'Har shaks tera naam le', start: 4, end: 7 },
      { text: 'Har shaks deewana tera', start: 8, end: 11 },
      { text: 'Kal chaudvin ki raat thi', start: 12, end: 15 },
      { text: 'Kal chaudvin ki raat thi', start: 16, end: 19 },
      { text: 'Shab bhar raha charcha tera', start: 20, end: 23 },
      { text: 'Kal chaudvin ki raat thi', start: 24, end: 27 },
    ]
  },
  'song3.mp3': {
    cycle: 47,
    lines: [
      { text: 'Dil karay dildaariyan', start: 0, end: 3 },
      { text: 'Bina gallan saareyaan naa larrda', start: 5, end: 9 },
      { text: 'Jidaan rang milde ne odha he aapan mil jaana', start: 10, end: 13 },
      { text: 'Jidaan phull khilde ne odha he donaa khill jaana', start: 14, end: 18 },
      { text: 'Jidaan rang milde ne odha he aapan mil jaana', start: 19, end: 23 },
      { text: 'Jidaan phull khilde ne odha he donaa khill jaana', start: 24, end: 28 },
      { text: 'Tera mera afsana', start: 30, end: 31 },
      { text: 'Pal-pal jeena muhaal', start: 31, end: 34 },
      { text: 'Poora hoya naa jaana', start: 34, end: 36 },
      { text: 'Saaray nashay bekaar', start: 36, end: 38 },
      { text: 'Hovaan band kamray vich kalla', start: 38, end: 40 },
      { text: 'Ghar nahi jaata, mein bahar', start: 40, end: 41 },
    ]
  },
  'song4.mp3': {
    cycle: 35,
    lines: [
      { text: 'Teri Saadgi Da Vi Koi Tod Nai', start: 0, end: 3 },
      { text: 'Par Teri <span class="lyric-hl">Akh</span> Sanu Chor Lagdi', start: 3, end: 5 },
      { text: 'Yaadan Yu Aunda Gal Door Di', start: 5, end: 9 },
      { text: 'Ajj Kal Sanu Teri Tod Lagdi', start: 9, end: 11 },
      { text: 'O Yaadan Yu Aunda Gal Hor Hundi', start: 11, end: 14 },
      { text: 'Ajj Kal Sanu Teri Tod Lagdi', start: 14, end: 18 },
      { text: 'Mera Dil Vi Na Lagge Kite', start: 20, end: 21 },
      { text: 'Akh Vi Na Lagge', start: 21, end: 22 },
      { text: 'Mainu Chakk Lave Rabb Tere', start: 22, end: 24 },
      { text: 'Satt Vi Na Lagge', start: 24, end: 26 },
      { text: 'Gal Sachi Vaise Gussa Na Karje Kitte', start: 26, end: 29 },
    ]
  },
};

let lyricsRAF = null;
let currentLyricIdx = -1;

function startLyrics() {
  const el = document.getElementById('lyrics-display');
  const data = songLyrics[chosenSongFile];
  if (!data || !data.lines.length) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  currentLyricIdx = -1;

  function tick() {
    const t = audioEl.currentTime % data.cycle;
    let foundIdx = -1;
    for (let i = 0; i < data.lines.length; i++) {
      if (t >= data.lines[i].start && t < data.lines[i].end) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== currentLyricIdx) {
      if (foundIdx === -1) {
        el.classList.remove('show');
      } else {
        el.classList.remove('show');
        setTimeout(() => {
          el.innerHTML = data.lines[foundIdx].text;
          el.classList.add('show');
        }, 250);
      }
      currentLyricIdx = foundIdx;
    }
    lyricsRAF = requestAnimationFrame(tick);
  }
  tick();
}

function stopLyrics() {
  if (lyricsRAF) { cancelAnimationFrame(lyricsRAF); lyricsRAF = null; }
  currentLyricIdx = -1;
  const el = document.getElementById('lyrics-display');
  el.classList.remove('show');
  setTimeout(() => el.classList.add('hidden'), 400);
}

// ─── Animation ──────────────────────────────────
const TOTAL_DURATION = 14000;
const SKETCH_PHASE = 0.55;
const COLOR_PHASE = 0.40;
const BIRTHDAY_DELAY = 500;

function startAnimation() {
  document.getElementById('play-btn').classList.add('hidden');
  document.getElementById('play-sub').classList.add('hidden');
  // Play audio
  if (chosenSongFile) {
    audioEl.src = chosenSongFile;
    audioEl.play().catch(() => {});
  }
  // Start lyrics
  startLyrics();
  runAnimation();
}

function grayscalePixels(imageData) {
  const d = imageData.data;
  const w = imageData.width, h = imageData.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = Math.min(255, (0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2]) * 1.05 + 15);
      d[i] = d[i+1] = d[i+2] = v;
    }
  }
}

function runAnimation() {
  if (animRunning) return;
  animRunning = true;
  const img = srcImage;
  const canvasEl = document.getElementById('art-canvas');
  const ctx = canvasEl.getContext('2d');
  const stageEl = document.getElementById('stage');

  const maxW = window.innerWidth * 0.93, maxH = window.innerHeight * 0.75;
  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  const W = Math.round(img.width * scale), H = Math.round(img.height * scale);
  canvasEl.width = W; canvasEl.height = H;

  ctx.drawImage(img, 0, 0, W, H);
  const colorPixels = ctx.getImageData(0, 0, W, H);
  const grayPixels = ctx.getImageData(0, 0, W, H);
  grayscalePixels(grayPixels);

  ctx.fillStyle = document.body.classList.contains('dark') ? '#0a0a12' : '#fdf2f8';
  ctx.fillRect(0, 0, W, H);
  stageEl.classList.add('visible');

  const pencil = document.createElement('div');
  pencil.className = 'pencil-cursor';
  pencil.textContent = '✏️';
  stageEl.appendChild(pencil);

  const progC = document.getElementById('progress-bar-container');
  const progB = document.getElementById('progress-bar');
  progC.classList.add('visible');

  const sketchEnd = TOTAL_DURATION * SKETCH_PHASE;
  const colorEnd = TOTAL_DURATION * (SKETCH_PHASE + COLOR_PHASE);
  let start = null;

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    progB.style.width = (Math.min(elapsed / TOTAL_DURATION, 1) * 100) + '%';

    if (elapsed <= sketchEnd) {
      const t = elapsed / sketchEnd;
      const revealRow = Math.floor(t * H);
      const out = ctx.getImageData(0, 0, W, H);
      const prev = Math.max(0, Math.floor(((elapsed - 16) < 0 ? 0 : (elapsed - 16)) / sketchEnd * H));
      for (let y = prev; y < revealRow; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          out.data[i] = grayPixels.data[i];
          out.data[i+1] = grayPixels.data[i+1];
          out.data[i+2] = grayPixels.data[i+2];
          out.data[i+3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      pencil.style.top = (revealRow / H * canvasEl.offsetHeight) + 'px';
      pencil.style.left = ((Math.sin(elapsed/120)*0.3+0.5) * canvasEl.offsetWidth) + 'px';
    } else if (elapsed <= colorEnd) {
      const t = (elapsed - sketchEnd) / (colorEnd - sketchEnd);
      const colorRow = Math.floor(H - t * H);
      const out = ctx.getImageData(0, 0, W, H);
      for (let y = colorRow; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          out.data[i] = colorPixels.data[i];
          out.data[i+1] = colorPixels.data[i+1];
          out.data[i+2] = colorPixels.data[i+2];
          out.data[i+3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      pencil.textContent = '🖌️';
      pencil.style.top = (colorRow / H * canvasEl.offsetHeight) + 'px';
      pencil.style.left = ((Math.sin(elapsed/100)*0.3+0.5) * canvasEl.offsetWidth) + 'px';
    } else {
      ctx.putImageData(colorPixels, 0, 0);
      pencil.remove();
      progC.classList.remove('visible');
      showBirthday();
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ─── Birthday + Confetti ────────────────────────
function showBirthday() {
  setTimeout(() => {
    const sec = document.getElementById('birthday-section');
    sec.classList.add('visible');
    setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
    spawnConfetti();
    setTimeout(() => document.getElementById('bottom-actions').classList.add('visible'), 1500);
  }, BIRTHDAY_DELAY);
}

function spawnConfetti() {
  const colors = ['#f472b6','#a855f7','#6366f1','#38bdf8','#facc15','#fb923c','#4ade80'];
  for (let i = 0; i < 100; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random()*100 + 'vw';
    el.style.top = '-4vh';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.setProperty('--fall-dur', (Math.random()*3+2.5).toFixed(2)+'s');
    el.style.setProperty('--rot', (Math.random()*1080-540)+'deg');
    el.style.animationDelay = (Math.random()*2).toFixed(2)+'s';
    el.style.width = (Math.random()*8+6)+'px';
    el.style.height = (Math.random()*10+8)+'px';
    el.style.borderRadius = Math.random()>.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 7000);
  }
}
