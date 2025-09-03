// src/components/Dashboard/SummaryCards.jsx
import React, { useMemo } from 'react';
import { useFinance } from '../../hooks/useFinance';

const SummaryCards = ({ frequencyFilter = 'general' }) => {
  const { state } = useFinance();

  // Factor para normalizar según frecuencia
  const frequencyFactor = (freq) => {
    const map = {
      semanal: 1 / 2,
      quincenal: 1,
      mensual: 2,
      bimestral: 4,
      trimestral: 6,
      semestral: 12,
      anual: 26,
    };
    return map[freq] || 1;
  };

  // Calcular ingresos según filtro
  const totalIncome = useMemo(() => {
    return state.incomes.reduce((sum, inc) => {
      const factor = frequencyFactor(frequencyFilter) / frequencyFactor(inc.frequency);
      return sum + (parseFloat(inc.amount) || 0) * factor;
    }, 0);
  }, [state.incomes, frequencyFilter]);

  // Calcular gastos según filtro
  const totalExpenses = useMemo(() => {
    return state.expenses.reduce((sum, exp) => {
      const factor = frequencyFactor(frequencyFilter) / frequencyFactor(exp.frequency);
      return sum + (parseFloat(exp.amount) || 0) * factor;
    }, 0);
  }, [state.expenses, frequencyFilter]);

  // Calcular préstamos según filtro (solo lo que corresponde al periodo)
  const totalLoansPending = useMemo(() => {
    return (state.loans || []).reduce((sum, loan) => {
      const remaining = loan.total - loan.paid;
      if (remaining <= 0) return sum;

      // Cuota correspondiente al periodo
      const loanFactor = frequencyFactor(frequencyFilter) / frequencyFactor(loan.frequency);
      const cuotaPeriodo = (loan.total / (loan.totalPayments || 1)) * loanFactor;
      return sum + Math.min(cuotaPeriodo, remaining);
    }, 0);
  }, [state.loans, frequencyFilter]);

  // Ahorro potencial = ingreso - (gastos + préstamos)
  const savings = Math.max(0, totalIncome - totalExpenses - totalLoansPending);

  // Balance restante (opcional, dinero disponible no comprometido)
  const balance = Math.max(0, totalIncome - totalExpenses - totalLoansPending - savings);

  // Formateo de moneda
  const format = (num) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(num);

  // Datos para mostrar
  const cards = [
    { title: 'Ingresos Totales', value: totalIncome, color: 'border-blue-500' },
    { title: 'Gastos Totales', value: totalExpenses, color: 'border-blue-500' },
    { title: 'Préstamos Pendientes', value: totalLoansPending, color: 'border-blue-500' },
    { title: 'Ahorro Potencial', value: savings, color: 'border-blue-500' },
    balance > 0 && { title: 'Balance Restante', value: balance, color: 'border-blue-500' },
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-white dark:bg-gray-800 border-l-8 ${card.color} text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-md transition-colors duration-300`}
        >
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">{card.title}</h3>
          <p className="text-2xl font-bold mt-2">{format(card.value)}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
