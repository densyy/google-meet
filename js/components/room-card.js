/* components/room-card.js — Componente: card de sala com ações */

import { modal } from './modal.js';
import { toast } from './toast.js';
import { construirUrlMeet } from '../lib/redirect.js';

/**
 * Escapa HTML para inserção segura
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Copia link da sala para clipboard
 * @param {{ nome: string, codigo: string }} sala
 */
function copiarLink(sala) {
  const url = construirUrlMeet(sala.codigo);
  navigator.clipboard.writeText(url).then(() => {
    toast('Link copiado!', 'ok');
  }).catch(() => {
    toast('Não foi possível copiar', 'erro');
  });
}

/**
 * Abre modal de renomear sala
 * @param {number} idx
 * @param {string} nomeAtual
 * @param {Function} onConfirmar - callback(novoNome)
 */
export function modalRenomear(idx, nomeAtual, onConfirmar) {
  const inputNome = document.createElement('input');
  inputNome.type = 'text';
  inputNome.value = nomeAtual;
  inputNome.maxLength = 30;
  inputNome.autocomplete = 'off';

  const wrapper = document.createElement('div');
  wrapper.innerHTML = '<label for="input-renomear">Nome da sala</label>';
  wrapper.appendChild(inputNome);

  modal({
    titulo: 'Renomear sala',
    conteudo: wrapper,
    botoes: [
      { texto: 'Cancelar', classe: 'btn-modal-cancelar' },
      { texto: 'Pronto', classe: 'btn-modal-ok', onClick: () => {
        const novoNome = inputNome.value.trim();
        if (novoNome) onConfirmar(novoNome);
      }}
    ]
  });

  setTimeout(() => { inputNome.focus(); inputNome.select(); }, 100);
}

/**
 * Abre modal de confirmação de remoção
 * @param {string} nome
 * @param {Function} onConfirmar
 */
export function modalRemover(nome, onConfirmar) {
  modal({
    titulo: 'Remover sala',
    conteudo: 'Tem certeza que deseja remover "' + nome + '"?',
    botoes: [
      { texto: 'Não', classe: 'btn-modal-cancelar' },
      { texto: 'Remover', classe: 'btn-modal-danger', onClick: onConfirmar }
    ]
  });
}

/**
 * Abre modal de ajuda
 */
export function modalAjuda() {
  const conteudo = document.createElement('div');
  conteudo.innerHTML = `
    <ol class="ajuda-passos">
      <li>Alguém te envia o código numa mensagem.</li>
      <li>O código é composto por letras e números, separados por hífens.</li>
      <li>Digite ou cole o código na tela e toque <strong>Entrar</strong>.</li>
    </ol>
    <div class="ajuda-exemplo">
      <p class="ajuda-exemplo-label">Exemplo de código:</p>
      <p class="ajuda-exemplo-url">meet.google.com/<span class="ajuda-exemplo-codigo">abc-defg-hij</span></p>
      <p class="ajuda-exemplo-hint">A parte colorida é o código que você precisa digitar.</p>
    </div>
  `;

  modal({
    titulo: 'Onde encontro esse código?',
    conteudo: conteudo,
    botoes: [{ texto: 'Entendi', classe: 'btn-modal-ok' }]
  });
}

/**
 * Renderiza lista de salas no DOM
 * @param {Array<{nome: string, codigo: string}>} salas
 * @param {Function} onEntrar - callback(codigo, nome)
 * @param {Function} onRenomear - callback(idx, nomeAtual)
 * @param {Function} onRemover - callback(idx, nome)
 */
export function renderizarSalas(salas, onEntrar, onRenomear, onRemover) {
  const salasSection = document.getElementById('salas-section');
  const salasList = document.getElementById('salas-list');
  salasList.innerHTML = '';

  if (salas.length === 0) {
    salasSection.classList.add('hidden');
    return;
  }

  salasSection.classList.remove('hidden');

  salas.forEach((sala, idx) => {
    const card = document.createElement('div');
    card.className = 'sala-card';

    const info = document.createElement('div');
    info.className = 'sala-card-info';
    info.innerHTML = '<div class="sala-card-nome">' + escapeHtml(sala.nome) + '</div>'
                   + '<div class="sala-card-codigo">' + escapeHtml(sala.codigo) + '</div>';
    info.addEventListener('click', () => onEntrar(sala.codigo, sala.nome));

    const acoes = document.createElement('div');
    acoes.className = 'sala-card-acoes';

    const btnRenomear = document.createElement('button');
    btnRenomear.className = 'btn-card btn-renomear';
    btnRenomear.innerHTML = '<i class="fa-solid fa-pen"></i>';
    btnRenomear.setAttribute('aria-label', 'Renomear ' + sala.nome);
    btnRenomear.addEventListener('click', (e) => {
      e.stopPropagation();
      onRenomear(idx, sala.nome);
    });

    const btnCopiar = document.createElement('button');
    btnCopiar.className = 'btn-card btn-copiar';
    btnCopiar.innerHTML = '<i class="fa-solid fa-copy"></i>';
    btnCopiar.setAttribute('aria-label', 'Copiar link de ' + sala.nome);
    btnCopiar.addEventListener('click', (e) => {
      e.stopPropagation();
      copiarLink(sala);
    });

    const btnRemover = document.createElement('button');
    btnRemover.className = 'btn-card btn-remover';
    btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>';
    btnRemover.setAttribute('aria-label', 'Remover ' + sala.nome);
    btnRemover.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemover(idx, sala.nome);
    });

    acoes.append(btnRenomear, btnCopiar, btnRemover);
    card.append(info, acoes);
    salasList.appendChild(card);
  });
}
