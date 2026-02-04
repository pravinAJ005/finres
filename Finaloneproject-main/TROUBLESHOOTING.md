# Troubleshooting Certificate Upload Issues

## Common Issues and Solutions

### 1. "Error uploading certificate" Error

**Possible Causes:**

#### A. Server Not Running
- Make sure the backend server is running on port 5000
- Check terminal for server logs: `npm run server`
- You should see: "Server running on port 5000"

#### B. Uploads Directory Not Created
- The server should automatically create the `server/uploads/` directory
- If it doesn't exist, create it manually:
  ```bash
  mkdir server/uploads
  ```

#### C. File Type Not Supported
- Only image files are allowed: JPEG, JPG, PNG, GIF, WebP
- Check the file extension and MIME type

#### D. File Too Large
- Maximum file size is 10MB
- Try compressing the image before uploading

#### E. CORS Issues
- Make sure the server has CORS enabled (it should be in the code)
- Check browser console for CORS errors

#### F. Network/Connection Issues
- Check if the API URL is correct: `http://localhost:5000/api`
- Make sure both frontend and backend are running
- Check firewall settings

### 2. How to Debug

1. **Check Server Logs:**
   - Look at the terminal where the server is running
   - You should see error messages if something goes wrong

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages
   - Go to Network tab to see the API request/response

3. **Verify File:**
   - Make sure the file is actually an image
   - Try with a different image file
   - Check file size (should be < 10MB)

4. **Test API Directly:**
   - You can test the upload endpoint using Postman or curl:
   ```bash
   curl -X POST http://localhost:5000/api/upload-certificate \
     -F "certificate=@path/to/your/image.jpg"
   ```

### 3. Quick Fixes

1. **Restart the Server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run server
   ```

2. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check File Paths:**
   - Make sure you're running the server from the project root directory
   - The `server/uploads/` directory should be created automatically

4. **Verify Dependencies:**
   ```bash
   npm install
   cd client
   npm install
   ```

### 4. Windows-Specific Issues

If you're on Windows and getting path-related errors:

1. Make sure Node.js has write permissions to the project directory
2. Run the terminal as Administrator if needed
3. Check that the uploads directory path is correct (should be `D:\port\server\uploads`)

### 5. Still Having Issues?

Check the following:
- Node.js version (should be 14+)
- All dependencies installed correctly
- Port 5000 is not being used by another application
- Antivirus/firewall is not blocking the connection
