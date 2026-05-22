/* ============================================================
   HERBAL KINGDOM BOLIVIA — Premium Match-3 Game Engine
   Version: 2.0 | Studio: HK Games Studio
   ============================================================ */

'use strict';

// ============================================================
// CONSTANTS & CONFIG
// ============================================================
const GRID_SIZE = 7;
const TILE_TYPES = [
  { id: 0, img: 'aloe_concentrate',  name: 'Aloe',       color: '#4CAF50', glow: 'rgba(76,175,80,0.7)'   },
  { id: 1, img: 'shake_f1',          name: 'Batido F1',  color: '#8D6E63', glow: 'rgba(141,110,99,0.7)'  },
  { id: 2, img: 'tea_concentrate',   name: 'Té',         color: '#FF8F00', glow: 'rgba(255,143,0,0.7)'   },
  { id: 3, img: 'protein_drink',     name: 'Proteína',   color: '#7B1FA2', glow: 'rgba(123,31,162,0.7)'  },
  { id: 4, img: 'liftoff',           name: 'Liftoff',    color: '#D32F2F', glow: 'rgba(211,47,47,0.7)'   },
  { id: 5, img: 'cr7_drive',         name: 'CR7 Drive',  color: '#1565C0', glow: 'rgba(21,101,192,0.7)'  },
  { id: 6, img: 'protein_bar',       name: 'Prot. Bar',  color: '#5D4037', glow: 'rgba(93,64,55,0.7)'    },
];

const REWARDS = [
  '🥤 Batido Gratis',
  '🎫 Cupón Wellness',
  '⭐ Cliente Estrella',
  '💚 Descuento Especial',
  '🏆 Shake Premium',
  '🌿 Aloe Mango Gratis',
  '💪 Proteína Gratis',
];

const LEVELS = [
  { num:1,  moves:20, target:[{id:0,count:10}], star1:500,  star2:1000, star3:1500, desc:'Recolecta 10 Aloe' },
  { num:2,  moves:22, target:[{id:1,count:15}], star1:600,  star2:1200, star3:1800, desc:'Recolecta 15 Batidos' },
  { num:3,  moves:25, target:[{id:2,count:12},{id:3,count:8}], star1:800, star2:1600, star3:2400, desc:'Té y Proteína' },
  { num:4,  moves:20, target:[{id:5,count:10}], star1:700,  star2:1400, star3:2100, desc:'¡Desbloquea CR7!' },
  { num:5,  moves:18, target:[{id:0,count:8},{id:1,count:8},{id:2,count:8}], star1:1000, star2:2000, star3:3000, desc:'Mezcla de Bienestar' },
  { num:6,  moves:24, target:[{id:4,count:15},{id:3,count:12}], star1:900,  star2:1800, star3:2700, desc:'Vitaminas y Proteínas' },
  { num:7,  moves:22, target:[{id:6,count:15}], star1:800, star2:1600, star3:2400, desc:'Corazón Wellness' },
  { num:8,  moves:20, target:[{id:0,count:10},{id:5,count:10}], star1:1200, star2:2400, star3:3600, desc:'Aloe & CR7' },
  { num:9,  moves:18, target:[{id:1,count:20}], star1:1000, star2:2000, star3:3000, desc:'Batidos Premium' },
  { num:10, moves:15, target:[{id:0,count:8},{id:1,count:8},{id:2,count:8},{id:3,count:8}], star1:1500, star2:3000, star3:4500, desc:'¡Desafío Supremo!' },
  { num:11, moves:22, target:[{id:4,count:18}], star1:1100, star2:2200, star3:3300, desc:'Festival de Vitaminas' },
  { num:12, moves:20, target:[{id:0,count:12},{id:6,count:12}], star1:1300, star2:2600, star3:3900, desc:'Aloe & Wellness' },
  { num:13, moves:17, target:[{id:2,count:15},{id:5,count:10}], star1:1400, star2:2800, star3:4200, desc:'Té & CR7 Challenge' },
  { num:14, moves:25, target:[{id:3,count:20},{id:4,count:15}], star1:1600, star2:3200, star3:4800, desc:'Proteína Máxima' },
  { num:15, moves:14, target:[{id:0,count:10},{id:1,count:10},{id:2,count:10},{id:3,count:10},{id:4,count:10}], star1:2000, star2:4000, star3:6000, desc:'¡MAESTRO DEL BIENESTAR!' },
];

// ============================================================
// GAME STATE
// ============================================================
let state = {
  screen: 'splash',
  coins: 0,
  energy: 5,
  maxEnergy: 5,
  musicOn: true,
  soundOn: true,
  playerName: 'Wellness Star',
  playerLevel: 1,
  levelsData: [],  // { stars, bestScore }
  unlockedLevel: 1,
  currentLevel: 1,
  totalScore: 0,
  // in-game
  board: [],
  score: 0,
  movesLeft: 25,
  objectives: [],
  progress: {},
  selectedTile: null,
  isAnimating: false,
  comboCount: 0,
  activeBooster: null,
  boosters: { bomb: 3, lightning: 2, shuffle: 1, aloe: 2 },
  hintTimer: null,
  dailyClaimed: false,
  achievements: [],
};

// ============================================================
// AUDIO ENGINE (Web Audio API)
// ============================================================
let audioCtx = null;

function initAudio() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) { audioCtx = null; }
}

function playTone(freq, type = 'sine', duration = 0.15, vol = 0.3) {
  if (!state.soundOn || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.type = type;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

function playMatch() {
  if (!state.soundOn || !audioCtx) return;
  [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.12, 0.25), i * 60));
}

function playBigMatch() {
  if (!state.soundOn || !audioCtx) return;
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'triangle', 0.15, 0.3), i * 50));
}

function playSwap() { playTone(400, 'sine', 0.1, 0.15); }
function playError() { playTone(200, 'square', 0.2, 0.2); }
function playVictory() {
  if (!state.soundOn || !audioCtx) return;
  [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.35), i * 100));
}
function playBooster() { playTone(880, 'sawtooth', 0.2, 0.4); }
function playCoin() { playTone(1047, 'sine', 0.1, 0.2); }

