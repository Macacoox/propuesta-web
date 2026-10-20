import { useEffect, useState } from 'react';
import { comprobarEstado, obtenerTarifas, pedirPresupuesto } from './api.js';
import { euros } from './formato.js';
import { IconoCheck, IconoCorporativa, IconoFormulario, IconoIdioma, IconoLanding } from './components/Iconos.jsx';
import SelectorPaginas from './components/SelectorPaginas.jsx';
import PanelResultado from './components/PanelResultado.jsx';

const TIPOS = [
  { valor: 'landing', nombre: 'Landing', desc: 'Una sola página pensada para convertir', Icono: IconoLanding },
  { valor: 'corporativa', nombre: 'Corporativa', desc: 'Web completa para tu empresa', Icono: IconoCorporativa },
];

const EXTRAS = [
  { clave: 'formulario', nombre: 'Formulario de contacto', desc: 'Recibe mensajes de tus clientes', Icono: IconoFormulario },
  { clave: 'segundoIdioma', nombre: 'Segundo idioma', desc: 'Tu web traducida a otro idioma', Icono: IconoIdioma },
];

const ERROR_CONEXION = 'El backend no responde. Arráncalo con "npm run dev" desde la carpeta raíz del proyecto.';

export default function App() {
  const [apiActiva, setApiActiva] = useState(null);
  const [tarifas, setTarifas] = useState(null);
  const [tipo, setTipo] = useState('corporativa');
  const [paginas, setPaginas] = useState('4');
  const [extras, setExtras] = useState({ formulario: true, segundoIdioma: false });
  const [respuesta, setRespuesta] = useState(null); // { ok, status, datos, solicitud }
  const [cargando, setCargando] = useState(false);

  // Consume las rutas GET: estado del servicio y tarifas del servidor
  useEffect(() => {
    comprobarEstado().then(setApiActiva);
    obtenerTarifas()
      .then(setTarifas)
      .catch(() => setTarifas(null));
  }, []);

  // Solo se envían las características; el precio lo calcula el servidor.
  // No se valida aquí a propósito: así se ven los errores 400 de la API.
  const solicitud = { tipo, paginas: Number(paginas), ...extras };
  const desactualizado = respuesta?.ok && JSON.stringify(respuesta.solicitud) !== JSON.stringify(solicitud);

  async function enviar(evento) {
    evento.preventDefault();
    setCargando(true);
    try {
      setRespuesta({ ...(await pedirPresupuesto(solicitud)), solicitud });
      setApiActiva(true);
    } catch {
      setRespuesta({ ok: false, status: null, datos: { detalles: [ERROR_CONEXION] }, solicitud });
      setApiActiva(false);
    } finally {
      setCargando(false);
    }
  }

  const precio = (clave) => (tarifas ? euros(tarifas[clave]) : '—');

  return (
    <div className="pagina">
      <header className="cabecera">
        <div className="marca">
          <span className="logo">€</span>
          <span>Agencia · Calculadora</span>
        </div>
        <EstadoApi activa={apiActiva} />
      </header>

      <section className="intro">
        <h1>
          Presupuesta <span className="degradado">tu web</span>
        </h1>
        <p>Elige las características de tu proyecto y el servidor calcula el precio al momento con sus propias tarifas.</p>
      </section>

      <main className="rejilla">
        <form className="panel formulario" onSubmit={enviar} noValidate>
          <fieldset>
            <legend>
              <span className="paso-num">01</span> Tipo de web
            </legend>
            <div className="tipos">
              {TIPOS.map(({ valor, nombre, desc, Icono }) => (
                <label key={valor} className={`tarjeta-opcion ${tipo === valor ? 'activa' : ''}`}>
                  <input type="radio" name="tipo" value={valor} checked={tipo === valor} onChange={() => setTipo(valor)} />
                  <span className="opcion-icono">
                    <Icono />
                  </span>
                  <span className="marca-check">
                    <IconoCheck />
                  </span>
                  <strong>{nombre}</strong>
                  <span className="desc">{desc}</span>
                  <span className="precio">
                    desde <b>{precio(valor)}</b>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <span className="paso-num">02</span> Páginas
            </legend>
            <SelectorPaginas valor={paginas} onChange={setPaginas} precioAdicional={precio('paginaAdicional')} />
          </fieldset>

          <fieldset>
            <legend>
              <span className="paso-num">03</span> Extras
            </legend>
            <div className="extras">
              {EXTRAS.map(({ clave, nombre, desc, Icono }) => (
                <label key={clave} className={`extra ${extras[clave] ? 'activa' : ''}`}>
                  <input
                    type="checkbox"
                    checked={extras[clave]}
                    onChange={(e) => setExtras({ ...extras, [clave]: e.target.checked })}
                  />
                  <span className="opcion-icono">
                    <Icono />
                  </span>
                  <span className="extra-texto">
                    <strong>{nombre}</strong>
                    <span className="desc">{desc}</span>
                  </span>
                  <span className="precio">+{precio(clave)}</span>
                  <span className="interruptor" aria-hidden="true" />
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="boton" disabled={cargando}>
            {cargando ? <span className="girando" /> : null}
            {cargando ? 'Calculando…' : 'Calcular presupuesto'}
          </button>
        </form>

        <PanelResultado respuesta={respuesta} cargando={cargando} desactualizado={desactualizado} tarifas={tarifas} />
      </main>

      <footer className="pie">Las tarifas y el cálculo los controla el servidor · Node.js + Express · React</footer>
    </div>
  );
}

function EstadoApi({ activa }) {
  const texto = activa === null ? 'Comprobando API…' : activa ? 'API conectada' : 'API desconectada';
  const clase = activa === null ? 'pendiente' : activa ? 'ok' : 'ko';
  return (
    <span className={`estado-api ${clase}`}>
      <span className="punto" />
      {texto}
    </span>
  );
}
