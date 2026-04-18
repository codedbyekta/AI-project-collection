/**
 * AI Flashcard Generator — script.js
 * Pure Vanilla JS, no API, no libraries.
 */

'use strict';

/* ══════════════════════════════════════════
   DATA: Template Banks
══════════════════════════════════════════ */

/**
 * Question templates per difficulty.
 * {T} → replaced with the topic at runtime.
 */
const QUESTION_TEMPLATES = {
  easy: [
    "What is {T}?",
    "Can you define {T} in simple terms?",
    "Give a basic example of {T}.",
    "Why do people study {T}?",
    "Name one key idea related to {T}.",
    "Where does {T} commonly appear in everyday life?",
    "Describe {T} to a beginner.",
    "What word comes to mind when you think of {T}?",
    "List one benefit of understanding {T}.",
    "Fill in the blank: '{T} is best described as ___.'",
  ],
  medium: [
    "What are the key components of {T}?",
    "How does {T} work in practice?",
    "Explain the main purpose of {T}.",
    "What distinguishes {T} from similar concepts?",
    "Why is {T} considered important in its field?",
    "Describe the relationship between {T} and its surrounding context.",
    "What problem does {T} solve?",
    "In what real-world scenario would {T} be applied?",
    "Summarize {T} in three key points.",
    "What are common misconceptions about {T}?",
  ],
  hard: [
    "Critically evaluate the significance of {T} and its long-term implications.",
    "Compare and contrast {T} with an alternative approach.",
    "What are the limitations or drawbacks of {T}?",
    "Explain the theoretical foundation underlying {T}.",
    "How has the understanding of {T} evolved over time?",
    "Propose an innovative application of {T} that hasn't been widely explored.",
    "What ethical considerations arise when dealing with {T}?",
    "Analyze the cause-and-effect relationship within {T}.",
    "Describe a scenario where {T} could fail and why.",
    "How would an expert differentiate between a shallow and deep understanding of {T}?",
  ],
};

/**
 * Answer openers – randomised to add variety.
 */
const ANSWER_OPENERS = [
  "In essence,",
  "Simply put,",
  "To put it briefly,",
  "At its core,",
  "Fundamentally,",
  "In the context of this topic,",
  "When examining this carefully,",
  "From a conceptual standpoint,",
];

/**
 * Answer body fragments – mixed with the topic name for believable filler.
 */
const ANSWER_BODIES = [
  "{T} refers to a foundational concept where core principles are applied systematically to achieve a desired outcome.",
  "{T} is understood as a structured set of ideas or processes that form the basis for further exploration and understanding.",
  "{T} can be explained as an organised framework that highlights essential elements within its domain of study.",
  "{T} encapsulates a series of interrelated ideas whose combined effect produces meaningful and measurable results.",
  "{T} is best viewed as a system of knowledge that helps practitioners solve problems and make informed decisions.",
  "{T} represents a paradigm where observable patterns are analysed and interpreted to draw reliable conclusions.",
  "{T} denotes a methodical approach to understanding complex phenomena, often broken down into digestible components.",
  "{T} embodies principles that, when applied correctly, lead to consistent and reproducible outcomes.",
];

/**
 * Answer closers – add a final helpful sentence.
 */
const ANSWER_CLOSERS = [
  "A solid grasp of this topic forms the foundation for more advanced study.",
  "Understanding this thoroughly will significantly enhance your broader knowledge.",
  "Mastering this concept opens doors to numerous related areas of expertise.",
  "This knowledge is widely regarded as essential for anyone studying this field.",
  "Practitioners rely on this understanding to guide real-world decisions.",
  "This is one of the key pillars that supports deeper investigation of the subject.",
];

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
const state = {
  topic:       '',
  difficulty:  'medium',
  count:       7,
  cards:       [],   // array of { question, answer, revealed }
  isLoading:   false,
  revealAll:   false,
};

