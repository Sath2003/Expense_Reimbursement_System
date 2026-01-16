# OTP System - Quick Start Guide

## 🚀 Start Here

This guide will get you testing the OTP verification system in 5 minutes.

---

## Step 1: Verify Frontend Files (1 min)

### ✅ Check Verify-OTP Page
```bash
# Location: frontend/verify-otp/page.tsx
# Should contain:
# - 6-digit OTP input field
# - 10-minute countdown timer
# - Email display
# - Submit and resend buttons
```

### ✅ Check Login Page
```bash
# Location: frontend/login/page.tsx
# Should contain:
# - Email and password fields
# - OTP flow detection
# - Redirect to verify-otp when needed
```

---

## Step 2: Start Frontend (1 min)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Visit: http://localhost:3000
```

---

## Step 3: Test Registration (1.5 mins)

### Go to Register Page
```
URL: http://localhost:3000/register
```

### Fill Form
```
Email:          test.user@example.com
Password:       SecurePass123
First Name:     Test
Last Name:      User
Phone:          1234567890
Designation:    Engineer
Department:     Engineering
```

### Submit
- Click "Create Account"
- Should see: "Registration successful! Please check your email for OTP."
- Should auto-redirect in 2 seconds

---

## Step 4: Get OTP from Email (1 min)

### Check Email
```
Backend sends to: test.user@example.com
Contains: 6-digit OTP code
Example: 123456
```

### If Email Not Received
1. Check spam/junk folder
2. Wait 2-3 seconds (email delay)
3. Verify email config in backend

---

## Step 5: Verify OTP (1 min)

### You Should Be On
```
URL: http://localhost:3000/verify-otp
Page: "Verify Email"
Message: "Sent to: test.user@example.com"
```

### Enter OTP
```
OTP Code Field: [Enter the 6-digit code]
Example: 123456

Then: Click "Verify OTP & Proceed"
```

### Expected Result
```
✓ "Email verified successfully!"
→ Auto-redirect to /login (2 seconds)
```

---

## Step 6: Login (30 seconds)

### On Login Page
```
URL: http://localhost:3000/login
Email:    test.user@example.com
Password: SecurePass123
```

### Click Login
- Should see success message
- Should redirect to /home

---

## ✅ Success Criteria

You should see:
- ✅ OTP email received
- ✅ OTP accepted on verification page
- ✅ Redirect to login after verification
- ✅ Successful login with registered email
- ✅ Access to home dashboard

---

## 🐛 Troubleshooting Quick Fixes

### Problem: OTP page doesn't load
**Fix**:
```bash
# Check browser console for errors
# Press F12 → Console
# Look for red error messages
# Clear cache: Ctrl+Shift+Delete
```

### Problem: Email not received
**Fix**:
1. Check spam folder
2. Wait 2-3 seconds
3. Verify backend email config
4. Check backend logs

### Problem: "Invalid OTP" error
**Fix**:
1. Make sure exactly 6 digits
2. No spaces or special characters
3. Copy directly from email
4. Try again

### Problem: Timer not counting down
**Fix**:
```bash
# Check browser console
# Verify JavaScript enabled
# Hard refresh: Ctrl+F5
```

### Problem: Can't see success message
**Fix**:
1. Check that OTP matches exactly
2. Try again with correct OTP
3. Use "Resend OTP" if expired
4. Check browser console for errors

---

## 📱 Test on Mobile

### Mobile Device Testing
1. Ensure backend running on accessible IP (not localhost)
2. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Access from mobile: `http://YOUR_IP:3000`
4. Test registration flow on mobile
5. Verify responsive layout

---

## 🧪 Test Different Scenarios

### Scenario 1: Valid OTP
```
Register with: test1@example.com
Receive: 6-digit OTP in email
Enter: Exact same 6 digits
Result: ✅ Verified, redirected to login
```

### Scenario 2: Invalid OTP
```
Register with: test2@example.com
Receive: 6-digit OTP (e.g., 123456)
Enter: Wrong code (e.g., 654321)
Result: ❌ "Invalid OTP code"
Try again: Enter correct code
Result: ✅ Verified
```