// ============================================================
// STORAGE
// ============================================================
function saveGame() {
  const save = {
    coins: state.coins,
    energy: state.energy,
    musicOn: state.musicOn,
    soundOn: state.soundOn,
    playerName: state.playerName,
    playerLevel: state.playerLevel,
    levelsData: state.levelsData,
    unlockedLevel: state.unlockedLevel,
    boosters: state.boosters,
    dailyClaimed: state.dailyClaimed,
    dailyDate: state.dailyDate,
    achievements: state.achievements,
  };
  try { localStorage.setItem('hk_save', JSON.stringify(save)); } catch(e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem('hk_save');
    if (!raw) return;
    const save = JSON.parse(raw);
    Object.assign(state, save);
  } catch(e) {}
  // Init levels data if needed
  if (!state.levelsData || state.levelsData.length < LEVELS.length) {
    state.levelsData = LEVELS.map(() => ({ stars: 0, bestScore: 0 }));
  }
  // Check daily
  const today = new Date().toDateString();
  if (state.dailyDate !== today) {
    state.dailyClaimed = false;
    state.dailyDate = today;
  }
}

// ============================================================
// SCREEN MANAGER
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    state.screen = id;
  }
  // Update UI on screen change
  if (id === 'main-menu') { updateMenuUI(); hidePause(); }
  if (id === 'level-select') { renderLevelGrid(); updateCoinsUI(); }
  if (id === 'shop-screen') { renderShop(); }
  if (id === 'gameplay') { /* handled by startLevel */ }
}

function updateMenuUI() {
  document.getElementById('player-name-display').textContent = state.playerName;
  document.getElementById('player-level-display').textContent = state.playerLevel;
  updateCoinsUI();
  updateEnergyUI();
  // Daily reward banner
  const banner = document.getElementById('daily-reward-banner');
  if (banner) banner.style.display = state.dailyClaimed ? 'none' : 'flex';
  // Music/sound buttons
  document.getElementById('music-btn').classList.toggle('muted', !state.musicOn);
  document.getElementById('sound-btn').classList.toggle('muted', !state.soundOn);
}

function updateCoinsUI() {
  ['coins-display','coins-ls','coins-shop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = state.coins;
  });
}

function updateEnergyUI() {
  const el = document.getElementById('energy-display');
  if (el) el.textContent = state.energy;
}

