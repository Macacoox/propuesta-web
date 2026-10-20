// Iconos SVG en línea (trazo de 24×24), sin librerías externas
function Icono({ children }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconoLanding = () => (
  <Icono>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </Icono>
);

export const IconoCorporativa = () => (
  <Icono>
    <path d="M3 21h18M5 21V7l7-4 7 4v14" />
    <path d="M9 10h1M14 10h1M9 14h1M14 14h1M10 21v-3h4v3" />
  </Icono>
);

export const IconoFormulario = () => (
  <Icono>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icono>
);

export const IconoIdioma = () => (
  <Icono>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
  </Icono>
);

export const IconoCheck = () => (
  <Icono>
    <path d="m5 12 5 5 9-10" />
  </Icono>
);

export const IconoAviso = () => (
  <Icono>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6M12 16.5v.5" />
  </Icono>
);

export const IconoServidor = () => (
  <Icono>
    <rect x="4" y="4" width="16" height="7" rx="1.5" />
    <rect x="4" y="13" width="16" height="7" rx="1.5" />
    <path d="M8 7.5h.01M8 16.5h.01" />
  </Icono>
);
