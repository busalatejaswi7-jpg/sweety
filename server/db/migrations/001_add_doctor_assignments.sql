ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'patient';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_allowed'
          AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_role_allowed
            CHECK (role IN ('patient', 'doctor'));
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS doctor_patient_assignments (
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (doctor_id, patient_id),
    CONSTRAINT doctor_patient_assignment_not_self CHECK (doctor_id <> patient_id)
);

CREATE INDEX IF NOT EXISTS doctor_patient_assignments_patient_idx
    ON doctor_patient_assignments (patient_id);