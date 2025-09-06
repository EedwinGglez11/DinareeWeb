// src/pages/DashboardPage.jsx
import React, { useMemo } from 'react';
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

  /*const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();*/

  // === Próximos pagos ===
  const allPendingPayments = useMemo(() => {
    const payments = [];

    // Gastos recurrentes
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
        const lastPaymentDate = new Date(exp.date);
        if (isNaN(lastPaymentDate.getTime())) return;

        const nextPaymentDate = new Date(lastPaymentDate);
        switch (exp.frequency) {
          case 'semanal': nextPaymentDate.setDate(lastPaymentDate.getDate() + 7); break;
          case 'quincenal': nextPaymentDate.setDate(lastPaymentDate.getDate() + 15); break;
          case 'mensual': nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 1); break;
          default: return;
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

    // Préstamos
    (state.loans || []).forEach((loan) => {
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
        const nextPaymentDate = new Date(startDate);
        nextPaymentDate.setMonth(startDate.getMonth() + paidCount + 1);
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

    // Tarjetas de crédito
    (state.creditCards || []).forEach((card) => {
      if (card.minPayment > 0 && card.currentDebt > 0) {
        const baseDate = card.paymentDate ? new Date(card.paymentDate) : card.cutDate ? new Date(card.cutDate) : now;
        if (isNaN(baseDate.getTime())) return;

        const nextPaymentDate = new Date(baseDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        if (nextPaymentDate >= now) {
          payments.push({
            id: `${card.id}-card`,
            type: 'tarjeta',
            name: `${card.cardName} (${card.bank})`,
            amount: card.minPayment,
            dueDate: nextPaymentDate.toISOString().split('T')[0],
            paymentType: 'Pago mínimo',
          });
        }
      }
    });

    return payments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [state.expenses, state.loans, state.creditCards, now]);

  const totalAmountDue = allPendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

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
          <h2 className="text-lg font-medium flex items-center gap-2 text-gray-700 dark:text-gray-100 mb-4">
            <Calendar className="w-4 h-4 text-blue-500" /> Próximos Pagos
          </h2>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 text-sm">
            <span>Total: <strong>{new Intl.NumberFormat('es-MX').format(totalAmountDue)}</strong></span>
            <span className="text-xs text-gray-500">{allPendingPayments.length} pagos</span>
          </div>
          {allPendingPayments.length === 0 ? (
            <p className="text-sm text-gray-500">No hay pagos pendientes.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allPendingPayments.slice(0, 5).map(p => (
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