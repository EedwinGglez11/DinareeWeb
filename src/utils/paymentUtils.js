// src/utils/paymentUtils.js

/**
 * Genera todas las fechas de pago dentro de un rango dado,
 * respetando la frecuencia del pago.
 */
export const generatePaymentDates = (startDate, frequency, endDate, periodStart, periodEnd) => {
  const dates = [];
  let current = new Date(startDate);

  // Ajustar al inicio del periodo si es necesario
  if (current < periodStart) {
    const dayDiff = Math.floor((periodStart - startDate) / (1000 * 60 * 60 * 24));
    switch (frequency) {
      case 'semanal': {
        const weeksToAdd = Math.ceil(dayDiff / 7);
        current.setDate(startDate.getDate() + weeksToAdd * 7);
        break;
      }
      case 'quincenal': {
        const fortnightsToAdd = Math.ceil(dayDiff / 15);
        current.setDate(startDate.getDate() + fortnightsToAdd * 15);
        break;
      }
      case 'mensual': {
        const monthsToAdd = Math.ceil(dayDiff / 30);
        current.setMonth(startDate.getMonth() + monthsToAdd);
        break;
      }
      default:
        current = new Date(periodStart);
    }
  }

  while (current <= periodEnd) {
    dates.push(new Date(current));
    switch (frequency) {
      case 'semanal':
        current.setDate(current.getDate() + 7);
        break;
      case 'quincenal':
        current.setDate(current.getDate() + 15);
        break;
      case 'mensual':
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        current.setMonth(current.getMonth() + 1);
    }
    if (endDate && current > endDate) break;
  }

  return dates;
};

/**
 * Calcula TODOS los pagos programados en el mes actual:
 * - Gastos recurrentes
 * - Préstamos (cuotas no pagadas)
 * - Tarjetas de crédito (pago mínimo)
 *
 * Usa la MISMA lógica que DashboardPage para garantizar consistencia.
 */
export const calculateLoanPaymentsThisMonth = (state, now) => {
  if (!state || !now) return 0;

  let total = 0;

  // === Rango del mes actual ===
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // === Copia exacta de generatePaymentDates desde DashboardPage ===
  const generatePaymentDates = (startDate, frequency, endDate, periodStart, periodEnd) => {
    const dates = [];
    let current = new Date(startDate);

    if (current < periodStart) {
      const dayDiff = Math.floor((periodStart - startDate) / (1000 * 60 * 60 * 24));
      switch (frequency) {
        case 'semanal': {
          const weeksToAdd = Math.ceil(dayDiff / 7);
          current.setDate(startDate.getDate() + weeksToAdd * 7);
          break;
        }
        case 'quincenal': {
          const fortnightsToAdd = Math.ceil(dayDiff / 15);
          current.setDate(startDate.getDate() + fortnightsToAdd * 15);
          break;
        }
        case 'mensual': {
          const monthsToAdd = Math.ceil(dayDiff / 30);
          current.setMonth(startDate.getMonth() + monthsToAdd);
          break;
        }
        default:
          if (current < periodStart) current = new Date(periodStart);
      }
    }

    while (current <= periodEnd) {
      dates.push(new Date(current));
      switch (frequency) {
        case 'semanal':
          current.setDate(current.getDate() + 7);
          break;
        case 'quincenal':
          current.setDate(current.getDate() + 15);
          break;
        case 'mensual':
          current.setMonth(current.getMonth() + 1);
          break;
        default:
          current.setMonth(current.getMonth() + 1);
      }
      if (endDate && current > endDate) break;
    }

    return dates;
  };

  // === Procesar préstamos ===
  (state.loans || []).forEach(loan => {
    const startDate = new Date(loan.startDate);
    if (isNaN(startDate.getTime())) return;

    const totalPayments = (() => {
      switch (loan.frequency) {
        case 'semanal': return loan.duration * 4;
        case 'quincenal': return loan.duration * 2;
        case 'mensual': return loan.duration;
        default: return loan.duration;
      }
    })();
    const paymentAmount = totalPayments > 0 ? loan.total / totalPayments : 0;
    const paidCount = Math.floor(loan.paid / paymentAmount);

    if (paidCount >= totalPayments) return; // Ya terminó

    const dates = generatePaymentDates(
      startDate,
      loan.frequency,
      null,
      monthStart,
      monthEnd
    );

    const validDates = dates.slice(0, totalPayments - paidCount);
    total += validDates.length * paymentAmount;
  });

  return Math.round(total * 100) / 100;
};