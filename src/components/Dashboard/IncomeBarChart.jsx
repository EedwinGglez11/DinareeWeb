// src/components/Dashboard/IncomeBarChart.jsx
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useFinance } from '../../context/FinanceContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const IncomeBarChart = ({ frequencyFilter = 'general' }) => {
  const { state } = useFinance();

  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    const incomeByMonth = Array(6).fill(0);
    const expenseByMonth = Array(6).fill(0);

    // Generar los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString('es-ES', { month: 'short', year: '2-digit' }));
    }

    const getMonthIndex = (dateStr) => {
      const date = new Date(dateStr);
      const diff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      return 5 - diff;
    };

    // Filtrar ingresos por frecuencia
    state.incomes.forEach((inc) => {
      if (frequencyFilter === 'general' || inc.frequency === frequencyFilter) {
        const idx = getMonthIndex(inc.date);
        if (idx >= 0 && idx < 6) {
          incomeByMonth[idx] += parseFloat(inc.amount) || 0;
        }
      }
    });

    // Filtrar gastos por frecuencia
    state.expenses.forEach((exp) => {
      if (frequencyFilter === 'general' || exp.frequency === frequencyFilter) {
        const idx = getMonthIndex(exp.date);
        if (idx >= 0 && idx < 6) {
          expenseByMonth[idx] += parseFloat(exp.amount) || 0;
        }
      }
    });

    // Añadir pagos de préstamos según frecuencia
    state.loans?.forEach((loan) => {
      if (frequencyFilter === 'general' || loan.frequency === frequencyFilter) {
        const startDate = new Date(loan.startDate);
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

        for (let i = 0; i < totalPayments; i++) {
          const paymentDate = new Date(startDate);
          switch (loan.frequency) {
            case 'semanal': paymentDate.setDate(startDate.getDate() + i * 7); break;
            case 'quincenal': paymentDate.setDate(startDate.getDate() + i * 15); break;
            case 'mensual': paymentDate.setMonth(startDate.getMonth() + i); break;
            case 'bimestral': paymentDate.setMonth(startDate.getMonth() + i * 2); break;
            case 'trimestral': paymentDate.setMonth(startDate.getMonth() + i * 3); break;
            case 'semestral': paymentDate.setMonth(startDate.getMonth() + i * 6); break;
            case 'anual': paymentDate.setMonth(startDate.getMonth() + i * 12); break;
          }

          const idx = getMonthIndex(paymentDate);
          if (idx >= 0 && idx < 6) {
            expenseByMonth[idx] += paymentAmount;
          }
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Ingresos',
           incomeByMonth,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10B981',
          borderWidth: 1,
        },
        {
          label: 'Gastos',
           expenseByMonth,
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: '#EF4444',
          borderWidth: 1,
        },
      ],
    };
  }, [state.incomes, state.expenses, state.loans, frequencyFilter]);

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
            const value = context.parsed.y;
            const formatted = new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            }).format(value);
            return `${context.dataset.label}: ${formatted}`;
          },
        },
        backgroundColor: '#1f2937',
      },
    },
  }), []);

  return <Bar data={chartData} options={options} />;
};

export default IncomeBarChart;