# OTP Verification System Guide

## Overview
The OTP (One-Time Password) verification system has been implemented to secure both registration and login flows. Users receive a 6-digit OTP via email that must match the code they enter in the verification page.

## Features Implemented

### 1. **OTP Verification Page** (`frontend/verify-otp/page.tsx`)
Enhanced with the following features:

#### Core Functionality
- ✅ **Email Display**: Shows which email the OTP was sent to
- ✅ **6-Digit OTP Input**: Numeric-only input field with formatting
- ✅ **Timer Display**: Shows remaining time (10 minutes) with color-coded urgency
  - Blue (5+ minutes remaining)
  - Orange (1-5 minutes remaining)
  - Red (< 1 minute remaining)
- ✅ **Dual Flow Support**: Handles both registration and login OTP verification
- ✅ **Resend Functionality**: Allow users to resend OTP after initial timeout
- ✅ **Error Handling**: Clear error messages for invalid/expired OTPs
- ✅ **Success State**: Confirmation message before redirect

#### User Experience
- Responsive design with Tailwind CSS
- Clear visual feedback for all actions
- Loading states with spinner animations
- Disabled states for buttons during verification
- Mobile-friendly layout

### 2. **Login Page Enhancement** (`frontend/login/page.tsx`)
Updated with OTP flow integration:

#### New Features
- ✅ **OTP Requirement Detection**: Checks if login requires OTP verification
- ✅ **Flow Management**: Detects whether user needs OTP or direct login
- ✅ **Email Storage**: Saves email to localStorage for OTP page retrieval
- ✅ **Redirect Logic**: Seamlessly directs to OTP verification page when needed
- ✅ **Success Messages**: Shows confirmation message before redirect

#### Security Features
- Email and password validation
- OTP requirement based on backend response
- Token storage only after successful verification

### 3. **Backend Integration** (`backend/app/routes/auth.py`)

#### Endpoints Used
- `POST /api/auth/login` - Authenticates user credentials
- `POST /api/auth/verify-otp` - Verifies 6-digit OTP code

#### User Service Methods (`backend/app/services/user_service.py`)
- `send_otp()` - Sends OTP via email
- `verify_otp()` - Validates OTP code and expiration
- `authenticate_user()` - Checks email, password, and verification status

## Workflow

### Registration Flow
1. User fills registration form on `/register`
2. System creates user account and generates 6-digit OTP
3. OTP sent via email to user
4. User navigated to `/verify-otp` (registration flow)
5. User enters 6-digit OTP received in email
6. System validates OTP:
   - ✅ Checks if OTP matches stored code
   - ✅ Verifies OTP hasn't expired (10 minutes)
   - ✅ Marks user as verified
7. User redirected to `/login` on success
8. User can now login with email/password

### Login Flow
1. User enters email and password on `/login`
2. System validates credentials
3. If OTP is required (configured):
   - System sends OTP to registered email
   - User redirected to `/verify-otp?flow=login`
4. User enters 6-digit OTP from email
5. System validates OTP (same as registration)
6. On success, user can access tokens or is redirected to `/home`

## Technical Details

### OTP Specifications
- **Length**: 6 digits (0-9 only)
- **Expiration**: 10 minutes from generation
- **Format**: Numeric input with visual formatting
- **Validation**: Exact match required

### Data Flow
```
Email Input → Password Input → Credentials Sent to Backend
                                    ↓
                          Backend Validates Credentials
                                    ↓
                    Generates OTP & Sends via Email
                                    ↓
                      Frontend Redirects to OTP Page
                                    ↓
                    User Enters OTP from Email
                                    ↓
                      Backend Validates OTP Match
                                    ↓
                    Token Generation & Redirect
```

### State Management
- **localStorage Keys Used**:
  - `registerEmail` - Temporary email during registration flow
  - `loginEmail` - Temporary email during login flow
  - `accessToken` - JWT token after successful verification
  - `refreshToken` - Refresh token for session management
  - `user` - User profile information

### Environment Variables
Ensure the following are configured in your backend:
- Email service credentials (for sending OTP)
- JWT secret keys (for token generation)
- Database connection (for storing OTP and user data)

## User Interface Components

### OTP Input Field
- Center-aligned display
- Large, bold font (3xl)
- Character spacing for readability
- Accepts only numeric input (0-9)
- Auto-limits to 6 characters

### Timer Display
- Color-coded based on remaining time
- Format: MM:SS (e.g., 10:00)
- Updates every second
- Visual indicator of urgency

### Messages
- **Error**: Red banner with icon
- **Success**: Green banner with icon
- **Info**: Blue banner with hint text

## Security Best Practices

1. ✅ **OTP Expiration**: 10-minute window prevents brute force attacks
2. ✅ **Email Verification**: Ensures users control email addresses
3. ✅ **Token Generation**: Only after OTP verification
4. ✅ **No Token Storage**: Tokens not stored during OTP process
5. ✅ **Email Validation**: OTP sent only to registered email

## Testing the Flow

### Registration Testing
```
1. Navigate to /register
2. Fill in all required fields
3. Submit registration
4. Check email for 6-digit OTP
5. Go to /verify-otp (automatic redirect)
6. Enter OTP from email
7. Should redirect to /login on success
```

### Login Testing
```
1. Navigate to /login
2. Enter registered email and password
3. If OTP required, automatic redirect to /verify-otp?flow=login
4. Check email for 6-digit OTP
5. Enter OTP in verification page
6. Should redirect to /home on success
```

## Troubleshooting

### OTP Not Received
- Check spam/junk folder
- Verify email address is correct
- Wait a few seconds for email delivery
- Use "Resend OTP" button after timer expires

### OTP Expired
- Timer shows expiration countdown
- Click "Resend OTP" to get a new code
- Maximum 10 minutes to verify

### Invalid OTP Error
- Ensure entering exactly 6 digits
- Check for typos when copying from email
- OTP is case-sensitive for some systems

## Future Enhancements

Potential improvements for future versions:
- [ ] OTP via SMS option
- [ ] Biometric authentication bypass
- [ ] OTP retry limits with account lockout
- [ ] Email verification in admin panel
- [ ] OTP event logging and auditing
- [ ] Customizable OTP expiration time
- [ ] Backup codes for account recovery

## Support
For issues with OTP verification:
1. Check backend logs for email sending errors
2. Verify email service configuration
3. Ensure database has OTP fields in user model
4. Check frontend console for JavaScript errors
