// src/components/Dashboard/ExpenseCategoryChart.jsx
import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useFinance } from '../../hooks/useFinance';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseCategoryChart = ({ frequencyFilter = 'general' }) => {
  const { state } = useFinance();

  const data = useMemo(() => {
    const categories = {
      Transporte: 0,
      Servicios: 0,
      Alimentación: 0,
      Salud: 0,
      Entretenimiento: 0,
      Educación: 0,
      Hogar: 0,
      Ropa: 0,
      Ahorro: 0,
      Deudas: 0,
      Otros: 0,
    };

    state.expenses.forEach((exp) => {
      if (frequencyFilter === 'general' || exp.frequency === frequencyFilter) {
        const category = exp.category || 'Otros';
        const amount = parseFloat(exp.amount) || 0;
        if (categories[category] !== undefined) {
          categories[category] += amount;
        } else {
          categories['Otros'] += amount;
        }
      }
    });

    // Crear items
    const items = [];
    Object.keys(categories).forEach(cat => {
      if (categories[cat] > 0) {
        items.push({ label: cat, value: categories[cat] });
      }
    });

    if (items.length === 0) {
      items.push({ label: 'Sin datos', value: 1 });
    }

    return {
      labels: items.map(i => i.label),
      datasets: [
        {
           data: items.map(i => i.value),
          backgroundColor: [
            '#3B82F6', // azul
            '#F59E0B', // naranja
            '#10B981', // verde
            '#8B5CF6', // morado
            '#EF4444', // rojo
            '#06B6D4', // cyan
            '#6B7280', // gris
            '#EC4899', // rosa
            '#84CC16', // lima
            '#F97316', // naranja oscuro
            '#A855F7'  // morado claro
          ].slice(0, items.length),
          borderWidth: 1,
        },
      ],
    };
  }, [state.expenses, frequencyFilter]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${percent}% (${new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            }).format(value)})`;
          },
        },
      },
    },
  }));

 return (
  <div style={{ height: '500px', width: '100%', position: 'relative' }}>
    <Pie data={data} options={options} />
  </div>
  );
};

export default ExpenseCategoryChart;