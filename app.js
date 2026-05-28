/**
 * ============================================================
 * ECO-TRACKER — app.js
 * Stack: Vanilla JS ES6+ · localStorage API · DOM API
 *
 * Nuova funzionalità: ogni classe ha i propri progressi
 * indipendenti, salvati su chiavi localStorage separate.
 * La classifica mostra i punteggi REALI di tutte le classi.
 * ============================================================
 */

'use strict';

// ============================================================
// 1. CHIAVI localStorage
// ============================================================

/**
 * Chiave che memorizza il nome della classe attualmente selezionata.
 * Persiste tra sessioni, così l'utente non deve riselezionarla ogni volta.
 */
const SELECTED_CLASS_KEY = 'ecotracker_selected_class';

/**
 * Prefisso per le chiavi dei dati di ogni singola classe.
 * La chiave completa sarà: "ecotracker_v1_5BI", "ecotracker_v1_5AI", ecc.
 */
const DATA_KEY_PREFIX = 'ecotracker_v1_';

/**
 * Restituisce la chiave localStorage per la classe indicata.
 * @param {string} className
 * @returns {string}
 */
function getStorageKey(className) {
  return `${DATA_KEY_PREFIX}${className}`;
}

// ============================================================
// 2. DATI STATICI — CLASSI PARTECIPANTI
// ============================================================

/**
 * Lista di tutte le classi partecipanti.
 * Ognuna ha i propri dati in localStorage.
 * @property {string} name    - Nome della classe (usato come ID e chiave)
 * @property {string} emoji   - Emoji rappresentativa
 * @property {string} desc    - Breve descrizione
 */
const ALL_CLASSES = [
  { name: '5BI', emoji: '💻', desc: 'Informatica — Anno 5' },
  { name: '5DM', emoji: '🔧', desc: 'Meccanica — Anno 5'   },
  { name: '4BI', emoji: '📐', desc: 'Informatica — Anno 4' },
  { name: '3AE', emoji: '⚡', desc: 'Elettronica — Anno 3' },
];

// ============================================================
// 3. DATI STATICI — AZIONI SOSTENIBILI
// ============================================================

const ACTIONS = [
  {
    id:          'borraccia',
    emoji:       '🚰',
    name:        'Borraccia riutilizzabile',
    description: 'Hai evitato almeno una bottiglia di plastica monouso',
    points:      10,
    sdg:         'SDG 6 · SDG 14',
    co2g:        100,
    waterL:      0,
  },
  {
    id:          'bici_piedi',
    emoji:       '🚴',
    name:        'Piedi o bicicletta',
    description: 'Ti sei spostato senza mezzi motorizzati',
    points:      20,
    sdg:         'SDG 3 · SDG 13',
    co2g:        2100,
    waterL:      0,
  },
  {
    id:          'differenziata',
    emoji:       '♻️',
    name:        'Raccolta differenziata',
    description: 'Hai smistato correttamente tutti i tuoi rifiuti',
    points:      15,
    sdg:         'SDG 11 · SDG 12',
    co2g:        200,
    waterL:      0,
  },
  {
    id:          'luci',
    emoji:       '💡',
    name:        'Luci e stand-by spenti',
    description: 'Hai spento luci e dispositivi in stand-by',
    points:      10,
    sdg:         'SDG 7 · SDG 13',
    co2g:        150,
    waterL:      0,
  },
  {
    id:          'borsa',
    emoji:       '🛍️',
    name:        'Borsa riutilizzabile',
    description: 'Nessun sacchetto di plastica durante la spesa',
    points:      10,
    sdg:         'SDG 12 · SDG 14',
    co2g:        70,
    waterL:      0,
  },
  {
    id:          'vegetariano',
    emoji:       '🥗',
    name:        'Pasto vegetariano',
    description: "Hai scelto un'alimentazione a basso impatto ambientale",
    points:      20,
    sdg:         'SDG 13 · SDG 15',
    co2g:        1700,
    waterL:      1000,
  },
  {
    id:          'doccia',
    emoji:       '🚿',
    name:        'Doccia breve (< 5 min)',
    description: "Hai ridotto il consumo d'acqua durante la doccia",
    points:      15,
    sdg:         'SDG 6',
    co2g:        0,
    waterL:      35,
  },
];

