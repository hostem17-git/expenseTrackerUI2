import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import { fetchSecondarySummary, fetchExpenses } from '../services/api';
import PieChart from './PieChart';
import './SecondarySummary.css';

const SecondarySummary = ({ primaryCategory, dateRange, onClose }) => {
  const [secondarySummary, setSecondarySummary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedSecondaryCategory, setSelectedSecondaryCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSecondarySummary = useCallback(async () => {
    if (!primaryCategory) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchSecondarySummary(primaryCategory, {
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      });
      
      setSecondarySummary(data || []);
    } catch (err) {
      setError(err.message);
      setSecondarySummary([]);
    } finally {
      setLoading(false);
    }
  }, [primaryCategory, dateRange?.start, dateRange?.end]);

  const loadExpenses = useCallback(async () => {
    if (!primaryCategory) {
      return;
    }

    setExpensesLoading(true);
    try {
      const data = await fetchExpenses({
        startDate: dateRange?.start,
        endDate: dateRange?.end,
        primarycategory: primaryCategory,
        secondarycategory: selectedSecondaryCategory || '',
      });
      setExpenses(data || []);
    } catch (err) {
      // Don't show error for expenses, just log it
      console.error('Error loading expenses:', err);
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }, [primaryCategory, dateRange?.start, dateRange?.end, selectedSecondaryCategory]);

  useEffect(() => {
    loadSecondarySummary();
  }, [loadSecondarySummary]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Calculate total and sort - with better error handling
  // Handle multiple possible data structures
  const total = secondarySummary.reduce((sum, item) => {
    if (!item) return sum;
    // Try multiple possible field names
    const value = parseFloat(
      item?.total || 
      item?.value || 
      item?.amount || 
      item?.sum || 
      0
    );
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
  
  // Filter out null/undefined items, but be lenient about field names
  const sortedSummary = [...secondarySummary]
    .filter(item => {
      if (!item) return false;
      // Accept item if it has any numeric field
      return (
        item.total !== undefined || 
        item.value !== undefined || 
        item.amount !== undefined ||
        item.sum !== undefined ||
        Object.keys(item).length > 0 // Accept if it has any properties
      );
    })
    .sort((a, b) => {
      const getValue = (item) => {
        return parseFloat(
          item?.total || 
          item?.value || 
          item?.amount || 
          item?.sum || 
          0
        );
      };
      const aValue = getValue(a);
      const bValue = getValue(b);
      return (isNaN(bValue) ? 0 : bValue) - (isNaN(aValue) ? 0 : aValue);
    });

  return (
    <div className="secondary-summary-overlay" onClick={onClose}>
      <div className="secondary-summary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="secondary-summary-header">
          <h3>Secondary Categories: {primaryCategory}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="error-icon">⚠️</p>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {secondarySummary && secondarySummary.length > 0 ? (
              <>
                <div className="secondary-summary-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">{formatCurrency(total)}</span>
                </div>

                {sortedSummary.length > 0 && (
                  <div className="secondary-summary-pie-chart">
                    <PieChart 
                      data={sortedSummary.map(item => {
                        const getValue = () => parseFloat(
                          item?.total || 
                          item?.value || 
                          item?.amount || 
                          item?.sum || 
                          0
                        );
                        const getCategoryName = () => 
                          item?.secondarycategory || 
                          item?.id || 
                          item?.category || 
                          item?.name || 
                          'Uncategorized';
                        
                        return {
                          secondarycategory: getCategoryName(),
                          total: getValue(),
                          count: item?.count || 0
                        };
                      })} 
                      title="Secondary Categories Distribution"
                      size={280}
                    />
                  </div>
                )}

                <div className="secondary-summary-list">
                  {sortedSummary.length === 0 ? (
                    <div className="empty-state">
                      <p>No secondary categories found.</p>
                    </div>
                  ) : (
                    sortedSummary.map((item, index) => {
                      const getValue = () => parseFloat(
                        item?.total || 
                        item?.value || 
                        item?.amount || 
                        item?.sum || 
                        0
                      );
                      const getCategoryName = () => 
                        item?.secondarycategory || 
                        item?.id || 
                        item?.category || 
                        item?.name || 
                        'Uncategorized';
                      
                      const amount = getValue();
                      const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
                      const categoryName = getCategoryName();
                      
                      const isSelected = selectedSecondaryCategory === categoryName;
                      
                      return (
                        <div 
                          key={index} 
                          className={`secondary-summary-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedSecondaryCategory(isSelected ? '' : categoryName);
                          }}
                          style={{ cursor: 'pointer' }}
                          title={`Click to filter expenses by ${categoryName}`}
                        >
                          <div className="secondary-summary-item-header">
                            <span className="category-name">{categoryName}</span>
                            <span className="category-amount">{formatCurrency(amount)}</span>
                          </div>
                          <div className="secondary-summary-item-bar">
                            <div 
                              className="secondary-summary-item-fill" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="secondary-summary-item-footer">
                            <span className="category-count">{item?.count || 0} expenses</span>
                            <span className="category-percentage">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Expenses Section */}
                <div className="secondary-summary-expenses-section">
                  <div className="expenses-section-header">
                    <h4>Related Expenses</h4>
                    <div className="expenses-filter-controls">
                      <div className="filter-group">
                        <label htmlFor="secondary-category-filter">Filter by Secondary Category:</label>
                        <select
                          id="secondary-category-filter"
                          className="secondary-category-filter-select"
                          value={selectedSecondaryCategory}
                          onChange={(e) => setSelectedSecondaryCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          {sortedSummary.map((item, index) => {
                            const getCategoryName = () => 
                              item?.secondarycategory || 
                              item?.id || 
                              item?.category || 
                              item?.name || 
                              'Uncategorized';
                            return (
                              <option key={index} value={getCategoryName()}>
                                {getCategoryName()} ({item?.count || 0} expenses)
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      {selectedSecondaryCategory && (
                        <button 
                          className="clear-filter-button"
                          onClick={() => setSelectedSecondaryCategory('')}
                        >
                          Clear Filter
                        </button>
                      )}
                    </div>
                  </div>

                  {expensesLoading ? (
                    <div className="loading-state-small">
                      <div className="spinner-small"></div>
                      <p>Loading expenses...</p>
                    </div>
                  ) : expenses.length > 0 ? (
                    <div className="expenses-list-compact">
                      {expenses.map((expense) => (
                        <div key={expense.id} className="expense-item-compact">
                          <div className="expense-item-main">
                            <div className="expense-item-info">
                              <span className="expense-item-name">{expense.expense}</span>
                              {expense.secondarycategory && (
                                <span className="expense-item-secondary-category">
                                  {expense.secondarycategory}
                                </span>
                              )}
                            </div>
                            <span className="expense-item-amount">{formatCurrency(expense.amount)}</span>
                          </div>
                          <div className="expense-item-date">{formatDate(expense.created)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <p>
                        {selectedSecondaryCategory 
                          ? `No expenses found for "${selectedSecondaryCategory}"`
                          : 'No expenses found'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No secondary categories found for "{primaryCategory}".</p>
                <p className="empty-state-hint">This category may not have any expenses with secondary categories assigned.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SecondarySummary;

