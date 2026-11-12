# Sweety - Blood Glucose Tracker

Sweety is a web application where users can record their daily blood glucose readings and check their reports.

I built this project using React, Node.js, Express and PostgreSQL.

## Technologies Used

- React and TypeScript
- Tailwind CSS
- Node.js and Express
- PostgreSQL
- JWT and bcrypt

## Features

- User signup and login.
- Add, view, edit and delete glucose readings.
- Four reading slots: Morning fasting, After breakfast, After lunch and After dinner.
- Maximum of four readings per day.
- Validation for glucose values, duplicate slots and future dates.
- Daily, month-to-date and previous-month reports.
- Reports show highest, lowest, average and total readings.

## Project Setup

### Prerequisites

- Node.js
- PostgreSQL
- npm

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd sweety
```

### 2. Create the database

Create a PostgreSQL database named `sweety`.

```sql
CREATE DATABASE sweety;
```

Run the database schema:

```bash
psql -U postgres -d sweety -f server/db/schema.sql
```

### 3. Configure environment variables

Go to the `server` folder and create a `.env` file using `.env.example`.

Add your PostgreSQL connection string and JWT secret.

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sweety
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Run the backend

```bash
cd server
npm install
npm run dev
```

Backend URL: `http://localhost:5000`

### 5. Run the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Running Tests

Backend:

```bash
cd server
npm test
```

Frontend:

```bash
cd client
npm run lint
npm run build
```

## Seed Data

To insert a demo user and sample readings into the database:

```bash
cd server
npm run seed
```

Demo login:

- Email: `demo@sweety.com`
- Password: `Demo@123`

## Notes

- I used four fixed reading slots for each day.
- A user cannot add more than one reading for the same slot and date.
- I added validation on both the frontend and backend.
- With more time, I would like to add charts to the reports and write more automated tests.