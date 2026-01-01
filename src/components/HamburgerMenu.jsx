import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import './HamburgerMenu.css';

const HamburgerMenu = ({
  onRefresh,
  onExportCSV,
  onPrint,
  onToggleCharts,
  showCharts,
  onCategorize,
  onAddExpense,
  onLogout,
  loading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="hamburger-menu-container" ref={menuRef}>
      <button
        className={`hamburger-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {isOpen && (
        <div className="hamburger-menu-dropdown">
          <button
            className="menu-item"
            onClick={() => handleMenuClick(onRefresh)}
            title="Refresh data"
          >
            <span className="menu-icon">🔄</span>
            <span className="menu-text">Refresh</span>
          </button>

          <button
            className="menu-item"
            onClick={() => handleMenuClick(onExportCSV)}
            title="Export to CSV"
          >
            <span className="menu-icon">📥</span>
            <span className="menu-text">Export CSV</span>
          </button>

          <button
            className="menu-item"
            onClick={() => handleMenuClick(onPrint)}
            title="Print"
          >
            <span className="menu-icon">🖨️</span>
            <span className="menu-text">Print</span>
          </button>

          <button
            className={`menu-item ${showCharts ? 'active' : ''}`}
            onClick={() => handleMenuClick(onToggleCharts)}
            title="Toggle Charts"
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">
              {showCharts ? 'Hide Charts' : 'Show Charts'}
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() => handleMenuClick(onCategorize)}
            title="Categorize pending expenses using AI"
            disabled={loading}
          >
            <span className="menu-icon">🤖</span>
            <span className="menu-text">Categorize</span>
          </button>

          <button
            className="menu-item menu-item-primary"
            onClick={() => handleMenuClick(onAddExpense)}
            title="Add new expense"
          >
            <span className="menu-icon">+</span>
            <span className="menu-text">Add Expense</span>
          </button>

          <div className="menu-item menu-item-theme">
            <ThemeToggle />
          </div>

          <button
            className="menu-item menu-item-logout"
            onClick={() => handleMenuClick(onLogout)}
            title="Logout"
          >
            <span className="menu-icon">🚪</span>
            <span className="menu-text">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;


