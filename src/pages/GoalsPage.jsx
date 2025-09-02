// src/pages/GoalsPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { saveData } from '../services/storageService';

const GoalsPage = () => {
  const { state, dispatch } = useFinance();
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.targetAmount || !form.deadline) return;

    const newGoal = {
      id: Date.now(),
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: 0,
      deadline: form.deadline,
    };

    const updatedGoals = [...state.goals, newGoal];
    dispatch({ type: 'SET_DATA', payload: { ...state, goals: updatedGoals } });
    saveData({ ...state, goals: updatedGoals });

    setForm({ name: '', targetAmount: '', deadline: '' });
    alert('✅ Meta de ahorro creada');
  };

  const handleDelete = (id) => {
    const updatedGoals = state.goals.filter(g => g.id !== id);
    dispatch({ type: 'SET_DATA', payload: { ...state, goals: updatedGoals } });
    saveData({ ...state, goals: updatedGoals });
    alert('🗑️ Meta eliminada');
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Metas de Ahorro</h1>

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-2xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">Crear Nueva Meta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre de la meta"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
            required
          />
          <input
            name="targetAmount"
            type="number"
            value={form.targetAmount}
            onChange={handleChange}
            placeholder="Monto objetivo (COP)"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
            required
          />
          <input
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700"
            required
          />
          <button
            type="submit"
            className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-green-700"
          >
            + Agregar Meta
          </button>
        </form>
      </div>

      {/* Lista de metas */}
      <div className="max-w-3xl mx-auto space-y-6">
        {state.goals.length === 0 ? (
          <p className="text-center text-gray-500">No tienes metas de ahorro aún.</p>
        ) : (
          state.goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const monthsLeft = Math.ceil(
              (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
            );
            const neededMonthly = monthsLeft > 0
              ? (goal.targetAmount - goal.currentAmount) / monthsLeft
              : 0;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-6 border-secondary"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(goal.deadline).toLocaleDateString('es-CO')} • Faltan {monthsLeft} meses
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Barra de progreso */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(goal.currentAmount)}
                    </span>
                    <span>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Sugerencia */}
                {monthsLeft > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Necesitas ahorrar {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(neededMonthly)} mensuales.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


export default GoalsPage;