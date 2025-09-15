// src/components/Dashboard/SummaryCards.jsx
import React, { useMemo, useState } from "react";
import { useFinance } from "../../hooks/useFinance";
import { Wallet, DollarSign, TrendingUp, TrendingDown, Scale, Target, CreditCard, Layers, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateLoanPaymentsThisMonth } from "../../utils/paymentUtils";

// Headless UI
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

const SummaryCards = () => {
  const { state } = useFinance();
  const navigate = useNavigate();
  //const now = useMemo(() => new Date(), []);
  /*const currentMonth = useMemo(() => now.getMonth(), [now]);
  const currentYear = useMemo(() => now.getFullYear(), [now]);*/
    const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // === 1. Ingresos mensuales ===
  const totalIncome = useMemo(() => {
    if (!Array.isArray(state.incomes)) return 0;

    return state.incomes.reduce((sum, inc) => {
      const startDate = new Date(inc.date);
      const endDate = inc.endDate ? new Date(inc.endDate) : null;

      if (inc.frequency === 'único') {
        if (
          startDate.getFullYear() === currentYear &&
          startDate.getMonth() === currentMonth
        ) {
          return sum + (Number(inc.amount) || 0);
        }
        return sum;
      }

      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const hasStarted = startDate <= endOfMonth;
      const hasNotEnded = !endDate || endDate >= startOfMonth;

      if (!hasStarted || !hasNotEnded) return sum;

      let frequencyMultiplier = 1;
      switch (inc.frequency) {
        case 'semanal': frequencyMultiplier = 4; break;
        case 'quincenal': frequencyMultiplier = 2; break;
        case 'mensual': frequencyMultiplier = 1; break;
        case 'bimestral': frequencyMultiplier = 1 / 2; break;
        case 'trimestral': frequencyMultiplier = 1 / 3; break;
        case 'semestral': frequencyMultiplier = 1 / 6; break;
        case 'anual': frequencyMultiplier = 1 / 12; break;
        default: frequencyMultiplier = 1;
      }

      return sum + (Number(inc.amount) || 0) * frequencyMultiplier;
    }, 0);
  }, [state.incomes, currentMonth, currentYear]);

  // === 2. Gastos mensuales ===
  const totalExpenses = useMemo(() => {
    if (!Array.isArray(state.expenses)) return 0;

    return state.expenses.reduce((sum, exp) => {
      const startDate = new Date(exp.date);
      const endDate = exp.endDate ? new Date(exp.endDate) : null;

      if (exp.frequency === 'único') {
        if (
          startDate.getFullYear() === currentYear &&
          startDate.getMonth() === currentMonth
        ) {
          return sum + (Number(exp.amount) || 0);
        }
        return sum;
      }

      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const hasStarted = startDate <= endOfMonth;
      const hasNotEnded = !endDate || endDate >= startOfMonth;

      if (!hasStarted || !hasNotEnded) return sum;

      let frequencyMultiplier = 1;
      switch (exp.frequency) {
        case 'semanal': frequencyMultiplier = 4; break;
        case 'quincenal': frequencyMultiplier = 2; break;
        case 'mensual': frequencyMultiplier = 1; break;
        case 'bimestral': frequencyMultiplier = 1 / 2; break;
        case 'trimestral': frequencyMultiplier = 1 / 3; break;
        case 'semestral': frequencyMultiplier = 1 / 6; break;
        case 'anual': frequencyMultiplier = 1 / 12; break;
        default: frequencyMultiplier = 1;
      }

      return sum + (Number(exp.amount) || 0) * frequencyMultiplier;
    }, 0);
  }, [state.expenses, currentMonth, currentYear]);

  // === 3. Préstamos este mes ===
  const totalLoanPaymentsThisMonth = useMemo(() => {
    if (!state) return 0;
    const rawTotal = calculateLoanPaymentsThisMonth(state, now);
    return Math.round(rawTotal * 100) / 100;
  }, [state, now]);

  // === 4. Tarjetas de crédito este mes ===
  const totalCreditCardPaymentsThisMonth = useMemo(() => {
    if (!state || !Array.isArray(state.creditCards)) return 0;

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return state.creditCards.reduce((sum, card) => {
      if (!card.paymentDate || card.minPayment <= 0) return sum;

      const paymentDate = new Date(card.paymentDate);
      if (isNaN(paymentDate.getTime())) return sum;

      const dayOfMonth = paymentDate.getDate();
      const baseDate = new Date(currentYear, currentMonth, dayOfMonth);
      const nextPayment = baseDate < now 
        ? new Date(currentYear, currentMonth + 1, dayOfMonth)
        : baseDate;

      if (
        nextPayment.getMonth() === currentMonth &&
        nextPayment.getFullYear() === currentYear
      ) {
        return sum + (Number(card.minPayment) || 0);
      }

      return sum;
    }, 0);
  }, [state,now]);

  // === 5. Balance final ===
  const balance = totalIncome - (totalExpenses + totalLoanPaymentsThisMonth + totalCreditCardPaymentsThisMonth);

  // === 6. Progreso de metas ===
  const goalsProgress = useMemo(() => {
    return (state.goals || []).map(goal => ({
      ...goal,
      progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
    }));
  }, [state.goals]);

  const completedGoals = goalsProgress.filter(g => g.progress >= 100).length;
  const averageProgress = goalsProgress.length > 0
    ? Math.round(goalsProgress.reduce((a, b) => a + b.progress, 0) / goalsProgress.length)
    : 0;

  // === 7. Total de obligaciones mensuales ===
  const totalObligations = useMemo(() => {
    return totalExpenses + totalLoanPaymentsThisMonth + totalCreditCardPaymentsThisMonth;
  }, [totalExpenses, totalLoanPaymentsThisMonth, totalCreditCardPaymentsThisMonth]);

  // Formato de moneda
  const format = (num) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // === Card reutilizable ===
  const SummaryCard = ({ title, value, subtitle, icon: Icon, iconColor, onClick }) => {
    return (
      <div
        onClick={onClick}
        className="flex flex-col justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          {Icon && (
            <div className={`p-2 rounded-full bg-opacity-10 ${iconColor.replace("text", "bg")}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}
        </div>
        <h2
          className={`font-semibold text-gray-800 dark:text-gray-100 mt-2 ${
            Math.abs(value) >= 1_000_000
              ? 'text-lg'
              : Math.abs(value) >= 100_000
                ? 'text-xl'
                : 'text-2xl'
          }`}
          style={{ wordBreak: 'break-word', lineHeight: '1.2' }}
        >
          {typeof value === "number" ? format(value) : value}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
            {subtitle}
          </p>
        )}
      </div>
    );
  };

  // Estado para controlar el modal
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Grid de tarjetas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <SummaryCard 
          title="Ingresos" 
          value={totalIncome} 
          icon={Wallet} 
          iconColor="text-green-500" 
          onClick={() => navigate("/income")} 
        />

        {/* Tarjeta de Balance con color especial */}
        <div
          onClick={() => navigate("/")}
          className="flex flex-col justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
            <div className={`p-2 rounded-full bg-opacity-10 ${balance >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {balance >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          <h2
            className={`font-semibold ${
              Math.abs(balance) >= 1_000_000
                ? 'text-lg'
                : Math.abs(balance) >= 100_000
                  ? 'text-xl'
                  : 'text-2xl'
            } ${balance >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}`}
            style={{ wordBreak: 'break-word', lineHeight: '1.2' }}
          >
            {format(balance)}
          </h2>
          <p className={`text-xs ${balance >= 0 ? 'text-green-500' : 'text-red-500'} mt-1 text-center`}>
            {balance >= 0 ? "Positivo" : "Negativo"}
          </p>
        </div>

        <SummaryCard 
          title="Obligaciones" 
          value={totalObligations} 
          icon={Layers} 
          iconColor="text-red-600" 
          subtitle="Gastos + Deudas + Tarjetas" 
          onClick={() => setShowDetails(true)} 
        />
        <SummaryCard 
          title="Metas" 
          value={`${completedGoals}/${goalsProgress.length}`} 
          subtitle={`${averageProgress}% promedio`} 
          icon={Target} 
          iconColor="text-purple-500" 
          onClick={() => navigate("/goals")} 
        />
      </div>

      {/* Modal con Headless UI */}
      <Transition.Root show={showDetails} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowDetails}>
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
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-white"
                      onClick={() => setShowDetails(false)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-6"
                  >
                    Detalle de Obligaciones Mensuales
                  </Dialog.Title>

                  {/* Grid de tarjetas dentro del modal */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <SummaryCard
                      title="Gastos"
                      value={totalExpenses}
                      icon={DollarSign}
                      iconColor="text-red-500"
                      onClick={() => navigate("/expenses")}
                    />
                    <SummaryCard
                      title="Deuda Activa"
                      value={totalLoanPaymentsThisMonth}
                      icon={Landmark}
                      iconColor="text-orange-500"
                      onClick={() => navigate("/debts")}
                    />
                    <SummaryCard
                      title="Tarjetas"
                      value={totalCreditCardPaymentsThisMonth}
                      icon={CreditCard}
                      iconColor="text-blue-500"
                      onClick={() => navigate("/credit-cards")}
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:text-white dark:border-gray-700 pt-4 flex justify-between font-bold text-lg">
                 
                    <span>Total</span>
                    <span>{format(totalObligations)}</span>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default SummaryCards;