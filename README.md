# Presupuesta mi web

Aplicación con **backend** y **frontend** en JavaScript:

- **Backend** ([backend/](backend/)): API REST con **Node.js + Express** que recibe las características de una web, valida los datos y devuelve un presupuesto desglosado calculado **con las tarifas del servidor**.
- **Frontend** ([frontend/](frontend/)): interfaz **React** (con Vite) con un formulario que envía la solicitud a la API y muestra el presupuesto o los errores recibidos.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`).

## Instalación

```bash
git clone <URL-de-este-repositorio>
cd <carpeta-del-repositorio>
npm install
```

El `npm install` de la raíz instala automáticamente las dependencias de `backend/` (Express) y de `frontend/` (React y Vite). Cada parte tiene su propio `package.json` y `package-lock.json`. Las carpetas `node_modules` no están en el repositorio.

## Ejecución

Desde la raíz, un solo comando arranca los dos:

```bash
npm run dev
```

| Parte    | URL                       | Puerto |
| -------- | ------------------------- | ------ |
| Backend  | http://localhost:3000/api | 3000   |
| Frontend | http://localhost:5173     | 5173   |

Abre **http://localhost:5173** en el navegador para usar la interfaz. El frontend reenvía las peticiones `/api/...` al backend (proxy de Vite configurado en [frontend/vite.config.js](frontend/vite.config.js)).

También se pueden arrancar por separado, cada uno en su terminal:

```bash
# Terminal 1 · backend
cd backend
npm start          # o: npm run dev (se reinicia al guardar)

# Terminal 2 · frontend
cd frontend
npm run dev
```

- Pruebas automáticas del backend: `npm test` (desde la raíz o desde `backend/`).
- Otro puerto para el backend: `PORT=4000 npm start` (Git Bash) o `$env:PORT=4000; npm start` (PowerShell). Si se cambia, hay que cambiarlo también en el proxy de `frontend/vite.config.js`.

## Rutas del backend

| Método | Ruta               | Descripción                                                    |
| ------ | ------------------ | -------------------------------------------------------------- |
| GET    | `/api/estado`      | Confirma que el servicio funciona: `{ "status": "ok" }`        |
| GET    | `/api/tarifas`     | Devuelve las tarifas que usa el servidor                        |
| POST   | `/api/presupuesto` | Recibe las características en JSON y devuelve el presupuesto    |

### GET /api/tarifas

```json
{
  "moneda": "EUR",
  "tarifas": {
    "landing": 300,
    "corporativa": 600,
    "paginaAdicional": 50,
    "formulario": 80,
    "segundoIdioma": 150
  }
}
```

### POST /api/presupuesto

Cabecera obligatoria: `Content-Type: application/json`. Cuerpo con cuatro campos obligatorios:

```json
{ "tipo": "corporativa", "paginas": 4, "formulario": true, "segundoIdioma": false }
```

Respuesta `200`:

```json
{ "base": 600, "paginasAdicionales": 150, "formulario": 80, "segundoIdioma": 0, "total": 830, "moneda": "EUR" }
```

Respuesta `400` (ejemplo):

```json
{ "error": "Solicitud incorrecta", "detalles": ["\"paginas\" debe ser un número entero entre 1 y 20 (recibido: 21)."] }
```

## Validación

Antes de calcular, el servidor ([backend/src/validacion.js](backend/src/validacion.js)) comprueba:

- El cuerpo es un objeto JSON (no un array, `null` ni JSON mal formado) y la cabecera es `application/json`.
- Están los cuatro campos: `tipo`, `paginas`, `formulario`, `segundoIdioma`.
- `tipo` es `"landing"` o `"corporativa"`.
- `paginas` es un entero entre 1 y 20 (`Number.isInteger` rechaza `"4"` y `2.5`).
- `formulario` y `segundoIdioma` son booleanos (`typeof ... === "boolean"` rechaza `"false"`).

Si algo falla se responde **400** con la lista de problemas y **no se calcula** nada. Las propiedades adicionales (por ejemplo `"total": 1`) se ignoran: el validador devuelve solo los cuatro campos permitidos.

## Cálculo

La función `calcularPresupuesto` ([backend/src/calculo.js](backend/src/calculo.js)) está separada del manejador de la ruta y recibe datos ya validados:

```
Total = precio base + (páginas − 1) × 50 + formulario (80 si true) + segundo idioma (150 si true)
```

Ejemplo caso 2 (corporativa, 4 páginas, formulario, sin segundo idioma): `600 + 3 × 50 + 80 + 0 = 830 €`.

Las tarifas están en [backend/src/tarifas.js](backend/src/tarifas.js) congeladas con `Object.freeze`, así que nada puede modificarlas en ejecución. El frontend nunca envía precios: solo las características, y muestra lo que calcula el servidor.

## Estructura

```
├── package.json             # scripts de la raíz: npm install / npm run dev / npm test
├── backend/
│   ├── package.json         # dependencias del backend (Express) y scripts
│   ├── package-lock.json
│   ├── src/
│   │   ├── server.js        # arranca el servidor en el puerto 3000
│   │   ├── app.js           # aplicación Express y rutas
│   │   ├── tarifas.js       # tarifas del servidor
│   │   ├── validacion.js    # validación de la solicitud
│   │   └── calculo.js       # cálculo del presupuesto (independiente de Express)
│   ├── test/api.test.js     # pruebas automáticas (node:test)
│   └── pruebas.http         # peticiones para probar a mano (VS Code REST Client)
└── frontend/
    ├── package.json         # dependencias del frontend (React, Vite) y scripts
    ├── package-lock.json
    ├── vite.config.js       # puerto 5173 y proxy /api → backend
    ├── index.html
    └── src/
        ├── main.jsx         # punto de entrada de React
        ├── App.jsx          # formulario y tabla con el presupuesto
        ├── api.js           # llamadas fetch a las tres rutas de la API
        └── App.css
