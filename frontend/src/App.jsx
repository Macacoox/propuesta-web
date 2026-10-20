import { useEffect, useState } from 'react';
import { comprobarEstado, obtenerTarifas, pedirPresupuesto } from './api.js';

const formatoEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  useGrouping: 'always',
});
const euros = (n) => formatoEuros.format(n);

const TIPOS = [
  { valor: 'landing', nombre: 'Landing', descripcion: 'Una sola página. Incluye la primera página.' },
  { valor: 'corporativa', nombre: 'Web corporativa', descripcion: 'Web de empresa. Incluye la primera página.' },
];

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

  const estado =
    servicioActivo === null
      ? { clase: '', texto: 'Comprobando servicio' }
      : servicioActivo
        ? { clase: 'ok', texto: 'Servicio disponible' }
        : { clase: 'ko', texto: 'Servicio no disponible' };

  return (
    <div className="pagina">
      <header className="encabezado">
        <div>
          <h1>Presupuesto de proyecto web</h1>
          <p className="muted">Indique las características del proyecto para obtener un presupuesto desglosado.</p>
        </div>
        <span className="badge">
          <span className={`punto ${estado.clase}`} />
          {estado.texto}
        </span>
      </header>

      <main className="rejilla">
        <form className="card" onSubmit={enviar} noValidate>
          <div className="card-header">
            <h2 className="card-title">Datos del proyecto</h2>
            <p className="card-description">Seleccione el tipo de web, el número de páginas y los servicios adicionales.</p>
          </div>

          <div className="card-content">
            <fieldset className="grupo">
              <legend className="label">Tipo de web</legend>
              <div className="opciones">
                {TIPOS.map(({ valor, nombre, descripcion }) => (
                  <label key={valor} className="opcion">
                    <input type="radio" name="tipo" value={valor} checked={tipo === valor} onChange={() => setTipo(valor)} />
                    <span className="opcion-texto">
                      <span className="opcion-titulo">{nombre}</span>
                      <span className="muted">{descripcion}</span>
                    </span>
                    <span className="opcion-precio">{precio(valor)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grupo">
              <label className="label" htmlFor="paginas">
                Número de páginas
              </label>
              <input id="paginas" className="input" type="number" value={paginas} onChange={(e) => setPaginas(e.target.value)} />
              <p className="muted">Entre 1 y 20. Cada página adicional: {precio('paginaAdicional')}.</p>
            </div>

            <fieldset className="grupo">
              <legend className="label">Servicios adicionales</legend>
              <div className="opciones">
                <label className="opcion">
                  <input type="checkbox" checked={formulario} onChange={(e) => setFormulario(e.target.checked)} />
                  <span className="opcion-texto">
                    <span className="opcion-titulo">Formulario de contacto</span>
                    <span className="muted">Los visitantes pueden enviar mensajes.</span>
                  </span>
                  <span className="opcion-precio">{precio('formulario')}</span>
                </label>
                <label className="opcion">
                  <input type="checkbox" checked={segundoIdioma} onChange={(e) => setSegundoIdioma(e.target.checked)} />
                  <span className="opcion-texto">
                    <span className="opcion-titulo">Segundo idioma</span>
                    <span className="muted">Contenido traducido a otro idioma.</span>
                  </span>
                  <span className="opcion-precio">{precio('segundoIdioma')}</span>
                </label>
              </div>
            </fieldset>
          </div>

          <div className="card-footer">
            <button type="submit" className="boton" disabled={cargando}>
              {cargando ? 'Calculando...' : 'Calcular presupuesto'}
            </button>
          </div>
        </form>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Presupuesto</h2>
            <p className="card-description">Calculado por el servidor con sus propias tarifas.</p>
          </div>

          <div className="card-content">
            {!presupuesto && errores.length === 0 && (
              <div className="vacio">Complete el formulario y pulse «Calcular presupuesto».</div>
            )}

            {errores.length > 0 && (
              <div className="alerta" role="alert">
                <p className="alerta-titulo">No se ha podido calcular el presupuesto</p>
                <ul>
                  {errores.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {presupuesto && (
              <div className="tabla">
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
              </div>
            )}
            {presupuesto && <p className="muted nota">Importes sin impuestos, en {presupuesto.moneda}.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
