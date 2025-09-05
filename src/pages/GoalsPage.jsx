// src/pages/GoalsPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { saveData } from '../services/storageService';
import ConfirmModal from '../components/UI/ConfirmModal';
import { toast } from 'react-toastify';

// Headless UI
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import EditableItem from '../components/UI/EditableItem';

const GoalsPage = () => {
  const { state, dispatch } = useFinance();

  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: '',
  });

  const openModal = () => {
    setEditingGoal(null);
    setForm({ name: '', targetAmount: '', deadline: '' });
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const showConfirmModal = ({ title, message, onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const hideConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('⚠️ El nombre de la meta es obligatorio.');
      return;
    }
    if (!form.targetAmount || isNaN(form.targetAmount) || form.targetAmount <= 0) {
      toast.error('⚠️ Ingresa un monto objetivo válido.');
      return;
    }
    if (!form.deadline) {
      toast.error('⚠️ Se requiere una fecha límite.');
      return;
    }

    const goal = {
      id: editingGoal ? editingGoal.id : Date.now(),
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: editingGoal ? editingGoal.currentAmount : 0,
      deadline: form.deadline,
    };

    let updatedGoals;
    if (editingGoal) {
      updatedGoals = state.goals.map(g => (g.id === goal.id ? goal : g));
    } else {
      updatedGoals = [...state.goals, goal];
    }

    dispatch({ type: 'SET_DATA', payload: { ...state, goals: updatedGoals } });
    saveData({ ...state, goals: updatedGoals });

    closeModal();
    toast.success(editingGoal ? 'Meta actualizada' : 'Meta de ahorro creada');
  };

  const handleDelete = (id) => {
    //const goal = state.goals.find(g => g.id === id);
    const updatedGoals = state.goals.filter(g => g.id !== id);
    dispatch({ type: 'SET_DATA', payload: { ...state, goals: updatedGoals } });
    saveData({ ...state, goals: updatedGoals });
    toast.error('Meta eliminada');
    hideConfirmModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200 py-8 px-4">
      {/* Botón flotante */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-30 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Agregar meta de ahorro"
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
                    {editingGoal ? 'Editar Meta de Ahorro' : 'Crear Meta de Ahorro'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nombre */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Nombre de la meta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Ej: Viaje a Cancún, Comprar carro"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Monto objetivo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Monto objetivo (COP) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="targetAmount"
                          value={form.targetAmount}
                          onChange={handleChange}
                          placeholder="10,000,000"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Fecha límite */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Fecha límite <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="deadline"
                          value={form.deadline}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
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
                        {editingGoal ? 'Guardar cambios' : 'Agregar meta'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Lista de metas */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Metas de Ahorro</h3>
        {state.goals.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No tienes metas de ahorro aún.</p>
        ) : (
          <div className="space-y-4">
            {state.goals.map((goal) => (
              <EditableItem
                key={goal.id}
                item={goal}
                onUpdate={(updatedGoal) => {
                  const updatedGoals = state.goals.map(g => (g.id === goal.id ? updatedGoal : g));
                  dispatch({ type: 'SET_DATA', payload: { ...state, goals: updatedGoals } });
                  saveData({ ...state, goals: updatedGoals });
                  toast.success('✅ Meta actualizada');
                }}
                onDelete={(id) => {
                  const goal = state.goals.find(g => g.id === id);
                  showConfirmModal({
                    title: `Eliminar meta "${goal.name}"`,
                    message: `¿Estás seguro de que deseas eliminar esta meta de ahorro?`,
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

export default GoalsPage;