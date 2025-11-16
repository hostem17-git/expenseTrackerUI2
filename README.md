# Expense Tracker UI

A modern React-based expense tracking application with date filtering capabilities and backend API integration.

## Features

- 📅 **Date Filters**: Filter expenses by:
  - Current Week
  - Current Month
  - Current Quarter
  - Custom Date Range
- 💰 **Expense Display**: Beautiful card-based UI showing:
  - Expense name
  - Amount (formatted as currency)
  - Primary and secondary categories
  - Date
- 📊 **Summary**: Total amount for filtered expenses
- 🎨 **Modern UI**: Clean, responsive design with gradient backgrounds
- 🔐 **API Integration**: Fetches data from backend with Bearer token authentication
- ⚡ **Loading States**: Shows loading spinner while fetching data
- 🚨 **Error Handling**: Displays helpful error messages

## Getting Started

### Installation

```bash
npm install
```

### Configuration

1. Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://expensetracker-u51b.onrender.com/api/v1
VITE_API_TOKEN=your-bearer-token-here
```

2. Update the values:
   - `VITE_API_BASE_URL`: Your backend API base URL
   - `VITE_API_TOKEN`: Your Bearer token for authentication

Alternatively, you can directly edit `src/config.js` to set these values.

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## API Requirements

The app expects your backend API to:

1. **Endpoint**: `GET {VITE_API_BASE_URL}/expense`
2. **Authentication**: Bearer token in the `Authorization` header
3. **Query Parameters**:
   - `startDate`: Start date (YYYY-MM-DD format)
   - `endDate`: End date (YYYY-MM-DD format)
   - `offset`: Pagination offset (default: 0)
   - `limit`: Pagination limit (default: 0 for all)
   - `primarycategory`: Filter by primary category (optional)
   - `secondarycategory`: Filter by secondary category (optional)
4. **Response Format**: Either:
   - An array of expense objects: `[{...}, {...}]`
   - An object with expenses: `{ expenses: [...] }` or `{ data: [...] }`

### Expected Expense Data Structure

```json
{
  "expense": "Expense name",
  "amount": 10.00,
  "created": "2025-02-05T00:00:00.000Z",
  "primarycategory": "Category",
  "secondarycategory": "Subcategory",
  "id": "unique-id"
}
```

## Project Structure

```
src/
├── components/
│   ├── DateFilter.jsx      # Date filter component
│   ├── DateFilter.css
│   ├── ExpenseList.jsx     # Expense display component
│   └── ExpenseList.css
├── services/
│   └── api.js              # API service with Bearer token
├── utils/
│   └── dateUtils.js        # Date utility functions
├── config.js               # API configuration
├── App.jsx                 # Main app component
└── main.jsx                # Entry point
```

## Error Handling

The app handles various error scenarios:
- **401 Unauthorized**: Token is invalid or missing
- **404 Not Found**: API endpoint doesn't exist
- **Network Errors**: Server is unreachable
- **Other HTTP Errors**: Displays status code and message