/* ══════════════════════════════════════════
   DOM REFERENCES
══════════════════════════════════════════ */
const DOM = {
  html:          document.documentElement,
  themeToggle:   document.getElementById('theme-toggle'),
  themeIcon:     document.getElementById('theme-icon'),
  topicInput:    document.getElementById('topic-input'),
  charCount:     document.getElementById('char-count'),
  inputError:    document.getElementById('input-error'),
  difficultySelect: document.getElementById('difficulty-select'),
  countSelect:   document.getElementById('count-select'),
  generateBtn:   document.getElementById('generate-btn'),
  statusArea:    document.getElementById('status-area'),
  resultsSection: document.getElementById('results-section'),
  resultsTitle:  document.getElementById('results-title'),
  resultsBadge:  document.getElementById('results-badge'),
  shuffleBtn:    document.getElementById('shuffle-btn'),
  regenerateBtn: document.getElementById('regenerate-btn'),
  revealAllBtn:  document.getElementById('reveal-all-btn'),
  progressBar:   document.getElementById('progress-bar'),
  progressLabel: document.getElementById('progress-label'),
  cardsGrid:     document.getElementById('cards-grid'),
};

/* ══════════════════════════════════════════
   UTILITY HELPERS
══════════════════════════════════════════ */

/** Pick a random element from an array */
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffle an array in-place (Fisher–Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Title-case a string */
function toTitleCase(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* ══════════════════════════════════════════
   CORE: FLASHCARD GENERATION
══════════════════════════════════════════ */

/**
 * Generate `count` flashcards for a given topic and difficulty.
 * @param {string} topic
 * @param {'easy'|'medium'|'hard'} difficulty
 * @param {number} count
 * @returns {Array<{question:string, answer:string, revealed:boolean}>}
 */
function generateFlashcards(topic, difficulty, count) {
  const T = toTitleCase(topic);
  const templates = [...QUESTION_TEMPLATES[difficulty]];
  shuffle(templates);

  const cards = [];
  const usedQuestions = new Set();

  for (let i = 0; i < Math.min(count, templates.length); i++) {
    let question = templates[i].replace(/\{T\}/g, T);

    // Deduplicate just in case
    if (usedQuestions.has(question)) continue;
    usedQuestions.add(question);

    const answer = buildAnswer(T);
    cards.push({ question, answer, revealed: false });
  }

  return cards;
}

/**
 * Builds a varied placeholder answer for a topic.
 * @param {string} T – title-cased topic
 * @returns {string}
 */
function buildAnswer(T) {
  const opener = randomFrom(ANSWER_OPENERS);
  const body   = randomFrom(ANSWER_BODIES).replace(/\{T\}/g, T);
  const closer = randomFrom(ANSWER_CLOSERS);
  return `${opener} ${body} ${closer}`;
}

/* ══════════════════════════════════════════
   CORE: PROGRESS TRACKING
══════════════════════════════════════════ */

function updateProgress() {
  const total    = state.cards.length;
  const revealed = state.cards.filter(c => c.revealed).length;
  const pct      = total === 0 ? 0 : Math.round((revealed / total) * 100);

  DOM.progressBar.style.width  = `${pct}%`;
  DOM.progressLabel.textContent = `${revealed} / ${total} revealed`;

  // Update reveal-all button label
  const allRevealed = revealed === total;
  DOM.revealAllBtn.innerHTML = allRevealed
    ? '<span aria-hidden="true">🙈</span> Hide All'
    : '<span aria-hidden="true">👁️</span> Reveal All';
  state.revealAll = allRevealed;
}

/* ══════════════════════════════════════════
   RENDERING
══════════════════════════════════════════ */

/**
 * Render all flashcards to the DOM.
 */
function renderCards() {
  DOM.cardsGrid.innerHTML = '';

  state.cards.forEach((card, index) => {
    const el = createCardElement(card, index);
    DOM.cardsGrid.appendChild(el);
  });

  updateProgress();
}

/**
 * Create a single flashcard DOM element.
 * @param {{question:string, answer:string, revealed:boolean}} card
 * @param {number} index
 * @returns {HTMLElement}
 */
function createCardElement(card, index) {
  const article = document.createElement('article');
  article.className = 'flashcard' + (card.revealed ? ' revealed' : '');
  article.setAttribute('role', 'listitem');
  article.setAttribute('aria-label', `Flashcard ${index + 1}: ${card.question}`);
  article.setAttribute('tabindex', '0');
  article.dataset.index = index;

  const diffLabel = {
    easy:   '🟢 Easy',
    medium: '🟡 Medium',
    hard:   '🔴 Hard',
  }[state.difficulty];

  article.innerHTML = `
    <span class="card-number">#${String(index + 1).padStart(2, '0')}</span>
    <div class="card-difficulty ${state.difficulty}">${diffLabel}</div>
    <p class="card-question">${escapeHTML(card.question)}</p>
    <div class="card-hint">
      <i class="hint-chevron" aria-hidden="true">▾</i>
      <span>${card.revealed ? 'Hide answer' : 'Tap to reveal answer'}</span>
    </div>
    <div class="card-answer" aria-live="polite">
      <div class="card-answer-inner">${escapeHTML(card.answer)}</div>
    </div>
  `;

  // Click + keyboard toggle
  article.addEventListener('click',   () => toggleCard(index));
  article.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard(index);
    }
  });

  return article;
}

