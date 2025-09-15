// src/pages/IncomePage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import EditableItem from '../components/UI/EditableItem';
import { saveData } from '../services/storageService';
import ConfirmModal from '../components/UI/ConfirmModal';
import { toast } from 'react-toastify';
import { Wallet} from "lucide-react";

// Headless UI
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

const IncomePage = () => {
  const { dispatch, state } = useFinance();

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    endDate: '',
    frequency: 'mensual',
    source: '',
    company: '',
    paymentMethod: '',
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
    const updatedIncomes = state.incomes.filter((inc) => inc.id !== id);
    dispatch({
      type: 'SET_DATA',
      payload: { ...state, incomes: updatedIncomes },
    });
    saveData({ ...state, incomes: updatedIncomes });
    toast.error('Ingreso eliminado');
    hideConfirmModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.amount || isNaN(form.amount) || form.amount <= 0) {
      toast.error('⚠️ Ingresa un monto válido.');
      return;
    }
    if (!form.date) {
      toast.error('⚠️ Se requiere la fecha de inicio.');
      return;
    }
    if (!form.source.trim()) {
      toast.error('⚠️ La fuente de ingreso es obligatoria.');
      return;
    }

    const newIncome = {
      id: Date.now(),
      amount: parseFloat(form.amount),
      date: form.date,
      endDate: form.endDate || null,
      frequency: form.frequency,
      source: form.source.trim(),
      company: form.company.trim() || 'Sin empresa',
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
    };

    dispatch({ type: 'ADD_INCOME', payload: newIncome });
    saveData({ ...state, incomes: [...state.incomes, newIncome] });

    // Resetear y cerrar
    setForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      endDate: '',
      frequency: 'mensual',
      source: '',
      company: '',
      paymentMethod: '',
      notes: '',
    });

    closeModal();
    toast.success('Ingreso agregado correctamente');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 py-8 px-4">
      {/* Botón flotante */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-30 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Agregar ingreso"
      >
        {/* ✅ Centrado perfecto con flex */}
        <span className="flex items-center justify-center w-full h-full">+</span>
      </button>

      {/* ✅ Modal con Headless UI */}
      <Transition.Root show={isModalOpen} as={Fragment}>
  <Dialog as="div" className="relative z-50" onClose={closeModal}>
    {/* Fondo del overlay */}
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
            {/* Botón de cerrar */}
            <div className="absolute right-4 top-4">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white"
                onClick={closeModal}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Título */}
             <Dialog.Title
                                as="h3"
                                className="text-lg font-bold leading-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-4"
                              >
                                Registrar Ingreso
                              </Dialog.Title>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Monto (MXN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="2,500,000"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Fecha inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Fecha de inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Fecha fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Fecha de fin (opcional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Frecuencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Frecuencia <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="frequency"
                    value={form.frequency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Fuente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    placeholder="Sueldo, Freelance"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Empresa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Empresa</label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Google, Mi negocio"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Método de pago</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Notas</label>
                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Bono, venta de laptop"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Botones */}
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
                  Agregar ingreso
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition.Root>

      {/* Lista de ingresos */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4"><Wallet>Ingresos</Wallet></h3>
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
                    toast.success('Ingreso actualizado');
                  }}
                  // En el onDelete del EditableItem
                  onDelete={(id) => {
                    const income = state.incomes.find(inc => inc.id === id);
                    showConfirmModal({
                      title: `Eliminar ingreso "${income.company}" (${income.source})`,
                      message: `¿Estás seguro de que deseas eliminar el ingreso?`,
                      onConfirm: () => handleDelete(id),
                    });
                  }}
                />
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

export default IncomePage;