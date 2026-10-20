import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { calcularPresupuesto } from '../src/calculo.js';

let servidor;
let url;

before(() => {
  // Puerto 0: el sistema asigna uno libre, así los tests no chocan con `npm start`
  servidor = app.listen(0);
  url = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

const valido = { tipo: 'corporativa', paginas: 4, formulario: true, segundoIdioma: false };

function postPresupuesto(cuerpo, contentType = 'application/json') {
  return fetch(`${url}/api/presupuesto`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });
}

// ---------- Rutas GET ----------

test('GET /api/estado devuelve { status: "ok" }', async () => {
  const res = await fetch(`${url}/api/estado`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET /api/tarifas devuelve las tarifas del servidor', async () => {
  const res = await fetch(`${url}/api/tarifas`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    moneda: 'EUR',
    tarifas: { landing: 300, corporativa: 600, paginaAdicional: 50, formulario: 80, segundoIdioma: 150 },
  });
});

// ---------- Los 9 casos obligatorios ----------

const casosValidos = [
  {
    caso: 1,
    cuerpo: { tipo: 'landing', paginas: 1, formulario: false, segundoIdioma: false },
    esperado: { base: 300, paginasAdicionales: 0, formulario: 0, segundoIdioma: 0, total: 300, moneda: 'EUR' },
  },
  {
    caso: 2,
    cuerpo: { tipo: 'corporativa', paginas: 4, formulario: true, segundoIdioma: false },
    esperado: { base: 600, paginasAdicionales: 150, formulario: 80, segundoIdioma: 0, total: 830, moneda: 'EUR' },
  },
  {
    caso: 3,
    cuerpo: { tipo: 'landing', paginas: 2, formulario: true, segundoIdioma: true },
    esperado: { base: 300, paginasAdicionales: 50, formulario: 80, segundoIdioma: 150, total: 580, moneda: 'EUR' },
  },
  {
    caso: 4,
    cuerpo: { tipo: 'landing', paginas: 20, formulario: false, segundoIdioma: false },
    esperado: { base: 300, paginasAdicionales: 950, formulario: 0, segundoIdioma: 0, total: 1250, moneda: 'EUR' },
  },
];

for (const { caso, cuerpo, esperado } of casosValidos) {
  test(`Caso ${caso}: ${JSON.stringify(cuerpo)} → 200 · total ${esperado.total}`, async () => {
    const res = await postPresupuesto(cuerpo);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), esperado);
  });
}

const casosInvalidos = [
  { caso: 5, cambio: { paginas: 0 } },
  { caso: 6, cambio: { paginas: 21 } },
  { caso: 7, cambio: { paginas: 2.5 } },
  { caso: 8, cambio: { tipo: 'tienda' } },
  { caso: 9, cambio: { formulario: 'false' } },
];

for (const { caso, cambio } of casosInvalidos) {
  test(`Caso ${caso}: ${JSON.stringify(cambio)} → 400`, async () => {
    // El resto de campos se mantienen correctos para aislar cada error
    const res = await postPresupuesto({ ...valido, ...cambio });
    assert.equal(res.status, 400);
    const cuerpo = await res.json();
    assert.equal(cuerpo.detalles.length, 1);
    assert.ok(cuerpo.detalles[0].includes(Object.keys(cambio)[0]));
  });
}

// ---------- Casos adicionales ----------

test('paginas como cadena "4" → 400', async () => {
  const res = await postPresupuesto({ ...valido, paginas: '4' });
  assert.equal(res.status, 400);
});

test('Falta un campo obligatorio → 400', async () => {
  const { segundoIdioma, ...incompleto } = valido;
  const res = await postPresupuesto(incompleto);
  assert.equal(res.status, 400);
  assert.match((await res.json()).detalles[0], /segundoIdioma/);
});

test('El cuerpo es un array → 400', async () => {
  const res = await postPresupuesto([valido]);
  assert.equal(res.status, 400);
});

test('JSON mal formado → 400', async () => {
  const res = await postPresupuesto('{"tipo": "landing",');
  assert.equal(res.status, 400);
});

test('Sin Content-Type: application/json → 400', async () => {
  const res = await postPresupuesto(JSON.stringify(valido), 'text/plain');
  assert.equal(res.status, 400);
});

test('Las propiedades adicionales (total, precios) se ignoran', async () => {
  const res = await postPresupuesto({ ...valido, total: 1, base: 0, tarifas: { corporativa: 1 } });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).total, 830);

  const tarifas = await (await fetch(`${url}/api/tarifas`)).json();
  assert.equal(tarifas.tarifas.corporativa, 600);
});

test('calcularPresupuesto funciona sin Express', () => {
  assert.equal(calcularPresupuesto(valido).total, 830);
});