/**
 * Toggle a card's revealed state.
 * @param {number} index
 */
function toggleCard(index) {
  state.cards[index].revealed = !state.cards[index].revealed;

  // Update this single card in the DOM without full re-render
  const cardEl = DOM.cardsGrid.querySelector(`[data-index="${index}"]`);
  if (!cardEl) return;

  const isRevealed = state.cards[index].revealed;
  cardEl.classList.toggle('revealed', isRevealed);

  const hintSpan = cardEl.querySelector('.card-hint span');
  if (hintSpan) {
    hintSpan.textContent = isRevealed ? 'Hide answer' : 'Tap to reveal answer';
  }

  updateProgress();
}

/**
 * Escape HTML to avoid XSS when injecting user input.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ══════════════════════════════════════════
   UI STATE HELPERS
══════════════════════════════════════════ */

function showLoading() {
  DOM.statusArea.innerHTML = `
    <div class="loading-pill" role="status">
      <div class="spinner" aria-hidden="true"></div>
      Generating flashcards for "<strong>${escapeHTML(toTitleCase(state.topic))}</strong>"…
    </div>
  `;
  DOM.resultsSection.hidden = true;
}

function clearLoading() {
  DOM.statusArea.innerHTML = '';
}

function showError(msg) {
  DOM.inputError.innerHTML = `<span aria-hidden="true">⚠️</span> ${msg}`;
  DOM.topicInput.focus();
  // Shake animation
  DOM.topicInput.classList.add('shake');
  DOM.topicInput.addEventListener('animationend', () => {
    DOM.topicInput.classList.remove('shake');
  }, { once: true });
}

function clearError() {
  DOM.inputError.textContent = '';
}

