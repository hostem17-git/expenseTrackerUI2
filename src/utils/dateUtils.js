export const getCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { start: startOfWeek, end: endOfWeek };
};

export const getCurrentMonth = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  return { start: startOfMonth, end: endOfMonth };
};

export const getCurrentQuarter = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
  startOfQuarter.setHours(0, 0, 0, 0);
  
  const endOfQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
  endOfQuarter.setHours(23, 59, 59, 999);
  
  return { start: startOfQuarter, end: endOfQuarter };
};

export const isDateInRange = (date, startDate, endDate) => {
  const expenseDate = new Date(date);
  return expenseDate >= startDate && expenseDate <= endDate;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

