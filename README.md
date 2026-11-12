# Sweety

Sweety is a blood glucose journal built with React, Express, and PostgreSQL. Patients can record up to four readings per day, edit or remove them, and review daily and monthly summaries. Doctor accounts can view reports only for patients explicitly assigned to them.

## Requirements

- Node.js 22.12 or newer
- PostgreSQL

## Setup

1. Create a PostgreSQL database, for example `sweety`.
2. From the project root, copy the server environment template and edit its values:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

3. Initialize a new database:

   ```powershell
   psql -U postgres -d sweety -v ON_ERROR_STOP=1 -f server/db/schema.sql
   ```

   For an existing database, do not rerun the schema file. Apply the additive migration instead:

   ```powershell
   psql -U postgres -d sweety -v ON_ERROR_STOP=1 -f server/db/migrations/001_add_doctor_assignments.sql
   ```

4. Install and start the API in one terminal:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

5. Install and start the client in a second terminal:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

   Vite prints the local client URL when it starts. The API defaults to `http://localhost:5000`.

## Configuration

`server/.env.example` lists the server settings. Set `DATABASE_URL` to your PostgreSQL connection string and replace the example `JWT_SECRET` with a random value of at least 32 characters. `CLIENT_URL` controls the browser origin accepted by CORS; it defaults to `http://localhost:5173` when unset.

## Tests and checks

Run these from their respective directories:

```powershell
cd client
npm run lint
npm test
npm run build
```

```powershell
cd server
npm test
```

## Doctor access

Choose **Doctor** when signing up to submit a doctor application. New applications are stored as `doctor_pending` and cannot access patient data. An administrator must promote the account and assign patients before it can use the doctor portal. The SQL steps are documented in [server/db/migrations/README.md](server/db/migrations/README.md).

## Notes

I treated each glucose entry as one of four fixed daily slots and kept values within 40–600 mg/dL. A doctor signup is an application rather than automatic access; patient assignments are checked by the API on every doctor report request. With more time, I would add an admin screen for reviewing doctor applications and assigning patients, plus a repeatable demo seed script. For now, doctor setup is done with the documented SQL, and no demo account is created automatically.
