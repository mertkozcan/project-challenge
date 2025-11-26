# Implementation Plan - Auth Features

## Goal Description
Implement "Remember Me" functionality and a "Forgot Password" flow using Supabase Authentication.

## Proposed Changes

### Frontend Services
#### [MODIFY] [AuthService.ts](file:///e:/Projects/project-challenge/project-challenge/src/services/auth/auth.service.ts)
- Add `resetPassword(email: string)` method calling `supabase.auth.resetPasswordForEmail`.

### Frontend Hooks
#### [MODIFY] [useAuth.ts](file:///e:/Projects/project-challenge/project-challenge/src/utils/hooks/useAuth.ts)
- Expose `resetPassword` function.

### Frontend Pages
#### [NEW] [ForgotPassword.tsx](file:///e:/Projects/project-challenge/project-challenge/src/pages/auth/ForgotPassword.tsx)
- Create a new page with an email input form to request a password reset link.

#### [MODIFY] [SignIn.tsx](file:///e:/Projects/project-challenge/project-challenge/src/pages/auth/SignIn.tsx)
- Add "Remember Me" checkbox (visual/functional if possible).
- Add "Forgot Password?" link pointing to `/forgot-password`.
- *Note:* For "Remember Me", we will use `supabase.auth.setPersistence` to toggle between `LOCAL` (Remember) and `SESSION` (Don't Remember) storage.

#### [MODIFY] [App.tsx](file:///e:/Projects/project-challenge/project-challenge/src/App.tsx)
- Add route for `/forgot-password`.

## Verification Plan

### Manual Verification
- **Forgot Password:**
    - Go to `/forgot-password`.
    - Enter email and submit.
    - Check email (if possible) or verify success message.
- **Remember Me:**
    - Login with "Remember Me" UNCHECKED. Close tab/browser. Reopen. Should be logged out (if session persistence works as expected).
    - Login with "Remember Me" CHECKED. Close tab/browser. Reopen. Should be logged in.
