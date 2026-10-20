import { euros } from '../formato.js';

const formatoFecha = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// Colores de cada concepto (los mismos que en el desglose)
const CONCEPTOS = [
  ['base', 'var(--c-base)'],
  ['paginasAdicionales', 'var(--c-paginas)'],
  ['formulario', 'var(--c-formulario)'],
  ['segundoIdioma', 'var(--c-idioma)'],
];

export default function Historial({ entradas, activa, onSeleccionar, onBorrar }) {
  return (
    <aside className="historial">
      <div className="historial-cabecera">
        <h2>Historial</h2>
        <span className="contador-historial">{entradas.length}</span>
      </div>
      <p className="historial-info">Presupuestos calculados en este navegador.</p>

      {entradas.length === 0 ? (
        <p className="historial-vacio">Aún no has calculado ningún presupuesto.</p>
      ) : (
        <ul className="historial-lista">
          {entradas.map((entrada) => {
            const { solicitud: s, presupuesto: p } = entrada;
            return (
              <li key={entrada.id}>
                <button
                  type="button"
                  className={`entrada ${entrada.id === activa ? 'activa' : ''}`}
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

      {entradas.length > 0 && (
        <button type="button" className="borrar-historial" onClick={onBorrar}>
          Borrar historial
        </button>
      )}
    </aside>
  );
}
