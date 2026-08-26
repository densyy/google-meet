/* script.js — Lógica do app Meet */
(() => {
  'use strict';

  const CHAVE_SALAS = 'salas';
  const REDIRECT_BASE = 'https://meet.google.com/';
  const DELAY_RESGATE = 3000;
  const RE_CODIGO = /([a-z]{3}-?[a-z]{4}-?[a-z]{3})/i;

  // ── Componente UI ────────────────────────────────────────

  const UI = {
    // Toast (alerta temporário)
    toast(msg, tipo = 'ok') {
      const container = document.getElementById('toast-container');
      const icones = { ok: 'fa-check-circle', erro: 'fa-exclamation-circle', info: 'fa-info-circle' };
      const toast = document.createElement('div');
      toast.className = 'toast toast-' + tipo;
      toast.innerHTML = '<i class="fa-solid ' + (icones[tipo] || icones.ok) + '"></i> ' + msg;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 2300);
    },

    // Modal centralizado reutilizável
    modal({ titulo, conteudo, botoes, onFechar }) {
      const overlay = document.getElementById('modal-overlay');
      const box = document.getElementById('modal-box');
      const elTitulo = document.getElementById('modal-titulo');
      const elConteudo = document.getElementById('modal-conteudo');
      const elBotoes = document.getElementById('modal-botoes');

      elTitulo.textContent = titulo;
      elConteudo.innerHTML = typeof conteudo === 'string' ? '<p>' + conteudo + '</p>' : '';
      elBotoes.innerHTML = '';

      if (typeof conteudo !== 'string') {
        elConteudo.innerHTML = '';
        elConteudo.appendChild(conteudo);
      }

      botoes.forEach(({ texto, classe, onClick }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = classe || 'btn-modal-ok';
        btn.textContent = texto;
        btn.addEventListener('click', () => {
          UI.fecharModal();
          if (onClick) onClick();
        });
        elBotoes.appendChild(btn);
      });

      overlay.classList.remove('hidden');
      const primeiroBtn = elBotoes.querySelector('button');
      if (primeiroBtn) primeiroBtn.focus();

      // Fechar no backdrop
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          UI.fecharModal();
          if (onFechar) onFechar();
        }
      };

      // Fechar com Escape
      const onKey = (e) => {
        if (e.key === 'Escape') {
          UI.fecharModal();
          if (onFechar) onFechar();
          document.removeEventListener('keydown', onKey);
        }
      };
      document.addEventListener('keydown', onKey);
    },

    fecharModal() {
      document.getElementById('modal-overlay').classList.add('hidden');
    }
  };

  // ── DOM ──────────────────────────────────────────────────

  const input = document.getElementById('codigo-input');
  const btnEntrar = document.getElementById('btn-entrar');
  const btnColar = document.getElementById('btn-colar');
  const feedback = document.getElementById('feedback');
  const salasSection = document.getElementById('salas-section');
  const salasList = document.getElementById('salas-list');
  const resgate = document.getElementById('resgate');
  const resgateLink = document.getElementById('resgate-link');
  const btnAjuda = document.getElementById('btn-ajuda');

  let timerResgate = null;

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

      const info = document.createElement('div');
      info.className = 'sala-card-info';
      info.innerHTML = '<div class="sala-card-nome">' + escapeHtml(sala.nome) + '</div>'
                     + '<div class="sala-card-codigo">' + escapeHtml(sala.codigo) + '</div>';
      info.addEventListener('click', () => redirecionar(sala.codigo, sala.nome));

      const acoes = document.createElement('div');
      acoes.className = 'sala-card-acoes';

      // Renomear
      const btnRenomear = document.createElement('button');
      btnRenomear.className = 'btn-card btn-renomear';
      btnRenomear.innerHTML = '<i class="fa-solid fa-pen"></i>';
      btnRenomear.setAttribute('aria-label', 'Renomear ' + sala.nome);
      btnRenomear.addEventListener('click', (e) => {
        e.stopPropagation();
        modalRenomear(idx, sala.nome);
      });

      // Copiar link
      const btnCopiar = document.createElement('button');
      btnCopiar.className = 'btn-card btn-copiar';
      btnCopiar.innerHTML = '<i class="fa-solid fa-copy"></i>';
      btnCopiar.setAttribute('aria-label', 'Copiar link de ' + sala.nome);
      btnCopiar.addEventListener('click', (e) => {
        e.stopPropagation();
        copiarLink(sala);
      });

      // Remover
      const btnRemover = document.createElement('button');
      btnRemover.className = 'btn-card btn-remover';
      btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>';
      btnRemover.setAttribute('aria-label', 'Remover ' + sala.nome);
      btnRemover.addEventListener('click', (e) => {
        e.stopPropagation();
        modalRemover(idx, sala.nome);
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
      UI.toast('Link copiado!', 'ok');
    }).catch(() => {
      UI.toast('Não foi possível copiar', 'erro');
    });
  }

  // ── Modal: Renomear ──────────────────────────────────────

  function modalRenomear(idx, nomeAtual) {
    const inputNome = document.createElement('input');
    inputNome.type = 'text';
    inputNome.value = nomeAtual;
    inputNome.maxLength = 30;
    inputNome.autocomplete = 'off';

    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<label for="input-renomear">Nome da sala</label>';
    wrapper.appendChild(inputNome);

    UI.modal({
      titulo: 'Renomear sala',
      conteudo: wrapper,
      botoes: [
        { texto: 'Cancelar', classe: 'btn-modal-cancelar' },
        { texto: 'Pronto', classe: 'btn-modal-ok', onClick: () => {
          const novoNome = inputNome.value.trim();
          if (!novoNome) return;
          const salas = carregarSalas();
          if (salas[idx]) {
            salas[idx].nome = novoNome;
            salvarSalas(salas);
            renderizarSalas();
          }
        }}
      ]
    });

    setTimeout(() => { inputNome.focus(); inputNome.select(); }, 100);
  }

  // ── Modal: Remover ───────────────────────────────────────

  function modalRemover(idx, nome) {
    UI.modal({
      titulo: 'Remover sala',
      conteudo: 'Tem certeza que deseja remover "' + nome + '"?',
      botoes: [
        { texto: 'Não', classe: 'btn-modal-cancelar' },
        { texto: 'Remover', classe: 'btn-modal-danger', onClick: () => {
          const salas = carregarSalas();
          salas.splice(idx, 1);
          salvarSalas(salas);
          renderizarSalas();
          UI.toast('Sala removida', 'info');
        }}
      ]
    });
  }

  // ── Modal: Ajuda ─────────────────────────────────────────

  function modalAjuda() {
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

    UI.modal({
      titulo: 'Onde encontro esse código?',
      conteudo: conteudo,
      botoes: [
        { texto: 'Entendi', classe: 'btn-modal-ok' }
      ]
    });
  }

  btnAjuda.addEventListener('click', modalAjuda);

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
