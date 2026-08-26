/* lib/redirect.js — Função pura: construção de URL */

const REDIRECT_BASE = 'https://meet.google.com/';

/**
 * Constrói URL de redirecionamento Meet
 * @param {string} codigo
 * @returns {string}
 */
export function construirUrlMeet(codigo) {
  return REDIRECT_BASE + codigo;
}
