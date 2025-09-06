const STORAGE_KEY = 'finanzapp_data';

const defaultData = {
  incomes: [],
  expenses: [],
  debts: [],
  creditCards:[],
  goals: [],
};

export const loadData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : defaultData;
};

export const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};