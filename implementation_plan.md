# Implementation Plan - Security Hardening

## Goal Description
Fix critical security vulnerabilities identified in the audit report. The primary focus is on securing authentication (JWT), restricting file uploads, and protecting sensitive data.

## User Review Required
> [!IMPORTANT]
> This plan introduces **Breaking Changes** to the API.
> - All protected endpoints will require a valid `Authorization: Bearer <token>` header.
> - Clients sending `userId` in the body/query for authentication will fail.
> - File uploads will be restricted to specific types (images/videos) and sizes.

## Proposed Changes

### Backend Dependencies
#### [NEW] [package.json](file:///e:/Projects/project-challenge/project-challenge/package.json)
- Add `jsonwebtoken` dependency.

### Authentication & Authorization
#### [MODIFY] [authMiddleware.js](file:///e:/Projects/project-challenge/project-challenge/backend/middleware/authMiddleware.js)
- Remove logic that accepts `userId` from body/query.
- Implement `jsonwebtoken.verify` to validate the Bearer token.
- Set `req.user` from the decoded token payload.

#### [MODIFY] [adminMiddleware.js](file:///e:/Projects/project-challenge/project-challenge/backend/middleware/adminMiddleware.js)
- Update to use `req.user.id` (set by auth middleware) instead of `req.body.user_id`.

#### [MODIFY] [loginController.js](file:///e:/Projects/project-challenge/project-challenge/backend/controllers/loginController.js)
- Update `loginUser` to generate and return a JWT token upon successful login.
- Update `registerUser` to generate and return a JWT token upon successful registration.

### File Upload Security
#### [MODIFY] [proofController.js](file:///e:/Projects/project-challenge/project-challenge/backend/controllers/proofController.js)
- Configure `multer` with `fileFilter` to allow only images (jpeg, png, webp) and videos (mp4, webm).
- Configure `limits` to restrict file size (e.g., 50MB).

### Data Protection
#### [MODIFY] [db.js](file:///e:/Projects/project-challenge/project-challenge/backend/config/db.js)
- Remove or mask the console log that prints the database connection string.

## Verification Plan

### Automated Tests
- Create a test script to:
    - Attempt to access a protected route without a token (should fail 401).
    - Login to get a token, then access a protected route (should pass 200).
    - Attempt to upload a disallowed file type (e.g., .txt) (should fail).
    - Attempt to upload a large file (>50MB) (should fail).

### Manual Verification
- Review server logs to ensure DB connection string is not visible.
