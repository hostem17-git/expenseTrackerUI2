import React from 'react';
import { formatCurrency } from '../utils/dateUtils';
import PieChart from './PieChart';
import './ExpenseCharts.css';

const ExpenseCharts = ({ expenses, summary }) => {
  // Category breakdown for pie chart (using summary data)
  const categoryData = summary || [];
  const totalAmount = categoryData.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);

  return (
    <div className="charts-container">
      <div className="category-breakdown-container">
        <div className="chart-section pie-chart-section">
          <h3>Primary Categories Distribution</h3>
          <PieChart 
            data={categoryData} 
            title=""
            size={300}
          />
        </div>

        <div className="chart-section list-view-section">
          <h3>Category Breakdown (List View)</h3>
          <div className="category-chart">
            {categoryData.length === 0 ? (
              <div className="empty-chart">No data available</div>
            ) : (
              <div className="category-chart-list">
                {categoryData.map((item, index) => {
                  const amount = parseFloat(item.value || 0);
                  const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
                  const hue = (index * 137.508) % 360;
                  const color = `hsl(${hue}, 70%, 60%)`;
                  
                  return (
                    <div key={item.id || index} className="category-chart-item">
                      <div className="category-chart-header">
                        <div className="category-chart-info">
                          <span className="category-chart-color" style={{ background: color }}></span>
                          <span className="category-chart-label">{item.id}</span>
                        </div>
                        <span className="category-chart-amount">{formatCurrency(amount)}</span>
                      </div>
                      <div className="category-chart-bar">
                        <div 
                          className="category-chart-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            background: color
                          }}
                        ></div>
                      </div>
                      <div className="category-chart-footer">
                        <span className="category-chart-percentage">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;

