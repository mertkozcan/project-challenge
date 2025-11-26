# Security Hardening Walkthrough

## Changes Implemented

### 1. JWT Authentication
- **Dependency:** Added `jsonwebtoken` package.
- **Middleware:** Updated `authMiddleware.js` to verify JWT tokens from the `Authorization: Bearer <token>` header.
- **Controller:** Updated `loginController.js` to generate and return JWT tokens upon login and signup.
- **Admin:** Updated `adminMiddleware.js` to use the secure `req.user.id` from the token.

### 2. Secure File Uploads
- **Controller:** Updated `proofController.js` to restrict file uploads:
    - **Allowed Types:** Images (jpeg, jpg, png, webp) and Videos (mp4, webm).
    - **Size Limit:** 50MB.

### 3. Data Protection
- **Config:** Removed sensitive database connection string logging from `db.js`.

## Verification Steps

### Manual Verification

1.  **Login/Signup:**
    - Perform a login or signup request.
    - Verify that the response contains a `token` field.

2.  **Protected Routes:**
    - Try to access a protected route (e.g., `/api/admin/...`) *without* a token.
    - **Expected Result:** `401 Unauthorized`.
    - Try to access with the token in the header: `Authorization: Bearer <your_token>`.
    - **Expected Result:** `200 OK` (if authorized).

3.  **File Upload:**
    - Try to upload a `.txt` or `.exe` file.
    - **Expected Result:** Error message "Only images... and videos... are allowed!".
    - Try to upload a valid image.
    - **Expected Result:** Success.

### Next Steps
- Update the Frontend to store the JWT token (e.g., in localStorage) and send it in the `Authorization` header for all API requests.
