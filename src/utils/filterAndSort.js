/**
 * Filters expenses based on search query
 * @param {Array} expenses - Array of expense objects
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered expenses
 */
export const filterExpensesBySearch = (expenses, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return expenses;
  }

  const query = searchQuery.toLowerCase().trim();
  
  return expenses.filter(expense => {
    const expenseName = (expense.expense || '').toLowerCase();
    const primaryCategory = (expense.primarycategory || '').toLowerCase();
    const secondaryCategory = (expense.secondarycategory || '').toLowerCase();
    
    return expenseName.includes(query) ||
           primaryCategory.includes(query) ||
           secondaryCategory.includes(query);
  });
};

/**
 * Filters expenses by category
 * @param {Array} expenses - Array of expense objects
 * @param {string} primaryCategory - Primary category filter
 * @param {string} secondaryCategory - Secondary category filter
 * @returns {Array} Filtered expenses
 */
export const filterExpensesByCategory = (expenses, primaryCategory, secondaryCategory) => {
  return expenses.filter(expense => {
    const matchesPrimary = !primaryCategory || expense.primarycategory === primaryCategory;
    const matchesSecondary = !secondaryCategory || expense.secondarycategory === secondaryCategory;
    return matchesPrimary && matchesSecondary;
  });
};

/**
 * Sorts expenses based on sort option
 * @param {Array} expenses - Array of expense objects
 * @param {string} sortOption - Sort option (date-desc, date-asc, amount-desc, amount-asc, name-asc, name-desc)
 * @returns {Array} Sorted expenses
 */
export const sortExpenses = (expenses, sortOption) => {
  const sorted = [...expenses];
  
  switch (sortOption) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
    
    case 'amount-desc':
      return sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    
    case 'amount-asc':
      return sorted.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    
    case 'name-asc':
      return sorted.sort((a, b) => {
        const nameA = (a.expense || '').toLowerCase();
        const nameB = (b.expense || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    
    case 'name-desc':
      return sorted.sort((a, b) => {
        const nameA = (a.expense || '').toLowerCase();
        const nameB = (b.expense || '').toLowerCase();
        return nameB.localeCompare(nameA);
      });
    
    default:
      return sorted;
  }
};

