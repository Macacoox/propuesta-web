import { euros } from '../formato.js';

const formatoFecha = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// Tarifas tal como las publica el servidor (GET /api/tarifas)
const TARIFAS = [
  { clave: 'landing', nombre: 'Landing', detalle: 'Incluye la 1.ª página', color: 'var(--c-base)' },
  { clave: 'corporativa', nombre: 'Web corporativa', detalle: 'Incluye la 1.ª página', color: 'var(--c-base)' },
  { clave: 'paginaAdicional', nombre: 'Página adicional', detalle: 'Cada una a partir de la 2.ª', color: 'var(--c-paginas)' },
  { clave: 'formulario', nombre: 'Formulario de contacto', detalle: 'Extra', color: 'var(--c-formulario)' },
  { clave: 'segundoIdioma', nombre: 'Segundo idioma', detalle: 'Extra', color: 'var(--c-idioma)' },
];

// Colores de cada concepto del desglose
const CONCEPTOS = [
  ['base', 'var(--c-base)'],
  ['paginasAdicionales', 'var(--c-paginas)'],
  ['formulario', 'var(--c-formulario)'],
  ['segundoIdioma', 'var(--c-idioma)'],
];

export default function BarraLateral({ tarifas, presupuestos, activo, onSeleccionar, onBorrar }) {
  return (
    <aside className="lateral">
      <section className="lateral-seccion">
        <div className="lateral-titulo">
          <h2>Tarifas</h2>
          <span className="contador-lateral">EUR</span>
        </div>
        {tarifas ? (
          <ul className="tarifas-lista">
            {TARIFAS.map(({ clave, nombre, detalle, color }) => (
              <li key={clave} className="tarifa" style={{ '--color': color }}>
                <span className="tarifa-texto">
                  <small>{detalle}</small>
                  <strong>{nombre}</strong>
                </span>
                <span className="tarifa-precio">{euros(tarifas[clave])}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="lateral-vacio">No se han podido cargar las tarifas del servidor.</p>
        )}
      </section>

      <section className="lateral-seccion lateral-presupuestos">
        <div className="lateral-titulo">
          <h2>Presupuestos</h2>
          <span className="contador-lateral">{presupuestos.length}</span>
        </div>

        {presupuestos.length === 0 ? (
          <p className="lateral-vacio">Aún no has calculado ningún presupuesto.</p>
        ) : (
          <ul className="presupuestos-lista">
            {presupuestos.map((entrada) => {
              const { solicitud: s, presupuesto: p } = entrada;
              return (
                <li key={entrada.id}>
                  <button
                    type="button"
                    className={`entrada ${entrada.id === activo ? 'activa' : ''}`}
                    onClick={() => onSeleccionar(entrada)}
                  >
                    <time className="entrada-fecha" dateTime={entrada.fecha}>
                      {formatoFecha.format(new Date(entrada.fecha))}
                    </time>
                    <span className="entrada-cabecera">
                      <strong>
                        {s.tipo === 'landing' ? 'Landing' : 'Corporativa'} · {s.paginas} pág.
                      </strong>
                      <span className="entrada-total">{euros(p.total)}</span>
                    </span>
                    <span className="entrada-reparto" aria-hidden="true">
                      {CONCEPTOS.filter(([clave]) => p[clave] > 0).map(([clave, color]) => (
                        <span key={clave} style={{ background: color, flexGrow: p[clave] }} />
                      ))}
                    </span>
                    {(s.formulario || s.segundoIdioma) && (
                      <span className="etiquetas">
                        {s.formulario && <span style={{ '--color': 'var(--c-formulario)' }}>Formulario</span>}
                        {s.segundoIdioma && <span style={{ '--color': 'var(--c-idioma)' }}>2.º idioma</span>}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="lateral-info">Se guardan solo en este navegador.</p>
      </section>

      {presupuestos.length > 0 && (
        <button type="button" className="borrar-presupuestos" onClick={onBorrar}>
          Borrar presupuestos
        </button>
      )}
    </aside>
  );
}
