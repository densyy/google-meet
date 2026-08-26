/* lib/code.js — Funções puras: formatação e validação de código Meet */

const RE_CODIGO = /([a-z]{3}-?[a-z]{4}-?[a-z]{3})/i;

/**
 * Formata código raw em padrão XXX-XXXX-XXX
 * @param {string} raw
 * @returns {string}
 */
export function formatarCodigo(raw) {
  const limpo = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (limpo.length <= 3) return limpo;
  if (limpo.length <= 7) return limpo.slice(0, 3) + '-' + limpo.slice(3);
  return limpo.slice(0, 3) + '-' + limpo.slice(3, 7) + '-' + limpo.slice(7, 10);
}

/**
 * Extrai e valida código Meet de texto livre
 * @param {string} texto
 * @returns {string|null} código formatado ou null
 */
export function extrairCodigo(texto) {
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
