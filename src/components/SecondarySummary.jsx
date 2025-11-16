import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/dateUtils';
import { fetchSecondarySummary } from '../services/api';
import PieChart from './PieChart';
import './SecondarySummary.css';

const SecondarySummary = ({ primaryCategory, dateRange, onClose }) => {
  const [secondarySummary, setSecondarySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSecondarySummary();
  }, [primaryCategory, dateRange]);

  const loadSecondarySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSecondarySummary(primaryCategory, {
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      });
      setSecondarySummary(data);
    } catch (err) {
      setError(err.message);
      setSecondarySummary([]);
    } finally {
      setLoading(false);
    }
  };

  const total = secondarySummary.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const sortedSummary = [...secondarySummary].sort((a, b) => parseFloat(b.total || 0) - parseFloat(a.total || 0));

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
            <div className="secondary-summary-total">
              <span className="total-label">Total:</span>
              <span className="total-amount">{formatCurrency(total)}</span>
            </div>

            {sortedSummary.length > 0 && (
              <div className="secondary-summary-pie-chart">
                <PieChart 
                  data={sortedSummary.map(item => ({
                    secondarycategory: item.secondarycategory || 'Uncategorized',
                    total: item.total,
                    count: item.count || 0
                  }))} 
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
                  const amount = parseFloat(item.total || 0);
                  const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={index} className="secondary-summary-item">
                      <div className="secondary-summary-item-header">
                        <span className="category-name">{item.secondarycategory || 'Uncategorized'}</span>
                        <span className="category-amount">{formatCurrency(amount)}</span>
                      </div>
                      <div className="secondary-summary-item-bar">
                        <div 
                          className="secondary-summary-item-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="secondary-summary-item-footer">
                        <span className="category-count">{item.count || 0} expenses</span>
                        <span className="category-percentage">{percentage}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecondarySummary;