// ============================================================
// 4. DATI STATICI — BADGE / LIVELLI
// ============================================================

const BADGES = [
  {
    id:        'germoglio',
    name:      'Germoglio',
    icon:      '🌱',
    subtitle:  'Ogni grande foresta nasce da un piccolo seme',
    minPoints: 0,
    maxPoints: 50,
    cardClass: 'badge-card-germoglio',
  },
  {
    id:        'albero',
    name:      'Albero',
    icon:      '🌳',
    subtitle:  'Stai crescendo — la natura ti ringrazia!',
    minPoints: 51,
    maxPoints: 150,
    cardClass: 'badge-card-albero',
  },
  {
    id:        'custode',
    name:      'Custode del Pianeta',
    icon:      '🌍',
    subtitle:  'Sei un esempio per tutta la comunità scolastica!',
    minPoints: 151,
    maxPoints: Infinity,
    cardClass: 'badge-card-custode',
  },
];

// ============================================================
// 5. STATO ATTIVO (della classe correntemente selezionata)
// ============================================================

/**
 * Nome della classe correntemente selezionata.
 * Viene caricato dal localStorage o impostato al default.
 */
let activeClass = '5BI';

/**
 * Oggetto di stato della classe attiva.
 * Viene caricato/salvato su localStorage con chiave dinamica.
 */
let state = {
  totalPoints:    0,
  dailyPoints:    0,
  completedToday: [],
  lastDate:       '',
  totalActions:   0,
  activeDays:     0,
  totalCo2:       0,
  totalWater:     0,
};

// ============================================================
// 6. STATO DEFAULT (template vuoto per nuove classi)
// ============================================================

function getDefaultState() {
  return {
    totalPoints:    0,
    dailyPoints:    0,
    completedToday: [],
    lastDate:       '',
    totalActions:   0,
    activeDays:     0,
    totalCo2:       0,
    totalWater:     0,
  };
}

// ============================================================
// 7. PERSISTENZA — localStorage (per classe)
// ============================================================

/**
 * Carica lo stato di una specifica classe dal localStorage.
 * Se non esistono dati per quella classe, restituisce il default.
 *
 * @param   {string} className
 * @returns {Object} stato della classe
 */
function loadClassState(className) {
  try {
    const raw = localStorage.getItem(getStorageKey(className));
    if (raw !== null) {
      return Object.assign({}, getDefaultState(), JSON.parse(raw));
    }
  } catch (err) {
    console.error(`[Eco-Tracker] Errore caricamento stato classe ${className}:`, err);
  }
  return getDefaultState();
}

/**
 * Salva lo stato della classe attiva nel localStorage.
 */
function saveState() {
  try {
    localStorage.setItem(getStorageKey(activeClass), JSON.stringify(state));
  } catch (err) {
    console.error('[Eco-Tracker] Errore nel salvataggio su localStorage:', err);
  }
}

/**
 * Legge il totalPoints di una classe dal localStorage senza caricarla come attiva.
 * Usato dalla classifica per leggere i punteggi di tutte le classi.
 *
 * @param   {string} className
 * @returns {number}
 */
function readClassTotalPoints(className) {
  const s = loadClassState(className);
  return s.totalPoints;
}

// ============================================================
// 8. GESTIONE DATA E ROLLOVER GIORNALIERO
// ============================================================

function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Verifica se è cambiato il giorno dall'ultima sessione.
 * In caso affermativo resetta le azioni giornaliere.
 */
function checkDayRollover() {
  const today = getTodayISO();
  if (state.lastDate !== today) {
    if (state.lastDate !== '' && state.completedToday.length > 0) {
      state.activeDays += 1;
    }
    state.completedToday = [];
    state.dailyPoints    = 0;
    state.lastDate       = today;
    saveState();
  }
}

// ============================================================
// 9. SELEZIONE CLASSE
// ============================================================

/**
 * Carica la classe selezionata persistita nel localStorage.
 * Se non esiste, usa il default ('5BI').
 */
