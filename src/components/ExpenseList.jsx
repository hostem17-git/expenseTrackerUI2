import React from 'react';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import './ExpenseList.css';

const ExpenseList = ({ expenses, totalAmount: propTotalAmount, dateRange, loading, error, onEdit, onDelete, selectedIds, onSelectExpense, hiddenIds, onHideExpense, onUnhideAll }) => {
  const formatDateRange = () => {
    if (!dateRange) return '';
    const start = formatDate(dateRange.start);
    const end = formatDate(dateRange.end);
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="expense-list-container">
        <div className="expense-header">
          <h2>Expenses</h2>
          {dateRange && <p className="date-range">{formatDateRange()}</p>}
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-list-container">
        <div className="expense-header">
          <h2>Expenses</h2>
          {dateRange && <p className="date-range">{formatDateRange()}</p>}
        </div>
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const hasHiddenExpenses = hiddenIds && hiddenIds.size > 0;

  if (expenses.length === 0) {
    return (
      <div className="expense-list-container">
        <div className="expense-header">
          <h2>Expenses</h2>
          {dateRange && <p className="date-range">{formatDateRange()}</p>}
        </div>
        
        <div className="total-summary">
          <span className="total-label">Total:</span>
          <span className="total-amount">{formatCurrency(propTotalAmount || 0)}</span>
        </div>
        
        {hasHiddenExpenses && onUnhideAll && (
          <div className="unhide-all-container">
            <button 
              className="unhide-all-button" 
              onClick={onUnhideAll}
              title="Show all hidden expenses"
            >
              👁️ Unhide All ({hiddenIds.size})
            </button>
          </div>
        )}
        
        <div className="empty-state">
          <p>{hasHiddenExpenses ? 'All expenses are hidden.' : 'No expenses found for the selected period.'}</p>
        </div>
      </div>
    );
  }

  // Use provided totalAmount (from all filtered expenses) or calculate from current page as fallback
  const totalAmount = propTotalAmount !== undefined 
    ? propTotalAmount 
    : expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <div className="expense-list-container">
      <div className="expense-header">
        <h2>Expenses</h2>
        {dateRange && <p className="date-range">{formatDateRange()}</p>}
      </div>
      
      <div className="total-summary">
        <span className="total-label">Total:</span>
        <span className="total-amount">{formatCurrency(totalAmount)}</span>
      </div>
      
      {hasHiddenExpenses && onUnhideAll && (
        <div className="unhide-all-container">
          <button 
            className="unhide-all-button" 
            onClick={onUnhideAll}
            title="Show all hidden expenses"
          >
            👁️ Unhide All ({hiddenIds.size})
          </button>
        </div>
      )}

      <div className="expense-list">
        {expenses.map((expense) => (
          <div key={expense.id} className={`expense-card-wrapper ${onSelectExpense ? 'with-checkbox' : ''}`}>
            {onSelectExpense && (
              <input
                type="checkbox"
                className="expense-checkbox"
                checked={selectedIds?.has(expense.id) || false}
                onChange={(e) => onSelectExpense(expense.id, e.target.checked)}
              />
            )}
            <div className="expense-card">
            <div className="expense-main">
              <div className="expense-info">
                <h3 className="expense-name">{expense.expense}</h3>
                <div className="expense-categories">
                  <span className="primary-category">{expense.primarycategory}</span>
                  <span className="secondary-category">{expense.secondarycategory}</span>
                </div>
              </div>
              <div className="expense-amount">{formatCurrency(expense.amount)}</div>
            </div>
            <div className="expense-footer">
              <div className="expense-date">{formatDate(expense.created)}</div>
              <div className="expense-actions">
                {onHideExpense && (
                  <button 
                    className="action-button hide-button" 
                    onClick={() => onHideExpense(expense.id)}
                    title="Hide expense"
                  >
                    👁️‍🗨️
                  </button>
                )}
                {onEdit && (
                  <button 
                    className="action-button edit-button" 
                    onClick={() => onEdit(expense)}
                    title="Edit expense"
                  >
                    ✏️
                  </button>
                )}
                {onDelete && (
                  <button 
                    className="action-button delete-button" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this expense?')) {
                        onDelete(expense.id);
                      }
                    }}
                    title="Delete expense"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;

