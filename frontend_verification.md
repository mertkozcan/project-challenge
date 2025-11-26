# Frontend Verification Walkthrough (Supabase Auth)

## Changes Implemented

### 1. Backend (`authMiddleware.js`)
- **Updated:** Now verifies tokens using `supabase.auth.getUser(token)`.
- **Logic:**
    1.  Receives Bearer token.
    2.  Calls Supabase API to verify token and get User ID.
    3.  Queries local `users` table with that ID to get role (admin/user).
    4.  Sets `req.user` with combined info.

### 2. Frontend (`AuthService.ts`)
- **Restored:** Uses `supabase.auth.signUp` and `signInWithPassword`.
- **Flow:**
    - Login -> Get Supabase Token.
    - Call Backend `/auth/profile/:id` to get role.
    - Return combined data.

### 3. Frontend (`BaseService.ts`)
- **Maintained:** Sends the token (now Supabase token) in `Authorization` header.

## Verification Steps

### 1. Clear Local Storage
- Open Browser DevTools -> Application -> Local Storage -> Clear All.

### 2. Login
- Go to the Login page.
- Enter credentials (Email and Password).
    - **Note:** Use your Supabase credentials.
- Click Login.
- **Check Network Tab:**
    - Request to `https://<project>.supabase.co/auth/v1/token` (Supabase) should succeed.
    - Request to `/api/auth/profile/<id>` should succeed (200).

### 3. Verify Protected Requests
- Navigate to a protected page.
- **Check Network Tab:**
    - API requests (e.g., `/api/challenges`) should have `Authorization: Bearer <supabase_token>`.
    - Requests should succeed (200).

### 4. Signup
- Try creating a new account.
- Verify it calls Supabase API first, then `/api/auth/signup`.
