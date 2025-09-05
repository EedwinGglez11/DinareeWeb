// src/components/UI/EditableItem.jsx
import React, { useState } from 'react';
import { Edit2, Trash2, Save, X } from "lucide-react";
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';


const EditableItem = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...item });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...item }); // Restablecer si cancela
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);

  // === Tipos de item ===
  const isLoan = 'total' in item;
  const isIncome = 'source' in item && 'company' in item;
  const isExpense = 'category' in item && 'description' in item;
  const isCreditCard = 'cardName' in item; 
  const isGoal = 'targetAmount' in item && 'deadline' in item;

  // === Funciones para préstamos ===
  const getPaymentAmount = () => {
    if (!formData.total || !formData.duration || !formData.frequency) return 0;

    let totalPayments = 0;
    switch (formData.frequency) {
      case 'semanal': totalPayments = formData.duration * 4; break;
      case 'quincenal': totalPayments = formData.duration * 2; break;
      case 'mensual': totalPayments = formData.duration; break;
      case 'bimestral': totalPayments = Math.ceil(formData.duration / 2); break;
      case 'trimestral': totalPayments = Math.ceil(formData.duration / 3); break;
      case 'semestral': totalPayments = Math.ceil(formData.duration / 6); break;
      case 'anual': totalPayments = Math.ceil(formData.duration / 12); break;
      default: return 0;
    }

    return totalPayments > 0 ? formData.total / totalPayments : 0;
  };

  const getRemainingPayments = () => {
    const paymentAmount = getPaymentAmount();
    const paid = formData.paid || 0;
    const paidCount = paymentAmount > 0 ? Math.floor(paid / paymentAmount) : 0;
    const totalPayments = (() => {
      switch (formData.frequency) {
        case 'semanal': return formData.duration * 4;
        case 'quincenal': return formData.duration * 2;
        case 'mensual': return formData.duration;
        default: return formData.duration;
      }
    })();
    return Math.max(0, totalPayments - paidCount);
  };

  const getProgress = () => {
    return formData.total > 0 ? (formData.paid / formData.total) * 100 : 0;
  };

  const getFrequencyLabel = (frequency) => {
      const labels = {
        'único': 'Pago único',
        'diario': 'Diario',
        'semanal': 'Semanal',
        'quincenal': 'Quincenal',
        'mensual': 'Mensual',
        'bimestral': 'Bimestral',
        'trimestral': 'Trimestral',
        'semestral': 'Semestral',
        'anual': 'Anual'
      };
      return labels[frequency] || frequency;
    };
    const progress = (item.currentAmount / item.targetAmount) * 100;
  const monthsLeft = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30));
  const neededMonthly = monthsLeft > 0 ? (item.targetAmount - item.currentAmount) / monthsLeft : 0;

