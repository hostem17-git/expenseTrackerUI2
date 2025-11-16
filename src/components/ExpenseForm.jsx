import React, { useState, useEffect } from 'react';
import './ExpenseForm.css';

const ExpenseForm = ({ expense, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    expense: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    primarycategory: '',
    secondarycategory: '',
  });

  useEffect(() => {
    if (expense) {
      // Editing existing expense
      setFormData({
        expense: expense.expense || '',
        amount: expense.amount || '',
        date: expense.created ? new Date(expense.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        primarycategory: expense.primarycategory || '',
        secondarycategory: expense.secondarycategory || '',
      });
    } else {
      // Adding new expense
      setFormData({
        expense: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        primarycategory: '',
        secondarycategory: '',
      });
    }
  }, [expense, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (expense) {
      // Update expense
      onSave(expense.id, {
        expense: formData.expense,
        amount: formData.amount,
        created: formData.date,
        primarycategory: formData.primarycategory,
        secondarycategory: formData.secondarycategory,
      });
    } else {
      // Add expense
      onSave({
        expense: formData.expense,
        amount: formData.amount,
        date: formData.date,
        category: formData.primarycategory || formData.secondarycategory || undefined,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="expense">Expense Description *</label>
            <input
              type="text"
              id="expense"
              name="expense"
              value={formData.expense}
              onChange={handleChange}
              required
              placeholder="e.g., Grocery shopping"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount (₹) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="primarycategory">Primary Category</label>
            <input
              type="text"
              id="primarycategory"
              name="primarycategory"
              value={formData.primarycategory}
              onChange={handleChange}
              placeholder="e.g., Essential Expenses"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="secondarycategory">Secondary Category</label>
            <input
              type="text"
              id="secondarycategory"
              name="secondarycategory"
              value={formData.secondarycategory}
              onChange={handleChange}
              placeholder="e.g., Food & Groceries"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {expense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;

