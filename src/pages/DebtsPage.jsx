import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

const DebtsPage = () => {
  const { state, dispatch } = useFinance();
  const [form, setForm] = useState({
    name: '',
    amount: '',
    installments: '12',
    frequency: 'mensual',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDebt = {
      id: Date.now(),
      ...form,
      amount: parseFloat(form.amount),
      paid: 0,
      startDate: form.startDate
    };

    const updatedDebts = [...state.debts, newDebt];
    dispatch({ type: 'SET_DATA', payload: { ...state, debts: updatedDebts } });
    saveData({ ...state, debts: updatedDebts });
    alert('✅ Préstamo agregado');
    setForm({
      name: '', amount: '', installments: '12', frequency: 'mensual', startDate: new Date().toISOString().split('T')[0]
    });
  };

  const handlePayInstallment = (debtId) => {
    const updatedDebts = state.debts.map(debt => {
      if (debt.id === debtId && debt.paid < debt.installments) {
        return { ...debt, paid: debt.paid + 1 };
      }
      return debt;
    });
    dispatch({ type: 'SET_DATA', payload: { ...state, debts: updatedDebts } });
    saveData({ ...state, debts: updatedDebts });
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Préstamos y Deudas</h1>

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-2xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">Registrar Préstamo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Nombre (ej: Infonavit, Banco)"
            name="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
            required
          />
          <input
            type="number"
            placeholder="Monto total"
            name="amount"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
            required
          />
          <input
            type="number"
            placeholder="Número de cuotas"
            name="installments"
            value={form.installments}
            onChange={e => setForm({ ...form, installments: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
            required
          />
          <select
            name="frequency"
            value={form.frequency}
            onChange={e => setForm({ ...form, frequency: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
          >
            <option value="mensual">Mensual</option>
            <option value="quincenal">Quincenal</option>
            <option value="semanal">Semanal</option>
          </select>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={e => setForm({ ...form, startDate: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
          />
          <button
            type="submit"
            className="w-full bg-danger text-white py-2 rounded-lg"
          >
            + Agregar Préstamo
          </button>
        </form>
      </div>

      {/* Lista de deudas */}
      <div className="max-w-3xl mx-auto space-y-4">
        {state.debts?.map(debt => {
          const progress = (debt.paid / debt.installments) * 100;
          return (
            <div
              key={debt.id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-6 border-danger"
            >
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">{debt.name}</h3>
                <span className="text-sm text-gray-500">{debt.paid}/{debt.installments}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(debt.amount)} • {debt.frequency}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-danger h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => handlePayInstallment(debt.id)}
                disabled={debt.paid >= debt.installments}
                className="mt-2 text-sm bg-secondary text-white px-3 py-1 rounded disabled:bg-gray-400"
              >
                Pagar Cuota
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { saveData } from '../services/storageService';
export default DebtsPage;