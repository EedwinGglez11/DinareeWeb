// src/context/FinanceContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadData, saveData } from '../services/storageService';

// Datos iniciales
const defaultData = {
  incomes: [],
  expenses: [],
  debts: [],
  goals: [],
};

const FinanceContext = createContext();

const financeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      return action.payload;
    case 'ADD_INCOME':
      const newIncomes = [...state.incomes, action.payload];
      saveData({ ...state, incomes: newIncomes });
      return { ...state, incomes: newIncomes };
    case 'ADD_EXPENSE':
      const newExpenses = [...state.expenses, action.payload];
      saveData({ ...state, expenses: newExpenses });
      return { ...state, expenses: newExpenses };
    default:
      return state;
  }
};

export const FinanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, defaultData);

  useEffect(() => {
    const data = loadData();
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);