const formatoEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  useGrouping: 'always', // 1.250 € (sin esto, es-ES no agrupa los números de 4 cifras)
});

export const euros = (n) => formatoEuros.format(n);
