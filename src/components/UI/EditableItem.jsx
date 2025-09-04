// src/components/UI/EditableItem.jsx
import React, { useState, useRef } from 'react';
import { Edit2, Trash2, Save, X } from "lucide-react";

const EditableItem = ({ item, onUpdate, onDelete, renderPreview }) => {
  const [isEditing, setIsEditing] = useState(false);
  const formDataRef = useRef({ ...item });

  const openModal = () => {
    formDataRef.current = { ...item };
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current = { ...formDataRef.current, [name]: value };
  };

  const handleSave = () => {
    onUpdate(formDataRef.current);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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

  // === Funciones para préstamos ===
  const getPaymentAmount = () => {
    const { total, paid, duration, frequency } = formDataRef.current;
    if (!total || !duration || !frequency) return 0;

    let totalPayments = 0;
    switch (frequency) {
      case 'semanal': totalPayments = duration * 4; break;
      case 'quincenal': totalPayments = duration * 2; break;
      case 'mensual': totalPayments = duration; break;
      case 'bimestral': totalPayments = Math.ceil(duration / 2); break;
      case 'trimestral': totalPayments = Math.ceil(duration / 3); break;
      case 'semestral': totalPayments = Math.ceil(duration / 6); break;
      case 'anual': totalPayments = Math.ceil(duration / 12); break;
      default: return 0;
    }

    return totalPayments > 0 ? total / totalPayments : 0;
  };

  const getRemainingPayments = () => {
    const paymentAmount = getPaymentAmount();
    const paid = formDataRef.current.paid || 0;
    const paidCount = paymentAmount > 0 ? Math.floor(paid / paymentAmount) : 0;
    const totalPayments = (() => {
      switch (formDataRef.current.frequency) {
        case 'semanal': return formDataRef.current.duration * 4;
        case 'quincenal': return formDataRef.current.duration * 2;
        case 'mensual': return formDataRef.current.duration;
        default: return formDataRef.current.duration;
      }
    })();
    return Math.max(0, totalPayments - paidCount);
  };

  const getProgress = () => {
    const { total, paid } = formDataRef.current;
    return total > 0 ? (paid / total) * 100 : 0;
  };

  // === Modal de edición ===
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Editar {isIncome ? 'Ingreso' : isLoan ? 'Préstamo' : 'Gasto'}
          </h3>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* === Préstamo === */}
          {isLoan && (
            <>
              <input
                type="text"
                name="name"
                defaultValue={formDataRef.current.name}
                onChange={handleChange}
                placeholder="Nombre del préstamo"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                required
              />
              <input
                type="number"
                name="total"
                defaultValue={formDataRef.current.total}
                onChange={handleChange}
                placeholder="Monto total"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                required
              />
              <input
                type="number"
                name="paid"
                defaultValue={formDataRef.current.paid}
                onChange={handleChange}
                placeholder="Ya pagado"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <input
                type="number"
                name="duration"
                defaultValue={formDataRef.current.duration}
                onChange={handleChange}
                placeholder="Duración en meses"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <input
                type="date"
                name="startDate"
                defaultValue={formDataRef.current.startDate}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <select
                name="frequency"
                defaultValue={formDataRef.current.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
              <select
                name="category"
                defaultValue={formDataRef.current.category}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                {['Transporte', 'Servicios', 'Alimentación', 'Salud', 'Entretenimiento', 'Educación', 'Hogar', 'Ropa', 'Ahorro', 'Deudas', 'Otros'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </>
          )}

          {/* === Ingreso === */}
          {isIncome && (
            <>
              <input
                type="text"
                name="source"
                defaultValue={formDataRef.current.source}
                onChange={handleChange}
                placeholder="Fuente de ingreso"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <input
                type="text"
                name="company"
                defaultValue={formDataRef.current.company}
                onChange={handleChange}
                placeholder="Empresa"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <input
                type="date"
                name="date"
                defaultValue={formDataRef.current.date}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <input
                type="number"
                name="amount"
                defaultValue={formDataRef.current.amount}
                onChange={handleChange}
                placeholder="Monto"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                required
              />
              <select
                name="frequency"
                defaultValue={formDataRef.current.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="único">Único</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
              <select
                name="paymentMethod"
                defaultValue={formDataRef.current.paymentMethod || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="">Método de pago</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="depósito">Depósito</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
              <input
                type="text"
                name="notes"
                defaultValue={formDataRef.current.notes || ''}
                onChange={handleChange}
                placeholder="Notas (opcional)"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
            </>
          )}

          {/* === Gasto === */}
          {isExpense && !isLoan && (
            <>
              <input
                type="number"
                name="amount"
                defaultValue={formDataRef.current.amount}
                onChange={handleChange}
                placeholder="Monto"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                required
              />
              <select
                name="category"
                defaultValue={formDataRef.current.category}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                {['Transporte', 'Servicios', 'Alimentación', 'Salud', 'Entretenimiento', 'Educación', 'Hogar', 'Ropa', 'Ahorro', 'Deudas', 'Otros'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                name="description"
                defaultValue={formDataRef.current.description}
                onChange={handleChange}
                placeholder="Descripción"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <input
                type="date"
                name="date"
                defaultValue={formDataRef.current.date}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
              <select
                name="frequency"
                defaultValue={formDataRef.current.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
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
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );

  // Vista personalizada
  if (renderPreview) {
    return (
      <>
        {renderPreview(item)}
        {isEditing && <EditModal />}
      </>
    );
  }

  // === Vista por defecto: Préstamo (especial) ===
  if (isLoan) {
    const startDate = new Date(item.startDate);
    const progress = getProgress();
    const remaining = item.total - item.paid;
    const remainingPayments = getRemainingPayments();
    const paymentAmount = getPaymentAmount();

    return (
      <>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Iniciado: {startDate.toLocaleDateString('es-CO')} • {item.frequency}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {formatCurrency(remaining)} restantes
              </p>
            </div>
          </div>

          {remainingPayments > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {remainingPayments} pagos de {formatCurrency(paymentAmount)}
            </p>
          )}

          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={openModal}
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

        {isEditing && <EditModal />}
      </>
    );
  }

  // === Vista por defecto: Ingresos y Gastos ===
  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition flex justify-between items-center">
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {isIncome && `${item.source} – ${item.company}`}
            {isExpense && `${item.category} – ${item.description}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {item.date ? item.date.split('-').reverse().join('/') : 'Fecha no disponible'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {isLoan ? formatCurrency(item.total - item.paid) : formatCurrency(item.amount)}
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={openModal}
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

      {isEditing && <EditModal />}
    </>
  );
};

export default EditableItem;