function loadSelectedClass() {
  const saved = localStorage.getItem(SELECTED_CLASS_KEY);
  if (saved && ALL_CLASSES.some(c => c.name === saved)) {
    activeClass = saved;
  } else {
    activeClass = ALL_CLASSES[0].name;
  }
}

/**
 * Salva la classe attiva nel localStorage.
 */
function saveSelectedClass() {
  localStorage.setItem(SELECTED_CLASS_KEY, activeClass);
}

/**
 * Cambia la classe attiva:
 * 1. Salva lo stato corrente (per sicurezza)
 * 2. Aggiorna activeClass
 * 3. Carica lo stato della nuova classe
 * 4. Esegue il rollover giornaliero
 * 5. Ricarica tutta la UI
 *
 * @param {string} className - Nome della classe da attivare
 */
function selectClass(className) {
  if (className === activeClass) {
    closeClassModal();
    return;
  }

  // Salva stato precedente prima di cambiare
  saveState();

  // Imposta nuova classe
  activeClass = className;
  saveSelectedClass();

  // Carica stato della nuova classe
  state = loadClassState(className);
  checkDayRollover();

  // Aggiorna UI completa
  closeClassModal();
  renderHeaderClass();
  renderAzioni();
  updateHeaderScore();

  // Se le tab progressi/classifica sono visibili, aggiorna anche quelle
  renderProgressi();
  renderClassifica();

  showToast(`Classe ${className} selezionata`);
}

// ============================================================
// 10. MODAL — SELEZIONE CLASSE
// ============================================================

/**
 * Apre il bottom sheet di selezione classe e
 * renderizza le card di tutte le classi disponibili.
 */
function openClassModal() {
  renderClassOptions();
  document.getElementById('class-modal').classList.add('open');
}

function closeClassModal() {
  document.getElementById('class-modal').classList.remove('open');
}

/**
 * Genera le card selezionabili per ogni classe nel modal.
 */
