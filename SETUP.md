# Jevah App Setup Guide

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:3001/api
```

3. Start the development server:
```bash
npm run dev
```

## Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:3001`

## Features

### Zod Validation
- All forms use Zod for client-side validation
- Provides real-time error messages
- Ensures data quality before submission

### API Endpoints
- **Newsletter Subscription**: Saves email addresses to `server/data/newsletter.json`
- **Contact Form**: Saves contact submissions to `server/data/contacts.json`

### Data Storage
- Data is stored in JSON files (for development)
- For production, consider migrating to a database

## Running Both Servers

You'll need two terminal windows:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```

## Production Considerations

1. Replace JSON file storage with a database (PostgreSQL, MongoDB, etc.)
2. Add authentication for admin endpoints
3. Implement rate limiting
4. Add email notifications
5. Use environment variables for all configuration
6. Set up proper error logging
7. Add CORS configuration for production domain

