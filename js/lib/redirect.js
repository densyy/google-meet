/* lib/redirect.js — Função pura: construção de URL */

const REDIRECT_BASE = 'https://meet.google.com/';
const TRANSICAO_PATH = 'transicao.html';

/**
 * Constrói URL de redirecionamento Meet
 * @param {string} codigo
 * @returns {string}
 */
export function construirUrlMeet(codigo) {
  return REDIRECT_BASE + codigo;
}

/**
 * Constrói URL da tela de transição
 * @param {string} codigo
 * @param {string} nome
 * @returns {string}
 */
export function construirUrlTransicao(codigo, nome) {
  const params = new URLSearchParams({ codigo, nome });
  return TRANSICAO_PATH + '?' + params.toString();
}
