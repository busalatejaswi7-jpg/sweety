From the `server` directory, set `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` in `.env`, then run:

```powershell
npm run seed:demo
```

The script creates a patient account and sample readings for the last three days. It is safe to rerun: existing passwords and readings are not overwritten. The script refuses to run when `NODE_ENV=production` and is never run automatically when the server starts.