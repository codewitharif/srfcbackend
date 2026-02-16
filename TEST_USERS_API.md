# Users API - Test Commands

## Issues Fixed

✅ **Password Hashing**: Now automatically hashes passwords using SHA256 (use bcrypt in production)  
✅ **Validation**: Checks for required fields (username, email, password)  
✅ **Duplicate Check**: Prevents duplicate username or email  
✅ **Better Error Messages**: Clear feedback on what went wrong  
✅ **Field Defaults**: Sets sensible defaults for optional fields  

---

## Test Endpoints

### 1. Create User (POST)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe",
    "role": "loan_officer",
    "department": "Sales",
    "mobile_number": "9876543210",
    "is_active": true
  }'
```

**Expected Response (201):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "loan_officer",
  "department": "Sales",
  "mobile_number": "9876543210",
  "is_active": true,
  "created_at": "2026-02-06T10:30:00.000Z"
}
```

---

### 2. Get All Users (GET)
```bash
curl http://localhost:5000/api/users
```

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "loan_officer",
    "department": "Sales",
    "mobile_number": "9876543210",
    "is_active": true,
    "last_login": null,
    "created_at": "2026-02-06T10:30:00.000Z"
  }
]
```

---

### 3. Get User by ID (GET)
```bash
curl http://localhost:5000/api/users/1
```

---

### 4. Update User (PUT)
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Smith",
    "role": "kyc_verifier",
    "is_active": true
  }'
```

---

### 5. Delete User (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/users/1
```

---

## Error Scenarios

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe"
  }'
```
**Response (400):**
```json
{
  "error": "Missing required fields: username, email, and password are required"
}
```

---

### Duplicate Username/Email
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Pass123"
  }'
```
**Response (409):**
```json
{
  "error": "Username or email already exists"
}
```

---

## Key Changes Made

| Issue | Before | After |
|-------|--------|-------|
| **Password Storage** | Stored plain text or expected hash | Auto-hashes with SHA256 |
| **Validation** | None | Checks username, email, password required |
| **Duplicates** | No check | Prevents duplicate username/email |
| **Error Messages** | Generic | Specific feedback |
| **Defaults** | None | `role='customer_support'`, `is_active=true` |
| **Return Fields** | Missing department | Now includes all fields |

---

## Next Steps (Production)

1. **Replace SHA256 with bcrypt** - More secure:
   ```bash
   npm install bcrypt
   ```
   Then update the hashPassword function

2. **Add Login Endpoint** - Verify password and return token
3. **Add JWT Authentication** - Protect other endpoints
4. **Add Password Reset** - Allow users to change password
5. **Add Rate Limiting** - Prevent brute force attacks

