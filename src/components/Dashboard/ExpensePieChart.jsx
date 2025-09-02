// src/components/Dashboard/ExpensePieChart.jsx
import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useFinance } from '../../hooks/useFinance';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ frequencyFilter = 'general' }) => {
  const { state } = useFinance();

  const data = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalLoanPayments = 0;

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

    // --- 1. Calcular ingresos proyectados según filtro ---
    state.incomes.forEach((inc) => {
      const factor = frequencyFactor(frequencyFilter) / frequencyFactor(inc.frequency);
      totalIncome += parseFloat(inc.amount) * factor || 0;
    });

    // --- 2. Calcular gastos proyectados según filtro ---
    state.expenses.forEach((exp) => {
      const factor = frequencyFactor(frequencyFilter) / frequencyFactor(exp.frequency);
      totalExpenses += parseFloat(exp.amount) * factor || 0;
    });

    // --- 3. Calcular préstamos/proyectos según filtro ---
state.loans?.forEach((loan) => {
  const remaining = loan.total - loan.paid;
  if (remaining <= 0) return;

  // factor según frecuencia del préstamo
  const loanFactor = {
    semanal: 1 / 4,
    quincenal: 1 / 2,
    mensual: 1,
    bimestral: 2,
    trimestral: 3,
    semestral: 6,
    anual: 12,
  }[loan.frequency] || 1;

  // factor según filtro seleccionado
  const filterFactor = {
    semanal: 1 / 2,
    quincenal: 1,
    mensual: 2,
    bimestral: 4,
    trimestral: 6,
    semestral: 12,
    anual: 26,
  }[frequencyFilter] || 1;

  // Calculamos la **cuota que corresponde al periodo seleccionado**
  const cuotaPeriodo = (loan.total / (loan.totalPayments || 1)) * (filterFactor / loanFactor);

  // Solo tomamos lo que debemos pagar este periodo
  totalLoanPayments += Math.min(cuotaPeriodo, remaining);
});


    // --- 4. Calcular ahorro ---
    const savings = Math.max(0, totalIncome - totalExpenses - totalLoanPayments);
    const balance = Math.max(0, totalIncome - (totalExpenses + totalLoanPayments + savings));

    // --- 5. Crear items para el gráfico ---
    const items = [];
    if (totalExpenses > 0) items.push({ label: `Gastos`, value: totalExpenses });
    if (totalLoanPayments > 0) items.push({ label: `Préstamos`, value: totalLoanPayments });
    if (savings > 0) items.push({ label: `Ahorro`, value: savings });
    if (balance > 0) items.push({ label: `Balance`, value: balance });

    if (items.length === 0) items.push({ label: 'Sin datos', value: 1 });

    return {
      labels: items.map((i) => i.label),
      datasets: [
        {
          data: items.map((i) => i.value),
          backgroundColor: [
            '#EF4444', // rojo = gastos
            '#F59E0B', // naranja = préstamos
            '#10B981', // verde = ahorro
            '#3B82F6', // azul = balance restante
          ].slice(0, items.length), // adapta colores al número de items
          borderWidth: 1,
        },
      ],
    };
  }, [state.incomes, state.expenses, state.loans, frequencyFilter]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
 <div style={{ height: '500px', width: '100%', position: 'relative' }}>
    <Pie data={data} options={options} />
  </div>
);
};

export default ExpensePieChart;
