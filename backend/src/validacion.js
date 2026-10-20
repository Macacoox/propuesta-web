export const TIPOS_VALIDOS = ['landing', 'corporativa'];
export const PAGINAS_MIN = 1;
export const PAGINAS_MAX = 20;

const CAMPOS_OBLIGATORIOS = ['tipo', 'paginas', 'formulario', 'segundoIdioma'];

/**
 * Valida el cuerpo de una solicitud de presupuesto.
 * Devuelve { errores } con la lista de problemas encontrados y, si no hay
 * ninguno, { datos } con SOLO los cuatro campos permitidos (las propiedades
 * adicionales se descartan).
 */
export function validarSolicitud(cuerpo) {
  // El cuerpo debe ser un objeto JSON (no null, ni un array, ni un valor suelto)
  if (typeof cuerpo !== 'object' || cuerpo === null || Array.isArray(cuerpo)) {
    return { errores: ['El cuerpo de la solicitud debe ser un objeto JSON.'] };
  }

  const errores = [];

  for (const campo of CAMPOS_OBLIGATORIOS) {
    if (!(campo in cuerpo)) {
      errores.push(`Falta el campo obligatorio "${campo}".`);
    }
  }
  if (errores.length > 0) return { errores };

  const { tipo, paginas, formulario, segundoIdioma } = cuerpo;

  if (!TIPOS_VALIDOS.includes(tipo)) {
    errores.push(`"tipo" debe ser "landing" o "corporativa" (recibido: ${JSON.stringify(tipo)}).`);
  }

  // Number.isInteger rechaza la cadena "4", los decimales (2.5), null, etc.
  if (!Number.isInteger(paginas) || paginas < PAGINAS_MIN || paginas > PAGINAS_MAX) {
    errores.push(
      `"paginas" debe ser un número entero entre ${PAGINAS_MIN} y ${PAGINAS_MAX} (recibido: ${JSON.stringify(paginas)}).`,
    );
  }

  // typeof rechaza la cadena "false", 0, 1, null, etc.
  if (typeof formulario !== 'boolean') {
    errores.push(`"formulario" debe ser un booleano: true o false (recibido: ${JSON.stringify(formulario)}).`);
  }

  if (typeof segundoIdioma !== 'boolean') {
    errores.push(`"segundoIdioma" debe ser un booleano: true o false (recibido: ${JSON.stringify(segundoIdioma)}).`);
  }

  if (errores.length > 0) return { errores };

  return { datos: { tipo, paginas, formulario, segundoIdioma } };
}
