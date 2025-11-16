import React, { useState } from 'react';
import './SearchAndSort.css';

const SearchAndSort = ({ onSearchChange, onSortChange, searchQuery, sortOption }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearchChange(value);
  };

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <div className="search-sort-container">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search expenses..."
          value={localSearchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {localSearchQuery && (
          <button
            className="clear-search"
            onClick={() => {
              setLocalSearchQuery('');
              onSearchChange('');
            }}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="sort-box">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={handleSortChange}
          className="sort-select"
        >
          <option value="date-desc">Date (Newest First)</option>
          <option value="date-asc">Date (Oldest First)</option>
          <option value="amount-desc">Amount (High to Low)</option>
          <option value="amount-asc">Amount (Low to High)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
      </div>
    </div>
  );
};

export default SearchAndSort;

