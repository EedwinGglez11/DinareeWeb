// src/pages/ExpensesPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { saveData } from '../services/storageService';
import EditableItem from '../components/UI/EditableItem';

const defaultCategories = [
  'Transporte', 'Servicios', 'Alimentación', 'Salud',
  'Entretenimiento', 'Educación', 'Hogar', 'Ropa',
  'Ahorro', 'Deudas', 'Otros'
];

const frequencyOptions = [
  { value: 'único', label: 'Único (no repetido)' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' }
];

const ExpensesPage = () => {
  const { state, dispatch } = useFinance();
  const [form, setForm] = useState({
    category: 'Deudas',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'único',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const expense = {
      id: Date.now(),
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      date: form.date,
      frequency: form.frequency,
    };

    const updatedExpenses = [...state.expenses, expense];
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    saveData({ ...state, expenses: updatedExpenses });
    alert('✅ Gasto registrado');

    setForm({
      category: 'Deudas',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'único',
    });
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {/* Formulario de Gasto */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto mb-10 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6">Registrar Gasto</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría:</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {defaultCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha:</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción:</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ej: Pago de tarjeta, gasolina"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto:</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
          </div>

          {/* Frecuencia del gasto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frecuencia de pago:</label>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {frequencyOptions.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md"
          >
            Registrar Gasto
          </button>
        </form>
      </div>

      {/* Lista de gastos */}
<div className="max-w-4xl mx-auto mt-12">
  <h2 className="text-2xl font-bold mb-6">Gastos Recientes</h2>
  {state.expenses.length === 0 ? (
    <p className="text-gray-500 text-center">No hay gastos registrados.</p>
  ) : (
    <div className="space-y-3">
      {[...state.expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .map((exp) => (
          <EditableItem
            key={exp.id}
            item={exp}
            onUpdate={(updatedExpense) => {
              const updatedExpenses = state.expenses.map(e => e.id === exp.id ? updatedExpense : e);
              dispatch({ type: 'SET_DATA', payload: { ...state, expenses: updatedExpenses } });
              saveData({ ...state, expenses: updatedExpenses });
              alert('✅ Gasto actualizado');
            }}
            onDelete={(id) => {
              const confirm = window.confirm('¿Eliminar este gasto?');
              if (!confirm) return;
              const updatedExpenses = state.expenses.filter(e => e.id !== id);
              dispatch({ type: 'SET_DATA', payload: { ...state, expenses: updatedExpenses } });
              saveData({ ...state, expenses: updatedExpenses });
              alert('🗑️ Gasto eliminado');
            }}
            
          />
        ))}
    </div>
  )}
</div>
    </div>
  );
};

export default ExpensesPage;