// ============================================================
// PARTICLES SYSTEM
// ============================================================
function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    const hue = Math.random() > 0.5 ? '120' : '45';
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      background: hsla(${hue}, 60%, 60%, 0.6);
      animation-duration: ${Math.random()*8+6}s;
      animation-delay: ${Math.random()*8}s;
    `;
    container.appendChild(p);
  }
}

// ============================================================
// SPLASH SCREEN
// ============================================================
function runSplash() {
  const fill = document.getElementById('loader-fill');
  const text = document.getElementById('loader-text');
  const logo = document.getElementById('splash-logo');
  const messages = [
    'Preparando tu bienestar...',
    'Cargando productos Herbalife...',
    'Activando energía wellness...',
    'Iniciando Herbal Kingdom...',
  ];

  setTimeout(() => logo && (logo.style.animationDelay = '0s'), 100);

  let progress = 0;
  let msgIdx = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 7;
    if (progress > 100) progress = 100;
    if (fill) fill.style.width = progress + '%';
    msgIdx = Math.min(Math.floor(progress / 25), messages.length - 1);
    if (text) text.textContent = messages[msgIdx];
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => showScreen('main-menu'), 600);
    }
  }, 220);
}

// ============================================================
// DAILY REWARD
// ============================================================
function claimDailyReward() {
  if (state.dailyClaimed) return;
  const rewards = [50, 75, 100, 150];
  const coins = rewards[Math.floor(Math.random() * rewards.length)];
  addCoins(coins);
  state.dailyClaimed = true;
  state.dailyDate = new Date().toDateString();
  saveGame();
  showToast(`🎁 ¡Recompensa reclamada! +${coins} 🪙`);
  const banner = document.getElementById('daily-reward-banner');
  if (banner) banner.style.display = 'none';
  spawnCoins(coins);
}

function addCoins(amount) {
  state.coins += amount;
  updateCoinsUI();
  playCoin();
  animateValue('coins-display', state.coins - amount, state.coins, 600);
}

function animateValue(id, from, to, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ============================================================
// LEVEL GRID
// ============================================================
function renderLevelGrid() {
  const grid = document.getElementById('level-grid');
  if (!grid) return;
  grid.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    const ld = state.levelsData[i] || { stars: 0, bestScore: 0 };
    const unlocked = i < state.unlockedLevel;
    const completed = ld.stars > 0;
    const current = i === state.unlockedLevel - 1 && !completed;

    const node = document.createElement('div');
    node.className = `level-node ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''} ${current ? 'current' : ''}`;

    const stars = ld.stars > 0 ? '⭐'.repeat(ld.stars) + '☆'.repeat(3 - ld.stars) : '☆☆☆';
    const tileIcons = lvl.target.map(t => TILE_TYPES[t.id].emoji).join('');
    const glow = current ? '<div class="level-node-glow"></div>' : '';
    node.innerHTML = `
      ${glow}
      <div class="level-num">${lvl.num}</div>
      <div class="level-stars">${stars}</div>
      <div class="level-icon">${tileIcons}</div>
    `;

    if (unlocked) {
      node.addEventListener('click', () => {
        if (state.energy <= 0) { showToast('⚡ Sin energía. Espera o recarga.'); return; }
        startLevel(i);
      });
    }
    grid.appendChild(node);
  });
  document.getElementById('coins-ls').textContent = state.coins;
}

// ============================================================
// GAME START
// ============================================================
function startLevel(levelIdx) {
  const lvl = LEVELS[levelIdx];
  if (!lvl) return;

  state.currentLevel = levelIdx;
  state.score = 0;
  state.movesLeft = lvl.moves;
  state.comboCount = 0;
  state.selectedTile = null;
  state.isAnimating = false;
  state.activeBooster = null;

  // Setup objectives
  state.objectives = lvl.target.map(t => ({ ...t, collected: 0 }));
  state.progress = {};
  lvl.target.forEach(t => state.progress[t.id] = 0);

  // Reduce energy
  state.energy = Math.max(0, state.energy - 1);
  saveGame();

  showScreen('gameplay');
  document.getElementById('current-level-display').textContent = lvl.num;
  updateScoreUI();
  updateMovesUI();
  renderObjectives();
  updateBoostersUI();

  generateBoard();
  renderBoard();
  clearHint();
  scheduleHint();
}

// ============================================================
// BOARD GENERATION
// ============================================================
function generateBoard() {
  const typesForLevel = Math.min(4 + Math.floor(state.currentLevel / 3), TILE_TYPES.length);
  const available = TILE_TYPES.slice(0, typesForLevel);

  do {
    state.board = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      state.board[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let type;
        let attempts = 0;
        do {
          type = available[Math.floor(Math.random() * available.length)];
          attempts++;
        } while (attempts < 20 && wouldMatch(r, c, type.id));
        state.board[r][c] = { type, special: null, id: Math.random() };
      }
    }
  } while (!hasPossibleMoves());
}

function wouldMatch(r, c, typeId) {
  // Check horizontal
  if (c >= 2 &&
      state.board[r][c-1]?.type.id === typeId &&
      state.board[r][c-2]?.type.id === typeId) return true;
  // Check vertical
  if (r >= 2 &&
      state.board[r-1]?.[c]?.type.id === typeId &&
      state.board[r-2]?.[c]?.type.id === typeId) return true;
  return false;
}

function hasPossibleMoves() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canSwap(r, c, r, c+1) ||
          canSwap(r, c, r+1, c)) return true;
    }
  }
  return false;
}

function canSwap(r1, c1, r2, c2) {
  if (r2 >= GRID_SIZE || c2 >= GRID_SIZE) return false;
  // Simulate swap
  const temp = state.board[r1][c1];
  state.board[r1][c1] = state.board[r2][c2];
  state.board[r2][c2] = temp;
  const hasMatch = findMatches().length > 0;
  // Undo
  state.board[r2][c2] = state.board[r1][c1];
  state.board[r1][c1] = temp;
  return hasMatch;
}

// ============================================================
// RENDER BOARD
// ============================================================
function renderBoard() {
  const board = document.getElementById('game-board');
  if (!board) return;
  board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;
  board.innerHTML = '';

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      board.appendChild(createTileEl(r, c));
    }
  }
}

function createTileEl(r, c) {
  const cell = state.board[r][c];
  const div = document.createElement('div');
  div.className = 'tile';
  div.dataset.r = r;
  div.dataset.c = c;

  // Color glow border based on product
  div.style.setProperty('--tile-glow', cell.type.glow || 'rgba(106,174,106,0.6)');
  div.style.setProperty('--tile-color', cell.type.color || '#4CAF50');

  // Determine image key
  let imgKey = cell.type.img;
  if (cell.special === 'bomb')      { imgKey = 'special_bomb';      div.classList.add('special-bomb'); }
  if (cell.special === 'lightning') { imgKey = 'special_lightning'; div.classList.add('special-lightning'); }
  if (cell.special === 'rainbow')   { imgKey = 'special_rainbow';   div.classList.add('special-rainbow'); }

  // Product image
  const imgEl = document.createElement('img');
  imgEl.className = 'tile-img';
  imgEl.src = (typeof PRODUCT_IMAGES !== 'undefined' && PRODUCT_IMAGES[imgKey])
    ? PRODUCT_IMAGES[imgKey]
    : '';
  imgEl.alt = cell.type.name;
  imgEl.draggable = false;
  div.appendChild(imgEl);

  // Name label
  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = cell.type.name;
  div.appendChild(label);

  // Shine
  const shine = document.createElement('div');
  shine.className = 'tile-shine';
  div.appendChild(shine);

  // Special crown/badge overlay
  if (cell.special) {
    const badge = document.createElement('div');
    badge.className = 'tile-special-badge';
    badge.textContent = cell.special === 'bomb' ? '💥' : cell.special === 'lightning' ? '⚡' : '🌈';
    div.appendChild(badge);
  }

  div.addEventListener('click', () => onTileClick(r, c));
  div.addEventListener('touchstart', onTouchStart, { passive: true });
  div.addEventListener('touchend', onTouchEnd, { passive: true });

  return div;
}

function getTileEl(r, c) {
  const board = document.getElementById('game-board');
  if (!board) return null;
  return board.querySelector(`[data-r="${r}"][data-c="${c}"]`);
}

// ============================================================
// TOUCH / DRAG SUPPORT
// ============================================================
let touchStart = null;

function onTouchStart(e) {
  const touch = e.touches[0];
  touchStart = { x: touch.clientX, y: touch.clientY, el: e.currentTarget };
}

function onTouchEnd(e) {
  if (!touchStart) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  const threshold = 30;
  if (absDx < threshold && absDy < threshold) {
    // Tap — handled by click
    touchStart = null;
    return;
  }

  const r = parseInt(touchStart.el.dataset.r);
  const c = parseInt(touchStart.el.dataset.c);
  let targetR = r, targetC = c;

  if (absDx > absDy) {
    targetC += dx > 0 ? 1 : -1;
  } else {
    targetR += dy > 0 ? 1 : -1;
  }
  touchStart = null;

  if (targetR < 0 || targetR >= GRID_SIZE || targetC < 0 || targetC >= GRID_SIZE) return;

  // Auto-select and swap
  if (state.selectedTile) {
    clearSelected();
  }
  state.selectedTile = { r, c };
  attemptSwap(r, c, targetR, targetC);
}

// ============================================================
// TILE CLICK LOGIC
// ============================================================
function onTileClick(r, c) {
  if (state.isAnimating) return;
  if (!audioCtx) initAudio();

  // Booster mode
  if (state.activeBooster) {
    applyBoosterToTile(r, c);
    return;
  }

  if (!state.selectedTile) {
    // Select
    state.selectedTile = { r, c };
    getTileEl(r, c)?.classList.add('selected');
    playSwap();
    clearHint();
  } else {
    const { r: sr, c: sc } = state.selectedTile;
    if (sr === r && sc === c) {
      // Deselect
      clearSelected();
    } else if (isAdjacent(sr, sc, r, c)) {
      // Swap
      attemptSwap(sr, sc, r, c);
    } else {
      // New selection
      clearSelected();
      state.selectedTile = { r, c };
      getTileEl(r, c)?.classList.add('selected');
      playSwap();
    }
  }
}

function clearSelected() {
  if (state.selectedTile) {
    const { r, c } = state.selectedTile;
    getTileEl(r, c)?.classList.remove('selected');
    state.selectedTile = null;
  }
}

function isAdjacent(r1, c1, r2, c2) {
  return (Math.abs(r1-r2) === 1 && c1 === c2) ||
         (Math.abs(c1-c2) === 1 && r1 === r2);
}

// ============================================================
// SWAP & MATCH LOGIC
// ============================================================
async function attemptSwap(r1, c1, r2, c2) {
  if (state.isAnimating) return;
  clearSelected();

  // Animate swap
  animateSwap(r1, c1, r2, c2);

  // Swap in data
  const temp = state.board[r1][c1];
  state.board[r1][c1] = state.board[r2][c2];
  state.board[r2][c2] = temp;

  const matches = findMatches();
  if (matches.length === 0) {
    // Revert
    await delay(220);
    animateSwap(r1, c1, r2, c2);
    const t2 = state.board[r1][c1];
    state.board[r1][c1] = state.board[r2][c2];
    state.board[r2][c2] = t2;
    playError();
    return;
  }

  playSwap();
  state.movesLeft--;
  updateMovesUI();

  state.isAnimating = true;
  state.comboCount = 0;

  // Check special tiles
  await processSpecials(r1, c1, r2, c2, matches);
  await processMatches(matches, r1, c1, r2, c2);

  state.isAnimating = false;

  // Check win / lose
  if (checkObjectivesComplete()) {
    await delay(300);
    showVictory();
    return;
  }

  if (state.movesLeft <= 0) {
    await delay(500);
    showDefeat();
    return;
  }

  if (!hasPossibleMoves()) {
    showToast('🔄 ¡Tablero mezclado automáticamente!');
    await delay(500);
    shuffleBoard();
  }

  scheduleHint();
}

function animateSwap(r1, c1, r2, c2) {
  const el1 = getTileEl(r1, c1);
  const el2 = getTileEl(r2, c2);
  if (!el1 || !el2) return;

  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  const dx = rect2.left - rect1.left;
  const dy = rect2.top - rect1.top;

  el1.classList.add('swap-anim');
  el2.classList.add('swap-anim');
  el1.style.transform = `translate(${dx}px, ${dy}px)`;
  el2.style.transform = `translate(${-dx}px, ${-dy}px)`;

  setTimeout(() => {
    el1.style.transform = '';
    el2.style.transform = '';
    el1.classList.remove('swap-anim');
    el2.classList.remove('swap-anim');
    // Refresh tile elements
    refreshTileEl(r1, c1);
    refreshTileEl(r2, c2);
  }, 220);
}

function refreshTileEl(r, c) {
  const board = document.getElementById('game-board');
  const old = getTileEl(r, c);
  if (old) old.replaceWith(createTileEl(r, c));
}

// ============================================================
// FIND MATCHES
// ============================================================
function findMatches() {
  const matched = new Set();

  // Horizontal
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 2; c++) {
      const t = state.board[r][c]?.type.id;
      if (t === undefined) continue;
      if (state.board[r][c+1]?.type.id === t && state.board[r][c+2]?.type.id === t) {
        let end = c + 2;
        while (end + 1 < GRID_SIZE && state.board[r][end+1]?.type.id === t) end++;
        for (let k = c; k <= end; k++) matched.add(`${r},${k}`);
      }
    }
  }

  // Vertical
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r < GRID_SIZE - 2; r++) {
      const t = state.board[r][c]?.type.id;
      if (t === undefined) continue;
      if (state.board[r+1]?.[c]?.type.id === t && state.board[r+2]?.[c]?.type.id === t) {
        let end = r + 2;
        while (end + 1 < GRID_SIZE && state.board[end+1]?.[c]?.type.id === t) end++;
        for (let k = r; k <= end; k++) matched.add(`${k},${c}`);
      }
    }
  }

  return [...matched].map(key => {
    const [r, c] = key.split(',').map(Number);
    return { r, c };
  });
}

// ============================================================
// PROCESS SPECIALS
// ============================================================
async function processSpecials(r1, c1, r2, c2) {
  for (const pos of [[r1,c1],[r2,c2]]) {
    const [r, c] = pos;
    const cell = state.board[r]?.[c];
    if (!cell) continue;
    if (cell.special === 'bomb') {
      await triggerBomb(r, c);
    } else if (cell.special === 'lightning') {
      await triggerLightning(r, c);
    } else if (cell.special === 'rainbow') {
      await triggerRainbow(r, c);
    }
  }
}

async function triggerBomb(r, c) {
  const positions = [];
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        positions.push({ r: nr, c: nc });
      }
    }
  }
  spawnExplosion(r, c, '#FF5252');
  await clearTiles(positions, true);
  addScore(positions.length * 30);
}

async function triggerLightning(r, c) {
  const positions = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    positions.push({ r, c: i });
    positions.push({ r: i, c });
  }
  spawnExplosion(r, c, '#FFD700');
  await clearTiles([...new Set(positions.map(p => `${p.r},${p.c}`))].map(k => {
    const [r2,c2] = k.split(',').map(Number); return {r:r2,c:c2};
  }), true);
  addScore(GRID_SIZE * 2 * 25);
}

async function triggerRainbow(r, c) {
  // Clears all tiles of a random type
  const types = [...new Set(state.board.flat().map(t => t?.type.id))];
  const targetType = types[Math.floor(Math.random() * types.length)];
  const positions = [];
  for (let r2 = 0; r2 < GRID_SIZE; r2++) {
    for (let c2 = 0; c2 < GRID_SIZE; c2++) {
      if (state.board[r2][c2]?.type.id === targetType) positions.push({ r:r2, c:c2 });
    }
  }
  spawnExplosion(r, c, '#AB47BC');
  await clearTiles(positions, true);
  addScore(positions.length * 40);
}

// ============================================================
// PROCESS MATCHES (cascades)
// ============================================================
async function processMatches(matches, swapR1, swapC1, swapR2, swapC2) {
  if (matches.length === 0) return;

  state.comboCount++;
  const comboBonus = Math.pow(1.5, state.comboCount - 1);

  // Create special pieces for 4+ matches
  const specialCreated = checkSpecialCreation(matches, swapR1, swapC1);

  // Animate matches
  await animateMatches(matches);
  // Track objectives
  matches.forEach(({ r, c }) => {
    const typeId = state.board[r][c]?.type.id;
    if (typeId !== undefined) {
      state.progress[typeId] = (state.progress[typeId] || 0) + 1;
    }
  });

  // Score
  const baseScore = matches.length * 50 * comboBonus;
  addScore(Math.round(baseScore));

  if (matches.length >= 5) { playBigMatch(); shakeBoard(); }
  else { playMatch(); }

  // Show combo
  if (state.comboCount > 1) showCombo(state.comboCount);

  // Score popup
  showScorePopup(matches, Math.round(baseScore));

  // Create special if deserved
  if (specialCreated) {
    const { r, c, type } = specialCreated;
    if (state.board[r]?.[c]) {
      state.board[r][c].special = type;
      await delay(100);
      refreshTileEl(r, c);
    }
  }

  // Clear matched tiles
  matches.forEach(({ r, c }) => {
    state.board[r][c] = null;
  });

  updateObjectiveProgress();
  renderObjectives();

  // Cascade: drop tiles
  await delay(150);
  cascadeTiles();
  await delay(300);
  fillNewTiles();
  await delay(350);
  rerenderBoard();
  await delay(250);

  // Recursive cascade check
  const newMatches = findMatches();
  if (newMatches.length > 0) {
    await processMatches(newMatches, -1, -1, -1, -1);
  }
}

function checkSpecialCreation(matches, swapR, swapC) {
  if (matches.length >= 5) return { r: swapR, c: swapC, type: 'rainbow' };
  if (matches.length === 4) return { r: swapR, c: swapC, type: 'lightning' };
  // Check for L/T shape (5 tiles)
  if (matches.length >= 4) return { r: swapR, c: swapC, type: 'bomb' };
  return null;
}

async function animateMatches(matches) {
  matches.forEach(({ r, c }) => {
    const el = getTileEl(r, c);
    if (el) el.classList.add('matched');
  });
  await delay(400);
}

async function clearTiles(positions, animate = false) {
  if (animate) {
    positions.forEach(({ r, c }) => {
      const el = getTileEl(r, c);
      if (el) el.classList.add('matched');
    });
    await delay(400);
  }
  positions.forEach(({ r, c }) => {
    if (state.board[r]) state.board[r][c] = null;
  });
}

function cascadeTiles() {
  for (let c = 0; c < GRID_SIZE; c++) {
    let empty = GRID_SIZE - 1;
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (state.board[r][c] !== null) {
        state.board[empty][c] = state.board[r][c];
        if (empty !== r) state.board[r][c] = null;
        empty--;
      }
    }
  }
}

function fillNewTiles() {
  const typesForLevel = Math.min(4 + Math.floor(state.currentLevel / 3), TILE_TYPES.length);
  const available = TILE_TYPES.slice(0, typesForLevel);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (state.board[r][c] === null) {
        state.board[r][c] = {
          type: available[Math.floor(Math.random() * available.length)],
          special: null,
          id: Math.random(),
        };
      }
    }
  }
}

function rerenderBoard() {
  const board = document.getElementById('game-board');
  if (!board) return;
  board.innerHTML = '';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const el = createTileEl(r, c);
      el.classList.add('falling');
      board.appendChild(el);
    }
  }
}

// ============================================================
// OBJECTIVES
// ============================================================
function updateObjectiveProgress() {
  const lvl = LEVELS[state.currentLevel];
  if (!lvl) return;
  state.objectives.forEach(obj => {
    const collected = state.progress[obj.id] || 0;
    obj.collected = Math.min(collected, obj.count);
  });
}

function checkObjectivesComplete() {
  return state.objectives.every(obj => (state.progress[obj.id] || 0) >= obj.count);
}

function renderObjectives() {
  const container = document.getElementById('obj-items');
  if (!container) return;
  container.innerHTML = '';
  state.objectives.forEach(obj => {
    const collected = Math.min(state.progress[obj.id] || 0, obj.count);
    const complete = collected >= obj.count;
    const div = document.createElement('div');
    div.className = `obj-item ${complete ? 'completed' : ''}`;
    div.innerHTML = `
      <span class="obj-item-icon">${TILE_TYPES[obj.id].emoji}</span>
      <span class="obj-item-count">${collected}/${obj.count}</span>
    `;
    container.appendChild(div);
  });
}

// ============================================================
// SCORE & PROGRESS UI
// ============================================================
function addScore(amount) {
  state.score += amount;
  updateScoreUI();
  updateProgressBar();
}

function updateScoreUI() {
  const el = document.getElementById('score-display');
  if (el) {
    el.textContent = state.score;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}

function updateMovesUI() {
  const el = document.getElementById('moves-display');
  if (el) el.textContent = state.movesLeft;
}

function updateProgressBar() {
  const lvl = LEVELS[state.currentLevel];
  if (!lvl) return;
  const p1 = document.getElementById('progress-fill');
  const p2 = document.getElementById('progress-fill2');
  const s1 = document.getElementById('star1');
  const s2 = document.getElementById('star2');
  const s3 = document.getElementById('star3');

  const pct1 = Math.min(state.score / lvl.star2 * 100, 100);
  const pct2 = Math.min(Math.max(state.score - lvl.star2, 0) / (lvl.star3 - lvl.star2) * 100, 100);

  if (p1) p1.style.width = pct1 + '%';
  if (p2) p2.style.width = pct2 + '%';

  if (state.score >= lvl.star1 && s1) { s1.classList.add('lit'); playTone(880, 'sine', 0.2, 0.3); }
  if (state.score >= lvl.star2 && s2) { s2.classList.add('lit'); playTone(988, 'sine', 0.2, 0.3); }
  if (state.score >= lvl.star3 && s3) { s3.classList.add('lit'); playTone(1047, 'sine', 0.2, 0.3); }
}

function updateBoostersUI() {
  Object.entries(state.boosters).forEach(([key, count]) => {
    const el = document.getElementById(`${key}-count`);
    if (el) el.textContent = count;
  });
}

// ============================================================
// BOOSTERS
// ============================================================
function useBooster(type) {
  if (state.boosters[type] <= 0) {
    showToast(`Sin ${type}. ¡Compra más en la tienda!`);
    return;
  }
  if (state.activeBooster === type) {
    state.activeBooster = null;
    document.querySelectorAll('.booster-btn').forEach(b => b.classList.remove('active'));
    return;
  }
  state.activeBooster = type;
  document.querySelectorAll('.booster-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`booster-${type}`);
  if (btn) btn.classList.add('active');
  showToast(`${getBoosterEmoji(type)} Toca una casilla para usar el potenciador`);
  playBooster();
}

function getBoosterEmoji(type) {
  return { bomb:'💣', lightning:'⚡', shuffle:'🔄', aloe:'🌿' }[type] || '⚡';
}

async function applyBoosterToTile(r, c) {
  const type = state.activeBooster;
  state.activeBooster = null;
  document.querySelectorAll('.booster-btn').forEach(b => b.classList.remove('active'));
  state.boosters[type]--;
  updateBoostersUI();
  saveGame();

  state.isAnimating = true;

  if (type === 'bomb') {
    await triggerBomb(r, c);
    state.board[r][c] = null;
  } else if (type === 'lightning') {
    await triggerLightning(r, c);
  } else if (type === 'shuffle') {
    shuffleBoard();
  } else if (type === 'aloe') {
    // Remove 3x3 around tile
    const positions = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r+dr, nc = c+dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          positions.push({ r: nr, c: nc });
        }
      }
    }
    spawnExplosion(r, c, '#4CAF50');
    await clearTiles(positions, true);
    addScore(positions.length * 35);
  }

  cascadeTiles();
  fillNewTiles();
  await delay(300);
  rerenderBoard();
  await delay(250);

  const newMatches = findMatches();
  if (newMatches.length > 0) {
    await processMatches(newMatches, -1, -1, -1, -1);
  }

  state.isAnimating = false;

  if (checkObjectivesComplete()) { showVictory(); return; }
  if (state.movesLeft <= 0) { showDefeat(); return; }
}

function shuffleBoard() {
  const tiles = state.board.flat().filter(Boolean);
  tiles.sort(() => Math.random() - 0.5);
  let i = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      state.board[r][c] = tiles[i++];
    }
  }
  rerenderBoard();
  showToast('🔄 ¡Tablero mezclado!');
}

// ============================================================
// VISUAL EFFECTS
// ============================================================
function spawnExplosion(r, c, color) {
  const el = getTileEl(r, c);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const container = document.getElementById('board-wrapper');
  if (!container) return;
  const bRect = container.getBoundingClientRect();

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'explosion-particle';
    const angle = (i / 12) * Math.PI * 2;
    const dist = Math.random() * 60 + 30;
    p.style.cssText = `
      left: ${rect.left - bRect.left + rect.width/2}px;
      top: ${rect.top - bRect.top + rect.height/2}px;
      background: ${color};
      --dx: ${Math.cos(angle)*dist}px;
      --dy: ${Math.sin(angle)*dist}px;
      --dur: ${Math.random()*0.3+0.4}s;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

