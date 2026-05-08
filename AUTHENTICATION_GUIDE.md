# Authentication & Token Refresh Implementation Guide

## 🎯 Overview

This document explains the complete authentication flow with automatic token refresh, best practices for token rotation, and production-ready error handling.

---

## 🏗️ Architecture

### Token Types & Expiry

```
Access Token:
├─ Lifetime: 15 minutes (short-lived)
├─ Storage: localStorage (billingit_access_token)
├─ Usage: Sent in Authorization header for API requests
└─ Security: Can expire and be refreshed

Refresh Token:
├─ Lifetime: 7 days (long-lived)
├─ Storage: httpOnly cookie (refreshToken) - more secure
├─ Usage: Used to get new access token
└─ Security: Validated against database value
```

### Token Rotation Strategy

- Every time a refresh token is used, both a new access token AND new refresh token are generated
- Old refresh token is discarded and replaced in the database
- This prevents token reuse and limits damage if token is compromised

---

## 📊 Frontend Flow

### 1. App Initialization

```
App Start
  ↓
useAuthInit() hook runs
  ↓
hydrate() checks if token exists
  ↓
If token exists, fetch user profile
  ↓
Set isAuthenticated = true/false
```

### 2. Protected Route Check

```
User tries to access /app/* route
  ↓
ProtectedRoute component
  ↓
Is authChecking? → Show loading spinner
  ↓
Is authenticated? → Show page content
  ↓
No? → Redirect to /login
```

### 3. Automatic Token Refresh (On 401)

```
API Request with access token
  ↓
Response: 401 Unauthorized
  ↓
Request interceptor detects 401
  ↓
Add to queue if refresh already in progress
  ↓
Call /auth/refresh-token endpoint
  ↓
If successful:
   ├─ New accessToken stored in localStorage
   ├─ New refreshToken set in cookie
   └─ Original request retried with new token
  ↓
If failed:
   ├─ Clear all tokens
   ├─ Show session expired notification
   └─ Redirect to /login
```

---

## 🔧 Key Components

### 1. `api.js` - Axios Instance with Interceptors

**Features:**

- ✅ Request queue system for handling concurrent 401s
- ✅ Failed request queue to retry after token refresh
- ✅ Automatic token attachment in request headers
- ✅ Response interception for 401 handling
- ✅ Prevents infinite retry loops with `_retry` flag

**Key Methods:**

```javascript
// Request interceptor - adds token to headers
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles 401 and refreshes
api.interceptors.response.use(response, (error) => {
  if (error.response?.status === 401) {
    // Queue mechanism ensures only one refresh happens
    // All pending requests wait and retry after refresh
  }
});
```

### 2. `tokenUtils.js` - Token Helpers

```javascript
isTokenExpired(token); // Check if token expired
getTokenExpiryTime(token); // Time remaining until expiry
decodeToken(token); // Decode JWT payload
getTokenMetadata(token); // Get token details for debugging
```

### 3. `ProtectedRoute.jsx` - Route Protection

**Features:**

- ✅ Auth state checking before rendering
- ✅ Session expiry notifications
- ✅ User profile verification
- ✅ Better loading states with messages

### 4. `useAuthInit.js` - App Initialization Hook

**Features:**

- ✅ Runs on app mount
- ✅ Hydrates auth state from tokens
- ✅ Can implement proactive token refresh (2 min before expiry)

### 5. `auth.store.js` - Zustand State Management

**Methods:**

```javascript
hydrate(); // Load user from token on app start
login(); // Authenticate user
logout(); // Clear auth state and tokens
verifyOtp(); // Verify OTP and login
```

---

## 🔐 Backend Endpoints

### 1. POST `/auth/login`

**Request:**

```json
{ "email": "user@example.com", "password": "pass123" }
```

**Response (200):**

```json
{
  "message": "Login Successful",
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

**Cookie Set:** `refreshToken` (httpOnly, secure, 7 days)

### 2. POST `/auth/verify-otp`

**Request:**

```json
{ "email": "user@example.com", "otp": "1234" }
```

**Response (200):**

```json
{
  "message": "Account Verified Successfully",
  "accessToken": "eyJhbGc...",
  "user": { ... }
}
```

**Note:** Now returns tokens (was fixed in this implementation)

### 3. POST `/auth/refresh-token`

**Request:** Requires `refreshToken` cookie
**Response (200):**

```json
{
  "accessToken": "eyJhbGc...",
  "message": "Token refreshed successfully"
}
```

**Error Codes:**

- `NO_REFRESH_TOKEN` - Cookie missing
- `REFRESH_TOKEN_EXPIRED` - Token expired
- `INVALID_REFRESH_TOKEN` - Signature invalid
- `TOKEN_MISMATCH` - DB token doesn't match

### 4. POST `/auth/logout`

**Request:** Requires `refreshToken` cookie
**Response (200):**

```json
{ "message": "Logged out successfully" }
```

**Actions:**

- ✅ Clears refreshToken from DB
- ✅ Clears cookie

---

## 🛡️ Error Handling

### Error Code Reference

```javascript
// Access Token Errors
TOKEN_EXPIRED        → 401 - Access token expired (refresh needed)
INVALID_TOKEN        → 401 - Token signature invalid
NO_TOKEN            → 401 - No token provided
USER_NOT_FOUND      → 401 - User doesn't exist

