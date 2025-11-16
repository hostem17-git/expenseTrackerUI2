# Expense Tracker API Documentation

## Overview

This is a RESTful API for an expense tracking application with WhatsApp integration. The API allows users to manage expenses, authenticate, and interact via WhatsApp.

**Base URL:** `/api/v1`

**Default Port:** `3000`

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication via Bearer tokens in the Authorization header.

### Bearer Token (Header)
For all protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

**Note:** While `cookie-parser` is installed in the application, cookies are **not currently used** for authentication. All authentication must be done via the Authorization header.

**Token Lifetime:** 1 hour (3600 seconds)

---

## API Endpoints

### 1. Authentication Endpoints (`/api/v1/auth`)

#### 1.1 Sign Up
**Endpoint:** `POST /api/v1/auth/signup`

**Description:** Creates a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
- **201 Created:**
  ```json
  {
    "message": "User created successfully"
  }
  ```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "message": "Please provide all the required fields"
  }
  ```
  ```json
  {
    "message": "Email already exists"
  }
  ```
- **409 Conflict:**
  ```json
  {
    "message": "User already exists"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

#### 1.2 Sign In
**Endpoint:** `POST /api/v1/auth/signin`

**Description:** Authenticates a user and returns user information. The JWT token must be extracted from the response and sent in subsequent requests via the Authorization header.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
- **200 OK:**
  ```json
  {
    "message": "Signed in successfully",
    "payload": {
      "email": "user@example.com",
      "role": "user",
      "username": "username",
      "life": 3600,
      "access_token": "jwt_token_here"
    }
  }
  ```
  *Note: The `access_token` in the response should be used in the Authorization header for subsequent requests.*

**Error Responses:**
- **401 Unauthorized:**
  ```json
  {
    "message": "Incorrect username or password"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "message": "User not found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

#### 1.3 Sign Out
**Endpoint:** `POST /api/v1/auth/signout`

**Description:** Signs out the current user. Currently only returns a success message (no server-side token invalidation).

**Request Body:** None

**Response:**
- **200 OK:**
  ```json
  {
    "message": "Signed out"
  }
  ```
  *Note: This endpoint does not invalidate tokens. Clients should discard tokens on their end.*

**Error Responses:**
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

---

#### 1.4 Send OTP
**Endpoint:** `POST /api/v1/auth/sendOTP`

**Description:** Sends a 6-digit OTP to a WhatsApp number for authentication.

**Request Body:**
```json
{
  "phoneNumber": "string (required, format: +1234567890)"
}
```

**Phone Number Format:** Must be in E.164 format (e.g., `+1234567890`)

**Response:**
- **200 OK:**
  ```json
  {
    "message": "OTP sent successfully"
  }
  ```
  *OTP is valid for 5 minutes*

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "message": "Phone number is required"
  }
  ```
  ```json
  {
    "message": "Invalid phone number format"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Failed to send OTP"
  }
  ```

---

#### 1.5 Verify OTP
**Endpoint:** `POST /api/v1/auth/verifyOTP`

**Description:** Verifies the OTP sent to a WhatsApp number and authenticates the user. Creates a new user if one doesn't exist for the phone number.

**Request Body:**
```json
{
  "phoneNumber": "string (required, format: +1234567890)",
  "otp": "string (required, 6 digits)"
}
```

**Response:**
- **200 OK:**
  ```json
  {
    "message": "Signed in successfully",
    "payload": {
      "role": "user",
      "username": "User",
      "life": 3600,
      "access_token": "jwt_token_here"
    }
  }
  ```
  *Note: The `access_token` in the response should be used in the Authorization header for subsequent requests.*

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "message": "Phone number and OTP are required"
  }
  ```
  ```json
  {
    "message": "Invalid phone number format"
  }
  ```
  ```json
  {
    "message": "OTP must be 6 digits"
  }
  ```
  ```json
  {
    "message": "No OTP found for this number"
  }
  ```
  ```json
  {
    "message": "OTP expired. Please request a new one."
  }
  ```
  ```json
  {
    "message": "Invalid OTP"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```
  ```json
  {
    "message": "Unable to add user"
  }
  ```

---

### 2. Expense Endpoints (`/api/v1/expense`)

**All expense endpoints require authentication via Bearer token in the Authorization header.**

#### 2.1 Get Expense Items
**Endpoint:** `GET /api/v1/expense`

**Description:** Retrieves expenses for the authenticated user with optional filtering and pagination.

**Query Parameters:**
- `startDate` (optional): Start date for filtering expenses (format: `YYYY-MM-DD`). Default: `1970-01-01`
- `endDate` (optional): End date for filtering expenses (format: `YYYY-MM-DD`). Default: current date
- `primarycategory` (optional): Filter by primary category
- `secondarycategory` (optional): Filter by secondary category
- `offset` (optional): Number of records to skip. Default: `0`
- `limit` (optional): Maximum number of records to return. Default: `1000`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
- **200 OK:**
  ```json
  {
    "message": "10 Expenses found",
    "data": {
      "rowCount": 10,
      "payload": [
        {
          "id": 1,
          "expense": "Grocery shopping",
          "amount": 50.00,
          "date": "2024-01-15",
          "category": "Food",
          ...
        }
      ]
    }
  }
  ```

**Error Responses:**
- **401 Unauthorized:**
  ```json
  {
    "message": "Authorization token missing or malformed"
  }
  ```
  ```json
  {
    "error": "Authorization token expired"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "message": "No expenses found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

#### 2.2 Get Expense Summary (Primary Categories)
**Endpoint:** `GET /api/v1/expense/summary`

**Description:** Retrieves expense summary grouped by primary categories for the authenticated user.

**Query Parameters:**
- `startDate` (optional): Start date for filtering expenses (format: `YYYY-MM-DD`). Default: `1970-01-01`
- `endDate` (optional): End date for filtering expenses (format: `YYYY-MM-DD`). Default: current date

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
- **200 OK:**
  ```json
  {
    "message": "5 Expenses found",
    "data": [
      {
        "primarycategory": "Food",
        "total": 500.00,
        "count": 10
      },
      ...
    ]
  }
  ```

**Error Responses:**
- **401 Unauthorized:** Same as above
- **404 Not Found:**
  ```json
  {
    "message": "No expenses found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

#### 2.3 Get Expense Summary (Secondary Categories)
**Endpoint:** `GET /api/v1/expense/summary/:primaryCategory`

**Description:** Retrieves expense summary grouped by secondary categories within a specific primary category.

**Path Parameters:**
- `primaryCategory` (required): The primary category to filter by

**Query Parameters:**
- `startDate` (optional): Start date for filtering expenses (format: `YYYY-MM-DD`). Default: `1970-01-01`
- `endDate` (optional): End date for filtering expenses (format: `YYYY-MM-DD`). Default: current date

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
- **200 OK:**
  ```json
  {
    "message": "3 Expenses found",
    "data": [
      {
        "secondarycategory": "Groceries",
        "total": 200.00,
        "count": 5
      },
      ...
    ]
  }
  ```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "message": "Primary category is required"
  }
  ```
- **401 Unauthorized:** Same as above
- **404 Not Found:**
  ```json
  {
    "message": "No expenses found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

#### 2.4 Add Expense
**Endpoint:** `POST /api/v1/expense`

**Description:** Adds a single expense for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "expense": "string (required) - Expense description/remark",
  "amount": "number (required) - Expense amount",
  "date": "string (optional, format: YYYY-MM-DD) - Date of expense. Default: current date",
  "category": "string (optional) - Expense category. Default: 'Categorization pending'"
}
```

**Response:**
- **201 Created:**
  ```json
  {
    "message": "Expense added successfully",
    "data": {
      "id": 123,
      "expense": "Grocery shopping",
      "amount": 50.00,
      "date": "2024-01-15",
      "category": "Food",
      ...
    }
  }
  ```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "message": "Expense and amount are required"
  }
  ```
- **401 Unauthorized:** Same as above
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

#### 2.5 Bulk Add Expense
**Endpoint:** `POST /api/v1/expense/bulk`

**Description:** Adds multiple expenses in bulk. **Currently returns 500 error - implementation pending.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "string (required) - Bulk expense data"
}
```

**Response:**
- **500 Internal Server Error:**
  ```json
  {
    "message": "Bulk add expense implementation pending"
  }
  ```

---

#### 2.6 Update Expense
**Endpoint:** `PUT /api/v1/expense/:id`

**Description:** Updates an existing expense for the authenticated user.

**Path Parameters:**
- `id` (required): The ID of the expense to update

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "expense": "string (required) - Expense description/remark",
  "amount": "number (required) - Expense amount",
  "created": "string (required, format: YYYY-MM-DD) - Date of expense",
  "primarycategory": "string (optional) - Primary category. Default: 'Categorization pending'",
  "secondarycategory": "string (optional) - Secondary category. Default: 'Categorization pending'"
}
```

**Response:**
- **200 OK:**
  ```json
  {
    "message": "Expense updated successfully",
    "data": {
      "id": 123,
      "expense": "Updated expense",
      "amount": 75.00,
      "created": "2024-01-15",
      "primarycategory": "Food",
      "secondarycategory": "Groceries",
      ...
    }
  }
  ```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "message": "Expense and amount are required"
  }
  ```
  ```json
  {
    "message": "date required"
  }
  ```
