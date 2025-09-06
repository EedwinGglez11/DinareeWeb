// src/pages/DebtsPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import EditableItem from '../components/UI/EditableItem';
import { saveData } from '../services/storageService';
import ConfirmModal from '../components/UI/ConfirmModal';
import { toast } from 'react-toastify';

// Headless UI
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { formatCurrency } from '../utils/formatters';

const frequencyOptions = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' }
];

const DebtsPage = () => {
  const { state, dispatch } = useFinance();

  const [form, setForm] = useState({
  name: '',
  total: '',
  paid: '',
  frequency: 'mensual',
  startDate: '',
  duration: '',
  loanType: '',
  interestRate: '',
  endDate: '',
  paymentsMade: 0,
  paymentMethod: '',
  autoDebit: 'no',
  lastPaymentDate: '',
  nextPaymentDate: '',
  notes: '',
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
    const updatedLoans = state.loans.filter(l => l.id !== id);
    dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
    saveData({ ...state, loans: updatedLoans });
    toast.error('Préstamo eliminado');
    hideConfirmModal();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('⚠️ El nombre del préstamo es obligatorio.');
      return;
    }
    if (!form.total || isNaN(form.total) || form.total <= 0) {
      toast.error('⚠️ Ingresa un monto total válido.');
      return;
    }
    if (!form.startDate) {
      toast.error('⚠️ Se requiere la fecha de inicio.');
      return;
    }

    const loan = {
      id: Date.now(),
      type: 'loan',
      name: form.name.trim(),
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

    // Resetear y cerrar
    setForm({
      name: '',
      total: '',
      paid: '',
      frequency: 'mensual',
      startDate: new Date().toISOString().split('T')[0],
      duration: '',
      loanType: '',
      interestRate: '',
      endDate: '',
      paymentsMade: 0,
      paymentMethod: '',
      autoDebit: 'no',
      lastPaymentDate: '',
      nextPaymentDate: '',
      notes: '',
    });

    closeModal();
    toast.success('Préstamo registrado correctamente');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 py-8 px-4">
      {/* Botón flotante */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-30 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Agregar préstamo"
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
                                                  Registrar Préstamo
                                                </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Nombre del préstamo */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Institución / Prestamista <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      />
    </div>


    {/* Tipo de préstamo */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Tipo de préstamo
      </label>
      <select
        name="loanType"
        value={form.loanType || ''}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="">Seleccionar tipo</option>
        <option value="personal">Personal</option>
        <option value="hipoteca">Hipoteca</option>
        <option value="automotriz">Automotriz</option>
        <option value="estudiantil">Estudiantil</option>
        <option value="negocio">Negocio</option>
        <option value="tarjeta">Refinanciamiento de tarjeta</option>
        <option value="otro">Otro</option>
      </select>
    </div>

    {/* Monto original */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Monto original <span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        name="total"
        value={form.total}
        onChange={handleChange}
        placeholder="1000000"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      />
    </div>

    {/* Interés (%) */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Tasa de interés (%) <span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        step="0.01"
        name="interestRate"
        value={form.interestRate || 0}
        onChange={handleChange}
        placeholder="5.5"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      />
    </div>

    {/* Plazo (meses) */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Plazo (meses) <span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        name="duration"
        value={form.duration}
        onChange={handleChange}
        placeholder="12"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      />
    </div>

    {/* Fecha de inicio */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Fecha de inicio <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        name="startDate"
        value={form.startDate}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      />
    </div>

    {/* Fecha de vencimiento */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Fecha de vencimiento
      </label>
      <input
        type="date"
        name="endDate"
        value={form.endDate || ''}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>

    {/* Frecuencia */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Frecuencia de pago <span className="text-red-500">*</span>
      </label>
      <select
        name="frequency"
        value={form.frequency}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      >
        {frequencyOptions.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
    </div>

    {/* Ya pagado */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Ya pagado (opcional)
      </label>
      <input
        type="number"
        name="paid"
        value={form.paid}
        onChange={handleChange}
        placeholder="0.00"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>

    {/* Cuotas pagadas */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Cuotas pagadas
      </label>
      <input
        type="number"
        name="paymentsMade"
        value={form.paymentsMade || 0}
        onChange={handleChange}
        placeholder="3"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
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
        <option value="transferencia">Transferencia</option>
        <option value="depósito">Depósito</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="debito-automático">Débito automático</option>
      </select>
    </div>

    {/* Débito automático */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        ¿Débito automático?
      </label>
      <select
        name="autoDebit"
        value={form.autoDebit || 'no'}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="no">No</option>
        <option value="sí">Sí</option>
      </select>
    </div>

    {/* Fecha último pago */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Fecha del último pago
      </label>
      <input
        type="date"
        name="lastPaymentDate"
        value={form.lastPaymentDate || ''}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>

    {/* Fecha próximo pago */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Fecha del próximo pago
      </label>
      <input
        type="date"
        name="nextPaymentDate"
        value={form.nextPaymentDate || ''}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
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
        placeholder="Ej: Sin intereses hasta 2025, factura guardada en Drive"
        rows="2"
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>
  </div>

  {/* Cuota estimada y saldo */}
  {(form.total && form.duration) && (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
        Cuota {form.frequency} estimada:{' '}
        <span className="font-bold">{formatCurrency(calculatePayment())}</span>
      </p>
      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
        Saldo pendiente:{' '}
        <span className="font-bold">{formatCurrency(form.total - (form.paid || 0))}</span>
      </p>
    </div>
  )}

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
      Registrar préstamo
    </button>
  </div>
</form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Lista de préstamos */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Préstamos</h3>
        {state.loans?.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No hay préstamos registrados.</p>
        ) : (
          <div className="space-y-3">

            {state.loans?.length > 0 ? (
  state.loans.map((loan) => (
    <EditableItem
      key={loan.id}
      item={loan}
      onUpdate={(updatedLoan) => {
        const updatedLoans = state.loans.map(l => l.id === loan.id ? updatedLoan : l);
        dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
        saveData({ ...state, loans: updatedLoans });
        toast.success('Préstamo actualizado');
      }}
      onDelete={(id) => {
        const loan = state.loans.find(l => l.id === id);
        showConfirmModal({
          title: `Eliminar préstamo "${loan.name}"`,
          message: `¿Estás seguro de que deseas eliminar este préstamo?`,
          onConfirm: () => handleDelete(id),
        });
      }}
    />
  ))
) : (
  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
    No hay préstamos registrados.
  </p>
)}
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

export default DebtsPage;