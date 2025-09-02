// src/components/Dashboard/IncomeBarChart.jsx
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useFinance } from '../../hooks/useFinance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const IncomeBarChart = () => {
  const { state } = useFinance();

  const chartData = useMemo(() => {

    const now = new Date();
    const months = [];
    const incomeByMonth = Array(6).fill(0);
    const loanPaymentByMonth = Array(6).fill(0);
    const creditCardPaymentByMonth = Array(6).fill(0);
    const savingsByMonth = Array(6).fill(0);

    // Generar próximos 6 meses
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(date.toLocaleString('es-ES', { month: 'short', year: '2-digit' }));
    }

    const getMonthIndex = (date) => {
      const d = new Date(date);
      const diff = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
      return diff;
    };

    // === 1. Ingresos ===
    state.incomes.forEach((inc) => {
      const freq = inc.frequency;
      for (let i = 0; i < 6; i++) {
        const idx = getMonthIndex(new Date(now.getFullYear(), now.getMonth() + i));
        if (idx >= 0 && idx < 6) {
          if (freq === 'mensual') {
            incomeByMonth[idx] += parseFloat(inc.amount) || 0;
          } else if (freq === 'quincenal') {
            incomeByMonth[idx] += (parseFloat(inc.amount) || 0) / 2;
          }
        }
      }
    });

    // === 2. Préstamos ===
    state.debts?.forEach((debts) => {
      const startDate = new Date(debts.startDate);
      const totalPayments = (() => {
        switch (debts.frequency) {
          case 'mensual': return debts.duration;
          case 'quincenal': return debts.duration * 2;
          case 'semanal': return debts.duration * 4;
          default: return debts.duration;
        }
      })();

      const paymentAmount = totalPayments > 0 ? debts.total / totalPayments : 0;

      for (let i = 0; i < totalPayments; i++) {
        const paymentDate = new Date(startDate);
        switch (debts.frequency) {
          case 'mensual': paymentDate.setMonth(startDate.getMonth() + i); break;
          case 'quincenal': paymentDate.setDate(startDate.getDate() + i * 15); break;
          case 'semanal': paymentDate.setDate(startDate.getDate() + i * 7); break;
          default: paymentDate.setMonth(startDate.getMonth() + i);
        }

        const idx = getMonthIndex(paymentDate);
        if (idx >= 0 && idx < 6) {
          loanPaymentByMonth[idx] += paymentAmount;
        }
      }
    });

    // === 3. Tarjetas ===
    state.creditCards?.forEach((card) => {
      const paymentDate = new Date(card.paymentDate || card.startDate || now);
      const paymentAmount = card.minPayment || 0;

      let current = new Date(paymentDate);
      while (getMonthIndex(current) < 6) {
        const idx = getMonthIndex(current);
        if (idx >= 0 && idx < 6) {
          creditCardPaymentByMonth[idx] += paymentAmount;
        }
        current.setMonth(current.getMonth() + 1);
      }
    });

    // === 4. Ahorro ===
    for (let i = 0; i < 6; i++) {
      const totalDebts = loanPaymentByMonth[i] + creditCardPaymentByMonth[i];
      savingsByMonth[i] = Math.max(0, incomeByMonth[i] - totalDebts);
    }

    const data = {
      labels: months,
      datasets: [
        {
           incomeByMonth,
          label: 'Ingresos',
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10B981',
          borderWidth: 1,
        },
        {
           loanPaymentByMonth,
          label: 'Préstamos',
          backgroundColor: 'rgba(147, 51, 234, 0.7)',
          borderColor: '#9333EA',
          borderWidth: 1,
        },
        {
           creditCardPaymentByMonth,
          label: 'Tarjetas',
          backgroundColor: 'rgba(234, 179, 8, 0.7)',
          borderColor: '#EAB308',
          borderWidth: 1,
        },
        {
           savingsByMonth,
          label: 'Ahorro',
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3B82F6',
          borderWidth: 1,
        },
      ],
    };

    return data;
  }, [state.incomes, state.debts, state.creditCards]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y;
            return `${ctx.dataset.label}: ${new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP'
            }).format(value)}`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default IncomeBarChart;