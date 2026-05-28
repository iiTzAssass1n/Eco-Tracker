# 🌿 Eco-Tracker — Documentazione Tecnica

> **Progetto Capolavoro per l'Esame di Stato**  
> Classe 5BI · ITIP Luigi Bucci di Faenza  
> Materia: Informatica · Collegamento interdisciplinare: Educazione Civica (Agenda 2030 ONU)

---

## Indice

1. [Descrizione del progetto](#1-descrizione-del-progetto)
2. [Stack tecnologico](#2-stack-tecnologico)
3. [Struttura dei file](#3-struttura-dei-file)
4. [Come funziona il localStorage](#4-come-funziona-il-localstorage)
5. [Installazione e avvio](#5-installazione-e-avvio)
6. [Funzionalità principali](#6-funzionalità-principali)
7. [Architettura del codice](#7-architettura-del-codice)
8. [Collegamento con l'Agenda 2030](#8-collegamento-con-lagenda-2030)
9. [Possibili estensioni future](#9-possibili-estensioni-future)

---

## 1. Descrizione del progetto

**Eco-Tracker** è una web app responsive (ottimizzata per dispositivi mobili) che permette agli studenti di:

- **Tracciare** le proprie azioni sostenibili quotidiane (borraccia, bicicletta, raccolta differenziata, ecc.)
- **Accumulare punti** e sbloccare badge/livelli (Germoglio → Albero → Custode del Pianeta)
- **Visualizzare** i progressi personali e il confronto con altre classi dell'istituto

Il progetto collega l'informatica all'**Educazione Civica** attraverso i 17 Obiettivi di Sviluppo Sostenibile dell'Agenda 2030 dell'ONU (in particolare SDG 3, 6, 7, 12, 13, 14, 15).

---

## 2. Stack tecnologico

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **HTML5** | Standard W3C | Struttura semantica della pagina |
| **Tailwind CSS** | 3.x (via CDN) | Stile utility-first, layout responsive |
| **Vanilla JavaScript** | ES6+ | Logica dell'app, gestione DOM, persistenza |
| **localStorage API** | Web Storage API | Persistenza dei dati lato client |
| **Google Fonts** | Playfair Display + Nunito | Tipografia display e corpo testo |

> **Nessuna dipendenza back-end, nessun server, nessun database remoto.**  
> L'app funziona interamente nel browser, come file statici.

---

## 3. Struttura dei file

```
eco-tracker/
│
├── index.html   ← Struttura HTML, layout Tailwind, markup delle 3 sezioni
├── app.js       ← Tutta la logica JS: stato, localStorage, rendering, badge
└── README.md    ← Questa documentazione tecnica
```

La suddivisione segue il principio di **separazione delle responsabilità**:
- `index.html` si occupa solo di *cosa* mostrare (struttura e stile)
- `app.js` si occupa di *come* funziona (logica e dati)

---

## 4. Come funziona il localStorage

### Cos'è il localStorage

Il **localStorage** è una Web Storage API fornita dai browser moderni che consente di salvare dati in formato chiave-valore **in modo permanente** sul dispositivo dell'utente, senza bisogno di un server.

| Caratteristica | localStorage | sessionStorage | Cookie |
|---|---|---|---|
| Persistenza | Permanente (fino a cancellazione manuale) | Solo finché il tab è aperto | Configurabile (con scadenza) |
| Capacità | ~5 MB per origine | ~5 MB per origine | ~4 KB |
| Accesso lato server | ❌ No | ❌ No | ✅ Sì |
| Sincronizzazione tra tab | ✅ Sì | ❌ No | Dipende |

### Come viene usato in Eco-Tracker

L'intera applicazione usa **un'unica chiave** nel localStorage:

```
chiave: "ecotracker_v1"
valore: stringa JSON che rappresenta l'oggetto stato
```

#### Esempio di dati salvati

```json
{
  "totalPoints": 145,
  "dailyPoints": 45,
  "completedToday": ["borraccia", "differenziata", "luci"],
  "lastDate": "2025-06-15",
  "totalActions": 23,
  "activeDays": 7,
  "totalCo2": 12400,
  "totalWater": 245
}
```

### Le tre operazioni fondamentali

#### 1. Salvataggio (`saveState`)
```javascript
// Converte l'oggetto JavaScript in stringa JSON e lo salva
localStorage.setItem('ecotracker_v1', JSON.stringify(state));
```

#### 2. Caricamento (`loadState`)
```javascript
// Legge la stringa JSON e la converte di nuovo in oggetto JavaScript
const raw = localStorage.getItem('ecotracker_v1');
if (raw !== null) {
  state = Object.assign({}, state, JSON.parse(raw));
}
```

#### 3. Cancellazione (`handleResetAll`)
```javascript
// Sovrascrive i dati con lo stato iniziale vuoto
localStorage.setItem('ecotracker_v1', JSON.stringify(statoIniziale));
```

### Reset giornaliero automatico

Ogni volta che l'app viene aperta, la funzione `checkDayRollover()` confronta la data salvata (`lastDate`) con la data odierna:

```javascript
function checkDayRollover() {
  const today = getTodayISO(); // es. "2025-06-15"
  if (state.lastDate !== today) {
    // Nuovo giorno: resetta le azioni giornaliere
    // ma mantiene il punteggio totale accumulato
    state.completedToday = [];
    state.dailyPoints    = 0;
    state.lastDate       = today;
    saveState();
  }
}
```

Questo garantisce che ogni giorno le azioni siano nuovamente disponibili, mentre i punti totali rimangono.

---

## 5. Installazione e avvio

### Requisiti

- Un **browser moderno** (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Nessun server web, nessuna installazione di Node.js o altri strumenti

### Procedura

1. **Scaricare** (o copiare) i tre file nella stessa cartella:
   ```
   eco-tracker/
   ├── index.html
   ├── app.js
   └── README.md
   ```

2. **Aprire** `index.html` con doppio clic (si apre nel browser predefinito)

   Oppure, per una migliore esperienza di sviluppo, usare l'estensione **Live Server** di VS Code:
   - Installare l'estensione "Live Server" su VS Code
   - Tasto destro su `index.html` → "Open with Live Server"

3. L'app è immediatamente funzionante. **Non è necessaria una connessione internet** una volta che i font e Tailwind sono stati cachati (la prima apertura richiede connessione per caricarli dal CDN).

### Note per l'uso offline completo

Per un utilizzo completamente offline, è possibile:
- Scaricare Tailwind CSS come file locale e modificare il `<script src>` in `index.html`
- Scaricare i font Google e usare `@font-face` in CSS

---

## 6. Funzionalità principali

### Tab 1 — Checklist Azioni

| Azione | Punti | SDG Collegati |
|---|---|---|
| 🚰 Borraccia riutilizzabile | +10 pt | SDG 6, 14 |
| 🚴 Piedi o bicicletta | +20 pt | SDG 3, 13 |
| ♻️ Raccolta differenziata | +15 pt | SDG 11, 12 |
| 💡 Luci e stand-by spenti | +10 pt | SDG 7, 13 |
| 🛍️ Borsa riutilizzabile | +10 pt | SDG 12, 14 |
| 🥗 Pasto vegetariano | +20 pt | SDG 13, 15 |
| 🚿 Doccia breve (< 5 min) | +15 pt | SDG 6 |

- Ogni azione può essere registrata **una sola volta al giorno**
- Il punteggio è **cumulativo** e persiste tra sessioni diverse
- Le card completate vengono visivamente disabilitate con animazione

### Tab 2 — Dashboard Progressi

**Sistema di badge dinamici:**

| Badge | Soglia punti | Descrizione |
|---|---|---|
| 🌱 Germoglio | 0 – 50 pt | Livello iniziale |
| 🌳 Albero | 51 – 150 pt | Livello intermedio |
| 🌍 Custode del Pianeta | > 150 pt | Livello massimo |

Statistiche mostrate:
- Giorni attivi (giorni in cui almeno un'azione è stata svolta)
- Azioni totali completate lifetime
- CO₂ simbolicamente risparmiata (in grammi o kg)
- Acqua simbolicamente risparmiata (in litri)

### Tab 3 — Classifica Simulata

- La classe 5BI (utente) viene posizionata in base al punteggio reale accumulato
- Le altre 3 classi (5AI, 4BI, 3CI) hanno punteggi simulati fissi con una piccola variazione deterministica
- Vengono mostrati: podio grafico (top 3) e tabella completa con barra proporzionale

---

## 7. Architettura del codice

### Pattern: State Management semplice

```
STATO (oggetto JS in memoria)
     │
     ├──▶ saveState()  ──▶  localStorage (persistenza)
     │
     └──▶ render*()    ──▶  DOM (visualizzazione)
```

Ogni azione dell'utente:
1. Aggiorna `state` (oggetto in memoria)
2. Chiama `saveState()` (scrive in localStorage)
3. Chiama le funzioni `render*()` per aggiornare la UI

### Funzioni principali in app.js

| Funzione | Responsabilità |
|---|---|
| `init()` | Punto di ingresso, chiamata a DOMContentLoaded |
| `loadState()` | Legge dal localStorage e ripristina lo stato |
| `saveState()` | Serializza e scrive lo stato nel localStorage |
| `checkDayRollover()` | Resetta i dati giornalieri se è cambiato il giorno |
| `renderAzioni()` | Genera le card delle azioni nel DOM |
| `completeAction(id)` | Registra un'azione, aggiorna stato e UI |
| `renderProgressi()` | Aggiorna badge, barre, statistiche |
| `renderClassifica()` | Costruisce podio e tabella della classifica |
| `getCurrentBadge()` | Calcola il badge attivo in base ai punti |
| `showToast(msg)` | Mostra notifica temporanea a schermo |
| `openResetModal()` / `closeResetModal()` | Gestisce il dialog di reset |
| `handleResetDaily()` | Azzera le azioni del giorno corrente |
| `handleResetAll()` | Azzera completamente tutti i dati |

---

## 8. Gestione multi-classe

### Come funziona la selezione della classe

Ogni classe ha la propria area di dati **completamente indipendente** nel localStorage:

| Classe selezionata | Chiave localStorage |
|---|---|
| 5BI | `ecotracker_v1_5BI` |
| 5AI | `ecotracker_v1_5AI` |
| 4BI | `ecotracker_v1_4BI` |
| 3CI | `ecotracker_v1_3CI` |

La classe attiva è memorizzata separatamente nella chiave `ecotracker_selected_class`.

### Cambiare classe

1. Tocca il nome della classe nell'header (es. **5BI ▾**)
2. Si apre il selettore con tutte le classi e i loro punteggi attuali
3. Seleziona la classe desiderata → la UI si aggiorna automaticamente

### Classifica con punteggi reali

La classifica legge i punteggi reali di ogni classe dal localStorage senza sovrascrivere lo stato attivo:

```javascript
function readClassTotalPoints(className) {
  const s = loadClassState(className);
  return s.totalPoints;
}
```

### Reset

Il reset agisce **solo sulla classe attiva**. Le altre classi non vengono toccate.

---

## 9. Collegamento con l'Agenda 2030

Il progetto si inserisce nel contesto dell'**Educazione Civica** attraverso il collegamento diretto con i **17 Obiettivi di Sviluppo Sostenibile (SDGs)** dell'Agenda 2030 delle Nazioni Unite:

- **SDG 3** (Salute e benessere) → spostarsi a piedi o in bici
- **SDG 6** (Acqua pulita) → borraccia riutilizzabile, doccia breve
- **SDG 7** (Energia pulita) → luci e stand-by spenti
- **SDG 11** (Città sostenibili) → raccolta differenziata
- **SDG 12** (Consumo responsabile) → borsa riutilizzabile, differenziata
- **SDG 13** (Lotta al cambiamento climatico) → mobilità sostenibile, alimentazione
- **SDG 14 & 15** (Vita sott'acqua, sulla terra) → riduzione plastica

L'app dimostra come la **gamification** (punti, badge, classifica) possa essere uno strumento efficace per incentivare comportamenti sostenibili tra i giovani, tema collegabile alle ricerche in **behavioral economics** e **nudge theory** (Thaler & Sunstein, 2008).

---

## 9. Possibili estensioni future

| Estensione | Tecnologia richiesta |
|---|---|
| Sincronizzazione tra dispositivi | Backend (Node.js + database) o Firebase |
| Notifiche push giornaliere | Service Worker + Push API |
| Grafico storico progressi | Chart.js o D3.js |
| Modalità classe reale (più studenti) | Autenticazione + database condiviso |
| Export PDF del report | jsPDF o stampa CSS (`@media print`) |
| PWA (installabile su mobile) | Service Worker + manifest.json |

---

## Note per la Commissione

> L'applicazione può essere dimostrata direttamente aprendo `index.html` in qualsiasi browser.  
> I dati vengono salvati automaticamente nel browser utilizzato per la demo.  
> Per vedere l'app "da zero", utilizzare la funzione **Reset completo** (icona 🔄 in alto a destra) oppure aprire una **finestra in modalità privata/anonima** del browser, che non condivide il localStorage con le sessioni normali.

---

*Documentazione generata per il Progetto Capolavoro — Esame di Stato · Classe 5BI · ITIP Luigi Bucci di Faenza*
