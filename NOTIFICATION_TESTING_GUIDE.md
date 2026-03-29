# 📧 Email Notification System Testing Guide

## Prerequisites

1. **Set up Resend API Key**
   ```bash
   # Add your actual Resend API key to backend/.env
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

2. **Run Database Migration**
   ```sql
   -- Run the SQL from database/notifications-migration.sql in your Supabase dashboard
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Start Frontend**
   ```bash
   npm run dev
   ```

## 🧪 Testing Steps

### 1. Test Notification Settings Page

1. **Navigate to Settings**
   - Go to http://localhost:5173
   - Login as any user
   - Click user dropdown → "Notifications"

2. **Verify UI Elements**
   - ✅ Email address input field
   - ✅ Three toggle switches (status changed, new comment, issue resolved)
   - ✅ Email frequency grid (instant, daily, weekly, off)
   - ✅ Save buttons work with "Saved ✓" feedback

3. **Test Preferences**
   - Change email address and save
   - Toggle notification types on/off
   - Change email frequency
   - Check browser console for API calls to `/api/notifications/prefs`

### 2. Test Admin Notification Triggers

1. **Go to Admin Dashboard**
   - Navigate to http://localhost:5173/admin
   - Should see existing reports

2. **Test Status Change Notification**
   - Find any report with status "pending"
   - Change status to "in_progress"
   - Check browser console for notification trigger
   - Check backend console for email sending attempt

3. **Test Comment Notification**
   - Click on any report to view details
   - Click "💬 Add Comment" button
   - Enter a test comment and send
   - Check for notification trigger

4. **Test Resolved Notification**
   - Change report status to "resolved"
   - Should trigger both status change AND resolved notifications

### 3. Test Email Delivery

1. **Check Resend Dashboard**
   - Go to https://resend.com/dashboard
   - Look for sent emails
   - Verify email content and styling

2. **Check Email Inbox**
   - Use a real email address in notification settings
   - Check for actual email delivery
   - Verify email formatting and links

### 4. Test Digest Functionality

1. **Set Email Frequency to "Daily"**
   - Go to notification settings
   - Select "Daily digest"
   - Trigger some notifications

2. **Check Queue Table**
   ```sql
   SELECT * FROM notification_queue WHERE sent = false;
   ```

3. **Verify Queue API**
   - Check browser Network tab for calls to `/api/notifications/queue`

## 🔍 Debugging Checklist

### Frontend Issues
```javascript
// Check browser console for:
- API calls to /api/notifications/prefs
- API calls to /api/notifications/queue
- API calls to /api/notifications/send
- Any JavaScript errors
```

### Backend Issues
```bash
# Check backend console for:
- "Sent notification to user@email.com" messages
- Any error messages
- Database connection issues
```

### Database Issues
```sql
-- Check notification preferences:
SELECT * FROM notification_prefs;

-- Check notification queue:
SELECT * FROM notification_queue;

-- Check reports table:
SELECT id, title, status, reported_by FROM reports;
```

### Email Issues
1. **Resend API Key Validity**
   - Verify key is correct and active
   - Check domain verification in Resend

2. **Email Content**
   - Verify HTML template rendering
   - Check CSS styles are applied
   - Test links work correctly

## 🧪 Test Scenarios

### Scenario 1: Full Notification Flow
1. User sets email: test@example.com
2. User enables all notifications, instant delivery
3. Admin changes report status: pending → in_progress
4. **Expected**: User receives email immediately

### Scenario 2: Comment Notification
1. User has notifications enabled
2. Admin adds comment to user's report
3. **Expected**: User receives comment email

### Scenario 3: Digest Mode
1. User sets frequency to "daily"
2. Multiple status changes happen
3. **Expected**: Notifications queued, not sent immediately

### Scenario 4: Opt-Out
1. User disables "status changed" notifications
2. Admin changes report status
3. **Expected**: No email sent for status change

## 🐛 Common Issues & Solutions

### Issue: "process is not defined"
**Solution**: Environment variables properly set to use `import.meta.env`

### Issue: No emails sent
**Check**: 
- Resend API key in backend/.env
- Backend server running on port 3001
- Network requests reaching backend

### Issue: CORS errors
**Check**:
- Backend CORS_ORIGIN matches frontend URL
- Backend server includes CORS middleware

### Issue: Database errors
**Check**:
- Migration SQL executed successfully
- Supabase connection working
- RLS policies not blocking access

## ✅ Success Indicators

- ✅ Notification settings page loads without errors
- ✅ Preference changes save successfully
- ✅ Admin status changes trigger notifications
- ✅ Emails appear in Resend dashboard
- ✅ Test emails arrive in inbox
- ✅ Email formatting matches CivicSutra design
- ✅ All links in emails work correctly

## 📞 Support

If you encounter issues:

1. **Check Browser Console** (F12 → Console)
2. **Check Backend Console** (where server is running)
3. **Check Network Tab** for API requests/responses
4. **Check Supabase Dashboard** for database issues
5. **Check Resend Dashboard** for email delivery issues

---

**🎉 Once all tests pass, your notification system is fully functional!**