function spawnCoins(count) {
  const container = document.getElementById('coin-animations');
  if (!container) return;
  const coinEl = document.getElementById('coins-display');
  const targetRect = coinEl?.getBoundingClientRect();

  for (let i = 0; i < Math.min(count / 10, 8); i++) {
    setTimeout(() => {
      const coin = document.createElement('div');
      coin.className = 'flying-coin';
      coin.textContent = '🪙';
      coin.style.cssText = `
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.3}px;
        --dx: ${targetRect ? targetRect.left - parseInt(coin.style.left) : 0}px;
      `;
      container.appendChild(coin);
      setTimeout(() => coin.remove(), 1100);
    }, i * 100);
  }
}

function showCombo(count) {
  const el = document.getElementById('combo-display');
  if (!el) return;
  el.textContent = `COMBO x${count}!`;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1000);
}

function showScorePopup(matches, score) {
  if (!matches.length) return;
  const mid = matches[Math.floor(matches.length / 2)];
  const el = getTileEl(mid.r, mid.c);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const container = document.getElementById('board-wrapper');
  if (!container) return;
  const bRect = container.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = `+${score}`;
  popup.style.cssText = `
    left: ${rect.left - bRect.left + rect.width/2}px;
    top: ${rect.top - bRect.top}px;
    transform: translateX(-50%);
  `;
  container.appendChild(popup);
  setTimeout(() => popup.remove(), 900);
}

