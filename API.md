# TipTap API Documentation

## Overview

This document outlines all API endpoints to be implemented in Day 3. All endpoints require authentication (session cookie).

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication Endpoints

### POST /auth/register

Register a new worker account.

**Request Body:**
```json
{
  "email": "worker@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "27712345678",
  "location": "Cape Town"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "worker@example.com"
  },
  "worker": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "location": "Cape Town"
  }
}
```

---

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "worker@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "worker@example.com"
  }
}
```

---

### POST /auth/logout

Logout current user.

**Response (200):**
```json
{
  "success": true
}
```

---

### GET /auth/session

Get current authenticated user session.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "worker@example.com"
  }
}
```

---

## Worker Endpoints

### GET /workers/profile

Get current worker's profile.

**Response (200):**
```json
{
  "success": true,
  "worker": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "location": "Cape Town",
    "rating": 5.0,
    "totalTipsEarned": 150.50,
    "bio": "Experienced service worker",
    "isActive": true
  }
}
```

---

### PUT /workers/profile

Update current worker's profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "location": "Cape Town",
  "bio": "Updated bio"
}
```

**Response (200):**
```json
{
  "success": true,
  "worker": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "location": "Cape Town",
    "bio": "Updated bio"
  }
}
```

---

### GET /workers/earnings

Get worker earnings summary.

**Response (200):**
```json
{
  "success": true,
  "earnings": {
    "totalEarned": 150.50,
    "thisMonth": 45.00,
    "thisWeek": 12.50,
    "today": 5.00,
    "currency": "ZAR"
  }
}
```

---

## Wallet Endpoints

### GET /wallets

Get current worker's wallet.

**Response (200):**
```json
{
  "success": true,
  "wallet": {
    "id": "uuid",
    "balance": 150.50,
    "currency": "ZAR"
  }
}
```

---

### GET /wallets/transactions

Get paginated transaction history.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "amount": 50.00,
      "methodType": "snapscan",
      "status": "completed",
      "description": "Tip from customer",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### POST /wallets/payment-methods

Add a new payment method.

**Request Body:**
```json
{
  "type": "snapscan",
  "accountIdentifier": "user@snapscan.me",
  "accountName": "John Doe",
  "isDefault": true
}
```

**Response (201):**
```json
{
  "success": true,
  "paymentMethod": {
    "id": "uuid",
    "type": "snapscan",
    "accountIdentifier": "user@snapscan.me",
    "accountName": "John Doe",
    "isDefault": true,
    "isActive": true
  }
}
```

---

### GET /wallets/payment-methods

Get all linked payment methods.

**Response (200):**
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": "uuid",
      "type": "snapscan",
      "accountIdentifier": "user@snapscan.me",
      "accountName": "John Doe",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

---

## Transaction Endpoints

### POST /transactions

Create a new tip transaction (mock payment processing).

**Request Body:**
```json
{
  "amount": 50.00,
  "methodType": "snapscan",
  "description": "Tip from customer"
}
```

**Response (201):**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "amount": 50.00,
    "methodType": "snapscan",
    "status": "pending",
    "description": "Tip from customer",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /transactions/:id

Get transaction details.

**Response (200):**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "amount": 50.00,
    "methodType": "snapscan",
    "status": "completed",
    "referenceId": "ref_12345",
    "description": "Tip from customer",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Health Endpoint

### GET /health

Check API health status.

**Response (200):**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `UNAUTHORIZED` - User not authenticated (401)
- `FORBIDDEN` - User not authorized (403)
- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Input validation failed (400)
- `INTERNAL_ERROR` - Server error (500)

---

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require:

```
Authorization: Bearer {session_token}
```

Or automatic via session cookie.

---

## Rate Limiting (Future)

Planned rate limits:
- 100 requests per minute per user
- 10 requests per second per IP

---

## Pagination

List endpoints support pagination:

```
GET /wallets/transactions?page=2&limit=50
```

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-01-15T10:30:00Z
```

---

## Implementation Timeline

- **Day 3**: All endpoints implemented with mock payment processing
- **Phase 2**: Real payment processor integration (Revolut, SnapScan, Zapper)

---

Last Updated: Day 1
