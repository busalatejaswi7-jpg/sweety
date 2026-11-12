import * as doctorService from "../services/doctor.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listPatients = asyncHandler(async (req, res) => {
    const patients = await doctorService.getAssignedPatients(req.user.userId);
    res.status(200).json({ success: true, data: { patients } });
});

export const patientReport = asyncHandler(async (req, res) => {
    const report = await doctorService.getAssignedPatientReport(
        req.user.userId,
        req.params.patientId,
        req.params.period,
        req.query.date
    );
    res.status(200).json({ success: true, data: { report } });
});