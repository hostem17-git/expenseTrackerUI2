# API Changes Required for Frontend Improvements

This document outlines all API changes needed to support the frontend improvements listed in `PROJECT_ANALYSIS.md`. Changes are grouped into stages based on priority and dependencies.

---

## 📋 Table of Contents

- [Stage 1: Critical Foundation](#stage-1-critical-foundation)
- [Stage 2: Core Feature Enhancements](#stage-2-core-feature-enhancements)
- [Stage 3: Advanced Features](#stage-3-advanced-features)
- [Stage 4: Integration & Advanced Capabilities](#stage-4-integration--advanced-capabilities)
- [Stage 5: Analytics & Reporting](#stage-5-analytics--reporting)
- [Summary & Dependencies](#summary--dependencies)

---

## Stage 1: Critical Foundation

### 1.1 Token Refresh Endpoint ⚠️ **HIGH PRIORITY**

**Purpose:** Support token refresh mechanism to prevent unexpected logouts

**New Endpoint:**
```
POST /api/v1/auth/refresh
```

**Request Headers:**
```
Authorization: Bearer <current_token>
```

**Request Body:**
```json
{
  "refreshToken": "string (optional) - if refresh tokens are implemented"
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "payload": {
    "access_token": "new_jwt_token",
    "life": 3600,
    "expires_at": "2024-01-15T12:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Token invalid or expired
- `400 Bad Request`: Invalid refresh token

**Alternative Approach (if refresh tokens not implemented):**
- Extend token lifetime to 24 hours
- Add token expiration time in JWT payload
- Frontend can decode and check expiration

---

### 1.2 Enhanced Error Response Format

**Purpose:** Standardize error responses for better frontend error handling

**Current Format:**
```json
{
  "message": "Error description"
}
```

**Enhanced Format:**
```json
{
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "field": "field_name (optional)",
    "details": "Additional error details (optional)"
  },
  "timestamp": "2024-01-15T12:00:00Z",
  "requestId": "unique-request-id"
}
```

**Error Codes to Support:**
- `VALIDATION_ERROR`: Field validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Duplicate resource
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

**Impact:** Better error handling, field-specific validation errors, retry logic

---

### 1.3 Request Rate Limiting Headers

**Purpose:** Support client-side rate limiting and retry logic

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
Retry-After: 60 (when rate limited)
```

**Error Response (429 Too Many Requests):**
```json
{
  "message": "Rate limit exceeded",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60
  }
}
```

---

### 1.4 Health Check Enhancement

**Purpose:** Better API health monitoring and connection status

**Current Endpoint:**
```
GET /api/v1/heartbeat
```

**Enhanced Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "services": {
    "whatsapp": "operational",
    "ai_categorization": "operational"
  }
}
```

---

## Stage 2: Core Feature Enhancements

### 2.1 Bulk Update Expense Endpoint ⚠️ **HIGH PRIORITY**

**Purpose:** Support bulk edit functionality (currently placeholder)

**New Endpoint:**
```
PUT /api/v1/expense/bulk
```

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "expenseIds": [1, 2, 3, 4, 5],
  "updates": {
    "primarycategory": "Food",
    "secondarycategory": "Groceries",
    "date": "2024-01-15"
  }
}
```

**Response:**
```json
{
  "message": "5 expenses updated successfully",
  "data": {
    "updated": 5,
    "failed": 0,
    "results": [
      {
        "id": 1,
        "status": "success"
      },
      {
        "id": 2,
        "status": "success"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "message": "3 expenses updated, 2 failed",
  "data": {
    "updated": 3,
    "failed": 2,
    "results": [
      {
        "id": 1,
        "status": "success"
      },
      {
        "id": 2,
        "status": "error",
        "error": "Expense not found"
      }
    ]
  }
}
```

**Validation:**
- At least one expense ID required
- At least one update field required
- Validate all expense IDs belong to authenticated user
- Validate update fields (same as single update)

---

### 2.2 Enhanced Expense Query Parameters

**Purpose:** Support advanced filtering and search

**Current Endpoint:**
```
GET /api/v1/expense
```

**New Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-01-31
&primarycategory=Food
&secondarycategory=Groceries
&minAmount=10.00          # NEW
&maxAmount=1000.00        # NEW
&search=groceries         # NEW - search in expense name/description
&sortBy=amount            # NEW - amount, date, expense
&sortOrder=desc           # NEW - asc, desc
&offset=0
&limit=100
```

**Response:** (unchanged)
```json
{
  "message": "10 Expenses found",
  "data": {
    "rowCount": 10,
    "payload": [...]
  }
}
```

**Validation:**
- `minAmount` and `maxAmount` must be positive numbers
- `maxAmount` must be >= `minAmount`
- `sortBy` must be one of: `amount`, `date`, `expense`
- `sortOrder` must be `asc` or `desc`
- `search` performs case-insensitive partial match

---

### 2.3 Bulk Delete Endpoint Enhancement

**Purpose:** Support bulk delete with better response format

**Current:** Individual DELETE requests

**New Endpoint:**
```
DELETE /api/v1/expense/bulk
```

**Request Body:**
```json
{
  "expenseIds": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "message": "5 expenses deleted successfully",
  "data": {
    "deleted": 5,
    "failed": 0,
    "results": [
      {
        "id": 1,
        "status": "success"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "message": "3 expenses deleted, 2 failed",
  "data": {
    "deleted": 3,
    "failed": 2,
    "results": [
      {
        "id": 1,
        "status": "success"
      },
      {
        "id": 2,
        "status": "error",
        "error": "Expense not found"
      }
    ]
  }
}
```

---

### 2.4 Expense Validation Enhancement

**Purpose:** Better validation error messages for forms

**Current Endpoint:**
```
POST /api/v1/expense
PUT /api/v1/expense/:id
```

**Enhanced Error Response:**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0",
      "code": "INVALID_AMOUNT"
    },
    {
      "field": "date",
      "message": "Date cannot be in the future",
      "code": "INVALID_DATE"
    }
  ]
}
```

**New Validation Rules:**
- Amount: Must be > 0, max 2 decimal places, reasonable maximum (e.g., 999999.99)
- Date: Cannot be in future, cannot be before reasonable past (e.g., 1970-01-01)
- Expense name: Max length (e.g., 500 characters), required
- Categories: Validate against allowed categories (if category list exists)

---

### 2.5 Optimistic Update Support

**Purpose:** Support optimistic UI updates with conflict resolution

**New Header for Update Requests:**
```
If-Match: <etag_or_version>
```

**Response Headers:**
```
ETag: <etag_or_version>
Last-Modified: <timestamp>
```

**Error Response (409 Conflict):**
```json
{
  "message": "Resource was modified by another request",
  "error": {
    "code": "CONFLICT",
    "currentVersion": "<etag>"
  },
  "data": {
    "currentData": {
      "id": 1,
      "expense": "Updated by another user",
      ...
    }
  }
}
```

**Alternative:** Add `version` field to expense model for optimistic locking

---

## Stage 3: Advanced Features

### 3.1 Budget Management Endpoints ⚠️ **NEW FEATURE**

**Purpose:** Support budget tracking and management

**3.1.1 Create Budget**
```
POST /api/v1/budget
```

**Request Body:**
```json
{
  "category": "Food",
  "subcategory": "Groceries",
  "amount": 5000.00,
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:**
```json
{
  "message": "Budget created successfully",
  "data": {
    "id": 1,
    "category": "Food",
    "subcategory": "Groceries",
    "amount": 5000.00,
    "period": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "spent": 0.00,
    "remaining": 5000.00,
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

**3.1.2 Get Budgets**
```
GET /api/v1/budget
```

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-12-31
&category=Food
&period=monthly
```

**Response:**
```json
{
  "message": "3 budgets found",
  "data": [
    {
      "id": 1,
      "category": "Food",
      "subcategory": "Groceries",
      "amount": 5000.00,
      "period": "monthly",
      "spent": 3200.00,
      "remaining": 1800.00,
      "percentageUsed": 64
    }
  ]
}
```

**3.1.3 Update Budget**
```
PUT /api/v1/budget/:id
```

**3.1.4 Delete Budget**
```
DELETE /api/v1/budget/:id
```

**3.1.5 Budget vs Actual Comparison**
```
GET /api/v1/budget/:id/comparison
```

**Response:**
```json
{
  "message": "Budget comparison",
  "data": {
    "budget": {
      "id": 1,
      "amount": 5000.00,
      "period": "monthly"
    },
    "actual": {
      "spent": 3200.00,
      "remaining": 1800.00,
      "percentageUsed": 64
    },
    "expenses": [
      {
        "id": 1,
        "expense": "Grocery shopping",
        "amount": 500.00,
        "date": "2024-01-15"
      }
    ]
  }
}
```

---

### 3.2 Recurring Expenses Endpoints ⚠️ **NEW FEATURE**

**Purpose:** Support recurring expense management

**3.2.1 Create Recurring Expense**
```
POST /api/v1/recurring-expense
```

**Request Body:**
```json
{
  "expense": "Netflix Subscription",
  "amount": 999.00,
  "frequency": "monthly",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "primarycategory": "Entertainment",
  "secondarycategory": "Streaming",
  "nextOccurrence": "2024-02-15"
}
```

**Frequency Options:**
- `daily`
- `weekly`
- `biweekly`
- `monthly`
- `quarterly`
- `yearly`
- `custom` (with custom pattern)

**Response:**
```json
{
  "message": "Recurring expense created successfully",
  "data": {
    "id": 1,
    "expense": "Netflix Subscription",
    "amount": 999.00,
    "frequency": "monthly",
    "startDate": "2024-01-15",
    "endDate": "2024-12-31",
    "nextOccurrence": "2024-02-15",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

**3.2.2 Get Recurring Expenses**
```
GET /api/v1/recurring-expense
```

**Query Parameters:**
```
?active=true
&frequency=monthly
```

**Response:**
```json
{
  "message": "5 recurring expenses found",
  "data": [
    {
      "id": 1,
      "expense": "Netflix Subscription",
      "amount": 999.00,
      "frequency": "monthly",
      "nextOccurrence": "2024-02-15",
      "active": true
    }
  ]
}
```

**3.2.3 Update Recurring Expense**
```
PUT /api/v1/recurring-expense/:id
```

**3.2.4 Delete Recurring Expense**
```
DELETE /api/v1/recurring-expense/:id
```

**3.2.5 Skip Next Occurrence**
```
POST /api/v1/recurring-expense/:id/skip
```

**Request Body:**
```json
{
  "skipDate": "2024-02-15"
}
```

**3.2.6 Generate Expenses from Recurring**
```
POST /api/v1/recurring-expense/generate
```

**Description:** Manually trigger generation of expenses from recurring patterns (or automatic cron job)

**Response:**
```json
{
  "message": "3 expenses generated from recurring patterns",
  "data": {
    "generated": 3,
    "expenses": [
      {
        "id": 100,
        "expense": "Netflix Subscription",
        "amount": 999.00,
        "date": "2024-02-15"
      }
    ]
  }
}
```

---

### 3.3 Expense Templates Endpoints ⚠️ **NEW FEATURE**

**Purpose:** Support expense templates for quick entry

**3.3.1 Create Template**
```
POST /api/v1/expense-template
```

**Request Body:**
```json
{
  "name": "Weekly Groceries",
  "expense": "Grocery shopping",
  "amount": 2000.00,
  "primarycategory": "Essential Expenses",
  "secondarycategory": "Groceries",
  "tags": ["weekly", "essential"]
}
```

**Response:**
```json
{
  "message": "Template created successfully",
  "data": {
    "id": 1,
    "name": "Weekly Groceries",
    "expense": "Grocery shopping",
    "amount": 2000.00,
    "primarycategory": "Essential Expenses",
    "secondarycategory": "Groceries",
    "tags": ["weekly", "essential"],
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

**3.3.2 Get Templates**
```
GET /api/v1/expense-template
```

**Query Parameters:**
```
?tag=weekly
&category=Essential Expenses
```

**Response:**
```json
{
  "message": "5 templates found",
  "data": [
    {
      "id": 1,
      "name": "Weekly Groceries",
      "expense": "Grocery shopping",
      "amount": 2000.00,
      "primarycategory": "Essential Expenses",
      "secondarycategory": "Groceries"
    }
  ]
}
```

**3.3.3 Update Template**
```
PUT /api/v1/expense-template/:id
```

**3.3.4 Delete Template**
```
DELETE /api/v1/expense-template/:id
```

**3.3.5 Create Expense from Template**
```
POST /api/v1/expense-template/:id/create-expense
```

**Request Body:**
```json
{
  "date": "2024-01-15",
  "amount": 2200.00  // Optional override
}
```

**Response:**
```json
{
  "message": "Expense created from template",
  "data": {
    "id": 100,
    "expense": "Grocery shopping",
    "amount": 2200.00,
    "date": "2024-01-15",
    "primarycategory": "Essential Expenses",
    "secondarycategory": "Groceries"
  }
}
```

---

### 3.4 Smart Categorization Enhancement

**Purpose:** Improve AI categorization with learning capabilities

**Current Endpoint:**
```
POST /api/v1/expense/categorize-pending
```

**Enhanced Request Body:**
```json
{
  "expenseIds": [1, 2, 3],  // Optional - specific expenses
  "useUserHistory": true,   // Learn from user's past categorizations
  "confidenceThreshold": 0.8  // Minimum confidence for auto-categorization
}
```

**Enhanced Response:**
```json
{
  "message": "3 expenses categorized successfully",
  "data": {
    "categorized": 3,
    "failed": 0,
    "results": [
      {
        "id": 1,
        "expense": "Grocery shopping",
        "primarycategory": "Essential Expenses",
        "secondarycategory": "Groceries",
        "confidence": 0.95
      }
    ]
  }
}
```

**New Endpoint - Category Suggestions:**
```
POST /api/v1/expense/suggest-category
```

**Request Body:**
```json
{
  "expense": "Starbucks coffee",
  "amount": 250.00
}
```

**Response:**
```json
{
  "message": "Category suggestions",
  "data": {
    "suggestions": [
      {
        "primarycategory": "Food & Dining",
        "secondarycategory": "Coffee",
        "confidence": 0.92
      },
      {
        "primarycategory": "Entertainment",
        "secondarycategory": "Dining Out",
        "confidence": 0.75
      }
    ]
  }
}
```

---

## Stage 4: Integration & Advanced Capabilities

### 4.1 Receipt Management Endpoints ⚠️ **NEW FEATURE**

**Purpose:** Support receipt upload and OCR

**4.1.1 Upload Receipt**
```
POST /api/v1/receipt/upload
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: <image file>
expenseId: 123 (optional - link to existing expense)
```

**Response:**
```json
{
  "message": "Receipt uploaded successfully",
  "data": {
    "id": 1,
    "expenseId": 123,
    "url": "https://storage.example.com/receipts/abc123.jpg",
    "uploadedAt": "2024-01-15T12:00:00Z"
  }
}
```

**4.1.2 Extract Expense from Receipt (OCR)**
```
POST /api/v1/receipt/extract
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <image file>
```

**Response:**
```json
{
  "message": "Expense extracted from receipt",
  "data": {
    "expense": "Grocery shopping at Walmart",
    "amount": 125.50,
    "date": "2024-01-15",
    "merchant": "Walmart",
    "items": [
      {
        "name": "Milk",
        "amount": 5.99
      }
    ],
    "confidence": 0.92
  }
}
```

**4.1.3 Get Receipts**
```
GET /api/v1/receipt
```

**Query Parameters:**
```
?expenseId=123
&limit=10
&offset=0
```

**Response:**
```json
{
  "message": "3 receipts found",
  "data": [
    {
      "id": 1,
      "expenseId": 123,
      "url": "https://storage.example.com/receipts/abc123.jpg",
      "uploadedAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

**4.1.4 Delete Receipt**
```
DELETE /api/v1/receipt/:id
```

**4.1.5 Link Receipt to Expense**
```
PUT /api/v1/receipt/:id/link
```

**Request Body:**
```json
{
  "expenseId": 123
}
```

---

### 4.2 Multi-Currency Support

**Purpose:** Support multiple currencies

**4.2.1 Get Supported Currencies**
```
GET /api/v1/currency
```

**Response:**
```json
{
  "message": "Supported currencies",
  "data": [
    {
      "code": "INR",
      "name": "Indian Rupee",
      "symbol": "₹"
    },
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$"
    }
  ]
}
```

**4.2.2 Get Exchange Rates**
```
GET /api/v1/currency/exchange-rates
```

**Query Parameters:**
```
?base=INR
&target=USD
&date=2024-01-15
```

**Response:**
```json
{
  "message": "Exchange rates",
  "data": {
    "base": "INR",
    "rates": {
      "USD": 0.012,
      "EUR": 0.011
    },
    "date": "2024-01-15"
  }
}
```

**4.2.3 Enhanced Expense Endpoints**

**Update Expense Model:**
- Add `currency` field (default: INR)
- Add `originalAmount` field (amount in original currency)
- Add `convertedAmount` field (amount converted to base currency)

**Expense Response:**
```json
{
  "id": 1,
  "expense": "Coffee",
  "amount": 250.00,
  "currency": "INR",
  "originalAmount": 250.00,
  "convertedAmount": 250.00,
  "date": "2024-01-15"
}
```

**Expense Creation/Update:**
```json
{
  "expense": "Coffee",
  "amount": 3.00,
  "currency": "USD",
  "date": "2024-01-15"
}
```

---

### 4.3 Export Endpoints

**Purpose:** Server-side export generation

**4.3.1 Export to CSV**
```
GET /api/v1/expense/export/csv
```

**Query Parameters:** (same as GET /api/v1/expense)
```
?startDate=2024-01-01
&endDate=2024-01-31
&format=csv
```

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="expenses_2024-01.csv"`

**4.3.2 Export to PDF**
```
GET /api/v1/expense/export/pdf
```

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-01-31
&format=pdf
&template=detailed  // detailed, summary, custom
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="expenses_2024-01.pdf"`

**4.3.3 Export to Excel**
```
GET /api/v1/expense/export/excel
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="expenses_2024-01.xlsx"`

**4.3.4 Email Export**
```
POST /api/v1/expense/export/email
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "format": "pdf",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "template": "detailed"
}
```

**Response:**
```json
{
  "message": "Export sent to email successfully"
}
```

---

### 4.4 Bank Account Integration (Future)

**Purpose:** Automatic expense import from bank accounts

**4.4.1 Connect Bank Account**
```
POST /api/v1/bank/connect
```

**Request Body:**
```json
{
  "bankName": "HDFC Bank",
  "accountNumber": "****1234",
  "credentials": {
    // Encrypted credentials
  }
}
```

**4.4.2 Get Connected Accounts**
```
GET /api/v1/bank/accounts
```

**4.4.3 Import Transactions**
```
POST /api/v1/bank/import
```

**Request Body:**
```json
{
  "accountId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "message": "10 transactions imported",
  "data": {
    "imported": 10,
    "duplicates": 2,
    "expenses": [...]
  }
}
```

**4.4.4 Disconnect Bank Account**
```
DELETE /api/v1/bank/accounts/:id
```

---

## Stage 5: Analytics & Reporting

### 5.1 Advanced Analytics Endpoints ⚠️ **NEW FEATURE**

**5.1.1 Spending Trends**
```
GET /api/v1/analytics/trends
```

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-12-31
&groupBy=month  // day, week, month, year
&category=Food
```

**Response:**
```json
{
  "message": "Spending trends",
  "data": {
    "groupBy": "month",
    "trends": [
      {
        "period": "2024-01",
        "total": 5000.00,
        "count": 25,
        "average": 200.00
      },
      {
        "period": "2024-02",
        "total": 5500.00,
        "count": 28,
        "average": 196.43
      }
    ],
    "summary": {
      "total": 10500.00,
      "average": 2500.00,
      "growth": 10.0
    }
  }
}
```

**5.1.2 Category Comparison**
```
GET /api/v1/analytics/category-comparison
```

**Query Parameters:**
```
?startDate1=2024-01-01
&endDate1=2024-01-31
&startDate2=2024-02-01
&endDate2=2024-02-29
&category=Food
```

**Response:**
```json
{
  "message": "Category comparison",
  "data": {
    "category": "Food",
    "period1": {
      "start": "2024-01-01",
      "end": "2024-01-31",
      "total": 5000.00,
      "count": 25
    },
    "period2": {
      "start": "2024-02-01",
      "end": "2024-02-29",
      "total": 5500.00,
      "count": 28
    },
    "comparison": {
      "difference": 500.00,
      "percentageChange": 10.0,
      "countChange": 3
    }
  }
}
```

**5.1.3 Spending Patterns**
```
GET /api/v1/analytics/patterns
```

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-12-31
&analysisType=weekly  // weekly, monthly, seasonal
```

**Response:**
```json
{
  "message": "Spending patterns",
  "data": {
    "analysisType": "weekly",
    "patterns": [
      {
        "dayOfWeek": "Monday",
        "averageSpending": 500.00,
        "count": 52
      },
      {
        "dayOfWeek": "Friday",
        "averageSpending": 750.00,
        "count": 52
      }
    ],
    "insights": [
      "Highest spending on Fridays",
      "Lowest spending on Tuesdays"
    ]
  }
}
```

**5.1.4 Anomaly Detection**
```
GET /api/v1/analytics/anomalies
```

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-12-31
&threshold=2.0  // Standard deviations
```

**Response:**
```json
{
  "message": "Anomalies detected",
  "data": {
    "anomalies": [
      {
        "id": 123,
        "expense": "Large purchase",
        "amount": 50000.00,
        "date": "2024-06-15",
        "reason": "Amount is 3.5 standard deviations above average",
        "severity": "high"
      }
    ],
    "summary": {
      "totalAnomalies": 5,
      "highSeverity": 2,
      "mediumSeverity": 3
    }
  }
}
```

**5.1.5 Predictive Analytics**
```
GET /api/v1/analytics/predictions
```

**Query Parameters:**
```
?period=month  // month, quarter, year
&category=Food
```

**Response:**
```json
{
  "message": "Spending predictions",
  "data": {
    "period": "month",
    "category": "Food",
    "predicted": {
      "amount": 5500.00,
      "confidence": 0.85,
      "range": {
        "min": 5000.00,
        "max": 6000.00
      }
    },
    "factors": [
      "Historical average: 5200.00",
      "Seasonal adjustment: +5%",
      "Trend: +3%"
    ]
  }
}
```

---

### 5.2 Custom Reports

**5.2.1 Create Report Template**
```
POST /api/v1/reports/template
```

**Request Body:**
```json
{
  "name": "Monthly Food Report",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "category": "Food"
  },
  "sections": [
    {
      "type": "summary",
      "fields": ["total", "count", "average"]
    },
    {
      "type": "categoryBreakdown",
      "groupBy": "secondarycategory"
    },
    {
      "type": "chart",
      "chartType": "pie"
    }
  ],
  "format": "pdf"
}
```

**5.2.2 Generate Report**
```
POST /api/v1/reports/generate
```

**Request Body:**
```json
{
  "templateId": 1,
  "parameters": {
    "startDate": "2024-02-01",
    "endDate": "2024-02-29"
  },
  "format": "pdf"
}
```

**Response:**
```json
{
  "message": "Report generated successfully",
  "data": {
    "reportId": 1,
    "url": "https://storage.example.com/reports/abc123.pdf",
    "expiresAt": "2024-01-22T12:00:00Z"
  }
}
```

**5.2.3 Schedule Report**
```
POST /api/v1/reports/schedule
```

**Request Body:**
```json
{
  "templateId": 1,
  "schedule": {
    "frequency": "monthly",
    "day": 1,
    "time": "09:00",
    "timezone": "Asia/Kolkata"
  },
  "email": "user@example.com"
}
```

---

### 5.3 Enhanced Summary Endpoints

**5.3.1 Enhanced Primary Category Summary**
```
GET /api/v1/expense/summary
```

**Enhanced Response:**
```json
{
  "message": "5 Expenses found",
  "data": [
    {
      "primarycategory": "Food",
      "total": 500.00,
      "count": 10,
      "average": 50.00,
      "percentage": 25.0,
      "trend": {
        "previousPeriod": 450.00,
        "change": 50.00,
        "percentageChange": 11.1
      }
    }
  ],
  "summary": {
    "grandTotal": 2000.00,
    "totalCount": 50,
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}
```

**5.3.2 Time-based Summary**
```
GET /api/v1/expense/summary/time
```

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-12-31
&groupBy=month  // day, week, month, quarter, year
```

**Response:**
```json
{
  "message": "Time-based summary",
  "data": {
    "groupBy": "month",
    "periods": [
      {
        "period": "2024-01",
        "total": 5000.00,
        "count": 25,
        "categories": {
          "Food": 2000.00,
          "Transport": 1500.00
        }
      }
    ]
  }
}
```

---

## Summary & Dependencies

### Stage Dependencies

```
Stage 1 (Critical Foundation)
  └─> Required for all other stages
  └─> No dependencies

Stage 2 (Core Feature Enhancements)
  └─> Depends on: Stage 1
  └─> Can be developed in parallel

Stage 3 (Advanced Features)
  └─> Depends on: Stage 1, Stage 2
  └─> Features can be developed independently

Stage 4 (Integration & Advanced Capabilities)
  └─> Depends on: Stage 1, Stage 2
  └─> Optional features, can be added incrementally

Stage 5 (Analytics & Reporting)
  └─> Depends on: Stage 1, Stage 2
  └─> Can leverage existing expense data
```

### Implementation Priority

**Phase 1 (Immediate - 2-4 weeks):**
- Stage 1: Critical Foundation (all items)
- Stage 2.1: Bulk Update Endpoint
- Stage 2.2: Enhanced Query Parameters
- Stage 2.4: Expense Validation Enhancement

**Phase 2 (Short Term - 1-2 months):**
- Stage 2.3: Bulk Delete Enhancement
- Stage 2.5: Optimistic Update Support
- Stage 3.1: Budget Management (basic)
- Stage 3.2: Recurring Expenses (basic)

**Phase 3 (Medium Term - 2-3 months):**
- Stage 3.3: Expense Templates
- Stage 3.4: Smart Categorization Enhancement
- Stage 4.3: Export Endpoints
- Stage 5.1: Advanced Analytics (basic)

**Phase 4 (Long Term - 3-6 months):**
- Stage 4.1: Receipt Management
- Stage 4.2: Multi-Currency Support
- Stage 4.4: Bank Integration
- Stage 5.2: Custom Reports
- Stage 5.3: Enhanced Summary Endpoints

### Estimated Development Effort

| Stage | Endpoints | Estimated Days |
|-------|-----------|----------------|
| Stage 1 | 4 | 5-7 days |
| Stage 2 | 5 | 8-12 days |
| Stage 3 | 15 | 20-30 days |
| Stage 4 | 20 | 30-45 days |
| Stage 5 | 10 | 15-20 days |
| **Total** | **54** | **78-114 days** |

### Breaking Changes

**None** - All new endpoints are additive. Existing endpoints remain unchanged (except for enhanced error responses which are backward compatible).

### Backward Compatibility

- All existing endpoints continue to work as before
- New query parameters are optional
- Enhanced error responses include original `message` field
- New endpoints are additive only

---

## Notes

1. **Authentication:** All new endpoints (except public ones) require Bearer token authentication
2. **Pagination:** All list endpoints should support `offset` and `limit` parameters
3. **Date Formats:** All dates should be in `YYYY-MM-DD` format
4. **Error Handling:** All endpoints should follow the enhanced error response format from Stage 1
5. **Rate Limiting:** All endpoints should include rate limiting headers
6. **Validation:** All endpoints should validate input and return field-specific errors
7. **Documentation:** Update API documentation for all new endpoints

---

*Last Updated: Based on PROJECT_ANALYSIS.md requirements*
*Total New Endpoints: 54*
*Estimated Development Time: 78-114 days*


