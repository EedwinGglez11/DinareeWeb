import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import EditableItem from '../components/UI/EditableItem';
import { saveData } from '../services/storageService';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const IncomePage = () => {
  const { dispatch, state } = useFinance();

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'mensual',
    source: '',
    company: '', 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.amount || isNaN(form.amount) || form.amount <= 0) {
      alert('Por favor ingresa un monto válido.');
      return;
    }

    const newIncome = {
      id: Date.now(),
      amount: parseFloat(form.amount),
      date: form.date,
      frequency: form.frequency,
      source: form.source.trim() || 'Ingreso',
      company: form.company.trim() || 'Sin empresa',
    };

    dispatch({ type: 'ADD_INCOME', payload: newIncome });

    setForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'mensual',
      source: '',
      company: '',
    });

    alert('✅ Ingreso agregado correctamente');
  };

  
  return (
    <div className="w-full">
        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Monto */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Monto:
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Ej: 2,500,000"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Fecha:
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                required
              />
            </div>

            {/* Frecuencia */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Frecuencia:
              </label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <option value="único">Único (una vez)</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esto ayuda a proyectar tus ingresos futuros.
              </p>
            </div>

            {/* Fuente */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Fuente de ingreso:
              </label>
              <input
                type="text"
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="Ej: Sueldo, Freelance, Venta extra"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Empresa / Empleador:
              </label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Ej: Google, Mi negocio"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Botón */}
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md"
              >
                Agregar Ingreso
              </button>
            </div>
          </form>
        </div>

        {/* Lista de ingresos (versión lista con divs) */}
        <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {state.incomes.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-6">
              No hay ingresos registrados.
            </p>
          ) : (
            <div className="space-y-4">
              {[...state.incomes]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((income) => (
                      <EditableItem
                        key={income.id}
                        item={income}
                        onUpdate={(updatedIncome) => {
                          const updatedIncomes = state.incomes.map((inc) =>
                            inc.id === income.id ? updatedIncome : inc
                          );
                          dispatch({
                            type: "SET_DATA",
                            payload: { ...state, incomes: updatedIncomes },
                          });
                          saveData({ ...state, incomes: updatedIncomes });
                          alert("✅ Ingreso actualizado");
                        }}
                        onDelete={(id) => {
                          const confirmDelete = window.confirm(
                            "¿Estás seguro de eliminar este ingreso?"
                          );
                          if (!confirmDelete) return;

                          const updatedIncomes = state.incomes.filter(
                            (inc) => inc.id !== id
                          );
                          dispatch({
                            type: "SET_DATA",
                            payload: { ...state, incomes: updatedIncomes },
                          });
                          saveData({ ...state, incomes: updatedIncomes });
                          alert("🗑️ Ingreso eliminado");
                        }}
                      />
                ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default IncomePage;