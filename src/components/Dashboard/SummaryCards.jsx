// src/components/Dashboard/SummaryCards.jsx
import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';

const SummaryCards = () => {
  const { state } = useFinance();

  // Calculamos los totales con useMemo para evitar cálculos innecesarios
  const { totalIncome, totalExpenses, balance, savings } = useMemo(() => {
    const totalIncome = state.incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    const totalExpenses = state.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
    const savings = balance > 0 ? balance : 0;

    return { totalIncome, totalExpenses, balance, savings };
  }, [state.incomes, state.expenses]); // ✅ Solo se recalcula cuando cambian

  const format = (num) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(num);

  // En SummaryCards.jsx
const totalMonthly = [...state.incomes, ...state.expenses]
  .filter(item => item.frequency === 'mensual')
  .reduce((sum, item) => sum + (item.amount || 0), 0);

  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Ingresos */}
      <div className="bg-white dark:bg-gray-800 border-l-8 border-blue-500 text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-md transition-colors duration-300">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Ingresos Totales</h3>
        <p className="text-2xl font-bold mt-2">{format(totalIncome)}</p>
      </div>

      {/* Gastos */}
      <div className="bg-white dark:bg-gray-800 border-l-8 border-red-500 text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-md transition-colors duration-300">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Gastos Totales</h3>
        <p className="text-2xl font-bold mt-2">{format(totalExpenses)}</p>
      </div>

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 border-l-8 border-green-500 text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-md transition-colors duration-300">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Balance</h3>
        <p className="text-2xl font-bold mt-2">{format(balance)}</p>
      </div>

      {/* Ahorro */}
      <div className="bg-white dark:bg-gray-800 border-l-8 border-yellow-500 text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-md transition-colors duration-300">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Ahorro Potencial</h3>
        <p className="text-2xl font-bold mt-2">{format(savings)}</p>
      </div>
    </div>
  );
};

export default SummaryCards;