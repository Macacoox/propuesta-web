// Acceso a la API del backend. Las rutas son relativas: en desarrollo,
// Vite reenvía /api al servidor Express (ver vite.config.js).

export async function obtenerTarifas() {
  const res = await fetch('/api/tarifas');
  if (!res.ok) throw new Error('No se pudieron cargar las tarifas.');
  return (await res.json()).tarifas;
}

/** Devuelve { ok: true, presupuesto } o { ok: false, errores: [...] } */
export async function pedirPresupuesto(solicitud) {
  const res = await fetch('/api/presupuesto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solicitud),
  });
  const datos = await res.json();
  return res.ok ? { ok: true, presupuesto: datos } : { ok: false, errores: datos.detalles || [datos.error] };
}
