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
import { saveData } from '../services/storageService'; // ✅ Importa saveData
import { useMemo } from 'react'; // ✅ Para optimizar allPendingPayments

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

  // Estado para pagos no realizados (mora)
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

  // === 2. Préstamos (próxima cuota) ===
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

  // === 3. Tarjetas de Crédito (pago mínimo) ===
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
  // Manejar cambios en el formulario
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

  // Procesar pago
  const processPayment = (payment, action, amountPaid) => {
  const { parentId, type } = payment;
  let updates = [];

  // Marcar como procesado
  setProcessedPayments(prev => new Set([...prev, payment.id]));

  if (action === 'no-pagar') {
    setOverduePayments(prev => [...prev, { ...payment, date: new Date().toISOString() }]);
    alert(`⚠️ ${payment.name} marcado como no pagado. Generará intereses.`);
    return;
  }

  const paid = parseFloat(amountPaid) || payment.amount;

  if (action === 'liquidar' && type === 'préstamo') {
    const loan = state.loans.find(l => l.id === parentId);
    if (loan) {
      updates.push({
        type: 'loan',
        id: parentId,
        paid: loan.total
      });
      alert(`💡 ${loan.name} liquidado. Ahorras intereses futuros.`);
    }
  } else if (action === 'abonar' || action === 'pagar') {
    if (type === 'préstamo') {
      const loan = state.loans.find(l => l.id === parentId);
      if (loan) {
        const newPaid = loan.paid + paid;
        updates.push({
          type: 'loan',
          id: parentId,
          paid: newPaid
        });
        alert(`✅ Cuota de ${new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP'
        }).format(paid)} pagada en ${loan.name}`);
      }
    } else if (type === 'tarjeta') {
      const card = state.creditCards.find(c => c.id === parentId);
      if (card) {
        const newDebt = Math.max(0, card.currentDebt - paid);
        updates.push({
          type: 'card',
          id: parentId,
          currentDebt: newDebt
        });
        alert(`✅ Abono de ${new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP'
        }).format(paid)} en ${card.cardName}`);
      }
    } else if (type === 'gasto') {
      // No se actualiza estado, pero se marca como procesado
      alert(`✅ Gasto "${payment.name}" marcado como pagado.`);
    }
  }

  // Aplicar actualizaciones
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
    <div className="w-full">
      {/* Filtro de frecuencia */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['general', 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'].map((freq) => (
          <button
            key={freq}
            onClick={() => setFrequencyFilter(freq)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              frequencyFilter === freq
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {freq.charAt(0).toUpperCase() + freq.slice(1)}
          </button>
        ))}
      </div>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Dashboard
        </h1>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>
  
      <div id="dashboard-content">
        <SummaryCards frequencyFilter={frequencyFilter} />

        {/* Pagos pendientes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-10 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" /> Gestión de Pagos Pendientes
          </h2>
            {/* Resumen y botón global */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
  <div>
    <p className="text-sm text-blue-800 dark:text-blue-200">
      <strong>Total de cuotas mostradas:</strong>{' '}
      {new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(totalAmountDue)}
    </p>
  </div>
  <button
    onClick={() => {
      if (window.confirm(`¿Pagar todas las cuotas mostradas (${allPendingPayments.length}) por un total de ${new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
      }).format(totalAmountDue)}?`)) {
        // Lógica para marcar todo como pagado
        const updates = [];

        allPendingPayments.forEach(payment => {
          if (payment.type === 'préstamo' && payment.parentId) {
            const loan = state.loans.find(l => l.id === payment.parentId);
            if (loan) {
              updates.push({
                type: 'loan',
                id: loan.id,
                paid: loan.paid + payment.amount
              });
            }
          } else if (payment.type === 'tarjeta' && payment.parentId) {
            const card = state.creditCards.find(c => c.id === payment.parentId);
            if (card) {
              const newDebt = Math.max(0, card.currentDebt - payment.amount);
              updates.push({
                type: 'card',
                id: card.id,
                currentDebt: newDebt
              });
            }
          }
        });

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
        alert('✅ Todas las cuotas han sido marcadas como pagadas.');
      }
    }}
    className="mt-2 sm:mt-0 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
  >
    <CheckCircle className="w-5 h-5" /> Marcar todo como pagado
  </button>
</div>
          

          {allPendingPayments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No hay pagos pendientes.</p>
          ) : (
            <div className="space-y-6">
              {allPendingPayments.map((payment) => {
                const details = paymentDetails[payment.id] || {};
                const showAmountInput = ['abonar', 'partial'].includes(details.action);

                return (
                  <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{payment.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {payment.type} • {payment.category} • {payment.paymentType}
                        </p>
                        <p className="text-sm font-medium text-orange-500">
                          Vence: {new Date(payment.dueDate).toLocaleDateString('es-CO')}
                        </p>
                        {payment.remainingPayments !== 'N/A' && (
                          <p className="text-sm text-gray-600">Faltan: {payment.remainingPayments} cuotas</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                          }).format(payment.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Formulario de gestión */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <select
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        value={details.action || ''}
                        onChange={(e) => handlePaymentChange(payment.id, 'action', e.target.value)}
                      >
                        <option value="">¿Qué hiciste?</option>
                        <option value="pagar">✅ Pagar cuota</option>
                        <option value="abonar">➕ Abonar monto</option>
                        {payment.type === 'préstamo' && <option value="liquidar">💡 Liquidar</option>}
                        <option value="no-pagar">❌ No pagar</option>
                      </select>

                      {showAmountInput && (
                        <input
                          type="number"
                          placeholder="Monto pagado"
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                          onChange={(e) => handlePaymentChange(payment.id, 'amountPaid', e.target.value)}
                        />
                      )}

                      <button
                        onClick={() => {
                          const action = details.action;
                          const amountPaid = details.amountPaid || payment.amount;
                          processPayment(payment, action, amountPaid);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Pagar
                      </button>

                      <button
                        onClick={() => {
                          processPayment(payment, 'no-pagar');
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> No pagar
                      </button>
                    </div>

                    {/* Alerta de intereses */}
                    {details.action === 'partial' && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                        ⚠️ Pago parcial: generará intereses si no cubre al menos el 90% de la cuota.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mora e intereses */}
        {overduePayments.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-2xl mt-8 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Pagos Atrasados
            </h3>
            <ul className="mt-3 space-y-2">
              {overduePayments.map((item, index) => (
                <li key={index} className="text-sm text-red-700 dark:text-red-300">
                  {item.name} - No pagado el {new Date(item.date).toLocaleDateString('es-CO')}
                  {item.interestGenerated && ` (Interés generado: ${new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                  }).format(item.interestGenerated)})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Gastos por Categoría
            </h2>
            <ExpenseCategoryChart frequencyFilter={frequencyFilter} />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Distribución del Ingreso
            </h2>
            <ExpensePieChart frequencyFilter={frequencyFilter} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Ingresos vs Gastos (Últimos 6 meses)
            </h2>
            <IncomeBarChart frequencyFilter={frequencyFilter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;