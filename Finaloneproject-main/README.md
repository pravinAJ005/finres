# Portfolio Web Application

A modern portfolio web application that allows you to create a resume-format portfolio, share it via URL, upload certificates, and download your portfolio as a PDF.

## Features

- 📝 **Resume Format UI**: Create your portfolio in a professional resume format
- 🔗 **URL Sharing**: Share your portfolio with others using a unique URL
- 📄 **Certificate Upload**: Upload certificates in image format
- ⬇️ **Certificate Download**: Others can download your certificates via the shared URL
- 📥 **PDF Download**: Download your portfolio as a PDF resume
- 🔄 **Auto-Update**: Updates to your portfolio automatically reflect in the shared URL

## Installation

1. Install server dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
cd ..
```

Or install all at once:
```bash
npm run install-all
```

## Running the Application

### Development Mode (runs both server and client):
```bash
npm run dev
```

### Or run separately:

**Server only:**
```bash
npm run server
```

**Client only:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Create Portfolio**: Fill out the form with your personal information, experience, education, skills, projects, and upload certificates.

2. **Save Portfolio**: Click "Save Portfolio" to save your data. You'll receive a shareable URL.

3. **Share URL**: Copy the shareable URL and send it to others.

4. **View Portfolio**: Click "View Portfolio" or visit the shared URL to see your portfolio in resume format.

5. **Download**: 
   - Download certificates individually
   - Download the entire portfolio as a PDF resume

6. **Auto-Update**: When you update your portfolio, the changes automatically appear in the shared URL (refreshes every 30 seconds).

## Project Structure

```
portfolio-web-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PortfolioForm.js
│   │   │   ├── PortfolioForm.css
│   │   │   ├── PortfolioView.js
│   │   │   └── PortfolioView.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/                 # Express backend
│   ├── index.js
│   └── uploads/           # Certificate storage
├── package.json
└── README.md
```

## Technologies Used

- **Frontend**: React, React Router, Axios, jsPDF, html2canvas
- **Backend**: Node.js, Express, Multer, CORS
- **Styling**: CSS3

## API Endpoints

- `POST /api/portfolio` - Create or update portfolio
- `GET /api/portfolio/:id` - Get portfolio by ID
- `POST /api/upload-certificate` - Upload certificate image
- `GET /api/certificate/:filename` - Download certificate
- `GET /api/portfolios` - Get all portfolios (admin)

## Notes

- The current implementation uses in-memory storage. For production, consider using a database (MongoDB, PostgreSQL, etc.)
- Certificate files are stored in the `server/uploads/` directory
- The portfolio view auto-refreshes every 30 seconds to show updates

## License

ISC