function shakeBoard() {
  const board = document.getElementById('board-wrapper');
  if (!board) return;
  board.classList.add('board-shake');
  setTimeout(() => board.classList.remove('board-shake'), 500);
}

// ============================================================
// HINT SYSTEM
// ============================================================
function scheduleHint() {
  clearHint();
  state.hintTimer = setTimeout(showHint, 4000);
}

function clearHint() {
  if (state.hintTimer) { clearTimeout(state.hintTimer); state.hintTimer = null; }
  document.querySelectorAll('.hint-glow').forEach(el => el.classList.remove('hint-glow'));
}

function showHint() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canSwap(r, c, r, c+1)) {
        getTileEl(r, c)?.classList.add('hint-glow');
        getTileEl(r, c+1)?.classList.add('hint-glow');
        return;
      }
      if (canSwap(r, c, r+1, c)) {
        getTileEl(r, c)?.classList.add('hint-glow');
        getTileEl(r+1, c)?.classList.add('hint-glow');
        return;
      }
    }
  }
}

// ============================================================
// VICTORY & DEFEAT
// ============================================================
function showVictory() {
  const lvl = LEVELS[state.currentLevel];
  if (!lvl) return;

  // Calculate stars
  let stars = 0;
  if (state.score >= lvl.star1) stars = 1;
  if (state.score >= lvl.star2) stars = 2;
  if (state.score >= lvl.star3) stars = 3;

  // Save progress
  const oldData = state.levelsData[state.currentLevel] || { stars: 0, bestScore: 0 };
  state.levelsData[state.currentLevel] = {
    stars: Math.max(oldData.stars, stars),
    bestScore: Math.max(oldData.bestScore, state.score),
  };

  // Unlock next level
  if (state.currentLevel + 1 > state.unlockedLevel) {
    state.unlockedLevel = state.currentLevel + 1;
  }

  // Coins earned
  const coinsEarned = stars * 25 + Math.floor(state.score / 50);
  addCoins(coinsEarned);

  // Player level up check
  const totalStars = state.levelsData.reduce((sum, d) => sum + (d?.stars||0), 0);
  state.playerLevel = Math.max(1, Math.floor(totalStars / 5) + 1);

  saveGame();
  playVictory();
  spawnCoins(coinsEarned);

  // Update victory UI
  document.getElementById('victory-score-val').textContent = state.score.toLocaleString();
  document.getElementById('coins-earned-display').textContent = `+${coinsEarned} 🪙`;
  const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
  document.getElementById('vr-text').textContent = reward;

  // Animate stars
  ['se1','se2','se3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i < stars) {
      setTimeout(() => { el.classList.add('lit'); playTone(523+i*130, 'sine', 0.2, 0.3); }, 500 + i * 300);
    } else {
      el.style.filter = 'grayscale(1)'; el.style.opacity = '0.3';
    }
  });

  showScreen('victory-screen');
  updateEnergyUI();
}

