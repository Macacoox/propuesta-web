import { TARIFAS, MONEDA } from './tarifas.js';

/**
 * Calcula el presupuesto desglosado a partir de datos YA VALIDADOS.
 * Es independiente de Express: no conoce req ni res.
 *
 * Total = precio base + páginas adicionales + extras seleccionados.
 */
export function calcularPresupuesto({ tipo, paginas, formulario, segundoIdioma }) {
  const base = TARIFAS[tipo]; // la primera página va incluida en el precio base
  const paginasAdicionales = (paginas - 1) * TARIFAS.paginaAdicional;
  const precioFormulario = formulario ? TARIFAS.formulario : 0;
  const precioSegundoIdioma = segundoIdioma ? TARIFAS.segundoIdioma : 0;

  return {
    base,
    paginasAdicionales,
    formulario: precioFormulario,
    segundoIdioma: precioSegundoIdioma,
    total: base + paginasAdicionales + precioFormulario + precioSegundoIdioma,
    moneda: MONEDA,
  };
}
