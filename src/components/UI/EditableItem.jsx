// src/components/UI/EditableItem.jsx
import React, { useState } from 'react';
import { Edit2, Trash2, Save, X } from "lucide-react";


const EditableItem = ({ item, type, onUpdate, onDelete, categories = [], renderPreview }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...item });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = ['total', 'paid', 'amount'].includes(name)
      ? parseFloat(value) || 0
      : value;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...item });
    setIsEditing(false);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);

  const isLoan = 'total' in item;
  const getPaymentsCount = () => {
    const { duration, frequency } = formData;
    if (!duration || !frequency) return 0;

    switch (frequency) {
      case 'semanal': return duration * 4;
      case 'quincenal': return duration * 2;
      case 'mensual': return duration;
      case 'bimestral': return Math.ceil(duration / 2);
      case 'trimestral': return Math.ceil(duration / 3);
      case 'semestral': return Math.ceil(duration / 6);
      case 'anual': return Math.ceil(duration / 12);
      default: return duration;
    }
  };
  const getPaymentAmount = () => {
    const totalPayments = getPaymentsCount();
    return totalPayments > 0 ? (formData.total / totalPayments) : 0;
  };

  const getRemainingPayments = () => {
    const totalPayments = getPaymentsCount();
    const paidPayments = Math.floor(formData.paid / getPaymentAmount());
    return Math.max(0, totalPayments - paidPayments);
  };

  const getTotalRemaining = () => {
    return formData.total - formData.paid;
  };

  const isIncome = 'source' in item && 'company' in item;
  const isExpense = 'category' in item && 'description' in item;

if (isEditing) {
    return (
      <div className="p-4 rounded-xl border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-gray-800 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Préstamo */}
          {isLoan && (
            <>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre del préstamo"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
                required
              />
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                placeholder="Monto total"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
                required
              />
              <input
                type="number"
                name="paid"
                value={formData.paid}
                onChange={handleChange}
                placeholder="Ya pagado"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              />
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Duración en meses"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              />
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
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
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              >
                {['Transporte', 'Servicios', 'Alimentación', 'Salud', 'Entretenimiento', 'Educación', 'Hogar', 'Ropa', 'Ahorro', 'Deudas', 'Otros'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </>
          )}

          {/* Ingreso */}
          {isIncome && (
            <>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Fuente de ingreso"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Empresa"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Monto"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
                required
              />
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              >
                <option value="único">Único</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </>
          )}

          {/* Gasto */}
          {isExpense && !isLoan && (
            <>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Monto"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
                required
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              >
                {['Transporte', 'Servicios', 'Alimentación', 'Salud', 'Entretenimiento', 'Educación', 'Hogar', 'Ropa', 'Ahorro', 'Deudas', 'Otros'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700"
              />
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition-all"
          >
            <Save className="w-4 h-4" /> Guardar
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow transition-all"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Si hay una función renderPreview, úsala
  if (renderPreview) {
    return renderPreview(item);
  }

  // Vista por defecto
  if (isLoan) {
    const startDate = new Date(formData.startDate);
    const progress = (formData.paid / formData.total) * 100;
    const remaining = getTotalRemaining();
    const remainingPayments = getRemainingPayments();
    const paymentAmount = getPaymentAmount();

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-6 border-primary relative">
       
        <div className="pr-12">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{formData.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Iniciado: {startDate.toLocaleDateString('es-CO')} • {formData.frequency}
              </p>
            </div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(remaining)} restantes
            </span>
          </div>

          {/* Mensaje de pagos restantes */}
          {remainingPayments > 0 && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
              Faltan {remainingPayments} pagos de {formatCurrency(paymentAmount)} → Total: {formatCurrency(remaining)}
            </p>
          )}

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Pagado: {formatCurrency(formData.paid)}</span>
              <span>Total: {formatCurrency(formData.total)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Progreso: {Math.round(progress)}% completado
          </p>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600 transition"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm("¿Eliminar este préstamo?")) {
                  onDelete(item.id);
                }
              }}
              className="p-1.5 rounded text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 transition"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow flex justify-between items-center">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-100">
          {isLoan && `${formData.name} (Préstamo)`}
          {isIncome && `${formData.source} – ${formData.company}`}
          {isExpense && !isLoan && `${formData.category} – ${formData.description}`}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {new Date(formData.date).toLocaleDateString('es-CO')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {isLoan ? (
            formatCurrency(formData.total - formData.paid)
          ) : (
            formatCurrency(formData.amount)
          )}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600 transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (window.confirm('¿Eliminar este registro?')) {
              onDelete(item.id);
            }
          }}
          className="p-1.5 rounded text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EditableItem;