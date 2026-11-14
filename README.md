# Sweety – Blood Glucose Tracker

A full-stack web application for recording, managing, and tracking daily blood glucose readings. Sweety provides a simple dashboard where users can securely manage their readings and view daily and month-to-date reports.

## Live Demo  https://sweety-blood-glucose-tracker-murex.vercel.app

## Features

- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected dashboard routes.
- Add, view, edit, and delete glucose readings.
- Four daily time slots:
  - Morning
  - After Breakfast
  - After Lunch
  - After Dinner
- Date-based reading management.
- Prevent duplicate readings for the same user, date, and time slot.
- Input validation for glucose values (40–600).
- Daily reports:
  - Highest reading
  - Lowest reading
  - Average reading
  - Total readings
- Month-to-date reports.
- PostgreSQL database integration.

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) |
| Authentication | JWT |
| Password Security | bcrypt |
| API Testing | Postman |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## Project Structure

```text
Sweety-Blood-Glucose-Tracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── db.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

*Adjust the structure above if your actual folder names differ.*

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Sweety-Blood-Glucose-Tracker
```

### 2. Set up the database

1. Create a PostgreSQL database using [Neon](https://neon.tech/).
2. Open the Neon SQL Editor.
3. Select your database.
4. Execute the following SQL commands.

**Users table**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Readings table**

```sql
CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_time_slot CHECK (
        time_slot IN (
            'morning',
            'after_breakfast',
            'after_lunch',
            'after_dinner'
        )
    ),

    CONSTRAINT valid_glucose_value CHECK (
        glucose_value BETWEEN 40 AND 600
    ),

    CONSTRAINT unique_daily_slot
        UNIQUE (user_id, reading_date, time_slot)
);
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5001
```

Create a `.env` file inside the `frontend` folder.

```env
VITE_API_URL=http://localhost:5000
```

**Important:** Never commit `.env` files, database credentials, or JWT secrets to GitHub.

### 4. Install and run the backend

```bash
cd backend
npm install
npm start
```

The backend runs at:

```text
http://localhost:5000
```

### 5. Install and run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/protected` | Verify authenticated access |

### Glucose Readings

All reading endpoints require a valid JWT token.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/readings?date=YYYY-MM-DD` | Get readings for a date |
| POST | `/api/readings` | Add a reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/month?date=YYYY-MM-DD` | Month-to-date report |

### Authentication Header

For protected endpoints, include:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Testing

The backend APIs can be tested using Postman.

Recommended manual testing:

1. Register a new user.
2. Login and obtain a JWT token.
3. Access a protected endpoint.
4. Add a glucose reading.
5. Retrieve readings for a selected date.
6. Update an existing reading.
7. Delete a reading.
8. Check daily report calculations.
9. Check month-to-date report calculations.
10. Verify that duplicate time slots are rejected.

**Automated tests:** Add a test suite and its execution command here when automated tests are implemented.

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| PostgreSQL Database | Neon |

Production environment variables must be configured in the respective hosting dashboards.

## Notes

### Assumptions

- Each user can manage only their own readings.
- A user can save one reading per time slot per date.
- Glucose values must be integers between 40 and 600.
- Future dates are not accepted.
- Month-to-date reports cover the first day of the selected month through the selected date.
- The application is intended as a personal tracking and demonstration project, not a medical diagnostic system.



**Aryan Singhal**
**Sweety – Blood Glucose Tracker**

Built with React, Node.js, Express, and PostgreSQL.