### Scenario 3: Expired OTP
```
Register with: test3@example.com
Receive: 6-digit OTP
Wait: 10 minutes (or until timer = 0:00)
Click: Try to submit
Result: ❌ "OTP has expired"
Click: "Resend OTP"
Result: ✅ New OTP received, timer resets
```

### Scenario 4: Multiple Attempts
```
Register with: test4@example.com
Attempt 1: Wrong OTP → Error
Attempt 2: Wrong OTP → Error
Attempt 3: Correct OTP → Success ✅
```

---

## 🔍 Verify Implementation

### Check Frontend Code
```bash
# Should see in verify-otp/page.tsx:
grep -n "otp_code" frontend/verify-otp/page.tsx
grep -n "timeLeft" frontend/verify-otp/page.tsx
grep -n "/api/auth/verify-otp" frontend/verify-otp/page.tsx
```

### Check Backend API
```bash
# Backend should have these endpoints:
# POST /api/auth/register
# POST /api/auth/verify-otp
# POST /api/auth/login

# Test verify-otp endpoint:
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456"
  }'
```

---

## 📊 Performance Check

### Page Load Time
```
/verify-otp page should load: < 1 second
Timer should update: Every second
Submit button should respond: < 500ms
```

### API Response Time
```
/api/auth/verify-otp: < 500ms
/api/auth/register: < 1 second
/api/auth/login: < 500ms
```

---

## 🎨 UI Check

### Visual Elements
```
✅ Email display at top
✅ OTP input field (6 digits, centered)
✅ Timer display (with color changes)
✅ Submit button
✅ Resend button (when timer expires)
✅ Error messages (red, with icon)
✅ Success messages (green, with icon)
✅ Info messages (blue, with icon)
```

### Color Changes
```
10:00 - 5:01 → Blue background (plenty of time)
5:00 - 1:00  → Orange background (warning)
0:59 - 0:01  → Red background (critical)
```

---

## 📝 Test Checklist

- [ ] Frontend starts without errors
- [ ] Register page loads
- [ ] Can enter all form fields
- [ ] Submit registration successful
- [ ] OTP email received in < 5 seconds
- [ ] Redirected to /verify-otp
- [ ] Email shows correctly on page
- [ ] Can enter 6-digit OTP
- [ ] Submit OTP verification
- [ ] Success message shows
- [ ] Redirected to /login
- [ ] Can login with registered credentials
- [ ] Redirected to /home
- [ ] Dashboard loads successfully

---

## 🚀 Next Steps After Testing

1. **Document Issues**: Note any errors or problems
2. **Check Backend**: Ensure all endpoints working
3. **Review Code**: Go through implementation files
4. **Read Documentation**: Study OTP_*.md files
5. **Integration Test**: Full end-to-end testing
6. **Security Review**: Check security measures
7. **Deploy**: Move to staging/production

---

## 📚 Related Documentation

For more details, see:
- **OTP_VERIFICATION_GUIDE.md** - Complete feature guide
- **OTP_QUICK_REFERENCE.md** - Code reference
- **OTP_VISUAL_GUIDE.md** - Flow diagrams
- **OTP_IMPLEMENTATION_SUMMARY.md** - Technical details
- **OTP_INTEGRATION_CHECKLIST.md** - Full testing checklist

---

## ⚡ Quick Commands

```bash
# Start frontend
cd frontend && npm run dev

# Start backend
cd backend && python main.py

# Test backend endpoint
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp_code":"123456"}'

# View frontend logs
# Open browser DevTools: F12
# Go to Console tab

# View backend logs
# Check terminal output where backend is running
```

---

## 💡 Tips

1. **OTP in Email**: Look for 6-digit number
2. **Copy OTP**: Select and copy directly, no spaces
3. **Timer**: Don't wait until it expires, verify before 0:00
4. **Resend**: Click "Resend OTP" button after timer expires
5. **Spam Folder**: Always check spam/promotions folder
6. **Browser Cache**: Clear if you see old pages
7. **Network**: Disable offline mode for email delivery
8. **Email**: Use real email for testing (not fake)

---

## ✨ You're All Set!

The OTP verification system is ready to test. Follow the steps above and you'll have a working implementation in minutes.

**Questions?** Check the comprehensive documentation files in the project root.

**Happy Testing!** 🎉
