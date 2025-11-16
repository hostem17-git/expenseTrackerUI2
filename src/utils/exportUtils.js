/**
 * Exports expenses to CSV format
 * @param {Array} expenses - Array of expense objects
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (expenses, filename = 'expenses.csv') => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  // CSV headers
  const headers = ['Date', 'Expense', 'Amount', 'Primary Category', 'Secondary Category', 'ID'];
  
  // Convert expenses to CSV rows
  const rows = expenses.map(expense => {
    const date = new Date(expense.created).toLocaleDateString('en-IN');
    const amount = expense.amount || 0;
    const expenseName = (expense.expense || '').replace(/"/g, '""'); // Escape quotes
    const primaryCategory = (expense.primarycategory || '').replace(/"/g, '""');
    const secondaryCategory = (expense.secondarycategory || '').replace(/"/g, '""');
    const id = expense.id || '';
    
    return [
      date,
      `"${expenseName}"`,
      amount,
      `"${primaryCategory}"`,
      `"${secondaryCategory}"`,
      id
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Formats expenses for printing
 * @param {Array} expenses - Array of expense objects
 * @returns {string} HTML content for printing
 */
export const formatForPrint = (expenses, dateRange) => {
  const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const dateRangeStr = dateRange 
    ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
    : 'All Time';

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        .header { margin-bottom: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Expense Report</h1>
        <p><strong>Date Range:</strong> ${dateRangeStr}</p>
        <p><strong>Total Expenses:</strong> ${expenses.length}</p>
      </div>
      <div class="summary">
        <p class="total">Total Amount: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Expense</th>
            <th>Amount</th>
            <th>Primary Category</th>
            <th>Secondary Category</th>
          </tr>
        </thead>
        <tbody>
  `;

  expenses.forEach(expense => {
    const date = new Date(expense.created).toLocaleDateString('en-IN');
    const amount = expense.amount || 0;
    html += `
      <tr>
        <td>${date}</td>
        <td>${(expense.expense || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        <td>₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${expense.primarycategory || '-'}</td>
        <td>${expense.secondarycategory || '-'}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
      <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Print</button>
    </body>
    </html>
  `;

  return html;
};

/**
 * Opens print dialog with formatted expenses
 * @param {Array} expenses - Array of expense objects
 * @param {Object} dateRange - Date range object
 */
export const printExpenses = (expenses, dateRange) => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to print');
    return;
  }

  const html = formatForPrint(expenses, dateRange);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

