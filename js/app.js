/* app.js — Orquestrador: event listeners e init */

import { formatarCodigo, extrairCodigo } from './lib/code.js';
import { carregarSalas, salvarSalas } from './storage.js';
import { salvarSeNovo, renomearSala, removerSala, buscarSalaPorCodigo, moverParaTopo } from './lib/rooms.js';
import { toast } from './components/toast.js';
import { renderizarSalas, modalRenomear, modalRemover, modalAjuda } from './components/room-card.js';

// ── DOM ──────────────────────────────────────────────────

const input = document.getElementById('codigo-input');
const btnEntrar = document.getElementById('btn-entrar');
const btnColar = document.getElementById('btn-colar');
const feedback = document.getElementById('feedback');
const btnAjuda = document.getElementById('btn-ajuda');

// ── Helpers ──────────────────────────────────────────────

function setFeedback(msg, tipo) {
  feedback.textContent = msg;
  feedback.className = 'feedback ' + (tipo || '');
}

function redirecionar(codigo, nomeSala) {
  // Move sala clicada para o topo da lista
  const salas = carregarSalas();
  const atualizadas = moverParaTopo(salas, codigo);
  salvarSalas(atualizadas);

  // Salva dados da sala para a tela de transição via sessionStorage
  sessionStorage.setItem('transicao_codigo', codigo);
  sessionStorage.setItem('transicao_nome', nomeSala || 'Sala');

  setFeedback('Abrindo ' + (nomeSala || 'sala') + '…', 'ok');
  btnEntrar.disabled = true;

  window.location.href = 'transicao.html';
}

// ── Salas: callbacks para o componente room-card ─────────

function atualizarSalas() {
  const salas = carregarSalas();
  renderizarSalas(salas, redirecionar, handleRenomear, handleRemover);
}

function handleRenomear(idx, nomeAtual) {
  modalRenomear(idx, nomeAtual, (novoNome) => {
    const salas = carregarSalas();
    const atualizadas = renomearSala(salas, idx, novoNome);
    salvarSalas(atualizadas);
    atualizarSalas();
  });
}

function handleRemover(idx, nome) {
  modalRemover(nome, () => {
    const salas = carregarSalas();
    const atualizadas = removerSala(salas, idx);
    salvarSalas(atualizadas);
    atualizarSalas();
    toast('Sala removida', 'info');
  });
}

// ── Entrar ───────────────────────────────────────────────

function aoEntrar() {
  const raw = input.value.trim();
  if (!raw) {
    setFeedback('Digite ou cole o código da sala', 'erro');
    return;
  }

  const codigo = extrairCodigo(raw);
  if (!codigo) {
    setFeedback('Ops, esse código parece incompleto', 'erro');
    return;
  }

  setFeedback('', '');
  input.value = formatarCodigo(codigo);

  const salas = carregarSalas();
  const existente = buscarSalaPorCodigo(salas, codigo);
  const nome = existente ? existente.nome : null;

  const { salas: atualizadas } = salvarSeNovo(salas, codigo);
  salvarSalas(atualizadas);
  atualizarSalas();

  redirecionar(codigo, nome);
}

// ── Input: formatação + colar ────────────────────────────

input.addEventListener('input', () => {
  const pos = input.selectionStart;
  const antes = input.value.length;
  input.value = formatarCodigo(input.value);
  const diff = input.value.length - antes;
  input.setSelectionRange(pos + diff, pos + diff);
});

btnColar.addEventListener('click', async () => {
  try {
    const texto = await navigator.clipboard.readText();
    if (texto) {
      input.value = texto;
      input.dispatchEvent(new Event('input'));
    }
  } catch {
    setFeedback('Cole manualmente segurando o dedo no campo', '');
  }
});

btnEntrar.addEventListener('click', aoEntrar);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') aoEntrar();
});

// ── Ajuda ────────────────────────────────────────────────

btnAjuda.addEventListener('click', modalAjuda);

// ── Init ─────────────────────────────────────────────────
atualizarSalas();
