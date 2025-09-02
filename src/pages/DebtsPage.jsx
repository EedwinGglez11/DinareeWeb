// src/pages/DebtsPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { saveData } from '../services/storageService';
import EditableItem from '../components/UI/EditableItem';
import { formatCurrency } from '../utils/formatters';

const DebtsPage = () => {
  const { state, dispatch } = useFinance();

  const [form, setForm] = useState({
    name: '',
    total: '',
    paid: '',
    frequency: 'mensual',
    startDate: new Date().toISOString().split('T')[0],
    duration: '', // en meses
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.total || !form.startDate) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const loan = {
      id: Date.now(),
      type: 'loan',
      name: form.name,
      total: parseFloat(form.total),
      paid: parseFloat(form.paid) || 0,
      frequency: form.frequency,
      startDate: form.startDate,
      duration: parseInt(form.duration) || 12,
      category: 'Deudas',
    };

    const updatedLoans = [...(state.loans || []), loan];
    dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
    saveData({ ...state, loans: updatedLoans });
    alert('✅ Préstamo registrado');

    // Resetear formulario
    setForm({
      name: '',
      total: '',
      paid: '',
      frequency: 'mensual',
      startDate: new Date().toISOString().split('T')[0],
      duration: '',
    });
  };

  // Calcular cuota estimada
  const calculatePayment = () => {
    const total = parseFloat(form.total) || 0;
    const duration = parseInt(form.duration) || 0;
    const freq = form.frequency;

    if (total === 0 || duration === 0) return null;

    let totalPayments = 0;
    switch (freq) {
      case 'semanal': totalPayments = duration * 4; break;
      case 'quincenal': totalPayments = duration * 2; break;
      case 'mensual': totalPayments = duration; break;
      case 'bimestral': totalPayments = Math.ceil(duration / 2); break;
      case 'trimestral': totalPayments = Math.ceil(duration / 3); break;
      case 'semestral': totalPayments = Math.ceil(duration / 6); break;
      case 'anual': totalPayments = Math.ceil(duration / 12); break;
      default: return null;
    }

    return totalPayments > 0 ? total / totalPayments : null;
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {/* Formulario de Préstamo */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto mb-10 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6">Registrar Préstamo o Crédito</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre del préstamo"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <input
              type="number"
              placeholder="Monto total"
              name="total"
              value={form.total}
              onChange={handleChange}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <input
              type="number"
              placeholder="Ya pagado (opcional)"
              name="paid"
              value={form.paid}
              onChange={handleChange}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
            <input
              type="number"
              placeholder="Duración en meses"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="bimestral">Bimestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          {/* Mostrar cuota estimada */}
          {form.total && form.duration && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Cuota {form.frequency} estimada:{' '}
                <span className="font-bold">
                  {formatCurrency(calculatePayment())}
                </span>
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md"
          >
            Registrar Préstamo
          </button>
        </form>
      </div>

      {/* Lista de préstamos */}
      {state.loans?.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6">Préstamos Activos</h2>
          <div className="space-y-5">
            {state.loans.map((loan) => (
              <EditableItem
                key={loan.id}
                item={loan}
                onUpdate={(updatedLoan) => {
                  const updatedLoans = state.loans.map(l => l.id === loan.id ? updatedLoan : l);
                  dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
                  saveData({ ...state, loans: updatedLoans });
                  alert('✅ Préstamo actualizado');
                }}
                onDelete={(id) => {
                  const confirm = window.confirm('¿Eliminar este préstamo?');
                  if (!confirm) return;
                  const updatedLoans = state.loans.filter(l => l.id !== id);
                  dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
                  saveData({ ...state, loans: updatedLoans });
                  alert('🗑️ Préstamo eliminado');
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsPage;