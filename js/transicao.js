/* transicao.js — Tela de transição com countdown antes do Meet */

import { construirUrlMeet } from './lib/redirect.js';

const DURACAO = 5; // segundos

const nomeEl = document.getElementById('transicao-nome');
const numEl = document.getElementById('countdown-num');
const ringEl = document.getElementById('countdown-ring');
const fallbackBtn = document.getElementById('btn-fallback');

// Lê parâmetros da URL
const params = new URLSearchParams(window.location.search);
const codigo = params.get('codigo') || '';
const nome = params.get('nome') || 'Sala';

if (!codigo) {
  window.location.href = 'index.html';
}

// Exibe nome da sala
nomeEl.textContent = nome;

// URL do Meet
const meetUrl = construirUrlMeet(codigo);

// Configura ring SVG
const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52
ringEl.style.strokeDasharray = CIRCUMFERENCE;
ringEl.style.strokeDashoffset = '0';

// Exibe botão fallback após 1s (caso redirect falhe)
let fallbackTimer = setTimeout(() => {
  fallbackBtn.href = meetUrl;
  fallbackBtn.classList.remove('hidden');
}, 1000);

// Countdown
let restante = DURACAO;
numEl.textContent = restante;

const intervalo = setInterval(() => {
  restante--;
  numEl.textContent = restante;

  // Anima ring
  const progresso = (DURACAO - restante) / DURACAO;
  ringEl.style.strokeDashoffset = CIRCUMFERENCE * progresso;

  if (restante <= 0) {
    clearInterval(intervalo);
    window.location.href = meetUrl;
  }
}, 1000);

// Cleanup
window.addEventListener('pagehide', () => {
  clearInterval(intervalo);
  clearTimeout(fallbackTimer);
});
