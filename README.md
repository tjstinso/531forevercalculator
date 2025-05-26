# 531 Training Spreadsheet Generator

A web application that helps users generate and manage their 5/3/1 training programs using the 5/3/1 Forever framework. This tool simplifies the process of creating and tracking your training blocks while integrating seamlessly with Google Sheets for data persistence.

## What is this Application?

This is a specialized calculator and spreadsheet generator for the 5/3/1 training methodology, specifically designed around the 5/3/1 Forever framework. The application offers several key features:

- **Training Max Calculation**: Input either your 1 Rep Max (1RM) or Training Max (TM) for each lift
- **Customizable Training Max Percentage**: Configure your TM as a percentage of your 1RM (80-90% range)
- **Google Sheets Integration**: 
  - Export your training program to Google Sheets
  - Create new spreadsheets or update existing ones
  - View and manage all your training spreadsheets
  - Auto-populate training maxes from previous training blocks
- **Comprehensive Tracking**:
  - Maintain a complete training history
  - Track current training block
  - Persist your training data across sessions

The application is designed to make it easier for lifters to follow the 5/3/1 methodology while keeping their training data organized and accessible through Google Sheets integration.

## Setup and Running Locally

### Prerequisites

1. Node.js (v18 or later)
2. Docker and Docker Compose (for containerized deployment)
3. Google Cloud Platform account with API access

### Google API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Drive API
   - Google Sheets API
4. Configure OAuth 2.0 credentials:
   - Create OAuth 2.0 Client ID
   - Add authorized JavaScript origins (e.g., `http://localhost:3000` for local development)
   - Add authorized redirect URIs (e.g., `http://localhost:3000` for local development)
5. Required OAuth scopes:
   - `https://www.googleapis.com/auth/drive.file` (for creating and managing spreadsheets)
   - `https://www.googleapis.com/auth/spreadsheets` (for reading and writing spreadsheet data)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000
```

Note: For production deployment, make sure to update the redirect URI to match your production domain.

### Running with Docker Compose

1. Build and start the application:
   ```bash
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`

### Running Locally (Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

### Data Persistence

The application stores session data in a SQLite database located in the `data` directory. This directory is mounted as a volume in the Docker container to ensure data persistence across container restarts.
