// src/pages/CreditCardsPage.jsx
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
//import { formatCurrency } from '../utils/formatters';

const CreditCardsPage = () => {
  const { state, dispatch } = useFinance();

  const [form, setForm] = useState({
    bank: '',
    cardName: '',
    last4Digits: '',
    creditLimit: '',
    currentDebt: '',
    minPayment: '',
    cutDate: '',
    paymentDate: '',
    interestRate: '',
    frequency: 'mensual',
    category: 'Deudas',
    status: 'Activa',
    notes: '',
    color: '#3B82F6', // azul por defecto
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
    const updatedCards = state.creditCards.filter(c => c.id !== id);
    dispatch({ type: 'SET_DATA', payload: { ...state, creditCards: updatedCards } });
    saveData({ ...state, creditCards: updatedCards });
    toast.error('Tarjeta eliminada');
    hideConfirmModal();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.bank.trim()) {
      toast.error('⚠️ El banco es obligatorio.');
      return;
    }
    if (!form.cardName.trim()) {
      toast.error('⚠️ El nombre de la tarjeta es obligatorio.');
      return;
    }
    if (!form.currentDebt || isNaN(form.currentDebt) || form.currentDebt < 0) {
      toast.error('⚠️ La deuda actual es inválida.');
      return;
    }

    const card = {
      id: Date.now(),
      ...form,
      creditLimit: parseFloat(form.creditLimit) || 0,
      currentDebt: parseFloat(form.currentDebt) || 0,
      minPayment: parseFloat(form.minPayment) || 0,
      interestRate: parseFloat(form.interestRate) || 0,
    };

    const updatedCards = [...(state.creditCards || []), card];
    dispatch({ type: 'SET_DATA', payload: { ...state, creditCards: updatedCards } });
    saveData({ ...state, creditCards: updatedCards });

    // Resetear y cerrar
    setForm({
      bank: '',
      cardName: '',
      last4Digits: '',
      creditLimit: '',
      currentDebt: '',
      minPayment: '',
      cutDate: '',
      paymentDate: '',
      interestRate: '',
      frequency: 'mensual',
      category: 'Deudas',
      status: 'Activa',
      notes: '',
      color: '#3B82F6',
    });

    closeModal();
    toast.success('Tarjeta de crédito registrada');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 py-8 px-4">
      {/* Botón flotante */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-30 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Agregar tarjeta de crédito"
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

                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Agregar Tarjeta de Crédito
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Banco */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Banco / Institución <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="bank"
                          value={form.bank}
                          onChange={handleChange}
                          placeholder="Ej: Nu, BBVA, Santander"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Nombre de la tarjeta */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Nombre de la tarjeta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={form.cardName}
                          onChange={handleChange}
                          placeholder="Ej: Nu Card, Platinum"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Últimos 4 dígitos */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Últimos 4 dígitos (opcional)
                        </label>
                        <input
                          type="text"
                          name="last4Digits"
                          value={form.last4Digits}
                          onChange={handleChange}
                          placeholder="1234"
                          maxLength="4"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Límite de crédito */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Límite de crédito
                        </label>
                        <input
                          type="number"
                          name="creditLimit"
                          value={form.creditLimit}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Deuda actual */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Deuda actual <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="currentDebt"
                          value={form.currentDebt}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Pago mínimo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Pago mínimo
                        </label>
                        <input
                          type="number"
                          name="minPayment"
                          value={form.minPayment}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Fecha de corte */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Fecha de corte
                        </label>
                        <input
                          type="date"
                          name="cutDate"
                          value={form.cutDate}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Fecha de pago */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Fecha de pago
                        </label>
                        <input
                          type="date"
                          name="paymentDate"
                          value={form.paymentDate}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Tasa de interés */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Tasa de interés (%)
                        </label>
                        <input
                          type="number"
                          name="interestRate"
                          value={form.interestRate}
                          onChange={handleChange}
                          placeholder="1.5"
                          step="0.01"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Frecuencia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Frecuencia de pago
                        </label>
                        <select
                          name="frequency"
                          value={form.frequency}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="mensual">Mensual</option>
                          <option value="quincenal">Quincenal</option>
                        </select>
                      </div>

                      {/* Estado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Estado
                        </label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Activa">Activa</option>
                          <option value="Inactiva">Inactiva</option>
                        </select>
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          name="color"
                          value={form.color}
                          onChange={handleChange}
                          className="w-full p-1 h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Notas
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Ej: Cashback 2%, sin anualidad"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows="2"
                      />
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
                        Registrar tarjeta
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Lista de tarjetas */}
<div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tarjetas de Crédito</h3>
  {state.creditCards.length === 0 ? (
    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No hay tarjetas registradas.</p>
  ) : (
    <div className="space-y-3">
    {state.creditCards?.length > 0 ? (
      state.creditCards.map((card) => (
        <EditableItem
          key={card.id}
          item={card}
          onUpdate={(updatedCard) => {
            const updatedCards = state.creditCards.map(c =>
              c.id === card.id ? updatedCard : c
            );
            dispatch({ type: 'SET_DATA', payload: { ...state, creditCards: updatedCards } });
            saveData({ ...state, creditCards: updatedCards });
            toast.success('Tarjeta actualizada');
          }}
          onDelete={(id) => {
            const card = state.creditCards.find(c => c.id === id);
            showConfirmModal({
              title: `Eliminar tarjeta "${card.cardName}"`,
              message: `¿Estás seguro de que deseas eliminar esta tarjeta?`,
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

export default CreditCardsPage;