```

## Pruebas

### Pruebas manuales con curl

Con el backend arrancado, desde Git Bash / Linux / macOS:

```bash
curl http://localhost:3000/api/estado
curl http://localhost:3000/api/tarifas
curl -X POST http://localhost:3000/api/presupuesto \
  -H "Content-Type: application/json" \
  -d '{"tipo":"corporativa","paginas":4,"formulario":true,"segundoIdioma":false}'
```

En PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/presupuesto `
  -ContentType "application/json" `
  -Body '{"tipo":"corporativa","paginas":4,"formulario":true,"segundoIdioma":false}'
```

También se puede usar el archivo [backend/pruebas.http](backend/pruebas.http) con la extensión *REST Client* de VS Code, o Postman / Thunder Client.

### Tabla de pruebas

En los casos inválidos, los demás campos se mantienen correctos para comprobar cada error por separado.

| Caso | Solicitud enviada (cuerpo JSON) | Resultado esperado | Resultado obtenido |
| ---- | ------------------------------- | ------------------ | ------------------ |
| 1 | `{"tipo":"landing","paginas":1,"formulario":false,"segundoIdioma":false}` | 200 · Total: 300 € | ✅ 200 · `{"base":300,"paginasAdicionales":0,"formulario":0,"segundoIdioma":0,"total":300,"moneda":"EUR"}` |
| 2 | `{"tipo":"corporativa","paginas":4,"formulario":true,"segundoIdioma":false}` | 200 · Total: 830 € | ✅ 200 · `{"base":600,"paginasAdicionales":150,"formulario":80,"segundoIdioma":0,"total":830,"moneda":"EUR"}` |
| 3 | `{"tipo":"landing","paginas":2,"formulario":true,"segundoIdioma":true}` | 200 · Total: 580 € | ✅ 200 · `{"base":300,"paginasAdicionales":50,"formulario":80,"segundoIdioma":150,"total":580,"moneda":"EUR"}` |
| 4 | `{"tipo":"landing","paginas":20,"formulario":false,"segundoIdioma":false}` | 200 · Total: 1.250 € | ✅ 200 · `{"base":300,"paginasAdicionales":950,"formulario":0,"segundoIdioma":0,"total":1250,"moneda":"EUR"}` |
| 5 | `{"tipo":"corporativa","paginas":0,"formulario":true,"segundoIdioma":false}` | 400 | ✅ 400 · `"paginas" debe ser un número entero entre 1 y 20 (recibido: 0).` |
| 6 | `{"tipo":"corporativa","paginas":21,"formulario":true,"segundoIdioma":false}` | 400 | ✅ 400 · `"paginas" debe ser un número entero entre 1 y 20 (recibido: 21).` |
| 7 | `{"tipo":"corporativa","paginas":2.5,"formulario":true,"segundoIdioma":false}` | 400 | ✅ 400 · `"paginas" debe ser un número entero entre 1 y 20 (recibido: 2.5).` |
| 8 | `{"tipo":"tienda","paginas":4,"formulario":true,"segundoIdioma":false}` | 400 | ✅ 400 · `"tipo" debe ser "landing" o "corporativa" (recibido: "tienda").` |
| 9 | `{"tipo":"corporativa","paginas":4,"formulario":"false","segundoIdioma":false}` | 400 | ✅ 400 · `"formulario" debe ser un booleano: true o false (recibido: "false").` |

Rutas GET:

| Petición | Resultado esperado | Resultado obtenido |
| -------- | ------------------ | ------------------ |
| `GET /api/estado` | 200 · `{"status":"ok"}` | ✅ 200 · `{"status":"ok"}` |
| `GET /api/tarifas` | 200 · tarifas identificables | ✅ 200 · `{"moneda":"EUR","tarifas":{"landing":300,"corporativa":600,"paginaAdicional":50,"formulario":80,"segundoIdioma":150}}` |

### Pruebas automáticas

`npm test` ejecuta [backend/test/api.test.js](backend/test/api.test.js) con el runner nativo de Node (`node:test`, sin dependencias extra). Levanta la API en un puerto libre y comprueba las tres rutas, los nueve casos de la tabla y casos extra: `paginas: "4"`, campo ausente, cuerpo array, JSON mal formado, cabecera incorrecta y propiedades adicionales (`total`, `base`, `tarifas`) que se ignoran.

```
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

## Frontend React

Con `npm run dev` arrancado, abre **http://localhost:5173**. El formulario carga los precios desde `/api/tarifas`, envía la solicitud a `/api/presupuesto` y muestra el desglose o los errores que devuelve la API. El frontend no valida a propósito: si escribes 0 o 21 en el número de páginas, verás el mensaje 400 del backend.

Para generar la versión de producción: `npm run build --prefix frontend` (crea `frontend/dist/`).
