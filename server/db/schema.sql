
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    reading_date DATE NOT NULL,
    slot VARCHAR(30) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT readings_value_check
        CHECK (value BETWEEN 40 AND 600),

    CONSTRAINT readings_slot_check
        CHECK (
            slot IN (
                'Morning fasting',
                'After breakfast',
                'After lunch',
                'After dinner'
            )
        ),

    CONSTRAINT unique_user_reading_slot
        UNIQUE (user_id, reading_date, slot),

    CONSTRAINT readings_date_check
        CHECK (reading_date <= CURRENT_DATE)
);
