// src/pages/ExpensesPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import EditableItem from '../components/UI/EditableItem';
import { saveData } from '../services/storageService';
import ConfirmModal from '../components/UI/ConfirmModal';
import { toast } from 'react-toastify';
import ErrorBoundary from '../components/UI/ErrorBoundary';

// Headless UI
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

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
    frequency: 'único',
    endDate:'',
    lastPaymentDate: '',        // nuevo
    nextPaymentDate: '', 
    paymentMethod:'',
    autoDebit:'',
    notes:'',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: '',
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const showConfirmModal = ({ title, message, onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const hideConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDelete = (id) => {
    const updatedExpenses = state.expenses.filter(e => e.id !== id);
    dispatch({ type: 'SET_DATA', payload: { ...state, expenses: updatedExpenses } });
    saveData({ ...state, expenses: updatedExpenses });
    toast.error('Gasto eliminado');
    hideConfirmModal();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  // En handleSubmit de ExpensesPage
  
  if (!form.nextPaymentDate && form.frequency !== 'único') {
  toast.error('⚠️ Para gastos recurrentes, ingresa al menos el "próximo pago".');
  return;
}

  if (!form.amount || isNaN(form.amount) || form.amount <= 0) {
    toast.error('⚠️ Ingresa un monto válido.');
    return;
  }
  if (!form.description.trim()) {
    toast.error('⚠️ La descripción es obligatoria.');
    return;
  }

  const expense = {
    id: Date.now(),
    category: form.category,
    description: form.description.trim(),
    amount: parseFloat(form.amount),
    date: form.nextPaymentDate ||new Date().toISOString().split('T')[0],
    frequency: form.frequency,
    endDate: form.endDate,
    lastPaymentDate: form.lastPaymentDate,
    nextPaymentDate: form.nextPaymentDate,
    paymentMethod: form.paymentMethod,
    autoDebit: form.autoDebit,
    notes: form.notes,
  };

  dispatch({ type: 'ADD_EXPENSE', payload: expense });
  saveData({ ...state, expenses: [...state.expenses, expense] });

  setForm({
    category: 'Deudas',
    description: '',
    amount: '',
    frequency: 'único',
    endDate: '',
    lastPaymentDate: '',
    nextPaymentDate: '',
    paymentMethod: '',
    autoDebit: '',
    notes: '',
  });

  closeModal();
  toast.success('Gasto agregado correctamente');
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 py-8 px-4">
      {/* Botón flotante */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-30 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Agregar gasto"
      >
        <span className="flex items-center justify-center w-full h-full">+</span>
      </button>

      {/* Modal con Headless UI */}
      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 px-6 pb-6 pt-8 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                  <div className="absolute right-4 top-4">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                   <Dialog.Title
                                                  as="h3"
                                                  className="text-lg font-bold leading-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-4"
                                                >
                                                  Registrar Gasto
                                                </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Categoría */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Categoría <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          {defaultCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Fecha de fin (opcional)
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={form.endDate || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700"
                        />
                      </div>

                      {/* Fecha  Último pago */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Último pago (opcional)
                        </label>
                        <input
                          type="date"
                          name="lastPaymentDate"
                          value={form.lastPaymentDate || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Fecha del próximo pago */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Próximo pago (opcional)
                        </label>
                        <input
                          type="date"
                          name="nextPaymentDate"
                          value={form.nextPaymentDate || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Descripción */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Descripción <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Ej: Pago de tarjeta, gasolina"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Monto */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Monto <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={form.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Frecuencia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Frecuencia
                        </label>
                        <select
                          name="frequency"
                          value={form.frequency}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {frequencyOptions.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                      {/* Método de pago */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Método de pago
                      </label>
                      <select
                        name="paymentMethod"
                        value={form.paymentMethod || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta de crédito</option>
                        <option value="debito">Débito automático</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="pse">PSE</option>
                      </select>
                    </div>

                    {/* Débito automático */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        ¿Débito automático?
                      </label>
                      <select
                        name="autoDebit"
                        value={form.autoDebit || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="no">No</option>
                        <option value="sí">Sí</option>
                      </select>
                    </div>

                  {/* Notas */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes || ''}
                      onChange={handleChange}
                      placeholder="Notas (opcional)"
                      rows="2"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                    </div>
                    

                    <div className="flex justify-end gap-3 pt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                      >
                        Agregar gasto
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Lista de gastos */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gastos</h3>
        {state.expenses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No hay gastos registrados.</p>
        ) : (
          <div className="space-y-3">
            {[...state.expenses]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)) 
              .map((expense) => (
                <ErrorBoundary 
                 key={expense.id}
                  onRemove={() => {
                    // ✅ Elimina este gasto específico
                    const updatedExpenses = state.expenses.filter(e => e.id !== expense.id);
                    dispatch({ type: 'SET_DATA', payload: { ...state, expenses: updatedExpenses } });
                    saveData({ ...state, expenses: updatedExpenses });
                    console.log(`Gasto eliminado por ErrorBoundary: ID ${expense.id}`);
                  }}
                >
                  <EditableItem
                    key={expense.id}
                    item={expense}
                    onUpdate={(updatedExpense) => {
                      const updatedExpenses = state.expenses.map(e =>
                        e.id === expense.id ? updatedExpense : e
                      );
                      dispatch({ type: 'SET_DATA', payload: { ...state, expenses: updatedExpenses } });
                      saveData({ ...state, expenses: updatedExpenses });
                      toast.success('Gasto actualizado');
                    }}
                    onDelete={(id) => {
                      const expense = state.expenses.find(e => e.id === id);
                      showConfirmModal({
                        title: `Eliminar gasto "${expense.description}"`,
                        message: `¿Estás seguro de que deseas eliminar este gasto?`,
                        onConfirm: () => handleDelete(id),
                      });
                    }}
                  />
                </ErrorBoundary>
                
              ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => confirmModal.onConfirm()}
        onCancel={hideConfirmModal}
      />
    </div>
  );
};

export default ExpensesPage;