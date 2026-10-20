import express from 'express';
import { TARIFAS, MONEDA } from './tarifas.js';
import { validarSolicitud } from './validacion.js';
import { calcularPresupuesto } from './calculo.js';

const app = express();

// Solo interpreta cuerpos con Content-Type: application/json
app.use(express.json());

// La raíz solo informa de las rutas disponibles (la interfaz está en el frontend)
app.get('/', (req, res) => {
  res.json({
    servicio: 'API de presupuestos',
    rutas: ['GET /api/estado', 'GET /api/tarifas', 'POST /api/presupuesto'],
    frontend: 'http://localhost:5173',
  });
});

app.get('/api/estado', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tarifas', (req, res) => {
  res.json({ moneda: MONEDA, tarifas: TARIFAS });
});

app.post('/api/presupuesto', (req, res) => {
  // 1. Cabecera obligatoria
  if (!req.is('application/json')) {
    return res.status(400).json({
      error: 'Solicitud incorrecta',
      detalles: ['La petición debe usar la cabecera Content-Type: application/json.'],
    });
  }

  // 2. Validación de los datos
  const { errores, datos } = validarSolicitud(req.body);
  if (errores) {
    return res.status(400).json({ error: 'Solicitud incorrecta', detalles: errores });
  }

  // 3. Cálculo con las tarifas del servidor (solo con los campos validados)
  res.status(200).json(calcularPresupuesto(datos));
});

// Rutas de la API que no existen
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
});

// JSON mal formado u otros errores
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Solicitud incorrecta',
      detalles: ['El cuerpo no es un JSON válido.'],
    });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
