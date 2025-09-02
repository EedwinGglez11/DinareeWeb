// src/pages/CreditCardsPage.jsx
import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { saveData } from '../services/storageService';
import EditableItem from '../components/UI/EditableItem';
import { formatCurrency } from '../utils/formatters';

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.bank || !form.cardName || !form.currentDebt) {
      alert('Por favor completa los campos principales');
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
    alert('✅ Tarjeta de crédito registrada');

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
  };

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {/* Formulario de tarjeta de crédito */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto mb-10 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6">Agregar Tarjeta de Crédito</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banco / Institución</label>
              <input
                type="text"
                name="bank"
                value={form.bank}
                onChange={handleChange}
                placeholder="Ej: Nu, BBVA, Santander"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la tarjeta</label>
              <input
                type="text"
                name="cardName"
                value={form.cardName}
                onChange={handleChange}
                placeholder="Ej: Nu Card, Platinum"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Últimos 4 dígitos (opcional)</label>
              <input
                type="text"
                name="last4Digits"
                value={form.last4Digits}
                onChange={handleChange}
                placeholder="1234"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                maxLength="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Límite de crédito</label>
              <input
                type="number"
                name="creditLimit"
                value={form.creditLimit}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deuda actual</label>
              <input
                type="number"
                name="currentDebt"
                value={form.currentDebt}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pago mínimo</label>
              <input
                type="number"
                name="minPayment"
                value={form.minPayment}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de corte</label>
              <input
                type="date"
                name="cutDate"
                value={form.cutDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de pago</label>
              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tasa de interés (%)</label>
              <input
                type="number"
                name="interestRate"
                value={form.interestRate}
                onChange={handleChange}
                placeholder="1.5"
                step="0.01"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frecuencia de pago</label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
              <input
                type="color"
                name="color"
                value={form.color}
                onChange={handleChange}
                className="w-full p-1 h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Ej: Cashback 2%, sin anualidad"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows="2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md"
          >
            Registrar Tarjeta
          </button>
        </form>
      </div>

      {/* Lista de tarjetas */}
      {state.creditCards?.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6">Tarjetas de Crédito</h2>
          <div className="space-y-5">
            {state.creditCards.map((card) => (
              <EditableItem
                key={card.id}
                item={card}
                onUpdate={(updatedCard) => {
                  const updatedCards = state.creditCards.map(c => c.id === card.id ? updatedCard : c);
                  dispatch({ type: 'SET_DATA', payload: { ...state, creditCards: updatedCards } });
                  saveData({ ...state, creditCards: updatedCards });
                  alert('✅ Tarjeta actualizada');
                }}
                onDelete={(id) => {
                  const confirm = window.confirm('¿Eliminar esta tarjeta?');
                  if (!confirm) return;
                  const updatedCards = state.creditCards.filter(c => c.id !== id);
                  dispatch({ type: 'SET_DATA', payload: { ...state, creditCards: updatedCards } });
                  saveData({ ...state, creditCards: updatedCards });
                  alert('🗑️ Tarjeta eliminada');
                }}
                renderPreview={(card) => (
  <div
    className="p-6 rounded-2xl shadow-md border-l-8 relative"
    style={{ borderColor: card.color }}
  >
    <div className="pr-12">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{card.cardName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{card.bank}</p>
          {card.last4Digits && <p className="text-sm">•••• {card.last4Digits}</p>}
        </div>
        <span className="text-lg font-bold" style={{ color: card.color }}>
          {formatCurrency(card.currentDebt)}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Deuda</span>
          <span>{formatCurrency(card.currentDebt)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-current h-3 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((card.currentDebt / card.creditLimit) * 100, 100)}%`,
              color: card.color
            }}
          ></div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-2">
        {card.paymentDate && `Pago: ${new Date(card.paymentDate).toLocaleDateString('es-CO')}`}
      </p>
    </div>
  </div>
)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardsPage;