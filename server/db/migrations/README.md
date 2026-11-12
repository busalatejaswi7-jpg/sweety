Apply the additive doctor-role migration to an existing database:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f db/migrations/001_add_doctor_assignments.sql
```

All existing users remain patients. To create a doctor, register both accounts normally, then promote and assign them using a database administrator connection:

```sql
UPDATE users
SET role = 'doctor'
WHERE email = lower('doctor@example.com');

INSERT INTO doctor_patient_assignments (doctor_id, patient_id)
SELECT doctor.id, patient.id
FROM users AS doctor
CROSS JOIN users AS patient
WHERE doctor.email = lower('doctor@example.com')
	AND doctor.role = 'doctor'
	AND patient.email = lower('patient@example.com')
	AND patient.role = 'patient'
ON CONFLICT DO NOTHING;
```

The doctor must log in again after promotion so their token contains the updated role.