/**
 * Quiz Culture G
 * ----------------
 * Le jeu charge les questions, filtre la difficulté choisie, mélange le
 * résultat et conserve les dix premières questions pour une manche unique.
 * Une question est donc utilisée au maximum une fois par manche.
 */
const state = {
    allQuestions: [],
    questions: [],
    index: 0,
    answers: new Map(),
    revealed: new Set(),
    difficulty: 1,
    hp: 3,
    maxHp: 3,
    roundLength: 10,
};

const ui = {
    loading: document.querySelector('#loading-screen'),
    container: document.querySelector('#container'),
    theme: document.querySelector('#theme-btn'),
    start: document.querySelector('#start-container'),
    startButton: document.querySelector('#start'),
    question: document.querySelector('#question-container'),
    final: document.querySelector('#final-screen'),
    difficulty: document.querySelector('#difficulty-select'),
    hp: document.querySelector('#hp-wrapper'),
    progress: document.querySelector('#progress'),
    progressContent: document.querySelector('#content'),
    questionContent: document.querySelector('#question-content'),
    choices: document.querySelector('#choices'),
    previous: document.querySelector('#prev-btn'),
    next: document.querySelector('#next-btn'),
    score: document.querySelector('#score'),
    hpStatus: document.querySelector('#hp-status'),
    finalMessage: document.querySelector('#final-message'),
    restart: document.querySelector('#restart'),
};

const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.12 6.12 0 0 1 15.5 4A4.5 4.5 0 0 1 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/** Affiche ou masque l'écran de chargement. */
function setLoading(isLoading) {
    ui.loading.classList.toggle('hidden', !isLoading);
    ui.loading.setAttribute('aria-busy', String(isLoading));
}

/** Laisse le loader visible assez longtemps pour éviter un flash d'interface. */
function waitForLoadingDelay() {
    return new Promise(resolve => setTimeout(resolve, 700));
}

/** Retourne une copie mélangée avec l'algorithme de Fisher-Yates. */
function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
    }
    return copy;
}

/** Met à jour les cœurs SVG sans créer de markup HTML interprétable. */
function renderHp() {
    ui.hp.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < state.maxHp; i++) {
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        heart.setAttribute('viewBox', '0 0 24 24');
        heart.setAttribute('class', `hp-heart ${i < state.hp ? 'active' : 'empty'}`);
        heart.setAttribute('aria-hidden', 'true');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', HEART_PATH);
        heart.appendChild(path);
        fragment.appendChild(heart);
    }

    ui.hp.appendChild(fragment);
    ui.hp.setAttribute('aria-label', `${state.hp} point${state.hp > 1 ? 's' : ''} de vie restant${state.hp > 1 ? 's' : ''}`);
}

/** Charge et valide minimalement le tableau des questions distant. */
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('impossible de charger les questions');

        const questions = await response.json();
        if (!Array.isArray(questions)) throw new Error('format de questions invalide');
        state.allQuestions = questions;
        return true;
    } catch (error) {
        console.error(error);
        ui.container.innerHTML = `<p class="error">Erreur : ${error.message}</p>`;
        return false;
    }
}

/** Sélectionne les questions accessibles pour la difficulté choisie. */
function getDifficultyPool() {
    return state.allQuestions.filter(question =>
        Number(question.difficulty) <= state.difficulty
    );
}

/** Prépare une manche aléatoire de dix questions maximum. */
function startGame() {
    const pool = shuffle(getDifficultyPool());
    const questionCount = Math.min(state.roundLength, pool.length);

    if (questionCount === 0) {
        ui.container.innerHTML = '<p class="error">Aucune question disponible pour cette difficulté.</p>';
        return;
    }

    state.questions = pool.slice(0, questionCount);
    state.index = 0;
    state.answers.clear();
    state.revealed.clear();
    state.hp = state.maxHp;
    renderHp();
    renderQuestion();
}

/** Affiche l'écran d'accueil et masque les autres écrans. */
function renderStart() {
    ui.difficulty.value = String(state.difficulty);
    ui.start.hidden = false;
    ui.question.hidden = true;
    ui.final.hidden = true;
}