function showResults() {
  const T = toTitleCase(state.topic);
  const diffEmoji = { easy: '🟢', medium: '🟡', hard: '🔴' }[state.difficulty];

  DOM.resultsTitle.textContent = `Flashcards for "${T}"`;
  DOM.resultsBadge.textContent = `${diffEmoji} ${state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1)} · ${state.cards.length} cards`;

  DOM.resultsSection.hidden = false;
  renderCards();

  // Smooth scroll to results
  DOM.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════
   EVENT HANDLERS
══════════════════════════════════════════ */

/**
 * Main generation handler – validates input, shows loading, then renders.
 */
async function handleGenerate() {
  clearError();

  const rawTopic = DOM.topicInput.value.trim();

  // ── Validation ──
  if (!rawTopic) {
    showError('Please enter a topic to generate flashcards.');
    return;
  }
  if (rawTopic.length < 2) {
    showError('Topic must be at least 2 characters long.');
    return;
  }

  state.topic      = rawTopic;
  state.difficulty = DOM.difficultySelect.value;
  state.count      = parseInt(DOM.countSelect.value, 10);
  state.revealAll  = false;

  // ── Loading state ──
  DOM.generateBtn.disabled = true;
  showLoading();

  // ── Simulate AI delay (0.9 – 1.6s) ──
  const delay = 900 + Math.random() * 700;

  await new Promise(resolve => setTimeout(resolve, delay));

  // ── Generate ──
  state.cards = generateFlashcards(state.topic, state.difficulty, state.count);

  clearLoading();
  DOM.generateBtn.disabled = false;
  showResults();
}

/** Shuffle currently displayed cards */
function handleShuffle() {
  if (state.cards.length === 0) return;
  shuffle(state.cards);
  renderCards();
}

/** Regenerate with same topic/settings */
function handleRegenerate() {
  if (!state.topic) return;
  handleGenerate();
}

/** Reveal or hide all card answers */
function handleRevealAll() {
  if (state.cards.length === 0) return;

  const reveal = !state.revealAll;
  state.cards.forEach(c => (c.revealed = reveal));

  // Update DOM
  DOM.cardsGrid.querySelectorAll('.flashcard').forEach((el, i) => {
    el.classList.toggle('revealed', reveal);
    const hintSpan = el.querySelector('.card-hint span');
    if (hintSpan) {
      hintSpan.textContent = reveal ? 'Hide answer' : 'Tap to reveal answer';
    }
  });

  updateProgress();
}

/** Theme toggle */
function handleThemeToggle() {
  const isDark = DOM.html.getAttribute('data-theme') === 'dark';
  DOM.html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  DOM.themeIcon.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('flashai-theme', isDark ? 'light' : 'dark');
}

/** Live character counter for topic input */
function handleInputChange() {
  const len = DOM.topicInput.value.length;
  DOM.charCount.textContent = `${len}/100`;
  if (len > 80) {
    DOM.charCount.style.color = '#ff7070';
  } else {
    DOM.charCount.style.color = '';
  }
  // Clear error as user types
  if (DOM.inputError.textContent) clearError();
}

/* ══════════════════════════════════════════
   KEYBOARD SHORTCUT
══════════════════════════════════════════ */
function handleGlobalKeydown(e) {
  // Enter in the topic input triggers generate
  if (e.target === DOM.topicInput && e.key === 'Enter') {
    e.preventDefault();
    handleGenerate();
  }
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */

/**
 * Restore saved theme from localStorage.
 */
function restoreTheme() {
  const saved = localStorage.getItem('flashai-theme');
  if (saved) {
    DOM.html.setAttribute('data-theme', saved);
    DOM.themeIcon.textContent = saved === 'dark' ? '☀️' : '🌙';
  }
}

/**
 * Attach all event listeners.
 */
function attachEvents() {
  DOM.generateBtn.addEventListener('click',   handleGenerate);
  DOM.shuffleBtn.addEventListener('click',    handleShuffle);
  DOM.regenerateBtn.addEventListener('click', handleRegenerate);
  DOM.revealAllBtn.addEventListener('click',  handleRevealAll);
  DOM.themeToggle.addEventListener('click',   handleThemeToggle);
  DOM.topicInput.addEventListener('input',    handleInputChange);
  document.addEventListener('keydown',        handleGlobalKeydown);
}

/**
 * Entry point.
 */
function init() {
  restoreTheme();
  attachEvents();
  DOM.topicInput.focus();
  console.info('%cFlashAI ready ⚡ — Pure JS, zero APIs.', 'color:#7c6aff;font-weight:bold;font-size:13px;');
}

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', init);

/* ══════════════════════════════════════════
   CSS INJECTION: shake animation
   (kept in JS to avoid extra CSS file noise)
══════════════════════════════════════════ */
(function injectShakeCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    .shake { animation: shake 0.4s ease; }
  `;
  document.head.appendChild(style);
})();
