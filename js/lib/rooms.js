/* lib/rooms.js — Funções puras: lógica de salas */

/**
 * Obtém próximo número disponível para nome de sala
 * @param {Array<{nome: string}>} salas
 * @returns {number}
 */
function obterProximoNumero(salas) {
  if (salas.length === 0) return 1;
  const numeros = salas.map(s => parseInt(s.nome.replace(/\D/g, ''), 10) || 0);
  return Math.max(...numeros) + 1;
}

/**
 * Gera próximo nome automático (Sala 001, Sala 002...)
 * @param {Array<{nome: string}>} salas
 * @returns {string}
 */
function proximoNome(salas) {
  return 'Sala ' + String(obterProximoNumero(salas)).padStart(3, '0');
}

/**
 * Cria objeto sala
 * @param {string} codigo
 * @param {string} nome
 * @returns {{ nome: string, codigo: string }}
 */
function criarSala(codigo, nome) {
  return { nome, codigo };
}

/**
 * Salva sala se não existir pelo código
 * @param {Array<{nome: string, codigo: string}>} salas
 * @param {string} codigo
 * @returns {{ salas: Array, foiNova: boolean }}
 */
export function salvarSeNovo(salas, codigo) {
  const existe = salas.some(s => s.codigo === codigo);
  if (existe) return { salas, foiNova: false };
  const nova = criarSala(codigo, proximoNome(salas));
  return { salas: [...salas, nova], foiNova: true };
}

/**
 * Renomeia sala por índice
 * @param {Array<{nome: string, codigo: string}>} salas
 * @param {number} idx
 * @param {string} novoNome
 * @returns {Array} nova lista (imutável)
 */
export function renomearSala(salas, idx, novoNome) {
  if (!salas[idx]) return salas;
  return salas.map((s, i) => i === idx ? { ...s, nome: novoNome } : s);
}

/**
 * Remove sala por índice
 * @param {Array<{nome: string, codigo: string}>} salas
 * @param {number} idx
 * @returns {Array} nova lista (imutável)
 */
export function removerSala(salas, idx) {
  return salas.filter((_, i) => i !== idx);
}

/**
 * Busca sala existente por código
 * @param {Array<{nome: string, codigo: string}>} salas
 * @param {string} codigo
 * @returns {{ nome: string, codigo: string } | undefined}
 */
export function buscarSalaPorCodigo(salas, codigo) {
  return salas.find(s => s.codigo === codigo);
}
