# OTP Verification - Quick Reference

## Files Modified

### 1. Frontend Verification Page
**Path**: `frontend/verify-otp/page.tsx`

**Core Logic**:
```typescript
- Accepts email and 6-digit OTP
- Displays countdown timer (10 minutes)
- Color-coded urgency indicator
- Handles both registration and login flows
- Validates OTP via POST to /api/auth/verify-otp
- Redirects based on flow type after success
```

**Key Variables**:
- `email` - User's email address
- `otp` - 6-digit code entered by user
- `timeLeft` - Countdown timer in seconds
- `flow` - Either 'registration' or 'login'
- `canResend` - Boolean for resend button state

**Main Functions**:
- `handleSubmit()` - Validates and submits OTP
- `handleResendOTP()` - Resends OTP to email
- `formatTime()` - Formats seconds to MM:SS

### 2. Updated Login Page
**Path**: `frontend/login/page.tsx`

**New Features**:
```typescript
- Detects if OTP verification is required
- Stores email in localStorage for OTP page
- Shows OTP notification message
- Redirects to /verify-otp?flow=login when needed
- Handles both direct login and OTP-based login
```

**Key Changes**:
- Added `showOtpMessage` state
- Added `flow` detection logic
- Updated success message handling
- Added redirect to OTP page when required

## API Endpoints Used

### Register User
```
POST /api/auth/register
Request: {
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  phone_number?: string,
  designation?: string,
  department?: string,
  manager_id?: number
}
Response: {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  message: string,
  otp_message: string
}
```

### Verify OTP
```
POST /api/auth/verify-otp
Request: {
  email: string,
  otp_code: string (6 digits)
}
Response: {
  message: string,
  email: string,
  is_verified: boolean,
  id: number
}
```

### Login
```
POST /api/auth/login
Request: {
  email: string,
  password: string
}
Response: {
  access_token: string,
  refresh_token: string,
  user_id: number,
  email: string,
  first_name: string,
  last_name: string,
  role: string,
  employee_id?: string,
  requires_otp?: boolean (if true, OTP needed)
}
```

## Error Handling

### Frontend Error Messages
```
"Please enter email and OTP"
"OTP must be 6 digits"
"OTP verification failed"
"Invalid OTP code"
"OTP has expired. Please register again."
"User not found"
```

### OTP Validation Rules
1. Must be exactly 6 digits
2. Must match the OTP sent to email
3. Must not be expired (10 minutes)
4. User email must exist in database

## State Management

### localStorage Keys Used
```javascript
// Registration flow
localStorage.setItem('registerEmail', email);
localStorage.removeItem('registerEmail'); // After verification

// Login flow
localStorage.setItem('loginEmail', email);
localStorage.removeItem('loginEmail'); // After verification

// After successful OTP verification
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', token);
localStorage.setItem('user', JSON.stringify(userData));
```

## UI Components

### OTP Input
```jsx
<input
  type="text"
  placeholder="000000"
  value={otp}
  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
  maxLength="6"
/>
```
- Accepts only digits
- Auto-limits to 6 characters
- Center-aligned display

### Timer Display
```jsx
<div className={`${timeLeft > 300 ? 'blue' : timeLeft > 60 ? 'orange' : 'red'}`}>
  OTP expires in: {formatTime(timeLeft)}
</div>
```
- Updates every second
- Color changes based on remaining time
- Format: MM:SS

### Error Message
```jsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    ⚠️ {error}
  </div>
)}
```

## Complete Flow Diagram

```
┌─────────────────────────────────────┐
│     User Registration              │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  POST /api/auth/register            │
│  - Create User                      │
│  - Generate OTP (6 digits)          │
│  - Send OTP Email                   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   Redirect to /verify-otp           │
│   - Store email in localStorage     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   User Enters OTP from Email        │
│   - 6-digit numeric input           │
│   - 10-minute countdown             │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  POST /api/auth/verify-otp          │
│  - Match OTP codes                  │
│  - Check expiration                 │
│  - Mark user as verified            │
└────────────────┬────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
    ✓ Success         ✗ Error
        │                 │
        ▼                 ▼
   Redirect to      Show Error
   /login           Message
        │           (can retry)
        └────────┬─────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │   POST /api/auth/login │
        │   - Send credentials │
        │   - Get tokens       │
        └─────────────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Redirect to /home   │
        │ - User Logged In ✓  │
        └─────────────────────┘
```

## Testing Checklist

- [ ] OTP received in email
- [ ] OTP input accepts 6 digits only
- [ ] Timer counts down correctly
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error
- [ ] Valid OTP verifies successfully
- [ ] Resend button works after timer
- [ ] Registration flow redirects to login
- [ ] Login flow redirects to home
- [ ] Email localStorage cleanup works
- [ ] Mobile layout responsive
- [ ] Error messages clear and helpful

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| OTP not received | Check spam folder, verify email config |
| OTP expired | Use resend button to get new code |
| Invalid OTP error | Ensure exactly 6 digits, no typos |
| Timer not counting | Check browser console for errors |
| Redirect not working | Verify API response includes redirect URL |
| Email not displaying | Ensure localStorage key matches value |

## Performance Optimization

- Timer updates only when needed (useEffect with dependency)
- Input validation on change (prevents invalid submissions)
- Loading states prevent double submissions
- localStorage used for temporary data (cleared after use)
- CSS classes for styling (no inline styles)

## Accessibility Features

- Clear label text for inputs
- Error messages with icon indicators
- Button disabled states during loading
- Color not sole indicator (also uses text/icons)
- Proper heading hierarchy
- Form labels associated with inputs
- Clear instructions for user actions
