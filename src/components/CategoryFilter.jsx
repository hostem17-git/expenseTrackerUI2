import React, { useState, useEffect } from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ expenses, onFilterChange, activeFilters }) => {
  const [primaryCategory, setPrimaryCategory] = useState(activeFilters?.primarycategory || '');
  const [secondaryCategory, setSecondaryCategory] = useState(activeFilters?.secondarycategory || '');
  const [primaryCategories, setPrimaryCategories] = useState([]);
  const [secondaryCategories, setSecondaryCategories] = useState([]);

  // Sync with parent state
  React.useEffect(() => {
    setPrimaryCategory(activeFilters?.primarycategory || '');
    setSecondaryCategory(activeFilters?.secondarycategory || '');
  }, [activeFilters]);

  useEffect(() => {
    // Extract unique categories from expenses
    const primarySet = new Set();
    const secondarySet = new Set();

    expenses.forEach(expense => {
      if (expense.primarycategory) {
        primarySet.add(expense.primarycategory);
      }
      if (expense.secondarycategory) {
        secondarySet.add(expense.secondarycategory);
      }
    });

    setPrimaryCategories(Array.from(primarySet).sort());
    setSecondaryCategories(Array.from(secondarySet).sort());
  }, [expenses]);

  const handlePrimaryCategoryChange = (e) => {
    const value = e.target.value;
    setPrimaryCategory(value);
    onFilterChange({ primarycategory: value, secondarycategory });
  };

  const handleSecondaryCategoryChange = (e) => {
    const value = e.target.value;
    setSecondaryCategory(value);
    onFilterChange({ primarycategory, secondarycategory: value });
  };

  const handleClearFilters = () => {
    setPrimaryCategory('');
    setSecondaryCategory('');
    onFilterChange({ primarycategory: '', secondarycategory: '' });
  };

  const hasActiveFilters = primaryCategory || secondaryCategory;

  return (
    <div className="category-filter">
      <div className="filter-header">
        <h3>Filter by Category</h3>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>
      
      <div className="filter-inputs">
        <div className="filter-group">
          <label htmlFor="primary-category">Primary Category</label>
          <select
            id="primary-category"
            value={primaryCategory}
            onChange={handlePrimaryCategoryChange}
            className="category-select"
          >
            <option value="">All Categories</option>
            {primaryCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="secondary-category">Secondary Category</label>
          <select
            id="secondary-category"
            value={secondaryCategory}
            onChange={handleSecondaryCategoryChange}
            className="category-select"
          >
            <option value="">All Subcategories</option>
            {secondaryCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="filter-label">Active Filters:</span>
          {primaryCategory && (
            <span className="filter-chip">
              Primary: {primaryCategory}
              <button onClick={() => handlePrimaryCategoryChange({ target: { value: '' } })}>×</button>
            </span>
          )}
          {secondaryCategory && (
            <span className="filter-chip">
              Secondary: {secondaryCategory}
              <button onClick={() => handleSecondaryCategoryChange({ target: { value: '' } })}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;

