// src/pages/DashboardPage.jsx
import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import SummaryCards from '../components/Dashboard/SummaryCards';
import ExpensePieChart from '../components/Dashboard/ExpensePieChart';
import IncomeBarChart from '../components/Dashboard/IncomeBarChart';
import ExpenseCategoryChart from '../components/Dashboard/ExpenseCategoryChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportToExcel } from '../services/exportService';
import { Download, FileSpreadsheet, Calendar } from "lucide-react";

const DashboardPage = () => {
  const { state } = useFinance();
  const now = useMemo(() => new Date(), []);

  // === Generar todos los próximos pagos: gastos, préstamos y tarjetas ===
  const allPendingPayments = useMemo(() => {
    const payments = [];

    // 1. Gastos recurrentes y únicos
    (state.expenses || []).forEach((exp) => {
      if (exp.frequency === 'único') {
        const date = new Date(exp.date);
        if (!isNaN(date.getTime()) && date >= now) {
          payments.push({
            id: exp.id,
            type: 'gasto',
            name: exp.description,
            category: exp.category,
            amount: exp.amount,
            dueDate: exp.date,
            paymentType: 'Pago único',
          });
        }
      } else {
        // ✅ Usar nextPaymentDate si existe, si no calcularlo
    let nextPaymentDate;
    if (exp.nextPaymentDate) {
      nextPaymentDate = new Date(exp.nextPaymentDate);
    } else {
      const lastPaymentDate = new Date(exp.date);
      if (isNaN(lastPaymentDate.getTime())) return;
      nextPaymentDate = new Date(lastPaymentDate);
      switch (exp.frequency) {
        case 'semanal': nextPaymentDate.setDate(lastPaymentDate.getDate() + 7); break;
        case 'quincenal': nextPaymentDate.setDate(lastPaymentDate.getDate() + 15); break;
        case 'mensual': nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 1); break;
        default: return;
      }
    }

    if (nextPaymentDate >= now) {
      payments.push({
        id: exp.id,
        type: 'gasto',
        name: exp.description,
        category: exp.category,
        amount: exp.amount,
        dueDate: nextPaymentDate.toISOString().split('T')[0],
        paymentType: `Próximo pago (${exp.frequency})`,
      });
    }
  }
    });

// 2. Préstamos (cuotas pendientes)
(state.loans || []).forEach((loan) => {
  // Validación básica
  if (!loan.name || !loan.total || !loan.duration || loan.total <= 0 || loan.duration <= 0) {
    console.warn('Préstamo con datos inválidos:', loan);
    return;
  }

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

  if (paidCount < totalPayments) {
    // Usar lastPaymentDate si existe, si no usar startDate
    const baseDate = loan.lastPaymentDate ? new Date(loan.lastPaymentDate) : startDate;
    const nextPaymentDate = new Date(baseDate);

    switch (loan.frequency) {
      case 'semanal':
        nextPaymentDate.setDate(baseDate.getDate() + 7);
        break;
      case 'quincenal':
        nextPaymentDate.setDate(baseDate.getDate() + 15);
        break;
      case 'mensual':
      default:
        nextPaymentDate.setMonth(baseDate.getMonth() + 1);
        break;
    }

    if (nextPaymentDate >= now) {
      payments.push({
        id: `${loan.id}-loan-${paidCount + 1}`,
        type: 'préstamo',
        name: loan.name,
        amount: paymentAmount,
        dueDate: nextPaymentDate.toISOString().split('T')[0],
        paymentType: `Cuota ${paidCount + 1}/${totalPayments}`,
      });
    }
  }
});


    // 3. Tarjetas de crédito (pago mínimo)
(state.creditCards || []).forEach((card) => {
  if (!card.cardName || card.minPayment <= 0 || card.currentDebt <= 0) {
    console.warn('Tarjeta con datos inválidos:', card);
    return;
  }

  // Usar paymentDate como base (día del mes para pagar)
  if (!card.paymentDate) {
    console.warn('Tarjeta sin fecha de pago:', card);
    return;
  }

  const paymentDate = new Date(card.paymentDate);
  if (isNaN(paymentDate.getTime())) {
    console.warn('Fecha de pago inválida:', card.paymentDate);
    return;
  }

  const dayOfMonth = paymentDate.getDate(); // Ej: 10 (del 10 de cada mes)
  const now = new Date();

  // Construir la fecha de pago de este mes
  let nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);

  // Si ya pasó este mes, usar el mes siguiente
  if (nextPaymentDate < now) {
    nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }

  // Asegurarnos de que sea una fecha válida (ej: no 30 de febrero)
  if (isNaN(nextPaymentDate.getTime())) {
    console.warn('Fecha de pago inválida generada:', nextPaymentDate);
    return;
  }

  payments.push({
    id: `${card.id}-card`,
    type: 'tarjeta',
    name: `${card.cardName} (${card.bank})`,
    amount: card.minPayment,
    dueDate: nextPaymentDate.toISOString().split('T')[0],
    paymentType: 'Pago mínimo',
  });
});
    

    // Ordenar por fecha (próximos primero)
    return payments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [state.expenses, state.loans, state.creditCards, now]);

  // === Filtro: Esta semana / Esta quincena / Este mes ===
  const [filter, setFilter] = useState('week');

  const getDateRange = () => {
    const today = new Date();
    let start, end;

    switch (filter) {
      case 'week': {
        const day = today.getDay();
        const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(today);
        start.setDate(diffToMonday);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }

      case 'fortnight': {
        const date = today.getDate();
        if (date <= 15) {
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          end = new Date(today.getFullYear(), today.getMonth(), 15, 23, 59, 59, 999);
        } else {
          start = new Date(today.getFullYear(), today.getMonth(), 16);
          end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        break;
      }

      case 'month':
      default: {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }
    }

    return { start, end };
  };

  const { start, end } = getDateRange();

const filteredPayments = allPendingPayments.filter(p => {
  const dueDate = new Date(p.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate >= start && dueDate <= end;
});

  const totalAmountDue = filteredPayments.reduce((sum, p) => {
  const amount = Number(p.amount);
  return sum + (isNaN(amount) ? 0 : amount);
}, 0);

  // === Exportaciones ===
  const generatePDF = () => {
    const input = document.getElementById('dashboard-content');
    if (!input) return;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('finanzapp-dashboard.pdf');
    });
  };

  const handleExportExcel = () => {
    exportToExcel(state);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 pb-20">
      <div id="dashboard-content" className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Financiero
          </h1>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-800/50 px-3 py-1 rounded-lg transition"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 dark:text-green-300 dark:bg-green-900/30 dark:hover:bg-green-800/50 px-3 py-1 rounded-lg transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>

        {/* Resumen rápido */}
        <SummaryCards />

        {/* Próximos pagos */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2 text-gray-700 dark:text-gray-100">
              <Calendar className="w-4 h-4 text-blue-500" /> Próximos Pagos
            </h2>

            {/* Filtro */}
            <div className="flex gap-1 mt-2 sm:mt-0">
              {[
                { key: 'week', label: 'Esta semana' },
                { key: 'fortnight', label: 'Esta quincena' },
                { key: 'month', label: 'Este mes' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`text-xs px-3 py-1 rounded-full transition ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 text-sm">
            <span>Total: <strong>{new Intl.NumberFormat('es-MX').format(totalAmountDue)}</strong></span>
            <span className="text-xs text-gray-500">{filteredPayments.length} pagos</span>
          </div>

          {filteredPayments.length === 0 ? (
            <p className="text-sm text-gray-500">No hay pagos programados en este periodo.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredPayments.map(p => (
                <div key={p.id} className="flex justify-between text-sm border-b pb-2 dark:border-gray-700">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.paymentType}</p>
                  </div>
                  <div className="text-right">
                    <p>{new Intl.NumberFormat('es-MX').format(p.amount)}</p>
                    <p className="text-xs text-orange-500">{new Date(p.dueDate).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Ingresos vs Gastos (6 meses)</h2>
            <IncomeBarChart />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Gastos por Categoría</h2>
            <ExpenseCategoryChart />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;