function showDefeat() {
  document.getElementById('defeat-score-val').textContent = state.score.toLocaleString();
  showScreen('defeat-screen');
  playTone(200, 'square', 0.5, 0.3);
}

function nextLevel() {
  if (state.currentLevel + 1 < LEVELS.length) {
    startLevel(state.currentLevel + 1);
  } else {
    showToast('🎉 ¡Has completado todos los niveles!');
    showScreen('main-menu');
  }
}

function retryLevel() {
  hidePause();
  startLevel(state.currentLevel);
}

function continueWithCoins() {
  if (state.coins < 30) {
    showToast('🪙 Sin monedas suficientes');
    return;
  }
  state.coins -= 30;
  state.movesLeft += 5;
  updateCoinsUI();
  updateMovesUI();
  saveGame();
  showScreen('gameplay');
  state.isAnimating = false;
}

// ============================================================
// PAUSE
// ============================================================
function pauseGame() {
  const overlay = document.getElementById('pause-overlay');
  if (overlay) overlay.classList.add('active');
  state.isAnimating = true;
}

function resumeGame() {
  hidePause();
  state.isAnimating = false;
}

function hidePause() {
  const overlay = document.getElementById('pause-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ============================================================
// SHOP
// ============================================================
function renderShop() {
  const grid = document.getElementById('shop-grid');
  const boosterGrid = document.getElementById('booster-grid');
  if (!grid || !boosterGrid) return;

  const rewards = [
    { icon: '🥤', name: 'Batido Premium', desc: 'Batido Fórmula 1 gratis', price: 100 },
    { icon: '🌿', name: 'Aloe Mango', desc: 'Bebida exclusiva', price: 80 },
    { icon: '⭐', name: 'Cliente Estrella', desc: 'Estatus especial', price: 200 },
    { icon: '🎫', name: 'Cupón Wellness', desc: '20% descuento', price: 150 },
    { icon: '💪', name: 'Proteína Gratis', desc: 'Muestra especial', price: 120 },
    { icon: '🏆', name: 'VIP Pass', desc: 'Acceso premium', price: 300 },
  ];

  const boosters = [
    { icon: '💣', name: 'Bomba x3', desc: 'Explota 5x5', price: 50, key: 'bomb', amount: 3 },
    { icon: '⚡', name: 'Rayo x2', desc: 'Fila y columna', price: 40, key: 'lightning', amount: 2 },
    { icon: '🔄', name: 'Mezclar x1', desc: 'Reorganiza todo', price: 30, key: 'shuffle', amount: 1 },
    { icon: '🌿', name: 'Aloe x2', desc: 'Limpia 3x3', price: 35, key: 'aloe', amount: 2 },
  ];

  grid.innerHTML = rewards.map(r => `
    <div class="shop-item" onclick="buyReward('${r.name}', ${r.price})">
      <div class="shop-item-icon">${r.icon}</div>
      <div class="shop-item-name">${r.name}</div>
      <div class="shop-item-desc">${r.desc}</div>
      <div class="shop-item-price">🪙 ${r.price}</div>
    </div>
  `).join('');

  boosterGrid.innerHTML = boosters.map(b => `
    <div class="shop-item" onclick="buyBooster('${b.key}', ${b.price}, ${b.amount})">
      <div class="shop-item-icon">${b.icon}</div>
      <div class="shop-item-name">${b.name}</div>
      <div class="shop-item-desc">${b.desc}</div>
      <div class="shop-item-price">🪙 ${b.price}</div>
    </div>
  `).join('');

  document.getElementById('coins-shop').textContent = state.coins;
}

function buyReward(name, price) {
  if (state.coins < price) { showToast('🪙 Monedas insuficientes'); return; }
  state.coins -= price;
  updateCoinsUI();
  saveGame();
  showToast(`✅ ¡${name} desbloqueado!`);
  spawnCoins(5);
}

function buyBooster(key, price, amount) {
  if (state.coins < price) { showToast('🪙 Monedas insuficientes'); return; }
  state.coins -= price;
  state.boosters[key] = (state.boosters[key] || 0) + amount;
  updateCoinsUI();
  updateBoostersUI();
  saveGame();
  showToast(`${getBoosterEmoji(key)} ¡Potenciador añadido!`);
}

// ============================================================
// SETTINGS
// ============================================================
function toggleMusic() {
  state.musicOn = !state.musicOn;
  document.getElementById('music-btn')?.classList.toggle('muted', !state.musicOn);
  showToast(state.musicOn ? '🎵 Música activada' : '🔇 Música desactivada');
  saveGame();
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  if (!audioCtx) initAudio();
  document.getElementById('sound-btn')?.classList.toggle('muted', !state.soundOn);
  showToast(state.soundOn ? '🔊 Sonido activado' : '🔇 Sonido desactivado');
  saveGame();
}

function showProfile() {
  const name = prompt('Tu nombre en el club:', state.playerName);
  if (name && name.trim()) {
    state.playerName = name.trim().substring(0, 20);
    saveGame();
    updateMenuUI();
    showToast(`👤 Bienvenido, ${state.playerName}!`);
  }
}

function showSettings() {
  showToast('⚙️ Herbal Kingdom Bolivia v2.0');
}

function showRanking() {
  const best = LEVELS.map((l, i) => {
    const d = state.levelsData[i];
    return d ? `Nv.${l.num}: ${d.bestScore.toLocaleString()} pts ⭐${d.stars}` : null;
  }).filter(Boolean).slice(0, 5).join('\n') || 'Sin puntuaciones aún';
  showToast(`🏆 Tus mejores scores`);
}

function showAchievements() {
  const totalStars = state.levelsData.reduce((sum, d) => sum + (d?.stars||0), 0);
  const completed = state.levelsData.filter(d => d?.stars > 0).length;
  showToast(`⭐ ${totalStars} estrellas | ✅ ${completed} niveles completados`);
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// UTILITY
// ============================================================
function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

// ============================================================
// INIT
// ============================================================
// [Init moved to ALX intro block below]

/* ============================================================
   ALX BRAND SYSTEM — Cinematic Intro Engine
   ============================================================ */

// ── ALX Particle Canvas ──────────────────────────────────────
function initALXCanvas() {
  const canvas = document.getElementById('alx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const COLORS = [
    'rgba(212,168,83,',
    'rgba(200,184,154,',
    'rgba(168,144,106,',
    'rgba(106,174,106,',
    'rgba(245,240,232,',
  ];

  const particles = Array.from({ length: 55 }, () => spawnParticle(W, H, COLORS));

  function spawnParticle(W, H, COLORS) {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.15,
      alpha: Math.random() * 0.5 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: Math.random(),
      decay: Math.random() * 0.003 + 0.001,
    };
  }

  let rafId;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
        particles[i] = spawnParticle(W, H, COLORS);
        particles[i].x = Math.random() * W;
        particles[i].y = H + 10;
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (p.alpha * p.life) + ')';
      ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  }
  draw();

  // Store raf id to cancel later
  window._alxRaf = rafId;
  window._alxDraw = draw;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
}

// ── ALX Intro Sound (elegant chime) ─────────────────────────
function playALXSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Low resonant pad
    const playNote = (freq, startT, dur, vol, type = 'sine') => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const rev  = audioCtx.createConvolver();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0, startT);
      gain.gain.linearRampToValueAtTime(vol, startT + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
      osc.start(startT); osc.stop(startT + dur + 0.05);
    };

    const t = audioCtx.currentTime;
    // Warm pad chord (mocha/wellness vibe)
    playNote(130.8, t + 0.05, 2.8, 0.06, 'sine');   // C2 sub
    playNote(261.6, t + 0.1,  2.5, 0.08, 'sine');   // C3
    playNote(329.6, t + 0.15, 2.2, 0.07, 'sine');   // E3
    playNote(392.0, t + 0.2,  2.0, 0.06, 'sine');   // G3
    // Bright logo sting
    playNote(783.9, t + 0.5,  0.8, 0.12, 'sine');   // G5 shimmer
    playNote(1046.5,t + 0.65, 0.6, 0.09, 'sine');   // C6 high
    playNote(1318.5,t + 0.75, 0.5, 0.07, 'sine');   // E6 bright
    // Gold tick
    playNote(2093,  t + 0.9,  0.3, 0.05, 'sine');   // C7 sparkle
  } catch(e) {}
}

