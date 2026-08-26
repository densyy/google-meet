/* components/modal.js — Componente: diálogo genérico */

const DOM = {
  get overlay() { return document.getElementById('modal-overlay'); },
  get titulo() { return document.getElementById('modal-titulo'); },
  get conteudo() { return document.getElementById('modal-conteudo'); },
  get botoes() { return document.getElementById('modal-botoes'); },
};

/**
 * Fecha o modal
 */
function fecharModal() {
  DOM.overlay.classList.add('hidden');
}

/**
 * Abre modal genérico
 * @param {Object} opts
 * @param {string} opts.titulo
 * @param {string|Element} opts.conteudo
 * @param {Array<{texto: string, classe?: string, onClick?: Function}>} opts.botoes
 * @param {Function} [opts.onFechar]
 */
export function modal({ titulo, conteudo, botoes, onFechar }) {
  DOM.titulo.textContent = titulo;
  DOM.conteudo.innerHTML = '';
  DOM.botoes.innerHTML = '';

  if (typeof conteudo === 'string') {
    DOM.conteudo.innerHTML = '<p>' + conteudo + '</p>';
  } else {
    DOM.conteudo.appendChild(conteudo);
  }

  botoes.forEach(({ texto, classe, onClick }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = classe || 'btn-modal-ok';
    btn.textContent = texto;
    btn.addEventListener('click', () => {
      fecharModal();
      if (onClick) onClick();
    });
    DOM.botoes.appendChild(btn);
  });

  DOM.overlay.classList.remove('hidden');
  const primeiroBtn = DOM.botoes.querySelector('button');
  if (primeiroBtn) primeiroBtn.focus();

  DOM.overlay.onclick = (e) => {
    if (e.target === DOM.overlay) {
      fecharModal();
      if (onFechar) onFechar();
    }
  };

  const onKey = (e) => {
    if (e.key === 'Escape') {
      fecharModal();
      if (onFechar) onFechar();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
}