- **401 Unauthorized:** Same as above
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

#### 2.7 Delete Expense
**Endpoint:** `DELETE /api/v1/expense/:id`

**Description:** Deletes an expense for the authenticated user.

**Path Parameters:**
- `id` (required): The ID of the expense to delete

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
- **200 OK:**
  ```json
  {
    "message": "Expense deleted successfully",
    "data": {
      "id": 123,
      ...
    }
  }
  ```

**Error Responses:**
- **401 Unauthorized:** Same as above
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

### 3. User Endpoints (`/api/v1/user`)

#### 3.1 Reset Password
**Endpoint:** `POST /api/v1/user/resetPassword`

**Description:** Resets a user's password. **Currently returns 500 error - implementation pending.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "string (required)",
  "old_password": "string (required)",
  "new_password": "string (required)"
}
```

**Response:**
- **500 Internal Server Error:**
  ```json
  {
    "message": "Implementation pending"
  }
  ```

---

### 4. WhatsApp Endpoints (`/api/v1/whatsapp`)

#### 4.1 Add Expense via WhatsApp
**Endpoint:** `POST /api/v1/whatsapp`

**Description:** Webhook endpoint for receiving WhatsApp messages and processing them as expenses. Validates Twilio signature for security.

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
x-twilio-signature: string (required) - Twilio webhook signature
```

