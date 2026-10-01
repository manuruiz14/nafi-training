// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll reveal animation
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Pilar selection + questionnaire
const WHATSAPP_NUMBER = '5493364378135';

const pilarCards = document.querySelectorAll('.pilar-card');
const quizSection = document.getElementById('cuestionario');
const quizPilar = document.getElementById('quiz-pilar');
const quizForm = document.getElementById('quiz-form');
const quizSteps = quizForm.querySelectorAll('.quiz-step');
const quizBar = document.getElementById('quiz-bar');
const quizCount = document.getElementById('quiz-count');
const quizError = document.getElementById('quiz-error');
const quizPrev = document.getElementById('quiz-prev');
const quizNext = document.getElementById('quiz-next');
const quizSubmit = document.getElementById('quiz-submit');
const quizDone = document.getElementById('quiz-done');
const quizWa = document.getElementById('quiz-wa');
const lesionesDetalle = document.getElementById('lesiones-detalle');
const lesionesCuales = document.getElementById('lesiones-cuales');

let selectedPilar = null;
let currentStep = 0;

function showStep(index) {
  currentStep = index;
  quizSteps.forEach((step, i) => { step.hidden = i !== index; });
  quizBar.style.width = `${((index + 1) / quizSteps.length) * 100}%`;
  quizCount.textContent = `Pregunta ${index + 1} de ${quizSteps.length}`;
  quizPrev.hidden = index === 0;
  quizNext.hidden = index === quizSteps.length - 1;
  quizSubmit.hidden = index !== quizSteps.length - 1;
  quizError.textContent = '';
  const field = quizSteps[index].querySelector('textarea, input[type="text"]');
  if (field && index > 0) field.focus({ preventScroll: true });
}

function validateStep(index) {
  const step = quizSteps[index];
  const radios = step.querySelectorAll('input[type="radio"]');

  if (radios.length) {
    const checked = step.querySelector('input[type="radio"]:checked');
    if (!checked) return 'Elegí una opción para continuar.';
    if (checked.name === 'lesiones' && checked.value === 'Sí' && !lesionesCuales.value.trim()) {
      lesionesCuales.focus();
      return 'Contanos cuáles son tus lesiones o molestias.';
    }
    return '';
  }

  const field = step.querySelector('textarea, input[type="text"]');
  if (!field.value.trim()) {
    field.focus();
    return 'Escribí tu respuesta para continuar.';
  }
  return '';
}

function selectPilar(card) {
  selectedPilar = card.dataset.pilar;
  pilarCards.forEach((c) => c.classList.toggle('is-selected', c === card));
  quizPilar.textContent = selectedPilar;

  quizForm.reset();
  lesionesDetalle.hidden = true;
  quizForm.hidden = false;
  quizDone.hidden = true;
  quizSection.hidden = false;
  showStep(0);

  quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  quizSteps[0].querySelector('input[type="text"]').focus({ preventScroll: true });
}

pilarCards.forEach((card) => {
  card.querySelector('.pilar-select').addEventListener('click', () => selectPilar(card));
});

document.getElementById('quiz-change').addEventListener('click', () => {
  document.getElementById('pilares').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

quizForm.querySelectorAll('input[name="lesiones"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    lesionesDetalle.hidden = radio.value !== 'Sí';
    quizError.textContent = '';
    if (radio.value === 'Sí') lesionesCuales.focus();
  });
});

quizNext.addEventListener('click', () => {
  const error = validateStep(currentStep);
  if (error) { quizError.textContent = error; return; }
  showStep(currentStep + 1);
});

quizPrev.addEventListener('click', () => showStep(currentStep - 1));

quizForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('input[type="text"]')) {
    e.preventDefault();
    quizNext.click();
  }
});

quizForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const error = validateStep(currentStep);
  if (error) { quizError.textContent = error; return; }

  const data = new FormData(quizForm);
  const lesiones = data.get('lesiones') === 'Sí'
    ? `Sí — ${data.get('lesionesCuales').trim()}`
    : 'No';

  const message = [
    '¡Hola Nafi! Quiero empezar a entrenar.',
    '',
    `*Plan elegido:* ${selectedPilar}`,
    '',
    `*1. ¿Cuál es tu nacionalidad?*\n${data.get('nacionalidad').trim()}`,
    '',
    `*2. ¿Cuál es tu objetivo?*\n${data.get('objetivo').trim()}`,
    '',
    `*3. ¿Cuántos días a la semana te gustaría entrenar?*\n${data.get('dias')}`,
    '',
    `*4. ¿Cuál es tu experiencia previa en entrenamiento?*\n${data.get('experiencia').trim()}`,
    '',
    `*5. ¿Dónde entrenás o entrenarías?*\n${data.get('lugar').trim()}`,
    '',
    `*6. ¿Tenés lesiones o molestias? ¿Cuáles son?*\n${lesiones}`,
    '',
    `*7. ¿Querés el plan con videollamadas?*\n${data.get('videollamadas')}`,
  ].join('\n');

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  quizWa.href = url;
  window.open(url, '_blank', 'noopener');

  quizForm.hidden = true;
  quizBar.style.width = '100%';
  quizCount.textContent = 'Cuestionario completado';
  quizDone.hidden = false;
});

document.getElementById('quiz-restart').addEventListener('click', () => {
  const card = [...pilarCards].find((c) => c.dataset.pilar === selectedPilar);
  selectPilar(card);
});
