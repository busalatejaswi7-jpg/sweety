
import api from "./api";

export interface ReportReading {
  id: number;
  reading_date: string;
  slot: string;
  value: number;
}

export interface Report {
  date?: string;
  startDate?: string;
  endDate?: string;
  highest: number;
  lowest: number;
  average: number;
  count: number;
  readings?: ReportReading[];
}

interface ReportResponse {
  success: boolean;
  data: {
    report: Report;
  };
}

export type ReportType =
  | "daily"
  | "month-to-date"
  | "previous-month";

export const fetchReport = async (
  type: ReportType,
  date: string
): Promise<Report> => {
  const response = await api.get<ReportResponse>(
    `/reports/${type}`,
    { params: { date } }
  );

  return response.data.data.report;
};