// ── ALX Intro Sequence ──────────────────────────────────────
function runALXIntro() {
  initALXCanvas();

  // Unlock audio & play logo sound
  setTimeout(() => {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    playALXSound();
  }, 300);

  // Show skip hint after 1.5s
  setTimeout(() => {
    const skip = document.getElementById('alx-skip');
    if (skip) skip.style.opacity = '1';
  }, 1500);

  // Auto-advance after 3.8 seconds
  setTimeout(() => { finishIntro(); }, 3800);
}

function finishIntro() {
  const intro = document.getElementById('alx-intro');
  if (!intro || intro.classList.contains('fade-out')) return;
  intro.classList.add('fade-out');
  setTimeout(() => {
    intro.classList.add('hidden');
    intro.classList.remove('active');
    // Start the actual splash
    showScreen('splash-screen');
    setTimeout(runSplash, 300);
  }, 850);
}

function skipIntro() { finishIntro(); }

// ── Override DOMContentLoaded to show intro first ───────────
// Patch the existing init to run AFTER ALX intro
document.addEventListener('DOMContentLoaded', () => {
  loadGame();
  initParticles();

  if (!state.levelsData || state.levelsData.length < LEVELS.length) {
    state.levelsData = LEVELS.map(() => ({ stars: 0, bestScore: 0 }));
  }
  if (!state.unlockedLevel) state.unlockedLevel = 1;
  if (!state.boosters) state.boosters = { bomb: 3, lightning: 2, shuffle: 1, aloe: 2 };

  // Start with ALX cinematic intro
  runALXIntro();

  // Unlock audio context on first interaction
  const unlockAudio = () => {
    if (!audioCtx) initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  };
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('click', unlockAudio, { once: true });
}, { once: true });