/** Construit uniquement la question actuellement visible. */
function renderQuestion() {
    const question = state.questions[state.index];
    if (!question) {
        showResults();
        return;
    }

    ui.start.hidden = true;
    ui.question.hidden = false;
    ui.final.hidden = true;
    ui.progress.textContent = `Question ${state.index + 1} sur ${state.questions.length}`;
    ui.questionContent.textContent = question.question;
    ui.choices.replaceChildren();

    const answer = state.answers.get(state.index);
    const isRevealed = state.revealed.has(state.index);
    const fragment = document.createDocumentFragment();

    question.choices.forEach((choice, choiceIndex) => {
        const item = document.createElement('li');
        item.className = 'choice';
        item.tabIndex = isRevealed ? -1 : 0;
        item.dataset.index = String(choiceIndex);
        item.setAttribute('role', 'button');
        item.setAttribute('aria-pressed', String(answer === choiceIndex));

        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = String.fromCharCode(65 + choiceIndex);
        const text = document.createElement('span');
        text.className = 'text';
        text.textContent = choice;
        item.append(label, text);

        if (isRevealed) {
            item.style.pointerEvents = 'none';
            if (choiceIndex === question.answer) item.classList.add('correct');
            if (choiceIndex === answer && answer !== question.answer) item.classList.add('wrong');
        } else if (answer === choiceIndex) {
            item.classList.add('selected');
        }

        fragment.appendChild(item);
    });

    ui.choices.appendChild(fragment);
    ui.previous.disabled = true;
    ui.next.textContent = state.index === state.questions.length - 1 ? 'Terminer' : 'Suivant';
    ui.next.disabled = !isRevealed;
    updateProgress();
}

/** Met à jour la barre de progression de la manche. */
function updateProgress() {
    const progress = state.questions.length
        ? (state.revealed.size / state.questions.length) * 100
        : 0;
    ui.progressContent.style.width = `${progress}%`;
}

/** Enregistre une réponse, révèle la correction et retire un PV si besoin. */
function selectChoice(choiceIndex) {
    const question = state.questions[state.index];
    if (!question || state.revealed.has(state.index)) return;

    state.answers.set(state.index, choiceIndex);
    state.revealed.add(state.index);

    if (choiceIndex !== question.answer) {
        state.hp = Math.max(0, state.hp - 1);
        renderHp();
    }

    renderQuestion();
    if (state.hp <= 0) setTimeout(showResults, 350);
}

/** Passe à la question suivante ou affiche le résultat final. */
function next() {
    if (state.index === state.questions.length - 1) {
        showResults();
        return;
    }
    state.index++;
    renderQuestion();
}

function changeTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/** Affiche le score, les PV restants et le bilan de la manche. */
function showResults() {
    ui.start.hidden = true;
    ui.question.hidden = true;
    ui.final.hidden = false;

    const score = state.questions.reduce((total, question, index) =>
        total + Number(state.answers.get(index) === question.answer), 0);

    ui.score.textContent = `Vous avez obtenu ${score} / ${state.questions.length}`;
    ui.hpStatus.textContent = `PV restants : ${state.hp} / ${state.maxHp}`;
    ui.finalMessage.textContent = state.hp <= 0
        ? 'Partie terminée : vos PV sont à zéro.'
        : score === state.questions.length
            ? 'Parfait ! Toutes les réponses sont correctes.'
            : score >= state.questions.length / 2
                ? 'Bonne performance !'
                : 'La prochaine partie sera meilleure.';
}

function restart() {
    state.index = 0;
    state.answers.clear();
    state.revealed.clear();
    state.hp = state.maxHp;
    renderHp();
    updateProgress();
    renderStart();
}

function bindUI() {
    ui.theme.addEventListener('click', changeTheme);
    ui.startButton.addEventListener('click', startGame);
    ui.next.addEventListener('click', next);
    ui.restart.addEventListener('click', restart);
    ui.difficulty.addEventListener('change', event => {
        state.difficulty = Number(event.target.value);
    });

    // Un seul écouteur pour tous les choix, y compris ceux recréés à chaque question.
    ui.choices.addEventListener('click', event => {
        const choice = event.target.closest('.choice');
        if (choice) selectChoice(Number(choice.dataset.index));
    });

    ui.choices.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const choice = event.target.closest('.choice');
        if (!choice) return;
        event.preventDefault();
        selectChoice(Number(choice.dataset.index));
    });

    window.addEventListener('keydown', event => {
        if (/^[1-4]$/.test(event.key)) selectChoice(Number(event.key) - 1);
        if (event.key === 'ArrowRight') next();
    });
}

async function init() {
    setLoading(true);
    if (!await loadQuestions()) {
        setLoading(false);
        return;
    }

    bindUI();
    renderHp();
    await waitForLoadingDelay();
    setLoading(false);
    renderStart();
}

init();
