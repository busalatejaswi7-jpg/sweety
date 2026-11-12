import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getApiErrorMessage } from "../services/apiError";
import {
  fetchAssignedPatientReport,
  fetchAssignedPatients,
  type AssignedPatient,
} from "../services/doctor.service";
import type { Report, ReportType } from "../services/report.service";

const reportTabs: { label: string; value: ReportType }[] = [
  { label: "Daily", value: "daily" },
  { label: "Month to date", value: "month-to-date" },
  { label: "Previous month", value: "previous-month" },
];

function getLocalDate() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function DoctorPage() {
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(getLocalDate);
  const [type, setType] = useState<ReportType>("daily");
  const [report, setReport] = useState<Report | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingReport, setLoadingReport] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchAssignedPatients()
      .then((assignedPatients) => {
        if (!active) return;
        setPatients(assignedPatients);
        setPatientId(assignedPatients[0] ? String(assignedPatients[0].id) : "");
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError, "Unable to load assigned patients."));
      })
      .finally(() => {
        if (active) setLoadingPatients(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!patientId) return;
    let active = true;

    fetchAssignedPatientReport(Number(patientId), type, date)
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setReport(null);
        setError(getApiErrorMessage(requestError, "Unable to load this patient report."));
      })
      .finally(() => {
        if (active) setLoadingReport(false);
      });

    return () => {
      active = false;
    };
  }, [patientId, type, date]);

  const selectedPatient = patients.find((patient) => String(patient.id) === patientId);
  const stats = [
    { label: "Highest", value: report?.highest ?? 0, unit: "mg/dL" },
    { label: "Lowest", value: report?.lowest ?? 0, unit: "mg/dL" },
    { label: "Average", value: report?.average ?? 0, unit: "mg/dL" },
    { label: "Readings", value: report?.count ?? 0, unit: "total" },
  ];

  const handlePatientChange = (nextPatientId: string) => {
    setPatientId(nextPatientId);
    setReport(null);
    setError("");
    setLoadingReport(true);
  };

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setReport(null);
    setError("");
    setLoadingReport(true);
  };

  const handlePeriodChange = (nextType: ReportType) => {
    setType(nextType);
    setReport(null);
    setError("");
    setLoadingReport(true);
  };

  return (
    <main className="journal-grid min-h-screen text-[#edf3e9]">
      <header className="border-b border-white/10 bg-[#101a17]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/doctor" className="flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-lg bg-[#c4f06a] font-display text-xl font-bold text-[#16221a]">S</span>
            <span>
              <span className="block font-display text-lg font-bold leading-tight text-[#f4f6ed]">Sweety</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#93a49a]">Care view</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#a3b2a7] sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-white/15 px-3 py-2 text-sm text-[#dce5d8] transition hover:border-[#c4f06a]/60 hover:text-[#c4f06a]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <div className="mb-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c4f06a]">Assigned care</p>
          <h1 className="font-display text-3xl font-semibold text-[#f4f6ed] sm:text-4xl">Patient reports</h1>
          <p className="mt-2 text-sm text-[#aab8ad]">View reports only for patients assigned to your account.</p>
        </div>

        <section aria-label="Patient report filters" className="mb-8 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-2 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="assigned-patient" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197]">Assigned patient</label>
              <select
                id="assigned-patient"
                value={patientId}
                disabled={loadingPatients || patients.length === 0}
                onChange={(event) => handlePatientChange(event.target.value)}
                className="w-full rounded-md border border-white/10 bg-[#182520] px-3.5 py-3 text-sm text-[#f4f6ed] outline-none focus:border-[#c4f06a] focus:ring-2 focus:ring-[#c4f06a]/15 disabled:opacity-50"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name} · {patient.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doctor-report-date" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197]">Report date</label>
              <input
                id="doctor-report-date"
                type="date"
                max={getLocalDate()}
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                className="w-full rounded-md border border-white/10 bg-[#182520] px-3.5 py-3 text-sm text-[#f4f6ed] outline-none focus:border-[#c4f06a] focus:ring-2 focus:ring-[#c4f06a]/15"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Report period">
            {reportTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={type === tab.value}
                onClick={() => handlePeriodChange(tab.value)}
                className={`rounded-md px-3.5 py-2.5 text-xs font-medium transition sm:text-sm ${type === tab.value ? "bg-[#c4f06a] text-[#16221a]" : "border border-white/10 bg-[#182520] text-[#bac8bc] hover:border-white/25 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {error && <p role="alert" className="mb-6 rounded-md border border-[#f28d75]/25 bg-[#f28d75]/10 px-4 py-3 text-sm text-[#ffad9b]">{error}</p>}

        {loadingPatients ? (
          <p role="status" className="py-10 text-sm text-[#aab8ad]">Loading assigned patients...</p>
        ) : patients.length === 0 ? (
          <p className="border-l-2 border-[#f28d75] py-3 pl-4 text-sm text-[#aab8ad]">No patients are assigned to this account.</p>
        ) : loadingReport ? (
          <p role="status" className="py-10 text-sm text-[#aab8ad]">Loading report...</p>
        ) : report ? (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#91a197]">Patient</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#f4f6ed]">{selectedPatient?.name}</h2>
              </div>
              <p className="font-mono text-xs text-[#c4f06a]">{type === "daily" ? report.date : `${report.startDate} to ${report.endDate}`}</p>
            </div>

            <section aria-label="Report summary" className="mb-8 grid grid-cols-2 border-y border-white/10 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={stat.label} className={`py-5 ${index > 0 ? "border-l border-white/10 pl-4 sm:pl-6" : "pr-4 sm:pr-6"} ${index > 1 ? "border-t border-white/10 sm:border-t-0" : ""}`}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#91a197] sm:text-xs">{stat.label}</p>
                  <p className={`mt-2 font-display text-2xl font-semibold sm:text-3xl ${index === 0 ? "text-[#f28d75]" : index === 2 ? "text-[#c4f06a]" : "text-[#f4f6ed]"}`}>{stat.value}</p>
                  <p className="mt-1 font-mono text-[10px] text-[#819087]">{stat.unit}</p>
                </div>
              ))}
            </section>

            {type === "daily" && report.readings?.length ? (
              <ol className="divide-y divide-white/10">
                {report.readings.map((reading, index) => (
                  <li key={reading.id} className="flex items-center gap-4 py-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#c4f06a]/10 font-mono text-xs text-[#c4f06a]">0{index + 1}</span>
                    <span className="min-w-0 flex-1 text-sm text-[#edf3e9]">{reading.slot}</span>
                    <span className="font-display text-xl font-semibold text-[#f4f6ed]">{reading.value}<span className="ml-1.5 font-mono text-[10px] font-normal text-[#91a197]">mg/dL</span></span>
                  </li>
                ))}
              </ol>
            ) : report.count === 0 ? (
              <p className="border-l-2 border-[#f28d75] py-3 pl-4 text-sm text-[#aab8ad]">No readings found for this report period.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}