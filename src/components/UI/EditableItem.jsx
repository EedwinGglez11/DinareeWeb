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
    setFormData({ ...item });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount || 0);

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
    const total = isLoan ? formData.total : (isGoal ? formData.targetAmount : 0);
    const current = isLoan ? formData.paid : (isGoal ? formData.currentAmount : 0);
    return total > 0 ? (current / total) * 100 : 0;
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

return (
    <>
      {/* Vista por defecto */}
      {isLoan && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Inicio: {new Date(item.startDate).toLocaleDateString('es-MX')} 
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Finaliza: {new Date(item.endDate).toLocaleDateString('es-MX')} • {item.frequency}
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
               Corte: {item.cutDate.split('-').reverse().join('/')} • Pago: {item.paymentDate.split('-').reverse().join('/')} 
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
              {item.lastPaymentDate.split('-').reverse().join('/')} 
              {item.nextPaymentDate && ` → ${item.nextPaymentDate.split('-').reverse().join('/')}`}
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
     {isGoal && item.deadline && (
  <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm relative">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {new Date(item.deadline).toLocaleDateString('es-CO')} • Faltan{' '}
          {Math.max(
            1,
            Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30))
          )}{' '}
          meses
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
        <span>{formatCurrency(item.currentAmount || 0)}</span>
        <span>{formatCurrency(item.targetAmount || 0)}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${
              item.targetAmount > 0
                ? Math.min((item.currentAmount / item.targetAmount) * 100, 100)
                : 0
            }%`,
          }}
        ></div>
      </div>
    </div>

    {/* Sugerencia mensual */}
    {item.targetAmount > 0 && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Necesitas ahorrar{' '}
        {formatCurrency(
          (item.targetAmount - item.currentAmount) /
            Math.max(
              1,
              Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30))
            )
        )}
        {' mensuales.'}
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
                    Editar {isIncome ? 'Ingreso' : isExpense ? 'Gasto' : isLoan ? 'Préstamo' : isCreditCard ? 'Tarjeta de Crédito' : isGoal ? 'Meta de Ahorro' :'Elemento'}
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Fecha de fin (opcional)
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          defaultValue={formData.endDate || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Último pago (opcional)
                        </label>
                        <input
                          type="date"
                          name="lastPaymentDate"
                          defaultValue={formData.lastPaymentDate || ''}
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
                          defaultValue={formData.nextPaymentDate || ''}
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
                      <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Método de pago
                      </label>
                      <select
                        name="paymentMethod"
                        defaultValue={formData.paymentMethod || ''}
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
                        defaultValue={formData.autoDebit || ''}
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
                      defaultValue={formData.notes || ''}
                      onChange={handleChange}
                      placeholder="Notas (opcional)"
                      rows="2"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                    </div>
                      </>
                    )}

                    {isLoan && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Nombre del préstamo */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Nombre del préstamo <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              defaultValue={formData.name}
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
                              defaultValue={formData.loanType || ''}
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
                              defaultValue={formData.total}
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
                              defaultValue={formData.interestRate || 0}
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
                              defaultValue={formData.duration}
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
                              defaultValue={formData.startDate}
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
                              defaultValue={formData.endDate || ''}
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
                              defaultValue={formData.frequency}
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
                              defaultValue={formData.paid}
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
                              defaultValue={formData.paymentsMade || 0}
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
                              defaultValue={formData.paymentMethod || ''}
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
                              defaultValue={formData.autoDebit || 'no'}
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
                              defaultValue={formData.lastPaymentDate || ''}
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
                              defaultValue={formData.nextPaymentDate || ''}
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
                              defaultValue={formData.notes || ''}
                              onChange={handleChange}
                              placeholder="Ej: Sin intereses hasta 2025, factura guardada en Drive"
                              rows="2"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {isCreditCard &&(
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Banco */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Banco / Institución <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="bank"
                            defaultValue={formData.bank}
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
                            defaultValue={formData.cardName}
                            onChange={handleChange}
                            placeholder="Ej: Nu Card, Platinum"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>

                        {/* Tipo de tarjeta */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Tipo de tarjeta
                          </label>
                          <select
                            name="cardType"
                            defaultValue={formData.cardType || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Seleccionar tipo</option>
                            <option value="clásica">Clásica</option>
                            <option value="oro">Oro</option>
                            <option value="platino">Platino</option>
                            <option value="black">Black</option>
                            <option value="negocios">Negocios</option>
                            <option value="estudiante">Estudiante</option>
                          </select>
                        </div>

                        {/* Últimos 4 dígitos */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Últimos 4 dígitos (opcional)
                          </label>
                          <input
                            type="text"
                            name="last4Digits"
                            defaultValue={formData.last4Digits}
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
                            defaultValue={formData.creditLimit}
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
                            defaultValue={formData.currentDebt}
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
                            defaultValue={formData.minPayment}
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
                            defaultValue={formData.cutDate}
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
                            defaultValue={formData.paymentDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Día de corte (alternativa numérica) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Día de corte (mes)
                          </label>
                          <input
                            type="number"
                            name="dueDay"
                            defaultValue={formData.dueDay || ''}
                            onChange={handleChange}
                            placeholder="15"
                            min="1"
                            max="31"
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
                            defaultValue={formData.interestRate}
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
                            defaultValue={formData.frequency}
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
                            defaultValue={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="Activa">Activa</option>
                            <option value="Inactiva">Inactiva</option>
                          </select>
                        </div>

                        {/* Método de pago */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Método de pago
                          </label>
                          <select
                            name="paymentMethod"
                            defaultValue={formData.paymentMethod || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="depósito">Depósito</option>
                            <option value="tarjeta">Otra tarjeta</option>
                            <option value="debito-automático">Débito automático</option>
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
                            defaultValue={formData.lastPaymentDate || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Débito automático */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            ¿Débito automático?
                          </label>
                          <select
                            name="autoDebit"
                            defaultValue={formData.autoDebit || 'no'}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="no">No</option>
                            <option value="sí">Sí</option>
                          </select>
                        </div>

                        {/* Beneficios / Recompensas */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Beneficios
                          </label>
                          <select
                            name="rewards"
                            defaultValue={formData.rewards || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Seleccionar beneficios</option>
                            <option value="cashback">Cashback</option>
                            <option value="millas">Millas aéreas</option>
                            <option value="puntos">Puntos por compras</option>
                            <option value="seguros">Seguros incluidos</option>
                            <option value="ninguno">Ninguno</option>
                          </select>
                        </div>

                        {/* Cuota anual */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Cuota anual
                          </label>
                          <select
                            name="annualFee"
                            defaultValue={formData.annualFee || 'no'}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="no">No tiene</option>
                            <option value="sí">Sí, tiene</option>
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
                            defaultValue={formData.color}
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
                          defaultValue={formData.notes}
                          onChange={handleChange}
                          placeholder="Ej: Cashback 2%, sin anualidad, promoción 0% hasta junio"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="2"
                        />
                      </div>
                      </>
                    )}
                    {isGoal && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Nombre de la meta */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Nombre de la meta <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              defaultValue={formData.name}
                              onChange={handleChange}
                              placeholder="Ej: Viaje a Cancún, Fondo de emergencia"
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

                          {/* Monto ahorrado actual */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Monto ahorrado actual
                            </label>
                            <input
                              type="number"
                              name="currentAmount"
                              defaultValue={formData.currentAmount}
                              onChange={handleChange}
                              placeholder="2,500,000"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Fecha límite (opcional) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Fecha límite (opcional)
                            </label>
                            <input
                              type="date"
                              name="deadline"
                              defaultValue={formData.deadline || ''}
                              onChange={handleChange}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          {/* Frecuencia de ahorro */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Frecuencia de ahorro
                            </label>
                            <select
                              name="frequency"
                              defaultValue={formData.frequency || 'mensual'}
                              onChange={handleChange}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="único">Único (pago inicial)</option>
                              <option value="semanal">Semanal</option>
                              <option value="quincenal">Quincenal</option>
                              <option value="mensual">Mensual</option>
                              <option value="bimestral">Bimestral</option>
                              <option value="trimestral">Trimestral</option>
                              <option value="semestral">Semestral</option>
                              <option value="anual">Anual</option>
                            </select>
                          </div>

                          {/* Prioridad */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Prioridad
                            </label>
                            <select
                              name="priority"
                              defaultValue={formData.priority || 'media'}
                              onChange={handleChange}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="baja">Baja</option>
                              <option value="media">Media</option>
                              <option value="alta">Alta</option>
                            </select>
                          </div>
                          {/* Notas */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Notas (opcional)
                            </label>
                            <textarea
                              name="notes"
                              defaultValue={formData.notes || ''}
                              onChange={handleChange}
                              placeholder="Ej: Guardar en cuenta de ahorros, usar bono de diciembre"
                              rows="2"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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