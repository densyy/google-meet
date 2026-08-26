/* components/toast.js — Componente: notificação temporária */

const ICONES = {
  ok: 'fa-check-circle',
  erro: 'fa-exclamation-circle',
  info: 'fa-info-circle',
};

/**
 * Exibe toast temporário
 * @param {string} msg
 * @param {'ok'|'erro'|'info'} tipo
 */
export function toast(msg, tipo = 'ok') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast toast-' + tipo;
  el.innerHTML = '<i class="fa-solid ' + (ICONES[tipo] || ICONES.ok) + '"></i> ' + msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2300);
}
