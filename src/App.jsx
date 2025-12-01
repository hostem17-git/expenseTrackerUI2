import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DateFilter from './components/DateFilter';
import CategoryFilter from './components/CategoryFilter';
import SearchAndSort from './components/SearchAndSort';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseForm from './components/ExpenseForm';
import ExpenseCharts from './components/ExpenseCharts';
import BulkActions from './components/BulkActions';
import Pagination from './components/Pagination';
import ThemeToggle from './components/ThemeToggle';
import HamburgerMenu from './components/HamburgerMenu';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import { getCurrentWeek } from './utils/dateUtils';
import { fetchExpenses, fetchSummary, addExpense, updateExpense, deleteExpense, categorizePendingExpenses } from './services/api';
import { filterExpensesBySearch, filterExpensesByCategory, sortExpenses } from './utils/filterAndSort';
import { exportToCSV, printExpenses } from './utils/exportUtils';
import './App.css';

const ExpenseTracker = () => {
  const [allExpenses, setAllExpenses] = useState([]); // All expenses from API
  const [filteredExpenses, setFilteredExpenses] = useState([]); // Filtered and sorted expenses
  const [summary, setSummary] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [categoryFilters, setCategoryFilters] = useState({ primarycategory: '', secondarycategory: '' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Bulk selection state
  const [selectedExpenseIds, setSelectedExpenseIds] = useState(new Set());
  const [showCharts, setShowCharts] = useState(false);
  
  const { logout } = useAuth();

  useEffect(() => {
    // Initialize with current week filter
    const weekRange = getCurrentWeek();
    setDateRange(weekRange);
    loadExpenses(weekRange);
    loadSummary(weekRange);
    
    // Listen for 401 unauthorized events
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Apply filters and sorting whenever expenses, search, sort, or category filters change
  useEffect(() => {
    let filtered = [...allExpenses];
    
    // Apply search filter
    filtered = filterExpensesBySearch(filtered, searchQuery);
    
    // Apply category filters
    filtered = filterExpensesByCategory(
      filtered,
      categoryFilters.primarycategory,
      categoryFilters.secondarycategory
    );
    
    // Apply sorting
    filtered = sortExpenses(filtered, sortOption);
    
    setFilteredExpenses(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
    // Clear selection when filters change
    setSelectedExpenseIds(new Set());
  }, [allExpenses, searchQuery, sortOption, categoryFilters]);

  // Calculate pagination
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
  
  // Calculate total amount from all filtered expenses (not just current page)
  const totalFilteredAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const loadExpenses = async (dateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses({
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      });
      
      setAllExpenses(data);
    } catch (err) {
      setError(err.message);
      setAllExpenses([]);
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
    // Clear category filters when date range changes
    setCategoryFilters({ primarycategory: '', secondarycategory: '' });
    setSearchQuery('');
    loadExpenses(range);
    loadSummary(range);
  };

  const handleCategoryFilterChange = (filters) => {
    setCategoryFilters(filters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  const handleRefresh = () => {
    if (dateRange) {
      loadExpenses(dateRange);
      loadSummary(dateRange);
    }
  };

  const handleExportCSV = () => {
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filteredExpenses, filename);
  };

  const handlePrint = () => {
    printExpenses(filteredExpenses, dateRange);
  };

  const handleSelectExpense = (id, checked) => {
    const newSelected = new Set(selectedExpenseIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedExpenseIds(newSelected);
  };

  const handleBulkDelete = async (ids) => {
    try {
      // Delete all selected expenses
      await Promise.all(ids.map(id => deleteExpense(id)));
      setSelectedExpenseIds(new Set());
      // Reload expenses and summary
      if (dateRange) {
        loadExpenses(dateRange);
        loadSummary(dateRange);
      }
    } catch (err) {
      alert(`Failed to delete expenses: ${err.message}`);
    }
  };

  const handleBulkEdit = (ids) => {
    // For now, just show a message - bulk edit can be implemented later
    alert(`Bulk edit for ${ids.length} expenses - Feature coming soon!`);
  };

  const handleClearSelection = () => {
    setSelectedExpenseIds(new Set());
  };

  const handleCategorizeExpenses = async () => {
    if (!window.confirm('This will categorize all expenses with "Categorization pending" status using AI. This may take a few moments. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await categorizePendingExpenses();
      // Show success message
      alert('Expenses categorized successfully! Refreshing data...');
      // Reload expenses and summary
      if (dateRange) {
        await loadExpenses(dateRange);
        await loadSummary(dateRange);
      }
    } catch (err) {
      setError(err.message);
      alert(`Failed to categorize expenses: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
            <h1>Whatspense</h1>
            <p>Track and manage your expenses with ease</p>
          </div>
          <div className="header-actions">
            <button className="refresh-button" onClick={handleRefresh} title="Refresh data">
              🔄 Refresh
            </button>
            <button className="export-button" onClick={handleExportCSV} title="Export to CSV">
              📥 Export CSV
            </button>
            <button className="print-button" onClick={handlePrint} title="Print">
              🖨️ Print
            </button>
            <button 
              className={`charts-button ${showCharts ? 'active' : ''}`} 
              onClick={() => setShowCharts(!showCharts)} 
              title="Toggle Charts"
            >
              {showCharts ? '📊 Hide Charts' : '📊 Show Charts'}
            </button>
            <button 
              className="categorize-button" 
              onClick={handleCategorizeExpenses}
              title="Categorize pending expenses using AI"
              disabled={loading}
            >
              🤖 Categorize
            </button>
            <button className="add-expense-button" onClick={() => setShowExpenseForm(true)}>
              + Add Expense
            </button>
            <ThemeToggle />
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
          <HamburgerMenu
            onRefresh={handleRefresh}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
            onToggleCharts={() => setShowCharts(!showCharts)}
            showCharts={showCharts}
            onCategorize={handleCategorizeExpenses}
            onAddExpense={() => setShowExpenseForm(true)}
            onLogout={logout}
            loading={loading}
          />
        </div>
      </header>
      
      <div className="app-content">
        <div className="filters-section">
          <DateFilter 
          onFilterChange={handleFilterChange} 
          currentDateRange={dateRange}
        />
          
          <CategoryFilter
            expenses={allExpenses}
            onFilterChange={handleCategoryFilterChange}
            activeFilters={categoryFilters}
          />
          
          <SearchAndSort
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            searchQuery={searchQuery}
            sortOption={sortOption}
          />
        </div>
        
        {showCharts && (
          <div className="charts-section">
            <ExpenseCharts summary={summary} />
          </div>
        )}
        
        <div className="summary-section">
          <ExpenseSummary 
            summary={summary}
            dateRange={dateRange}
            loading={summaryLoading}
            error={summaryError}
          />
        </div>
        
        <div className="expenses-section">
          <BulkActions
            expenses={paginatedExpenses}
            selectedIds={selectedExpenseIds}
            onSelectAll={handleSelectExpense}
            onBulkDelete={handleBulkDelete}
            onBulkEdit={handleBulkEdit}
            onClearSelection={handleClearSelection}
          />
          
          <ExpenseList 
            expenses={paginatedExpenses} 
            totalAmount={totalFilteredAmount}
            dateRange={dateRange}
            loading={loading}
            error={error}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            selectedIds={selectedExpenseIds}
            onSelectExpense={handleSelectExpense}
          />
          
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>
      
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
  const [authView, setAuthView] = useState('login'); // 'login', 'signup', 'forgotPassword'

  return (
    <>
      {authView === 'login' ? (
        <Login 
          onSwitchToSignup={() => setAuthView('signup')}
          onSwitchToForgotPassword={() => setAuthView('forgotPassword')}
        />
      ) : authView === 'signup' ? (
        <Signup onSwitchToLogin={() => setAuthView('login')} />
      ) : (
        <ForgotPassword onBackToLogin={() => setAuthView('login')} />
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
