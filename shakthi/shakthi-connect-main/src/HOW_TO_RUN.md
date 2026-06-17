# How to Run Shakthi Connect

## Prerequisites
- Python installed
- Node.js installed

## 1. Start the Backend
The backend handles the database and API.
1. Open a terminal.
2. Navigate to `src` (if not already there).
3. Run the Flask app:
   ```bash
   python backend/app.py
   ```
   *Note: If you are already running it, press `Ctrl+C` to stop and run it again to apply recent changes.*

## 2. Start the Frontend
The frontend is the visible website.
1. Open a **new** terminal.
2. Navigate to `src`.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the link shown (usually `http://localhost:5173`).

## 3. Verify
- Go to `http://localhost:5173`.
- Login (e.g., `priya@example.com`).
- Check **Take Work** to see jobs.
- Check **Dashboard** -> **Manage My Posted Jobs** to see applications.
