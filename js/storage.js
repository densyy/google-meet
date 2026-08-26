/* storage.js — Persistência localStorage */

const CHAVE_SALAS = 'salas';

export function carregarSalas() {
  try { return JSON.parse(localStorage.getItem(CHAVE_SALAS)) || []; }
  catch { return []; }
}

export function salvarSalas(salas) {
  try { localStorage.setItem(CHAVE_SALAS, JSON.stringify(salas)); }
  catch { /* fallback silencioso */ }
}
