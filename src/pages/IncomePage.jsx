// src/pages/IncomePage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import EditableItem from '../components/UI/EditableItem';
import { saveData } from '../services/storageService';
import ToastNotification from '../components/UI/ToastNotification';
import ConfirmModal from '../components/UI/ConfirmModal';

const IncomePage = () => {
  const { dispatch, state } = useFinance();

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'mensual',
    source: '',
    company: '',
    paymentMethod: '', // ✅ Nuevo campo
    notes: '', // ✅ Nuevo campo
  });

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ // ✅ Estado para confirmación
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };
  const showConfirmModal = ({ title, message, onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const hideConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  
  const handleDelete = (id) => {
    const updatedIncomes = state.incomes.filter((inc) => inc.id !== id);
    dispatch({
      type: 'SET_DATA',
      payload: { ...state, incomes: updatedIncomes },
    });
    saveData({ ...state, incomes: updatedIncomes });
    showToast('Ingreso eliminado', 'error');
    hideConfirmModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.amount || isNaN(form.amount) || form.amount <= 0) {
      showToast('Por favor ingresa un monto válido.', 'error');
      return;
    }

    const newIncome = {
      id: Date.now(),
      amount: parseFloat(form.amount),
      date: form.date,
      frequency: form.frequency,
      source: form.source.trim() || 'Ingreso',
      company: form.company.trim() || 'Sin empresa',
      paymentMethod: form.paymentMethod, // ✅ Guardar método de pago
      notes: form.notes.trim(), // ✅ Guardar notas
    };

    dispatch({ type: 'ADD_INCOME', payload: newIncome });

    // Resetear formulario
    setForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'mensual',
      source: '',
      company: '',
      paymentMethod: '',
      notes: '',
    });

    showToast('Ingreso agregado correctamente');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 py-8 px-4">
      {/* Formulario */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Registrar Ingreso</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto (COP)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="2,500,000"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              required
            />
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia</label>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="único">Único</option>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          {/* Fuente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuente</label>
            <input
              type="text"
              name="source"
              value={form.source}
              onChange={handleChange}
              placeholder="Sueldo, Freelance"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            />
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Google, Mi negocio"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de pago</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="">Seleccionar...</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="depósito">Depósito</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Bono, venta de laptop"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            />
          </div>

          {/* Botón */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium py-2 rounded-lg transition"
            >
              + Agregar ingreso
            </button>
          </div>
        </form>
      </div>

      {/* Lista de ingresos */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ingresos Recientes</h3>
        {state.incomes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No hay ingresos registrados.</p>
        ) : (
          <div className="space-y-3">
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
                      type: 'SET_DATA',
                      payload: { ...state, incomes: updatedIncomes },
                    });
                    saveData({ ...state, incomes: updatedIncomes });
                    showToast('Ingreso actualizado');
                  }}
                  onDelete={(id) => {
                    showConfirmModal({
                      title: 'Eliminar ingreso',
                      message: '¿Estás seguro de que deseas eliminar este ingreso?',
                      onConfirm: () => handleDelete(id),
                    });
                  }}
                />
              ))}
          </div>
        )}
      </div>
      {/* ✅ Modales */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => confirmModal.onConfirm()}
        onCancel={hideConfirmModal}
      />

    {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default IncomePage;