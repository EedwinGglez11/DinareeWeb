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
//import { Button } from "../components/UI/";
import { Download, FileSpreadsheet, Calendar,CreditCard, DollarSign, Landmark } from "lucide-react";

const DashboardPage = () => {
  const { state } = useFinance();
  const now = useMemo(() => new Date(), []);

  // === Función para generar fechas de pago dentro de un rango ===
  const generatePaymentDates = (startDate, frequency, endDate, periodStart, periodEnd) => {
    const dates = [];
    let current = new Date(startDate);

    // Ajustar al primer pago dentro del periodo si es necesario
    if (current < periodStart) {
      const dayDiff = Math.floor((periodStart - startDate) / (1000 * 60 * 60 * 24));
      switch (frequency) {
        case 'semanal': {
          const weeksToAdd = Math.ceil(dayDiff / 7);
          current.setDate(startDate.getDate() + weeksToAdd * 7);
          break;
        }
        case 'quincenal': {
          const fortnightsToAdd = Math.ceil(dayDiff / 15);
          current.setDate(startDate.getDate() + fortnightsToAdd * 15);
          break;
        }
        case 'mensual': {
          const monthsToAdd = Math.ceil(dayDiff / 30);
          current.setMonth(startDate.getMonth() + monthsToAdd);
          break;
        }
        default:
          current = new Date(periodStart);
      }
    }

    while (current <= periodEnd) {
      dates.push(new Date(current));
      switch (frequency) {
        case 'semanal':
          current.setDate(current.getDate() + 7);
          break;
        case 'quincenal':
          current.setDate(current.getDate() + 15);
          break;
        case 'mensual':
          current.setMonth(current.getMonth() + 1);
          break;
        default:
          current.setMonth(current.getMonth() + 1);
      }
      if (endDate && current > endDate) break;
    }

    return dates;
  };

  // === Generar todos los próximos pagos: gastos, préstamos y tarjetas ===
  const allPendingPayments = useMemo(() => {
    const payments = [];

    // Definir rangos de tiempo
    const { start: weekStart, end: weekEnd } = (() => {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now);
      start.setDate(diffToMonday);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    })();

    const { start: fortnightStart, end: fortnightEnd } = (() => {
      const date = now.getDate();
      const start = new Date(now.getFullYear(), now.getMonth(), date <= 15 ? 1 : 16);
      const end = new Date(now.getFullYear(), now.getMonth(), date <= 15 ? 15 : 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    })();

    const { start: monthStart, end: monthEnd } = (() => {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    })();

    // Helper: agregar pagos en cada rango
    const addPaymentsInRange = ({ id, name, category, amount, type, paymentType, startDate, frequency, endDate, countLimit = Infinity }) => {
  const ranges = {
    week: { start: weekStart, end: weekEnd },
    fortnight: { start: fortnightStart, end: fortnightEnd },
    month: { start: monthStart, end: monthEnd },
  };

  Object.entries(ranges).forEach(([rangeKey, { start, end }]) => {
    const dates = generatePaymentDates(startDate, frequency, endDate, start, end);
    dates.slice(0, countLimit).forEach(date => {
      payments.push({
        id: `${id}-${rangeKey}-${date.toISOString().split('T')[0]}`,
        name,
        category,
        amount,
        dueDate: date.toISOString().split('T')[0],
        type,
        paymentType: typeof paymentType === 'function' ? paymentType(date) : paymentType,
        range: rangeKey,
      });
    });
  });
};
    // 1. Gastos recurrentes
    (state.expenses || []).forEach((exp) => {
      if (exp.frequency === 'único') {
        const date = new Date(exp.date);
        if (!isNaN(date.getTime()) && date >= now) {
          payments.push({
            id: exp.id,
            name: exp.description,
            category: exp.category,
            amount: exp.amount,
            dueDate: exp.date,
            type: 'gasto',
            paymentType: 'Pago único',
            range: 'month', // aparece en todos
          });
        }
      } else {
        const startDate = new Date(exp.date);
        if (isNaN(startDate.getTime())) return;

        addPaymentsInRange({
          id: exp.id,
          name: exp.description,
          category: exp.category,
          amount: exp.amount,
          type: 'gasto',
          paymentType: `Recurrente (${exp.frequency})`,
          startDate,
          frequency: exp.frequency,
          endDate: exp.endDate ? new Date(exp.endDate) : null,
        });
      }
    });

    // 2. Préstamos
    // 2. Préstamos
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

  // Helper: calcular número de cuota por fecha
  const getInstallmentNumber = (date) => {
    const daysDiff = (new Date(date) - startDate) / (1000 * 60 * 60 * 24);
    let installment = 1;
    switch (loan.frequency) {
      case 'semanal':
        installment = Math.floor(daysDiff / 7) + 1;
        break;
      case 'quincenal':
        installment = Math.floor(daysDiff / 15) + 1;
        break;
      case 'mensual':
        installment = (date.getFullYear() - startDate.getFullYear()) * 12 +
                      (date.getMonth() - startDate.getMonth()) + 1;
        break;
      default:
        installment = 1;
    }
    return installment;
  };

  if (paidCount < totalPayments) {
    addPaymentsInRange({
      id: loan.id,
      name: loan.name,
      amount: paymentAmount,
      type: 'préstamo',
      paymentType: (date) => {
        const installmentNum = getInstallmentNumber(date);
        return `Cuota ${installmentNum}/${totalPayments}`;
      },
      startDate,
      frequency: loan.frequency,
      countLimit: totalPayments - paidCount,
    });
  }
});

    // 3. Tarjetas de crédito
    (state.creditCards || []).forEach((card) => {
      if (!card.cardName || card.minPayment <= 0 || !card.paymentDate) return;

      const paymentDate = new Date(card.paymentDate);
      if (isNaN(paymentDate.getTime())) return;

      const dayOfMonth = paymentDate.getDate();
      const baseDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
      const startDate = baseDate < now 
        ? new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth)
        : baseDate;

      addPaymentsInRange({
        id: card.id,
        name: `${card.cardName} (${card.bank})`,
        amount: card.minPayment,
        type: 'tarjeta',
        paymentType: 'Pago mínimo',
        startDate,
        frequency: 'mensual',
      });
    });

    return payments.sort((a, b) => {
  // 1. Ordenar por monto: mayor a menor
  if (b.amount !== a.amount) {
    return b.amount - a.amount;
  }
  // 2. Si el monto es igual, ordenar por nombre alfabéticamente
  return a.name.localeCompare(b.name, 'es-MX');
});
  }, [state.expenses, state.loans, state.creditCards, now]);

  // === Filtro: Esta semana / Esta quincena / Este mes ===
  const [filter, setFilter] = useState('week');

  const filteredPayments = allPendingPayments.filter(p => p.range === filter);

  const totalAmountDue = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 pb-16">
      <div id="dashboard-content" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* 🔹 Encabezado */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {new Intl.DateTimeFormat("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(now)}
          </h1>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" onClick={generatePDF}>
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
            </Button>
          </div>
        </header>

        {/* 🔹 Resumen de KPIs */}
        <SummaryCards />

        {/* 🔹 Próximos Pagos */}
        <section className="rounded-xl border border-gray-200 dark:border-gray-800  bg-white dark:bg-gray-900 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-blue-500" /> Próximos Pagos
            </h2>

            {/* Filtros */}
            <div className="flex gap-1 mt-2 sm:mt-0">
              {[
                { key: "week", label: "Esta semana" },
                { key: "fortnight", label: "Esta quincena" },
                { key: "month", label: "Este mes" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={filter === key ? "default" : "ghost"}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm mb-3">
            <span>
              Total:{" "}
              <strong>
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(totalAmountDue)}
              </strong>
            </span>
            <span className="text-xs text-gray-500">{filteredPayments.length} pagos</span>
          </div>

          {filteredPayments.length === 0 ? (
  <p className="text-sm text-gray-500">
    No hay pagos programados en este periodo.
  </p>
) : (
  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
    {filteredPayments.map((p) => {
      const Icon =
        p.type === "gasto"
          ? DollarSign
          : p.type === "préstamo"
          ? Landmark
          : CreditCard;

      return (
        <div
          key={p.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm"
        >
          {/* Icono */}
          <div className="flex-shrink-0 mt-1">
            <Icon className="w-5 h-5 text-blue-500" />
          </div>

          {/* Info principal */}
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {p.name}
            </p>
            <p className="text-xs text-gray-500">{p.paymentType}</p>
          </div>

          {/* Monto y fecha */}
          <div className="text-right">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(p.amount)}
            </p>
            <p className="text-xs text-orange-500">
              {new Date(p.dueDate).toLocaleDateString("es-MX")}
            </p>
          </div>
        </div>
      );
    })}
  </div>
)}
        </section>

        {/* 🔹 Gráficas */}
        <div className="grid  grid-cols-1 lg:grid-cols-2 gap-6">
          <CardChart title="Ingresos vs Gastos (6 meses)">
            <IncomeBarChart />
          </CardChart>
          <CardChart title="Gastos por Categoría">
            <ExpenseCategoryChart />
          </CardChart>
        </div>
      </div>
    </div>
  );
};

// 📌 Wrapper para gráficas minimalistas
const CardChart = ({ title, children }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

export default DashboardPage;