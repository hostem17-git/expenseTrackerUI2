import React from 'react';
import './BulkActions.css';

const BulkActions = ({ expenses, selectedIds, onSelectAll, onBulkDelete, onBulkEdit, onClearSelection }) => {
  const selectedCount = selectedIds?.size || 0;
  const allSelected = expenses.length > 0 && selectedCount === expenses.length;
  const someSelected = selectedCount > 0 && selectedCount < expenses.length;

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const allIds = expenses.map(exp => exp.id);
      allIds.forEach(id => {
        if (!selectedIds.has(id)) {
          onSelectAll(id, true);
        }
      });
    } else {
      selectedIds.forEach(id => {
        onSelectAll(id, false);
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCount} expense(s)?`)) {
      onBulkDelete(Array.from(selectedIds));
    }
  };

  const handleBulkEdit = () => {
    if (selectedCount === 0) return;
    onBulkEdit(Array.from(selectedIds));
  };

  if (expenses.length === 0) return null;

  return (
    <div className="bulk-actions-container">
      <div className="bulk-actions-header">
        <div className="select-all-control">
          <input
            type="checkbox"
            id="select-all"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={handleSelectAll}
          />
          <label htmlFor="select-all">Select All ({expenses.length})</label>
        </div>
        
        {selectedCount > 0 && (
          <div className="bulk-actions-buttons">
            <span className="selected-count">{selectedCount} selected</span>
            <button className="bulk-action-btn bulk-edit-btn" onClick={handleBulkEdit}>
              ✏️ Edit Selected
            </button>
            <button className="bulk-action-btn bulk-delete-btn" onClick={handleBulkDelete}>
              🗑️ Delete Selected
            </button>
            <button 
              className="bulk-action-btn bulk-clear-btn" 
              onClick={onClearSelection}
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActions;

