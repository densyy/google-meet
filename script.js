/* script.js — Lógica do app Meet */
(() => {
  'use strict';

  const CHAVE_SALAS = 'salas';
  const REDIRECT_BASE = 'https://meet.google.com/';
  const DELAY_RESGATE = 3000;

  const RE_CODIGO = /([a-z]{3}-?[a-z]{4}-?[a-z]{3})/i;

  // DOM
  const input = document.getElementById('codigo-input');
  const btnEntrar = document.getElementById('btn-entrar');
  const btnColar = document.getElementById('btn-colar');
  const feedback = document.getElementById('feedback');
  const salasSection = document.getElementById('salas-section');
  const salasList = document.getElementById('salas-list');
  const resgate = document.getElementById('resgate');
  const resgateLink = document.getElementById('resgate-link');
  const dialogRenomear = document.getElementById('dialog-renomear');
  const formRenomear = document.getElementById('form-renomear');
  const nomeInput = document.getElementById('nome-input');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnAjuda = document.getElementById('btn-ajuda');
  const dialogAjuda = document.getElementById('dialog-ajuda');
  const btnFecharAjuda = document.getElementById('btn-fechar-ajuda');
  const dialogRemover = document.getElementById('dialog-remover');
  const dialogRemoverTexto = document.getElementById('dialog-remover-texto');
  const btnNaoRemover = document.getElementById('btn-nao-remover');
  const btnSimRemover = document.getElementById('btn-sim-remover');

  let timerResgate = null;
  let idxRemover = null;

  // ── Helpers ──────────────────────────────────────────────

  function carregarSalas() {
    try { return JSON.parse(localStorage.getItem(CHAVE_SALAS)) || []; }
    catch { return []; }
  }

  function salvarSalas(salas) {
    try { localStorage.setItem(CHAVE_SALAS, JSON.stringify(salas)); }
    catch { /* fallback silencioso */ }
  }

  function formatarCodigo(raw) {
    const limpo = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 7) return limpo.slice(0, 3) + '-' + limpo.slice(3);
    return limpo.slice(0, 3) + '-' + limpo.slice(3, 7) + '-' + limpo.slice(7, 10);
  }

  function extrairCodigo(texto) {
    const limpo = texto.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    const m = limpo.match(RE_CODIGO);
    if (m) {
      const codigo = m[1].replace(/-/g, '');
      if (codigo.length === 10) return formatarCodigo(codigo);
    }
    const apenasLetrasNum = texto.toLowerCase().replace(/[^a-z0-9]/g, '');
    const m2 = apenasLetrasNum.match(/([a-z]{10})/i);
    if (m2) return formatarCodigo(m2[1]);
    return null;
  }

  function obterProximoNumero(salas) {
    if (salas.length === 0) return 1;
    const numeros = salas.map(s => parseInt(s.nome.replace(/\D/g, ''), 10) || 0);
    return Math.max(...numeros) + 1;
  }

  function proximoNome(salas) {
    return 'Sala ' + String(obterProximoNumero(salas)).padStart(3, '0');
  }

  function setFeedback(msg, tipo) {
    feedback.textContent = msg;
    feedback.className = 'feedback ' + (tipo || '');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Redirect ─────────────────────────────────────────────

  function redirecionar(codigo, nomeSala) {
    const url = REDIRECT_BASE + codigo;
    setFeedback('Abrindo ' + (nomeSala || 'sala') + '…', 'ok');
    btnEntrar.disabled = true;

    resgate.classList.add('hidden');
    timerResgate = setTimeout(() => {
      resgateLink.href = url;
      resgate.classList.remove('hidden');
    }, DELAY_RESGATE);

    window.location.href = url;
  }

  // ── Salas: render ────────────────────────────────────────

  function renderizarSalas() {
    const salas = carregarSalas();
    salasList.innerHTML = '';

    if (salas.length === 0) {
      salasSection.classList.add('hidden');
      return;
    }

    salasSection.classList.remove('hidden');

    salas.forEach((sala, idx) => {
      const card = document.createElement('div');
      card.className = 'sala-card';
      card.dataset.idx = idx;

      const info = document.createElement('div');
      info.className = 'sala-card-info';
      info.innerHTML = '<div class="sala-card-nome">' + escapeHtml(sala.nome) + '</div>'
                     + '<div class="sala-card-codigo">' + escapeHtml(sala.codigo) + '</div>';
      info.addEventListener('click', () => redirecionar(sala.codigo, sala.nome));

      const acoes = document.createElement('div');
      acoes.className = 'sala-card-acoes';

      // Renomear (Font Awesome)
      const btnRenomear = document.createElement('button');
      btnRenomear.className = 'btn-card btn-renomear';
      btnRenomear.innerHTML = '<i class="fa-solid fa-pen"></i>';
      btnRenomear.setAttribute('aria-label', 'Renomear ' + sala.nome);
      btnRenomear.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirDialogRenomear(idx);
      });

      // Copiar link (Font Awesome)
      const btnCopiar = document.createElement('button');
      btnCopiar.className = 'btn-card btn-copiar';
      btnCopiar.innerHTML = '<i class="fa-solid fa-copy"></i>';
      btnCopiar.setAttribute('aria-label', 'Copiar link de ' + sala.nome);
      btnCopiar.addEventListener('click', (e) => {
        e.stopPropagation();
        copiarLink(sala);
      });

      // Remover (Font Awesome)
      const btnRemover = document.createElement('button');
      btnRemover.className = 'btn-card btn-remover';
      btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>';
      btnRemover.setAttribute('aria-label', 'Remover ' + sala.nome);
      btnRemover.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirDialogRemover(idx, sala.nome);
      });

      acoes.append(btnRenomear, btnCopiar, btnRemover);
      card.append(info, acoes);
      salasList.appendChild(card);
    });
  }

  // ── Salas: copiar link ───────────────────────────────────

  function copiarLink(sala) {
    const url = REDIRECT_BASE + sala.codigo;
    navigator.clipboard.writeText(url).then(() => {
      setFeedback('Link copiado!', 'ok');
      setTimeout(() => setFeedback('', ''), 2000);
    }).catch(() => {
      setFeedback('Não foi possível copiar. Link: ' + url, '');
    });
  }

  // ── Salas: dialog renomear ───────────────────────────────

  function abrirDialogRenomear(idx) {
    const salas = carregarSalas();
    const sala = salas[idx];
    if (!sala) return;

    nomeInput.value = sala.nome;
    dialogRenomear.dataset.idx = idx;
    dialogRenomear.showModal();
    nomeInput.focus();
    nomeInput.select();
  }

  function fecharDialogRenomear() {
    dialogRenomear.close();
    dialogRenomear.dataset.idx = '';
  }

  formRenomear.addEventListener('submit', (e) => {
    e.preventDefault();
    const idx = parseInt(dialogRenomear.dataset.idx, 10);
    const novoNome = nomeInput.value.trim();
    if (isNaN(idx) || !novoNome) { fecharDialogRenomear(); return; }

    const salas = carregarSalas();
    if (salas[idx]) {
      salas[idx].nome = novoNome;
      salvarSalas(salas);
      renderizarSalas();
    }
    fecharDialogRenomear();
  });

  btnCancelar.addEventListener('click', fecharDialogRenomear);

  // ── Salas: dialog remover ────────────────────────────────

  function abrirDialogRemover(idx, nome) {
    idxRemover = idx;
    dialogRemoverTexto.textContent = 'Tem certeza que deseja remover "' + nome + '"?';
    dialogRemover.showModal();
  }

  function fecharDialogRemover() {
    dialogRemover.close();
    idxRemover = null;
  }

  btnNaoRemover.addEventListener('click', fecharDialogRemover);

  btnSimRemover.addEventListener('click', () => {
    if (idxRemover === null) return;
    const salas = carregarSalas();
    salas.splice(idxRemover, 1);
    salvarSalas(salas);
    renderizarSalas();
    fecharDialogRemover();
  });

  // ── Dialog Ajuda ─────────────────────────────────────────

  btnAjuda.addEventListener('click', () => dialogAjuda.showModal());
  btnFecharAjuda.addEventListener('click', () => dialogAjuda.close());

  // Fechar dialogs com clique no backdrop
  [dialogRenomear, dialogAjuda, dialogRemover].forEach(dlg => {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });
  });

  // ── Salas: salvar nova ───────────────────────────────────

  function salvarSeNovo(codigo) {
    const salas = carregarSalas();
    const existe = salas.some(s => s.codigo === codigo);
    if (!existe) {
      salas.push({ nome: proximoNome(salas), codigo: codigo });
      salvarSalas(salas);
    }
    renderizarSalas();
    return !existe;
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
    const salaExistente = salas.find(s => s.codigo === codigo);
    const nome = salaExistente ? salaExistente.nome : null;

    salvarSeNovo(codigo);
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

  // ── Resgate ──────────────────────────────────────────────

  resgateLink.addEventListener('click', () => {
    resgate.classList.add('hidden');
    if (timerResgate) clearTimeout(timerResgate);
  });

  window.addEventListener('pagehide', () => {
    if (timerResgate) clearTimeout(timerResgate);
  });

  // ── Init ─────────────────────────────────────────────────
  renderizarSalas();
})();
