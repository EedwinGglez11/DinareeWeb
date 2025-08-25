// src/components/Dashboard/ExpensePieChart.jsx
import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useFinance } from '../../context/FinanceContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ frequencyFilter = 'general' }) => {
  const { state } = useFinance();

  const data = useMemo(() => {
    const items = [];

    // Gastos regulares
    state.expenses.forEach((exp) => {
      if (frequencyFilter === 'general' || exp.frequency === frequencyFilter) {
        items.push({
          label: `${exp.category} – ${exp.description}`,
          value: parseFloat(exp.amount) || 0,
        });
      }
    });

    // Préstamos como elementos individuales
    state.loans?.forEach((loan) => {
      if (frequencyFilter === 'general' || loan.frequency === frequencyFilter) {
        const totalPayments = (() => {
          switch (loan.frequency) {
            case 'semanal': return loan.duration * 4;
            case 'quincenal': return loan.duration * 2;
            case 'mensual': return loan.duration;
            case 'bimestral': return Math.ceil(loan.duration / 2);
            case 'trimestral': return Math.ceil(loan.duration / 3);
            case 'semestral': return Math.ceil(loan.duration / 6);
            case 'anual': return Math.ceil(loan.duration / 12);
            default: return loan.duration;
          }
        })();

        const paymentAmount = totalPayments > 0 ? (loan.total / totalPayments) : 0;

        items.push({
          label: `${loan.name} (Préstamo)`,
          value: paymentAmount,
        });
      }
    });

    // Si no hay datos, mostrar mensaje
    if (items.length === 0) {
      items.push({ label: 'Sin datos', value: 1 });
    }

    return {
      labels: items.map(item => item.label),
      datasets: [
        {
          data: items.map(item => item.value),
          backgroundColor: [
            '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444',
            '#06B6D4', '#6B7280', '#EC4899', '#84CC16', '#F97316',
            '#A855F7', '#14B8A6', '#F472B6', '#93C5FD', '#FDBA74'
          ].slice(0, items.length),
          borderWidth: 1,
        },
      ],
    };
  }, [state.expenses, state.loans, frequencyFilter]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const formatted = new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            }).format(value);
            return ` ${formatted}`;
          },
        },
        backgroundColor: '#1f2937',
      },
    },
  }), []);

  return <Pie data={data} options={options} />;
};

export default ExpensePieChart;