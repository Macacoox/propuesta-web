const MIN = 1;
const MAX = 20;

// El número se puede escribir libremente (por ejemplo 0 o 21) para ver
// cómo responde la validación del servidor. Los botones y el deslizador
// se mantienen dentro del rango.
export default function SelectorPaginas({ valor, onChange, precioAdicional }) {
  const n = Number(valor);
  const enRango = Math.min(MAX, Math.max(MIN, Math.round(n) || MIN));
  const progreso = ((enRango - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="selector-paginas">
      <div className="contador">
        <button type="button" className="paso" onClick={() => onChange(String(Math.max(MIN, enRango - 1)))} aria-label="Una página menos">
          −
        </button>
        <input
          type="number"
          className="numero"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Número de páginas"
        />
        <button type="button" className="paso" onClick={() => onChange(String(Math.min(MAX, enRango + 1)))} aria-label="Una página más">
          +
        </button>
      </div>

      <input
        type="range"
        className="deslizador"
        min={MIN}
        max={MAX}
        value={enRango}
        style={{ '--progreso': `${progreso}%` }}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Número de páginas"
      />
      <div className="escala">
        <span>{MIN}</span>
        <span>{MAX}</span>
      </div>

      <p className="ayuda">
        La primera página va incluida en el precio base. Cada adicional: <strong>{precioAdicional}</strong>
      </p>
    </div>
  );
}
