import React, { useState } from 'react';
import { getCurrentWeek, getCurrentMonth, getCurrentQuarter } from '../utils/dateUtils';
import './DateFilter.css';

const DateFilter = ({ onFilterChange }) => {
  const [filterType, setFilterType] = useState('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleFilterChange = (type) => {
    setFilterType(type);
    let dateRange;

    switch (type) {
      case 'week':
        dateRange = getCurrentWeek();
        break;
      case 'month':
        dateRange = getCurrentMonth();
        break;
      case 'quarter':
        dateRange = getCurrentQuarter();
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          dateRange = {
            start: new Date(customStartDate),
            end: new Date(customEndDate)
          };
        } else {
          return;
        }
        break;
      default:
        return;
    }

    onFilterChange(dateRange);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      handleFilterChange('custom');
    }
  };

  return (
    <div className="date-filter">
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterType === 'week' ? 'active' : ''}`}
          onClick={() => handleFilterChange('week')}
        >
          Current Week
        </button>
        <button
          className={`filter-btn ${filterType === 'month' ? 'active' : ''}`}
          onClick={() => handleFilterChange('month')}
        >
          Current Month
        </button>
        <button
          className={`filter-btn ${filterType === 'quarter' ? 'active' : ''}`}
          onClick={() => handleFilterChange('quarter')}
        >
          Current Quarter
        </button>
        <button
          className={`filter-btn ${filterType === 'custom' ? 'active' : ''}`}
          onClick={() => setFilterType('custom')}
        >
          Custom Dates
        </button>
      </div>

      {filterType === 'custom' && (
        <div className="custom-date-inputs">
          <div className="date-input-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label>End Date:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>
          <button
            className="apply-btn"
            onClick={handleCustomDateApply}
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default DateFilter;

