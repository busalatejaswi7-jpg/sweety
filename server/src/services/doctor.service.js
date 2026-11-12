import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { validatePositiveId } from "../validators/common.validator.js";
import {
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport,
} from "./report.service.js";

export async function getAssignedPatients(doctorId) {
    const result = await pool.query(
        `SELECT patient.id, patient.name, patient.email
         FROM doctor_patient_assignments AS assignment
         JOIN users AS patient ON patient.id = assignment.patient_id
         WHERE assignment.doctor_id = $1 AND patient.role = 'patient'
         ORDER BY patient.name, patient.id`,
        [doctorId]
    );

    return result.rows;
}

export async function getAssignedPatientReport(doctorId, patientId, period, date) {
    const validatedPatientId = validatePositiveId(patientId, "Patient ID");
    const assignment = await pool.query(
        `SELECT 1
         FROM doctor_patient_assignments
         WHERE doctor_id = $1 AND patient_id = $2`,
        [doctorId, validatedPatientId]
    );

    if (assignment.rowCount === 0) {
        throw new ApiError(404, "Assigned patient not found.");
    }

    switch (period) {
        case "daily":
            return getDailyReport(validatedPatientId, date);
        case "month-to-date":
            return getMonthToDateReport(validatedPatientId, date);
        case "previous-month":
            return getPreviousMonthReport(validatedPatientId, date);
        default:
            throw new ApiError(400, "Unsupported report period.");
    }
}