import { useEffect, useRef, useState } from 'react';
import { euros } from '../formato.js';
import { IconoAviso, IconoServidor } from './Iconos.jsx';

// Anima un número desde su valor anterior hasta el nuevo
function useContador(objetivo) {
  const [valor, setValor] = useState(0);
  const actual = useRef(0);

  useEffect(() => {
    if (objetivo == null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      actual.current = objetivo;
      setValor(objetivo);
      return;
    }
    const origen = actual.current;
    const inicio = performance.now();
    let id;
    const paso = (t) => {
      const k = Math.min((t - inicio) / 700, 1);
      const suave = 1 - Math.pow(1 - k, 3);
      actual.current = Math.round(origen + (objetivo - origen) * suave);
      setValor(actual.current);
      if (k < 1) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [objetivo]);

  return valor;
}

export default function PanelResultado({ respuesta, cargando, desactualizado, tarifas }) {
  const presupuesto = respuesta?.ok ? respuesta.datos : null;
  const total = useContador(presupuesto?.total);

  return (
    <aside className="panel resultado" aria-live="polite">
      <div className="resultado-cabecera">
        <h2>Tu presupuesto</h2>
        {respuesta?.status && (
          <span className={`codigo ${respuesta.ok ? 'ok' : 'ko'}`}>HTTP {respuesta.status}</span>
        )}
      </div>

      {cargando && <Esqueleto />}

      {!cargando && !respuesta && (
        <div className="vacio">
          <div className="vacio-icono">
            <IconoServidor />
          </div>
          <p>Configura tu web y pulsa <strong>Calcular presupuesto</strong>.</p>
          <p className="ayuda">El servidor calcula el precio con sus propias tarifas.</p>
        </div>
      )}

      {!cargando && presupuesto && (
        <>
          {desactualizado && <p className="aviso-cambios">Has cambiado opciones. Vuelve a calcular para actualizar.</p>}
          <ul className="desglose">
            {filas(presupuesto, respuesta.solicitud, tarifas).map(({ concepto, detalle, importe }) => (
              <li key={concepto} className={importe === 0 ? 'cero' : ''}>
                <div className="fila">
                  <span className="concepto">
                    {concepto}
                    <small>{detalle}</small>
                  </span>
                  <span className="importe">{euros(importe)}</span>
                </div>
                <div className="barra">
                  <span style={{ width: `${(importe / presupuesto.total) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="total">
            <span>Total</span>
            <strong>{euros(total)}</strong>
          </div>
          <p className="nota">Sin impuestos ni descuentos · {presupuesto.moneda}</p>
        </>
      )}

      {!cargando && respuesta && !respuesta.ok && (
        <div className="errores" role="alert">
          <div className="errores-titulo">
            <IconoAviso />
            <h3>{respuesta.status ? 'La API ha rechazado la solicitud' : 'Sin conexión con la API'}</h3>
          </div>
          <ul>
            {(respuesta.datos?.detalles || [respuesta.datos?.error]).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {!cargando && respuesta && (
        <details className="tecnico">
          <summary>Ver petición y respuesta</summary>
          <p className="etiqueta-codigo">POST /api/presupuesto · Content-Type: application/json</p>
          <pre>{JSON.stringify(respuesta.solicitud, null, 2)}</pre>
          <p className="etiqueta-codigo">Respuesta · HTTP {respuesta.status ?? '—'}</p>
          <pre>{JSON.stringify(respuesta.datos, null, 2)}</pre>
        </details>
      )}
    </aside>
  );
}

function filas(p, solicitud, tarifas) {
  const adicionales = solicitud.paginas - 1;
  return [
    {
      concepto: 'Precio base',
      detalle: `Web ${solicitud.tipo}, incluye la 1.ª página`,
      importe: p.base,
    },
    {
      concepto: 'Páginas adicionales',
      detalle: tarifas ? `${adicionales} × ${euros(tarifas.paginaAdicional)}` : `${adicionales} páginas`,
      importe: p.paginasAdicionales,
    },
    { concepto: 'Formulario de contacto', detalle: p.formulario ? 'Incluido' : 'No seleccionado', importe: p.formulario },
    { concepto: 'Segundo idioma', detalle: p.segundoIdioma ? 'Incluido' : 'No seleccionado', importe: p.segundoIdioma },
  ];
}

function Esqueleto() {
  return (
    <div className="esqueleto" aria-label="Calculando">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} />
      ))}
      <span className="grande" />
    </div>
  );
}
