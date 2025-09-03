// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import SummaryCards from '../components/Dashboard/SummaryCards';
import ExpensePieChart from '../components/Dashboard/ExpensePieChart';
import IncomeBarChart from '../components/Dashboard/IncomeBarChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportToExcel } from '../services/exportService';
import { Download, FileSpreadsheet, Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import ExpenseCategoryChart from '../components/Dashboard/ExpenseCategoryChart';
import { saveData } from '../services/storageService';
import { useMemo } from 'react';

const DashboardPage = () => {
  const { state, dispatch } = useFinance();
  const [frequencyFilter, setFrequencyFilter] = useState('general');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [processedPayments, setProcessedPayments] = useState(new Set());

  const handleExportExcel = () => {
    exportToExcel(state);
  };

  const generatePDF = () => {
    const input = document.getElementById('dashboard-content');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('finanzapp-dashboard.pdf');
    });
  };

  const [overduePayments, setOverduePayments] = useState([]);

  const allPendingPayments = useMemo(() => {
    const now = new Date();
    const payments = [];

    // === 1. Gastos recurrentes ===
    state.expenses.forEach((exp) => {
      if (exp.frequency === 'único') {
        const date = new Date(exp.date);
        if (date >= now && !processedPayments.has(exp.id)) {
          payments.push({
            id: exp.id,
            type: 'gasto',
            name: exp.description,
            category: exp.category,
            amount: exp.amount,
            dueDate: exp.date,
            paymentType: 'Pago único',
            originalAmount: exp.amount,
          });
        }
      } else {
        const lastPaymentDate = new Date(exp.date);
        const nextPaymentDate = new Date(lastPaymentDate);

        switch (exp.frequency) {
          case 'semanal': nextPaymentDate.setDate(lastPaymentDate.getDate() + 7); break;
          case 'quincenal': nextPaymentDate.setDate(lastPaymentDate.getDate() + 15); break;
          case 'mensual': nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 1); break;
          case 'bimestral': nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 2); break;
          case 'trimestral': nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 3); break;
          case 'semestral': nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 6); break;
          case 'anual': nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 12); break;
        }

        const effectiveNextDate = nextPaymentDate < now ? now : nextPaymentDate;
        const dueDateStr = effectiveNextDate.toISOString().split('T')[0];

        if (!processedPayments.has(exp.id)) {
          payments.push({
            id: exp.id,
            type: 'gasto',
            name: exp.description,
            category: exp.category,
            amount: exp.amount,
            dueDate: dueDateStr,
            paymentType: `Próximo pago (${exp.frequency})`,
            originalAmount: exp.amount,
          });
        }
      }
    });

    // === 2. Préstamos ===
    state.loans?.forEach((loan) => {
      const startDate = new Date(loan.startDate);
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
        const paymentId = `${loan.id}-payment-${paidCount + 1}`;

        if (!processedPayments.has(paymentId)) {
          payments.push({
            id: paymentId,
            parentId: loan.id,
            type: 'préstamo',
            name: loan.name,
            category: loan.category,
            amount: paymentAmount,
            dueDate: nextPaymentDate.toISOString().split('T')[0],
            paymentType: `Cuota ${paidCount + 1}/${totalPayments}`,
            originalAmount: paymentAmount,
            interestRate: 0.015,
          });
        }
      }
    });

    // === 3. Tarjetas de Crédito ===
    state.creditCards?.forEach((card) => {
      if (card.minPayment > 0 && card.currentDebt > 0) {
        const paymentDate = new Date(card.paymentDate || card.cutDate || now);
        const nextPaymentDate = new Date(paymentDate);
        nextPaymentDate.setMonth(paymentDate.getMonth() + 1);
        const paymentId = `${card.id}-payment`;

        if (!processedPayments.has(paymentId)) {
          payments.push({
            id: paymentId,
            parentId: card.id,
            type: 'tarjeta',
            name: `${card.cardName} (${card.bank})`,
            category: 'Tarjeta de Crédito',
            amount: card.minPayment,
            dueDate: nextPaymentDate.toISOString().split('T')[0],
            paymentType: 'Pago mínimo',
            originalAmount: card.minPayment,
            interestRate: (card.interestRate || 24) / 100 / 12,
          });
        }
      }
    });

    return payments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [state.expenses, state.loans, state.creditCards, processedPayments]);

  const handlePaymentChange = (paymentId, field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [paymentId]: {
        ...prev[paymentId],
        [field]: value,
        amountPaid: field === 'action' && value === 'full' ? 'liquidar' : prev[paymentId]?.amountPaid
      }
    }));
  };

  const processPayment = (payment, action, amountPaid) => {
    const { parentId, type } = payment;
    let updates = [];

    setProcessedPayments(prev => new Set([...prev, payment.id]));

    if (action === 'no-pagar') {
      setOverduePayments(prev => [...prev, { ...payment, date: new Date().toISOString() }]);
      alert(`⚠️ ${payment.name} marcado como no pagado.`);
      return;
    }

    const paid = parseFloat(amountPaid) || payment.amount;

    if (action === 'liquidar' && type === 'préstamo') {
      const loan = state.loans.find(l => l.id === parentId);
      if (loan) {
        updates.push({ type: 'loan', id: parentId, paid: loan.total });
        alert(`💡 ${loan.name} liquidado.`);
      }
    } else if (action === 'abonar' || action === 'pagar') {
      if (type === 'préstamo') {
        const loan = state.loans.find(l => l.id === parentId);
        if (loan) {
          updates.push({ type: 'loan', id: parentId, paid: loan.paid + paid });
          alert(`✅ Cuota pagada en ${loan.name}`);
        }
      } else if (type === 'tarjeta') {
        const card = state.creditCards.find(c => c.id === parentId);
        if (card) {
          const newDebt = Math.max(0, card.currentDebt - paid);
          updates.push({ type: 'card', id: parentId, currentDebt: newDebt });
          alert(`✅ Abono en ${card.cardName}`);
        }
      } else {
        alert(`✅ Gasto "${payment.name}" pagado.`);
      }
    }

    if (updates.length > 0) {
      let newState = { ...state };
      updates.forEach(update => {
        if (update.type === 'loan') {
          newState = {
            ...newState,
            loans: newState.loans.map(l => l.id === update.id ? { ...l, paid: update.paid } : l)
          };
        } else if (update.type === 'card') {
          newState = {
            ...newState,
            creditCards: newState.creditCards.map(c => c.id === update.id ? { ...c, currentDebt: update.currentDebt } : c)
          };
        }
      });
      dispatch({ type: 'SET_DATA', payload: newState });
      saveData(newState);
    }
  };

  const totalAmountDue = allPendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200">
      {/* Filtro de frecuencia */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['general', 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'].map((freq) => (
          <button
            key={freq}
            onClick={() => setFrequencyFilter(freq)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition
              ${frequencyFilter === freq
                ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
          >
            {freq.charAt(0).toUpperCase() + freq.slice(1)}
          </button>
        ))}
      </div>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      <div id="dashboard-content" className="space-y-8">
        <SummaryCards frequencyFilter={frequencyFilter} />

        {/* Pagos pendientes */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium flex items-center gap-2 text-gray-700 dark:text-gray-100 mb-4">
            <Calendar className="w-4 h-4 text-blue-500" /> Próximos Pagos
          </h2>

          {/* Resumen */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4 text-sm">
            <span className="text-blue-800 dark:text-blue-200">
              Total: <strong>{new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 2,
              }).format(totalAmountDue)}</strong>
            </span>
            <button
              onClick={() => {
                if (window.confirm(`¿Pagar ${allPendingPayments.length} cuotas por ${new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 2
                }).format(totalAmountDue)}?`)) {
                  // Lógica de pago masivo aquí
                  alert('✅ Pagos realizados.');
                }
              }}
              className="mt-2 sm:mt-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" /> Pagar todo
            </button>
          </div>

          {allPendingPayments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay pagos pendientes.</p>
          ) : (
            <div className="space-y-3">
              {allPendingPayments.map((payment) => {
                const details = paymentDetails[payment.id] || {};
                const showAmountInput = ['abonar'].includes(details.action);

                return (
                  <div key={payment.id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">{payment.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.type} • {payment.category} • {payment.paymentType}
                        </p>
                        <p className="text-xs text-orange-500">Vence: {new Date(payment.dueDate).toLocaleDateString('es-MX')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                            minimumFractionDigits: 2,
                          }).format(payment.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <select
                        className="text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                        value={details.action || ''}
                        onChange={(e) => handlePaymentChange(payment.id, 'action', e.target.value)}
                      >
                        <option value="">Acción</option>
                        <option value="pagar">Pagar</option>
                        <option value="abonar">Abonar</option>
                        {payment.type === 'préstamo' && <option value="liquidar">Liquidar</option>}
                        <option value="no-pagar">No pagar</option>
                      </select>

                      {showAmountInput && (
                        <input
                          type="number"
                          placeholder="Monto"
                          className="text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                          onChange={(e) => handlePaymentChange(payment.id, 'amountPaid', e.target.value)}
                        />
                      )}

                      <button
                        onClick={() => {
                          const action = details.action;
                          const amountPaid = details.amountPaid || payment.amount;
                          processPayment(payment, action, amountPaid);
                        }}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Pagar
                      </button>

                      <button
                        onClick={() => processPayment(payment, 'no-pagar')}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> No
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Mora */}
        {overduePayments.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {overduePayments.length} pago(s) atrasado(s)
            </h3>
          </div>
        )}

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Gastos por Categoría</h2>
            <ExpenseCategoryChart frequencyFilter={frequencyFilter} />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Distribución del Ingreso</h2>
            <ExpensePieChart frequencyFilter={frequencyFilter} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Ingresos vs Gastos</h2>
          <IncomeBarChart frequencyFilter={frequencyFilter} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;