function renderClassOptions() {
  const container = document.getElementById('class-options-list');
  if (!container) return;
  container.innerHTML = '';

  ALL_CLASSES.forEach(cls => {
    const isSelected = cls.name === activeClass;
    const pts = readClassTotalPoints(cls.name);

    const card = document.createElement('div');
    card.className = `class-option-card${isSelected ? ' selected' : ''}`;
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    card.setAttribute('aria-label', `Classe ${cls.name}`);
    card.onclick = () => selectClass(cls.name);

    card.innerHTML = `
      <!-- Radio dot -->
      <div class="class-option-dot">
        <div class="class-option-dot-inner"></div>
      </div>

      <!-- Emoji classe -->
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
           style="background: ${isSelected ? 'rgba(45,106,79,0.12)' : '#F3F4F6'};">
        ${cls.emoji}
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="font-bold text-sm leading-tight" style="color:${isSelected ? 'var(--green)' : 'var(--text)'};">
          Classe ${cls.name}
        </p>
        <p class="text-xs mt-0.5" style="color:var(--text-muted);">${cls.desc}</p>
      </div>

      <!-- Punteggio attuale -->
      <div class="text-right flex-shrink-0">
        <p class="text-sm font-black" style="color:${isSelected ? 'var(--green)' : 'var(--forest)'}; font-family:'Playfair Display',serif;">
          ${pts}
        </p>
        <p class="text-xs" style="color:var(--text-muted);">pt</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// ============================================================
// 11. NAVIGAZIONE TRA TAB
// ============================================================

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const content = document.getElementById(`content-${tabName}`);
  if (content) content.classList.add('active');

  const btn = document.getElementById(`tab-${tabName}`);
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }

  if (tabName === 'progressi')  renderProgressi();
  if (tabName === 'classifica') renderClassifica();
}

// ============================================================
// 12. HEADER
// ============================================================

/**
 * Aggiorna il nome della classe visualizzato nell'header.
 */
function renderHeaderClass() {
  const el = document.getElementById('header-class-name');
  if (el) el.textContent = activeClass;
}

/**
 * Aggiorna il punteggio nell'header con animazione pop-in.
 */
function updateHeaderScore() {
  const el = document.getElementById('header-score');
  if (!el) return;
  el.textContent = state.totalPoints;
  el.classList.remove('pop-anim');
  void el.offsetWidth;
  el.classList.add('pop-anim');
}

// ============================================================
// 13. RENDERING — TAB AZIONI
// ============================================================

function renderAzioni() {
  const list = document.getElementById('actions-list');
  if (!list) return;
  list.innerHTML = '';

  ACTIONS.forEach(action => {
    const done = state.completedToday.includes(action.id);
    list.appendChild(createActionCard(action, done));
  });

  updateDailySummary();
}

function createActionCard(action, done) {
  const card = document.createElement('div');
  card.className = `action-card bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3${done ? ' completed' : ''}`;
  card.id = `card-${action.id}`;
  card.setAttribute('role', 'listitem');

  if (!done) {
    card.setAttribute('aria-label', `Registra: ${action.name} — +${action.points} punti`);
    card.onclick = () => completeAction(action.id);
  } else {
    card.setAttribute('aria-label', `Completata: ${action.name}`);
  }

  const iconWrap = document.createElement('div');
  iconWrap.className = 'text-3xl w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0';
  iconWrap.style.background = 'rgba(82,183,136,0.13)';
  iconWrap.textContent = action.emoji;

  const textBlock = document.createElement('div');
  textBlock.className = 'flex-1 min-w-0';
  textBlock.innerHTML = `
    <p class="font-bold text-sm leading-snug" style="color:var(--text);">${action.name}</p>
    <p class="text-xs mt-0.5" style="color:var(--text-muted);">${action.description}</p>
    <p class="text-xs mt-1 font-semibold" style="color:var(--mid);">${action.sdg}</p>
  `;

  const rightBlock = document.createElement('div');
  rightBlock.className = 'flex flex-col items-center gap-2 flex-shrink-0';
  rightBlock.innerHTML = `
    <div class="text-center leading-none">
      <span class="text-sm font-black" style="color:var(--green);">+${action.points}</span>
      <span class="block text-xs" style="color:var(--text-muted);">pt</span>
    </div>
    <div class="action-check" id="check-${action.id}" aria-hidden="true">
      <svg class="check-icon w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white">
        <path fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"/>
      </svg>
    </div>
  `;

  card.appendChild(iconWrap);
  card.appendChild(textBlock);
  card.appendChild(rightBlock);
  return card;
}

function updateDailySummary() {
  const completed = state.completedToday.length;
  const total     = ACTIONS.length;
  const pct       = total > 0 ? (completed / total) * 100 : 0;

  setTextContent('daily-score',         state.dailyPoints);
  setTextContent('completed-count',     `${completed} completate`);
  setTextContent('total-actions-count', `${total} totali`);

  const bar = document.getElementById('daily-progress-bar');
  if (bar) bar.style.width = `${pct}%`;

  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('it-IT', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  }
}

// ============================================================
// 14. COMPLETAMENTO AZIONE
// ============================================================

function completeAction(actionId) {
  if (state.completedToday.includes(actionId)) return;

  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) return;

  state.completedToday.push(actionId);
  state.dailyPoints  += action.points;
  state.totalPoints  += action.points;
  state.totalActions += 1;
  state.totalCo2     += action.co2g;
  state.totalWater   += action.waterL;

  saveState();

  markCardCompleted(actionId);
  spawnPointsPopup(actionId, action.points);
  updateHeaderScore();
  updateDailySummary();
  showToast(`+${action.points} pt — ${action.name}`);
}

function markCardCompleted(actionId) {
  const card = document.getElementById(`card-${actionId}`);
  if (!card) return;
  card.classList.add('completed');
  card.onclick = null;
}

function spawnPointsPopup(actionId, points) {
  const card = document.getElementById(`card-${actionId}`);
  if (!card) return;
  card.style.position = 'relative';
  const popup = document.createElement('span');
  popup.className   = 'points-popup';
  popup.textContent = `+${points} pt`;
  card.appendChild(popup);
  setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 1150);
}

// ============================================================
// 15. BADGE LOGIC
// ============================================================

function getCurrentBadge() {
  const pts = state.totalPoints;
  for (let i = BADGES.length - 1; i >= 0; i--) {
    if (pts >= BADGES[i].minPoints) return BADGES[i];
  }
  return BADGES[0];
}

function getNextBadge() {
  const current = getCurrentBadge();
  const idx = BADGES.findIndex(b => b.id === current.id);
  return idx < BADGES.length - 1 ? BADGES[idx + 1] : null;
}

// ============================================================
// 16. RENDERING — TAB PROGRESSI
// ============================================================

function renderProgressi() {
  const badge = getCurrentBadge();
  const next  = getNextBadge();

  const badgeCard = document.getElementById('badge-card');
  if (badgeCard) {
    badgeCard.className = `${badge.cardClass} rounded-3xl p-6 mt-2 mb-4 text-white relative overflow-hidden`;
  }

  setTextContent('badge-icon',      badge.icon);
  setTextContent('badge-title',     badge.name);
  setTextContent('badge-subtitle',  badge.subtitle);
  setTextContent('total-score-big', state.totalPoints);

  const levelBar = document.getElementById('level-bar');

  if (next) {
    setTextContent('next-badge-label',    `${next.name} ${next.icon}`);
    setTextContent('level-current-label', `${state.totalPoints} pt`);
    setTextContent('level-target-label',  `${next.minPoints} pt`);
    const progress = Math.min(
      ((state.totalPoints - badge.minPoints) / (next.minPoints - badge.minPoints)) * 100,
      100
    );
    if (levelBar) levelBar.style.width = `${progress.toFixed(1)}%`;
  } else {
    setTextContent('next-badge-label',    '🎉 Livello massimo raggiunto!');
    setTextContent('level-current-label', `${state.totalPoints} pt`);
    setTextContent('level-target-label',  'MAX');
    if (levelBar) levelBar.style.width = '100%';
  }

  setTextContent('stat-days',    state.activeDays);
  setTextContent('stat-actions', state.totalActions);

  const co2El = document.getElementById('stat-co2');
  if (co2El) {
    co2El.textContent = state.totalCo2 >= 1000
      ? `${(state.totalCo2 / 1000).toFixed(1)} kg`
      : `${state.totalCo2} g`;
  }

  setTextContent('stat-water', `${state.totalWater} L`);
}

// ============================================================
// 17. RENDERING — TAB CLASSIFICA
//     Legge i punteggi REALI di tutte le classi da localStorage
// ============================================================

function renderClassifica() {
  // Legge il punteggio reale di ogni classe dal localStorage
  const entries = ALL_CLASSES.map(cls => ({
    name:    cls.name,
    emoji:   cls.emoji,
    score:   readClassTotalPoints(cls.name),
    isUser:  cls.name === activeClass,
  }));

  // Ordina per punteggio decrescente
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => { e.position = i + 1; });

  renderPodium(entries);
  renderLeaderboardTable(entries);
}

function renderPodium(entries) {
  const container = document.getElementById('podium-container');
  if (!container) return;
  container.innerHTML = '';

  const top3 = entries.slice(0, 3);
  // Ordine visivo: 2° | 1° | 3°
  const visualOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const podiumConfig = [
    { heightPx: 88,  medal: '🥈', gradient: 'linear-gradient(to top, #9CA3AF, #D1D5DB)' },
    { heightPx: 120, medal: '🥇', gradient: 'linear-gradient(to top, #D97706, #FCD34D)' },
    { heightPx: 68,  medal: '🥉', gradient: 'linear-gradient(to top, #B45309, #F59E0B)' },
  ];

  visualOrder.forEach((entry, i) => {
    const cfg = podiumConfig[i];
    const col = document.createElement('div');
    col.className = 'podium-col flex flex-col items-center gap-1.5 flex-1';

    col.innerHTML = `
      <div class="text-center">
        <p class="text-xl leading-none mb-1">${cfg.medal}</p>
        <p class="text-sm font-bold leading-snug" style="${entry.isUser ? 'color:var(--green);' : 'color:#4B5563;'}">
          ${entry.name}${entry.isUser ? ' ★' : ''}
        </p>
        <p class="text-xs font-semibold text-gray-400">${entry.score} pt</p>
      </div>
      <div class="w-full rounded-t-xl flex items-start justify-center pt-2"
           style="height:${cfg.heightPx}px; background:${cfg.gradient};">
        <span style="font-family:'Playfair Display',serif; font-weight:900;
                     color:rgba(255,255,255,0.90); font-size:1.25rem;">
          ${entry.position}°
        </span>
      </div>
    `;

    container.appendChild(col);
  });
}

function renderLeaderboardTable(entries) {
  const table = document.getElementById('leaderboard-table');
  if (!table) return;
  table.innerHTML = '';

  const medals   = ['🥇', '🥈', '🥉'];
  const maxScore = Math.max(entries[0]?.score || 1, 1);

  entries.forEach(entry => {
    const pct = Math.max((entry.score / maxScore) * 100, 4).toFixed(1);
    const row = document.createElement('div');
    row.className = `lb-row px-4 py-3${entry.isUser ? ' lb-user-row' : ''}`;

    row.innerHTML = `
      <div class="flex items-center gap-3 mb-1.5">
        <span class="text-base w-6 text-center flex-shrink-0">
          ${entry.position <= 3 ? medals[entry.position - 1] : `${entry.position}°`}
        </span>
        <p class="font-bold text-sm flex-1" style="color:${entry.isUser ? 'var(--green)' : 'var(--text)'};">
          ${entry.name}
          ${entry.isUser ? '<span class="text-xs font-normal opacity-70"> (tu)</span>' : ''}
        </p>
        <p class="font-black text-sm flex-shrink-0"
           style="color:var(--forest); font-family:'Playfair Display',serif;">
          ${entry.score} pt
        </p>
      </div>
      <div class="ml-9 w-full rounded-full" style="height:6px; background:#F3F4F6;">
        <div class="bar-fill h-full"
             style="width:${pct}%; background:${entry.isUser ? 'var(--light)' : '#D1D5DB'};"></div>
      </div>
    `;

    table.appendChild(row);
  });
}

// ============================================================
// 18. MODAL — RESET
// ============================================================

function openResetModal() {
  // Aggiorna il sottotitolo con la classe corrente
  const sub = document.getElementById('reset-modal-subtitle');
  if (sub) sub.textContent = `Classe selezionata: ${activeClass}`;
  document.getElementById('reset-modal').classList.add('open');
}

function closeResetModal() {
  document.getElementById('reset-modal').classList.remove('open');
}

/**
 * Resetta solo le azioni giornaliere della classe attiva.
 * I punti totali rimangono invariati.
 */
function handleResetDaily() {
  state.completedToday = [];
  state.dailyPoints    = 0;
  saveState();
  closeResetModal();
  renderAzioni();
  updateHeaderScore();
  showToast(`Azioni di oggi resettate (${activeClass})`);
}

/**
 * Resetta COMPLETAMENTE tutti i dati della classe attiva.
 * Richiede conferma esplicita.
 */
function handleResetAll() {
  const confirmed = window.confirm(
    `Sei sicuro di voler azzerare tutti i dati e i punti della classe ${activeClass}?` +
    '\n\nQuesta operazione non può essere annullata.'
  );
  if (!confirmed) return;

  state = getDefaultState();
  state.lastDate = getTodayISO();
  saveState();
  closeResetModal();

  renderAzioni();
  updateHeaderScore();
  renderProgressi();
  renderClassifica();

  showToast(`Classe ${activeClass} azzerata`);
}

// ============================================================
// 19. TOAST
// ============================================================

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = `🌿 ${message}`;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, 2600);
}

// ============================================================
// 20. UTILITY
// ============================================================

function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ============================================================
// 21. INIZIALIZZAZIONE
// ============================================================

/**
 * Punto di ingresso dell'applicazione:
 * 1. Legge la classe selezionata dal localStorage
 * 2. Carica lo stato di quella classe
 * 3. Controlla il rollover giornaliero
 * 4. Renderizza tutta la UI
 */
function init() {
  loadSelectedClass();
  state = loadClassState(activeClass);
  checkDayRollover();

  renderHeaderClass();
  renderAzioni();
  updateHeaderScore();
}

document.addEventListener('DOMContentLoaded', init);