return (
    <>
      {/* Vista por defecto */}
      {isLoan && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Iniciado: {new Date(item.startDate).toLocaleDateString('es-CO')} • {item.frequency}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.total - item.paid)} restantes
              </p>
            </div>
          </div>

          {getRemainingPayments() > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {getRemainingPayments()} pagos de {formatCurrency(getPaymentAmount())}
            </p>
          )}

          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(getProgress(), 100)}%` }}
            ></div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs"
            >
              <Edit2 className="w-3 h-3 inline" /> Editar
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 text-xs"
            >
              <Trash2 className="w-3 h-3 inline" /> Eliminar
            </button>
          </div>
        </div>
      )}

      {isCreditCard && (
        <div
          className="p-4 rounded-lg border-l-8 relative bg-white dark:bg-gray-800 shadow-sm hover:shadow transition"
          style={{ borderColor: item.color }}
        >
          <div className="pr-12">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.cardName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.bank}</p>
                {item.last4Digits && <p className="text-sm text-gray-600 dark:text-gray-300">•••• {item.last4Digits}</p>}
              </div>
              <span className="text-lg font-bold" style={{ color: item.color }}>
                {formatCurrency(item.currentDebt)}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                <span>Deuda</span>
                <span>{formatCurrency(item.currentDebt)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-current h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((item.currentDebt / item.creditLimit) * 100, 100)}%`,
                    color: item.color,
                  }}
                ></div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {item.paymentDate && `Pago: ${new Date(item.paymentDate).toLocaleDateString('es-CO')}`}
            </p>

            <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs"
            >
              <Edit2 className="w-3 h-3 inline" /> Editar
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 text-xs"
            >
              <Trash2 className="w-3 h-3 inline" /> Eliminar
            </button>
          </div>
          </div>
        </div>
      )}

      {isIncome && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {item.source} – {item.company}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.date.split('-').reverse().join('/')}
              {item.endDate && ` → ${item.endDate.split('-').reverse().join('/')}`}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
              {getFrequencyLabel(item.frequency)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900 dark:text-white text-sm">{formatCurrency(item.amount)}</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs"
              >
                <Edit2 className="w-3 h-3 inline" /> Editar
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 text-xs"
              >
                <Trash2 className="w-3 h-3 inline" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {isExpense && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {item.category} – {item.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.date.split('-').reverse().join('/')}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
              {getFrequencyLabel(item.frequency)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900 dark:text-white text-sm">{formatCurrency(item.amount)}</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs"
              >
                <Edit2 className="w-3 h-3 inline" /> Editar
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 text-xs"
              >
                <Trash2 className="w-3 h-3 inline" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {isGoal && (
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(item.deadline).toLocaleDateString('es-CO')} • Faltan {monthsLeft} meses
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-700"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 text-xs p-1 rounded hover:bg-red-100 dark:hover:bg-gray-700"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1 text-gray-600 dark:text-gray-300">
            <span>{formatCurrency(item.currentAmount)}</span>
            <span>{formatCurrency(item.targetAmount)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Sugerencia mensual */}
        {monthsLeft > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Necesitas ahorrar {formatCurrency(neededMonthly)} mensuales.
          </p>
        )}
      </div>
      )}

      {/* ✅ Modal con Headless UI */}
      <Transition show={isEditing} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCancel}>
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
                      
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-4"
                  >
                    Editar {isIncome ? 'Ingreso' : isExpense ? 'Gasto' : isLoan ? 'Préstamo' : isCreditCard ? 'Tarjeta de Crédito' : 'Elemento'}
                  </Dialog.Title>

                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    {isIncome && (
                      <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto (MXN)<span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          name="amount"
                          defaultValue={formData.amount}
                          onChange={handleChange}
                          placeholder="Monto"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de inicio<span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          name="date"
                          defaultValue={formData.date}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de fin (opcional)</label>
                        <input
                          type="date"
                          name="endDate"
                          defaultValue={formData.endDate || ''}
                          onChange={handleChange}
                          placeholder="Fecha de fin (opcional)"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia<span className="text-red-500">*</span></label>
                        <select
                          name="frequency"
                          defaultValue={formData.frequency}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="único">Único</option>
                          <option value="diario">Diario</option>
                          <option value="semanal">Semanal</option>
                          <option value="quincenal">Quincenal</option>
                          <option value="mensual">Mensual</option>
                        </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuente<span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="source"
                          defaultValue={formData.source}
                          onChange={handleChange}
                          placeholder="Fuente de ingreso"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                        <input
                          type="text"
                          name="company"
                          defaultValue={formData.company}
                          onChange={handleChange}
                          placeholder="Empresa"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de pago</label>
                        <select
                          name="paymentMethod"
                          defaultValue={formData.paymentMethod || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Método de pago</option>
                          <option value="efectivo">Efectivo</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="depósito">Depósito</option>
                          <option value="tarjeta">Tarjeta</option>
                        </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
                        <input
                          type="text"
                          name="notes"
                          defaultValue={formData.notes || ''}
                          onChange={handleChange}
                          placeholder="Notas (opcional)"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        </div>
              </div>
                        
                      </>
                    )}

                    {isExpense && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Categoría */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Categoría <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          defaultValue={formData.category}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {['Transporte', 'Servicios', 'Alimentación', 'Salud', 'Entretenimiento', 'Educación', 'Hogar', 'Ropa', 'Ahorro', 'Deudas', 'Otros'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Fecha */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fecha <span className="text-red-500">*</span>
                        </label>
                       <input
                          type="date"
                          name="date"
                          defaultValue={formData.date}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        
                      </div>

                      {/* Descripción */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descripción <span className="text-red-500">*</span>
                        </label>
                       <input
                          type="text"
                          name="description"
                          defaultValue={formData.description}
                          onChange={handleChange}
                          placeholder="Descripción"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Monto */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Monto <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="amount"
                          defaultValue={formData.amount}
                          onChange={handleChange}
                          placeholder="Monto"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Frecuencia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Frecuencia
                        </label>
                        <select
                          name="frequency"
                          defaultValue={formData.frequency}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="único">Único</option>
                          <option value="semanal">Semanal</option>
                          <option value="quincenal">Quincenal</option>
                          <option value="mensual">Mensual</option>
                          <option value="bimestral">Bimestral</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="semestral">Semestral</option>
                          <option value="anual">Anual</option>
                        </select>
                      </div>
                    </div>
                      </>
                    )}

                    {isLoan && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Nombre */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Nombre del préstamo <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              defaultValue={formData.name}
                              onChange={handleChange}
                              placeholder="Nombre del préstamo"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                        
                          {/* Monto total */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Monto total <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="total"
                              defaultValue={formData.total}
                              onChange={handleChange}
                              placeholder="Monto total"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                        
                          {/* Ya pagado */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Ya pagado (opcional)
                            </label>
                            <input
                              type="number"
                              name="paid"
                              defaultValue={formData.paid}
                              onChange={handleChange}
                              placeholder="Ya pagado"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        
                          {/* Duración */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Duración (meses) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="duration"
                              defaultValue={formData.duration}
                              onChange={handleChange}
                              placeholder="Duración en meses"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        
                          {/* Fecha inicio */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Fecha de inicio <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              name="startDate"
                              defaultValue={formData.startDate}
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
                              defaultValue={formData.frequency}
                              onChange={handleChange}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="semanal">Semanal</option>
                              <option value="quincenal">Quincenal</option>
                              <option value="mensual">Mensual</option>
                              <option value="bimestral">Bimestral</option>
                              <option value="trimestral">Trimestral</option>
                              <option value="semestral">Semestral</option>
                              <option value="anual">Anual</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                    {isGoal && (
                      <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nombre */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Nombre de la meta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={formData.name}
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
                          defaultValue={formData.targetAmount}
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
                          defaultValue={formData.deadline}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                      </>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};


export default EditableItem;