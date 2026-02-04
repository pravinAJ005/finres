# Production Setup Guide

## Issue: Portfolio Not Found After Saving

If you're getting "portfolio not found" error after saving, here are the fixes:

### 1. Update API URL for Production

The API URL is currently hardcoded to `localhost:5000`. For production, you need to:

**Option A: Use Environment Variable**

1. Create a `.env` file in the `client` directory:
```bash
REACT_APP_API_URL=https://your-production-api-url.com/api
```

2. Rebuild your React app:
```bash
cd client
npm run build
```

**Option B: Update the API URL directly in code**

If you have a fixed production URL, update it in:
- `client/src/components/PortfolioForm.js`
- `client/src/components/PortfolioView.js`

Change:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

To:
```javascript
const API_URL = 'https://your-production-api-url.com/api';
```

### 2. Server Storage Issue

**Important:** The current server uses in-memory storage (`let portfolios = {}`), which means:
- Data is lost when the server restarts
- Data is not shared across multiple server instances
- Not suitable for production

**For Production, you should:**
1. Use a database (MongoDB, PostgreSQL, etc.)
2. Or use file-based storage (JSON file)
3. Or use a cloud database service

### 3. Debugging Steps

1. **Check Server Logs:**
   - After saving, check the server console for: "Portfolio saved successfully"
   - When viewing, check for: "Fetching portfolio with ID: [id]"
   - Check if the ID matches

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Check the Network tab when clicking "View Portfolio"
   - See what API call is being made and what response you get

3. **Verify Portfolio ID:**
   - After saving, check the share URL
   - Make sure the ID in the URL matches what's being requested

### 4. Quick Fix: Verify Before Navigation

The code now includes verification:
- After saving, it verifies the portfolio was saved
- Before viewing, it checks if the portfolio exists
- Better error messages are shown

### 5. Common Issues

**Issue:** Portfolio saved but not found
- **Cause:** Server restarted, data lost (in-memory storage)
- **Fix:** Use a database

**Issue:** API URL incorrect
- **Cause:** Still pointing to localhost
- **Fix:** Update API_URL in both components

**Issue:** CORS errors
- **Cause:** Backend not allowing requests from frontend domain
- **Fix:** Update CORS settings in server/index.js

### 6. Production Checklist

- [ ] Update API_URL in both PortfolioForm.js and PortfolioView.js
- [ ] Set up a database for persistent storage
- [ ] Configure CORS for your production domain
- [ ] Test save and view functionality
- [ ] Check server logs for errors
- [ ] Verify certificates are being uploaded correctly

## Temporary Workaround

If you need a quick fix and can't set up a database:

1. The portfolio should work immediately after saving (before server restart)
2. Make sure both frontend and backend are running
3. Check that the API URL is correct
4. Try saving again and viewing immediately

## Need Help?

Check the server console logs - they now show:
- When a portfolio is saved
- What ID was used
- When a portfolio is fetched
- What IDs are available

This will help identify the issue.
