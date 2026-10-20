import { useEffect, useState } from 'react';
import { comprobarEstado, obtenerTarifas, pedirPresupuesto } from './api.js';

const formatoEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  useGrouping: 'always',
});
const euros = (n) => formatoEuros.format(n);

export default function App() {
  const [servicioActivo, setServicioActivo] = useState(null);
  const [tarifas, setTarifas] = useState(null);
  const [tipo, setTipo] = useState('corporativa');
  const [paginas, setPaginas] = useState('4');
  const [formulario, setFormulario] = useState(true);
  const [segundoIdioma, setSegundoIdioma] = useState(false);
  const [presupuesto, setPresupuesto] = useState(null);
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    comprobarEstado().then(setServicioActivo);
    obtenerTarifas()
      .then(setTarifas)
      .catch(() => setTarifas(null));
  }, []);

  async function enviar(evento) {
    evento.preventDefault();
    setCargando(true);
    setPresupuesto(null);
    setErrores([]);

    // Solo se envían las características. El precio lo calcula el servidor.
    const solicitud = { tipo, paginas: Number(paginas), formulario, segundoIdioma };

    try {
      const { ok, datos } = await pedirPresupuesto(solicitud);
      if (ok) setPresupuesto(datos);
      else setErrores(datos.detalles || [datos.error]);
    } catch {
      setErrores(['No se ha podido conectar con el servidor. Compruebe que el backend está en ejecución.']);
    } finally {
      setCargando(false);
    }
  }

  const precio = (clave) => (tarifas ? euros(tarifas[clave]) : '');

  return (
    <div className="pagina">
      <header className="cabecera">
        <h1>Presupuesto de proyecto web</h1>
        <p>Indique las características del proyecto para obtener un presupuesto desglosado.</p>
      </header>

      <main className="contenido">
        <form className="bloque" onSubmit={enviar} noValidate>
          <h2>Datos del proyecto</h2>

          <fieldset>
            <legend>Tipo de web</legend>
            <label className="opcion">
              <input type="radio" name="tipo" value="landing" checked={tipo === 'landing'} onChange={() => setTipo('landing')} />
              Landing <span className="precio">{precio('landing')}</span>
            </label>
            <label className="opcion">
              <input
                type="radio"
                name="tipo"
                value="corporativa"
                checked={tipo === 'corporativa'}
                onChange={() => setTipo('corporativa')}
              />
              Web corporativa <span className="precio">{precio('corporativa')}</span>
            </label>
            <p className="nota">El precio base incluye la primera página.</p>
          </fieldset>

          <div className="campo">
            <label htmlFor="paginas">Número de páginas</label>
            <input id="paginas" type="number" value={paginas} onChange={(e) => setPaginas(e.target.value)} />
            <p className="nota">Entre 1 y 20. Cada página adicional: {precio('paginaAdicional')}</p>
          </div>

          <fieldset>
            <legend>Servicios adicionales</legend>
            <label className="opcion">
              <input type="checkbox" checked={formulario} onChange={(e) => setFormulario(e.target.checked)} />
              Formulario de contacto <span className="precio">{precio('formulario')}</span>
            </label>
            <label className="opcion">
              <input type="checkbox" checked={segundoIdioma} onChange={(e) => setSegundoIdioma(e.target.checked)} />
              Segundo idioma <span className="precio">{precio('segundoIdioma')}</span>
            </label>
          </fieldset>

          <button type="submit" disabled={cargando}>
            {cargando ? 'Calculando...' : 'Calcular presupuesto'}
          </button>
        </form>

        <section className="bloque">
          <h2>Presupuesto</h2>

          {!presupuesto && errores.length === 0 && (
            <p className="vacio">Complete el formulario y pulse «Calcular presupuesto».</p>
          )}

          {errores.length > 0 && (
            <div className="error" role="alert">
              <strong>No se ha podido calcular el presupuesto:</strong>
              <ul>
                {errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {presupuesto && (
            <table>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Precio base</td>
                  <td>{euros(presupuesto.base)}</td>
                </tr>
                <tr>
                  <td>Páginas adicionales</td>
                  <td>{euros(presupuesto.paginasAdicionales)}</td>
                </tr>
                <tr>
                  <td>Formulario de contacto</td>
                  <td>{euros(presupuesto.formulario)}</td>
                </tr>
                <tr>
                  <td>Segundo idioma</td>
                  <td>{euros(presupuesto.segundoIdioma)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{euros(presupuesto.total)}</td>
                </tr>
              </tfoot>
            </table>
          )}
          {presupuesto && <p className="nota">Importes sin impuestos, en {presupuesto.moneda}.</p>}
        </section>
      </main>

      <footer className="pie">
        Estado del servicio:{' '}
        {servicioActivo === null ? 'comprobando...' : servicioActivo ? 'disponible' : 'no disponible'}
      </footer>
    </div>
  );
}
