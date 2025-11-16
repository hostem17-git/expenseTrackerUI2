import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DateFilter from './components/DateFilter';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseForm from './components/ExpenseForm';
import Login from './components/Login';
import Signup from './components/Signup';
import { getCurrentWeek } from './utils/dateUtils';
import { fetchExpenses, fetchSummary, addExpense, updateExpense, deleteExpense } from './services/api';
import './App.css';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    // Initialize with current week filter
    const weekRange = getCurrentWeek();
    setDateRange(weekRange);
    loadExpenses(weekRange);
    loadSummary(weekRange);
  }, []);

  const loadExpenses = async (dateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses({
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      });
      
      // Sort by date (newest first)
      data.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      setExpenses(data);
    } catch (err) {
      setError(err.message);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async (dateRange) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await fetchSummary({
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      });
      
      setSummary(data);
    } catch (err) {
      setSummaryError(err.message);
      setSummary([]);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFilterChange = (range) => {
    setDateRange(range);
    loadExpenses(range);
    loadSummary(range);
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(expenseData);
      setShowExpenseForm(false);
      // Reload expenses and summary
      if (dateRange) {
        loadExpenses(dateRange);
        loadSummary(dateRange);
      }
    } catch (err) {
      alert(`Failed to add expense: ${err.message}`);
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    try {
      await updateExpense(id, expenseData);
      setShowExpenseForm(false);
      setEditingExpense(null);
      // Reload expenses and summary
      if (dateRange) {
        loadExpenses(dateRange);
        loadSummary(dateRange);
      }
    } catch (err) {
      alert(`Failed to update expense: ${err.message}`);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      // Reload expenses and summary
      if (dateRange) {
        loadExpenses(dateRange);
        loadSummary(dateRange);
      }
    } catch (err) {
      alert(`Failed to delete expense: ${err.message}`);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCancelForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = (idOrData, expenseData) => {
    if (editingExpense) {
      handleUpdateExpense(editingExpense.id, expenseData);
    } else {
      handleAddExpense(expenseData);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>💰 Expense Tracker</h1>
            <p>Track and manage your expenses with ease</p>
          </div>
          <div className="header-actions">
            <button className="add-expense-button" onClick={() => setShowExpenseForm(true)}>
              + Add Expense
            </button>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <DateFilter onFilterChange={handleFilterChange} />
      <ExpenseSummary 
        summary={summary}
        dateRange={dateRange}
        loading={summaryLoading}
        error={summaryError}
      />
      <ExpenseList 
        expenses={expenses} 
        dateRange={dateRange}
        loading={loading}
        error={error}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />
      
      <ExpenseForm
        expense={editingExpense}
        onSave={handleSaveExpense}
        onCancel={handleCancelForm}
        isOpen={showExpenseForm}
      />
    </div>
  );
};

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <Signup onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <ExpenseTracker /> : <AuthScreen />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