**Request Body:**
```
Body=expense_message&From=whatsapp:+1234567890
```

**Response:**
- **201 Created:**
  ```json
  {
    "success": true,
    "message": "Message processed successfully.",
    "data": {
      ...
    }
  }
  ```

**Error Responses:**
- **403 Forbidden:**
  ```
  Invalid Request
  ```
  *Returned when Twilio signature validation fails*

- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error"
  }
  ```

**Note:** This endpoint uses Twilio's webhook validation middleware to ensure requests are from Twilio.

---

### 5. Heartbeat Endpoint (`/api/v1/heartbeat`)

#### 5.1 Health Check
**Endpoint:** `GET /api/v1/heartbeat`

**Description:** Simple health check endpoint to verify the API is running.

**Request Body:** None

**Response:**
- **200 OK:**
  ```json
  {
    "message": "Ok"
  }
  ```

---

## Error Handling

### Common HTTP Status Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request parameters
- **401 Unauthorized:** Authentication required or token invalid/expired
- **403 Forbidden:** Access denied (e.g., invalid Twilio signature)
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource conflict (e.g., duplicate email)
- **500 Internal Server Error:** Server error

### Error Response Format

All error responses follow this format:
```json
{
  "message": "Error description",
  "error": "Optional error code"
}
```

---

## Authentication Middleware

### User Middleware (`userMiddleware`)

Applied to protected endpoints. Validates JWT tokens from the `Authorization` header.

**Requirements:**
- Header format: `Authorization: Bearer <token>`
- Valid, non-expired JWT token
- Token must be signed with `JWT_SECRET`

**Sets:** `res.locals.userId` with the authenticated user's ID

### WhatsApp Middleware (`whatsAppMiddleWare`)

Applied to WhatsApp webhook endpoints. Validates Twilio webhook signatures.

**Requirements:**
- `x-twilio-signature` header
- Valid Twilio signature matching the request body and webhook URL

---

## Notes

1. **JWT Token Lifetime:** Tokens expire after 1 hour (3600 seconds)
2. **OTP Validity:** OTPs sent via WhatsApp are valid for 5 minutes
3. **Date Formats:** All dates should be in `YYYY-MM-DD` format
4. **Phone Number Format:** Must be in E.164 format (e.g., `+1234567890`)
5. **Pagination:** Default limit for expense queries is 1000 records
6. **Pending Features:**
   - Bulk add expense endpoint (returns 500)
   - Reset password endpoint (returns 500)

---

## Base URL Examples

If running locally on port 3000:
- `http://localhost:3000/api/v1/auth/signup`
- `http://localhost:3000/api/v1/expense`
- `http://localhost:3000/api/v1/heartbeat`

---

## CORS

The API includes CORS middleware. Check `middleware/cors.middleware.js` for specific CORS configuration.

---

*Last Updated: Based on codebase analysis*

