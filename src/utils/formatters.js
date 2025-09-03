export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-MX', { // ✅ Cambiado a español de México
    style: 'currency',
    currency: 'MXN', // ✅ Moneda correcta: Pesos mexicanos
    minimumFractionDigits: 2, // ✅ Recomendado: 2 decimales para moneda
  }).format(amount);