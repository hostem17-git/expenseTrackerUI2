import React from 'react';
import { formatCurrency } from '../utils/dateUtils';
import './ExpenseSummary.css';

const ExpenseSummary = ({ summary, dateRange, loading, error }) => {
  const formatDateRange = () => {
    if (!dateRange) return '';
    const start = new Date(dateRange.start).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const end = new Date(dateRange.end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="expense-summary-container">
        <div className="summary-header">
          <h2>Summary by Category</h2>
          {dateRange && <p className="date-range">{formatDateRange()}</p>}
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-summary-container">
        <div className="summary-header">
          <h2>Summary by Category</h2>
          {dateRange && <p className="date-range">{formatDateRange()}</p>}
        </div>
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary || summary.length === 0) {
    return (
      <div className="expense-summary-container">
        <div className="summary-header">
          <h2>Summary by Category</h2>
          {dateRange && <p className="date-range">{formatDateRange()}</p>}
        </div>
        <div className="empty-state">
          <p>No summary data available for the selected period.</p>
        </div>
      </div>
    );
  }

  // Calculate total for percentage calculation
  const total = summary.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);

  // Sort by value (highest first)
  const sortedSummary = [...summary].sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

  return (
    <div className="expense-summary-container">
      <div className="summary-header">
        <h2>Summary by Category</h2>
        {dateRange && <p className="date-range">{formatDateRange()}</p>}
      </div>
      
      <div className="summary-total">
        <span className="total-label">Total:</span>
        <span className="total-amount">{formatCurrency(total)}</span>
      </div>

      <div className="summary-list">
        {sortedSummary.map((item, index) => {
          const amount = parseFloat(item.value || 0);
          const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
          
          return (
            <div key={item.id || index} className="summary-item">
              <div className="summary-item-header">
                <span className="category-name">{item.id}</span>
                <span className="category-amount">{formatCurrency(amount)}</span>
              </div>
              <div className="summary-item-bar">
                <div 
                  className="summary-item-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="summary-item-footer">
                <span className="category-percentage">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseSummary;

