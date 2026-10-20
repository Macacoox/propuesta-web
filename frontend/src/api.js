// Acceso a la API del backend. Las rutas son relativas: en desarrollo,
// Vite reenvía /api al servidor Express (ver vite.config.js).

/** GET /api/estado → true si el backend responde { status: "ok" } */
export async function comprobarEstado() {
  try {
    const res = await fetch('/api/estado');
    return res.ok && (await res.json()).status === 'ok';
  } catch {
    return false;
  }
}

/** GET /api/tarifas → objeto con las tarifas del servidor */
export async function obtenerTarifas() {
  const res = await fetch('/api/tarifas');
  if (!res.ok) throw new Error('No se pudieron cargar las tarifas.');
  return (await res.json()).tarifas;
}

/** POST /api/presupuesto → { ok, status, datos } con el cuerpo tal como lo devuelve la API */
export async function pedirPresupuesto(solicitud) {
  const res = await fetch('/api/presupuesto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solicitud),
  });
  return { ok: res.ok, status: res.status, datos: await res.json() };
}