// Refresh Token Errors
NO_REFRESH_TOKEN    → 401 - Cookie missing (likely cleared)
REFRESH_TOKEN_EXPIRED → 401 - Refresh token expired (must login again)
INVALID_REFRESH_TOKEN → 401 - Signature invalid
TOKEN_MISMATCH      → 403 - DB token different (potential attack)
```

### User Experience

```javascript
// Scenario 1: Access token expired, refresh token valid
1. API returns 401
2. Auto-refresh token
3. Retry request silently
4. User sees no interruption ✨

// Scenario 2: Both tokens expired
1. API returns 401
2. Try to refresh token
3. Refresh endpoint returns 401 (refresh expired)
4. Clear all tokens
5. Show: "Session expired. Please login again."
6. Redirect to /login?session_expired=true

// Scenario 3: Multiple simultaneous requests while refreshing
1. Request 1 fails → starts refresh
2. Request 2 fails → added to queue, waits for refresh
3. Request 3 fails → added to queue, waits for refresh
4. Refresh completes with new token
5. All 3 requests automatically retry ✨
```

---

## 🚀 Best Practices Implemented

### 1. Token Rotation

```javascript
// ✅ ON EACH REFRESH:
- Generate NEW accessToken
- Generate NEW refreshToken
- Store new refreshToken in database
- Invalidate old refreshToken
// Prevents token replay attacks
```

### 2. Secure Storage

```javascript
// ✅ ACCESS TOKEN: localStorage
- Accessible to JavaScript
- Automatically attached to requests
- Cleared on logout

// ✅ REFRESH TOKEN: httpOnly Cookie
- NOT accessible to JavaScript (XSS protection)
- Auto-sent with credentials
- Survives page refreshes
```

### 3. Request Queuing

```javascript
// ✅ PROBLEM: Multiple requests fail at same time
// ✅ OLD: Each calls refresh independently (inefficient)
// ✅ NEW: Queue system (only one refresh, others wait)
```

### 4. Automatic Redirect on Expiry

```javascript
// ✅ WHEN: Both tokens expired
// ✅ ACTION:
// - Clear localStorage + cookie
// - Redirect to /login?session_expired=true
// - Show user-friendly notification
```

### 5. Database Token Validation

```javascript
// ✅ ON REFRESH:
// 1. Verify JWT signature valid
// 2. Check token in database matches
// 3. If mismatch → potential attack → reject
```

---

## 🧪 Testing Scenarios

### Scenario 1: Normal Login Flow

```bash
1. User logs in
2. Receives accessToken (15 min) + refreshToken (7 day)
3. Makes API request with accessToken
4. Token is valid → Request succeeds
```

### Scenario 2: Access Token Expiry (Refresh Valid)

```bash
1. Wait 15+ minutes
2. Make API request
3. Server returns 401 (access token expired)
4. Frontend auto-refreshes token
5. Retries request with new token
6. Request succeeds (user doesn't notice) ✨
```

### Scenario 3: Full Session Expiry

```bash
1. Wait 7+ days
2. Make API request
3. Access token expired → try refresh
4. Refresh token also expired → refresh fails
5. Redirect to login: /login?session_expired=true
6. User logs in again
```

### Scenario 4: Concurrent Requests During Refresh

```bash
1. Multiple requests at same time
2. All get 401 (access token expired)
3. Only ONE refresh call made
4. All requests queued and wait
5. After refresh completes, all retry
```

### Scenario 5: Logout

```bash
1. User clicks logout
2. Clear localStorage (accessToken)
3. Clear cookie (refreshToken)
4. Clear database (refreshToken)
5. Redirect to /login
```

---

## 📝 Configuration

### Token Expiry Times

```javascript
// backend/controller/authController.js
ACCESS_TOKEN_EXPIRY = "15m"; // Short-lived
REFRESH_TOKEN_EXPIRY = "7d"; // Long-lived
```

### To Customize:

```javascript
// 1. Update token expiry in authController.js
const generateAccessToken = (user) => {
  return jwt.sign(data, secret, { expiresIn: "30m" }); // Change 15m to 30m
};

// 2. Update frontend buffer in tokenUtils.js
const bufferTime = 60 * 1000; // 1 minute before expiry
```

---

## 🐛 Debugging

### Check Token Status

```javascript
// In browser console
import {
  decodeToken,
  getTokenMetadata,
  isTokenExpired,
} from "@/lib/tokenUtils";

const token = localStorage.getItem("billingit_access_token");
console.log(getTokenMetadata(token));
// Shows: userId, role, issuedAt, expiresAt, timeRemaining, etc.
```

### Common Issues

**Issue: "Loading indefinitely"**

- Check: Is hydrate() completing?
- Check: Is token valid? `isTokenExpired(token)`
- Solution: Clear localStorage and re-login

**Issue: "401 errors on every request"**

- Check: Is refreshToken endpoint working?
- Check: Are cookies being sent? (withCredentials: true)
- Solution: Test `/auth/refresh-token` in Postman

**Issue: "Logged out unexpectedly"**

- Check: Did refresh token expire?
- Check: Was there a token mismatch error?
- Solution: Check server logs for TOKEN_MISMATCH

---

## 📚 References

### Files Modified

- `frontend/src/services/api.js` - Main interceptor logic
- `frontend/src/components/layout/ProtectedRoute.jsx` - Route protection
- `frontend/src/stores/auth.store.js` - State management
- `backend/controller/authController.js` - Auth endpoints
- `backend/middleware/authMiddleware.js` - Request validation

### Files Created

- `frontend/src/lib/tokenUtils.js` - Token utilities
- `frontend/src/hooks/useAuthInit.js` - Initialization hook

### Standards Used

- JWT (JSON Web Tokens) - RFC 7519
- OAuth 2.0 token refresh pattern
- httpOnly cookie security
- Token rotation best practices
