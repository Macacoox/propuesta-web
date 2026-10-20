import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API de presupuestos escuchando en http://localhost:${PORT}`);
  console.log(`  Prueba: http://localhost:${PORT}/api/estado`);
  console.log('  Interfaz (frontend): http://localhost:5173');
});
