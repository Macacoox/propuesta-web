import { useState, useEffect } from 'react';
import { obtenerTarifas, pedirPresupuesto } from './api.js';

const euros = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const TIPOS = [
  ['landing', 'Landing', 'Una página de impacto'],
  ['corporativa', 'Corporativa', 'Web completa de empresa'],
];

export default function App() {
  const [tarifas, setTarifas] = useState(null);
  const [tipo, setTipo] = useState('corporativa');
  const [paginas, setPaginas] = useState('4');
  const [formulario, setFormulario] = useState(true);
  const [segundoIdioma, setSegundoIdioma] = useState(false);
  const [presupuesto, setPresupuesto] = useState(null);
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Las tarifas se muestran tal como las publica el servidor
  useEffect(() => {
    obtenerTarifas()
      .then(setTarifas)
      .catch(() => setErrores(['No se pudo conectar con la API. ¿Está arrancado el backend?']));
  }, []);

  async function enviar(evento) {
    evento.preventDefault();
    setCargando(true);
    setErrores([]);
    setPresupuesto(null);

    // Solo se envían las características; el precio lo calcula el servidor.
    // No se valida aquí a propósito: así se ven los errores 400 de la API.
    const solicitud = { tipo, paginas: Number(paginas), formulario, segundoIdioma };

    try {
      const resultado = await pedirPresupuesto(solicitud);
      if (resultado.ok) setPresupuesto(resultado.presupuesto);
      else setErrores(resultado.errores);
    } catch {
      setErrores(['No se pudo conectar con la API. ¿Está arrancado el backend?']);
    } finally {
      setCargando(false);
    }
  }

  const precio = (clave) => (tarifas ? euros(tarifas[clave]) : '…');

  return (
    <main className="contenedor">
      <header>
        <p className="etiqueta">Agencia · Calculadora</p>
        <h1>Presupuesta mi web</h1>
        <p className="subtitulo">Elige las características y el servidor calcula el precio con sus tarifas.</p>
      </header>

      <form className="tarjeta" onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Tipo de web</legend>
          <div className="opciones">
            {TIPOS.map(([valor, nombre, desc]) => (
              <label key={valor} className={`opcion ${tipo === valor ? 'activa' : ''}`}>
                <input type="radio" name="tipo" value={valor} checked={tipo === valor} onChange={() => setTipo(valor)} />
                <strong>{nombre}</strong>
                <span>{desc}</span>
                <em>{precio(valor)}</em>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Páginas</legend>
          <div className="paginas">
            <input type="range" min="1" max="20" value={Number(paginas) || 1} onChange={(e) => setPaginas(e.target.value)} />
            <input type="number" className="numero" value={paginas} onChange={(e) => setPaginas(e.target.value)} />
          </div>
          <p className="ayuda">La primera va incluida. Cada adicional: {precio('paginaAdicional')}</p>
        </fieldset>

        <fieldset>
          <legend>Extras</legend>
          <label className="interruptor">
            <input type="checkbox" checked={formulario} onChange={(e) => setFormulario(e.target.checked)} />
            <span className="pista" />
            Formulario de contacto <em>{precio('formulario')}</em>
          </label>
          <label className="interruptor">
            <input type="checkbox" checked={segundoIdioma} onChange={(e) => setSegundoIdioma(e.target.checked)} />
            <span className="pista" />
            Segundo idioma <em>{precio('segundoIdioma')}</em>
          </label>
        </fieldset>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Calculando…' : 'Calcular presupuesto'}
        </button>
      </form>

      {errores.length > 0 && (
        <section className="tarjeta error" role="alert">
          <h2>La API ha rechazado la solicitud</h2>
          <ul>
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      {presupuesto && (
        <section className="tarjeta resultado">
          <h2>Tu presupuesto</h2>
          <dl>
            <dt>Precio base</dt>
            <dd>{euros(presupuesto.base)}</dd>
            <dt>Páginas adicionales</dt>
            <dd>{euros(presupuesto.paginasAdicionales)}</dd>
            <dt>Formulario</dt>
            <dd>{euros(presupuesto.formulario)}</dd>
            <dt>Segundo idioma</dt>
            <dd>{euros(presupuesto.segundoIdioma)}</dd>
          </dl>
          <p className="total">
            Total <strong>{euros(presupuesto.total)}</strong>
          </p>
        </section>
      )}
    </main>
  );
}
