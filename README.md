# Sweety - Blood Glucose Tracker

Sweety is a web application that allows users to record their daily blood glucose readings and view reports based on their readings.

I developed this project using React, Node.js, Express and PostgreSQL.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt

## Features

- User signup and login.
- Add, view, edit and delete glucose readings.
- Four reading slots: Morning fasting, After breakfast, After lunch and After dinner.
- Maximum of four readings per day.
- Validation for glucose values, duplicate readings and future dates.
- Daily, month-to-date and previous-month reports.
- Reports include highest, lowest, average and total number of readings.

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

Create a database named `sweety` in PostgreSQL.

```sql
CREATE DATABASE sweety;
```

Run the schema file:

```bash
psql -U postgres -d sweety -f server/db/schema.sql
```

### 3. Configure environment variables

Create a `.env` file inside the `server` folder using the provided `.env.example` file.

Update it with your PostgreSQL credentials and JWT secret.

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sweety
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Run the backend

Open a terminal and run:

```bash
cd server
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

### 5. Run the frontend

Open another terminal and run:

```bash
cd client
npm install
npm run dev
```

Open the URL displayed in the terminal. Usually it is `http://localhost:5173`.

## Running Tests

To run backend tests:

```bash
cd server
npm test
```

To check the frontend:

```bash
cd client
npm run lint
npm run build
```

## Seed Data

The project includes a seed script to create a demo user and add sample glucose readings for testing.

Configure these values in `server/.env`:

```env
DEMO_USER_NAME=Sweety Demo
DEMO_USER_EMAIL=demo@example.com
DEMO_USER_PASSWORD=choose-a-local-password-at-least-8-characters
```

Run the seed script from the server folder:

```bash
npm run seed:demo
```

The script can be run again without overwriting the existing demo user's password or sample readings. It also prevents execution in production.

Use the email and password configured in your `.env` file to log in.

## Notes

- I used four fixed reading slots for each day.
- A user can add only one reading for each slot on a particular date.
- I added validation on both the frontend and backend.
- If I had more time, I would add charts to the reports and write more automated tests.