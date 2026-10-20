// Tarifas del servidor. Son la única fuente de precios: nunca se usan
// precios ni totales enviados por el cliente.
// Object.freeze impide que se modifiquen en tiempo de ejecución.
export const MONEDA = 'EUR';

export const TARIFAS = Object.freeze({
  landing: 300, // incluye la primera página
  corporativa: 600, // incluye la primera página
  paginaAdicional: 50, // cada página a partir de la segunda
  formulario: 80,
  segundoIdioma: 150,
});
