import api from "./api";
import type { Report, ReportType } from "./report.service";

export interface AssignedPatient {
  id: number;
  name: string;
  email: string;
}

interface PatientsResponse {
  success: boolean;
  data: { patients: AssignedPatient[] };
}

interface ReportResponse {
  success: boolean;
  data: { report: Report };
}

export async function fetchAssignedPatients(): Promise<AssignedPatient[]> {
  const response = await api.get<PatientsResponse>("/doctor/patients");
  return response.data.data.patients;
}

export async function fetchAssignedPatientReport(
  patientId: number,
  type: ReportType,
  date: string,
): Promise<Report> {
  const response = await api.get<ReportResponse>(
    `/doctor/patients/${patientId}/reports/${type}`,
    { params: { date } },
  );
  return response.data.data.report;
}