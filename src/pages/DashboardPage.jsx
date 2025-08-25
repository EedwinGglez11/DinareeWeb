// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import SummaryCards from '../components/Dashboard/SummaryCards';
import ExpensePieChart from '../components/Dashboard/ExpensePieChart';
import IncomeBarChart from '../components/Dashboard/IncomeBarChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportToExcel } from '../services/exportService';
import { Download, FileSpreadsheet, Calendar } from "lucide-react";

const DashboardPage = () => {
  const { state } = useFinance();
  const [frequencyFilter, setFrequencyFilter] = useState('general');

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

        {/* Próximos pagos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-10 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" /> Próximos Pagos
          </h2>
          <ul className="space-y-3">
            {(() => {
              const now = new Date();
              const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

              const upcoming = state.expenses.filter((exp) => {
                if (frequencyFilter === 'general' || exp.frequency === frequencyFilter) {
                  const nextDate = new Date(exp.date);
                  switch (exp.frequency) {
                    case 'semanal': nextDate.setDate(nextDate.getDate() + 7); break;
                    case 'quincenal': nextDate.setDate(nextDate.getDate() + 15); break;
                    case 'mensual': nextDate.setMonth(nextDate.getMonth() + 1); break;
                    default: return false;
                  }
                  return nextDate >= now && nextDate <= nextMonth;
                }
                return false;
              });

              return upcoming.length > 0 ? (
                upcoming.map((exp) => (
                  <li key={exp.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-none">
                    <span className="text-gray-700 dark:text-gray-200">
                      <strong>{exp.category}</strong> – {exp.description}
                    </span>
                    <span className="text-sm font-medium text-orange-500">
                      {new Date(exp.date).toLocaleDateString('es-CO')}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 dark:text-gray-400">No hay pagos próximos programados.</li>
              );
            })()}
          </ul>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Gastos por Categoría y Préstamos</h2>
            <ExpensePieChart frequencyFilter={frequencyFilter} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Ingresos vs Gastos (Últimos 6 meses)</h2>
            <IncomeBarChart frequencyFilter={frequencyFilter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;