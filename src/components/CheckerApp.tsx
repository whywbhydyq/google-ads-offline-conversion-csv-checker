"use client";

import type { ChangeEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { downloadTextFile, exportIssuesCsv, parseCsvText } from "@/lib/csv";
import type { FieldMapping, ParsedCsv, ValidationIssue, ValidationModeInput, ValidationResult } from "@/lib/types";
import { getValidationModeCopy, validateCsv } from "@/lib/validation";

type SeverityFilter = "all" | "critical" | "warning" | "info";
type ValidationSource = "worker" | "main_thread";
type WorkflowSelection = ValidationModeInput;
type WorkerFailureReason = "timeout" | "runtime_error" | "validation_error";
type WorkerResponse =
  | { id: string; ok: true; parsed: ParsedCsv; result: ValidationResult }
  | { id: string; ok: false; error: string };

class CsvWorkerValidationError extends Error {
  reason: WorkerFailureReason;

  constructor(reason: WorkerFailureReason, message: string) {
    super(message);
    this.name = "CsvWorkerValidationError";
    this.reason = reason;
  }
}

const DISPLAY_LIMIT = 500;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function bucketCount(count: number) {
  if (count === 0) return "0";
  if (count <= 10) return "1-10";
  if (count <= 100) return "11-100";
  if (count <= 1000) return "101-1000";
  if (count <= 10000) return "1001-10000";
  return "10000+";
}

function bucketTextLength(length: number) {
  if (length === 0) return "0";
  if (length <= 3) return "1-3";
  if (length <= 10) return "4-10";
  if (length <= 30) return "11-30";
  return "31+";
}

function parseFailureReason(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("csv file")) return "not_csv";
  if (lower.includes("empty")) return "empty_file";
  if (lower.includes("too large")) return "file_too_large";
  if (lower.includes("worker")) return "worker_error";
  return "parse_or_validation_error";
}

function getIssueCounts(result: ValidationResult) {
  return {
    critical: result.issues.filter((issue) => issue.severity === "critical").length,
    warning: result.issues.filter((issue) => issue.severity === "warning").length,
    info: result.issues.filter((issue) => issue.severity === "info").length,
  };
}

function dateTimeFromNow(days: number, includeTimezone = true) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const pad = (value: number) => value.toString().padStart(2, "0");
  const base = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  return includeTimezone ? `${base}+08:00` : base;
}

function dateOnlyFromNow(days: number) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function validateCsvText(text: string, mode: WorkflowSelection): { parsed: ParsedCsv; result: ValidationResult; source: ValidationSource } {
  const parsed = parseCsvText(text);
  return { parsed, result: validateCsv(parsed, mode), source: "main_thread" };
}

function validateCsvTextInWorker(text: string, mode: WorkflowSelection): Promise<{ parsed: ParsedCsv; result: ValidationResult; source: ValidationSource }> {
  if (typeof Worker === "undefined") return Promise.resolve(validateCsvText(text, mode));

  return new Promise((resolve, reject) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    let worker: Worker;

    try {
      worker = new Worker(new URL("../workers/csvValidation.worker.ts", import.meta.url), { type: "module" });
    } catch {
      resolve(validateCsvText(text, mode));
      return;
    }

    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new CsvWorkerValidationError("timeout", "CSV worker timed out before validation completed. Try a smaller or simpler CSV file."));
    }, 60_000);

    function cleanup() {
      window.clearTimeout(timer);
      worker.terminate();
    }

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.id !== id) return;
      cleanup();
      if (message.ok) resolve({ parsed: message.parsed, result: message.result, source: "worker" });
      else reject(new CsvWorkerValidationError("validation_error", message.error));
    };

    worker.onerror = () => {
      cleanup();
      reject(new CsvWorkerValidationError("runtime_error", "CSV worker failed before validation completed. Try a smaller or simpler CSV file."));
    };

    try {
      worker.postMessage({ id, text, mode });
    } catch {
      cleanup();
      reject(new CsvWorkerValidationError("runtime_error", "CSV worker could not receive this file for validation. Try a smaller or simpler CSV file."));
    }
  });
}

async function validateUploadedFile(file: File, mode: WorkflowSelection) {
  if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please upload a CSV file.");
  if (file.size === 0) throw new Error("This file appears to be empty.");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("This file is too large for the browser checker. Try a smaller file.");

  const text = await file.text();
  return { ...(await validateCsvTextInWorker(text, mode)), text };
}

const sampleLoaders = [
  {
    id: "valid_click_id",
    label: "Try valid click ID CSV",
    fileName: "valid-click-id-offline-conversions.csv",
    mode: "click_id_upload" as const,
    csv: () => [
      "Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID",
      `EAIaIQobChMIvalidGclid01,Qualified lead,${dateTimeFromNow(-2)},125.50,USD,ORDER-1001`,
      `EAIaIQobChMIvalidGclid02,Qualified lead,${dateTimeFromNow(-1)},220,SGD,ORDER-1002`,
      `EAIaIQobChMIvalidGclid03,Booked consultation,${dateTimeFromNow(-1)},0,USD,ORDER-1003`,
    ].join("\n"),
  },
  {
    id: "user_data_preflight_risk",
    label: "Try user-data preflight risk CSV",
    fileName: "user-data-preflight-risk-sample.csv",
    mode: "user_data_preflight" as const,
    csv: () => [
      "Email,Phone,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID,Ad User Data,Ad Personalization",
      `bad-email,callme,Qualified lead,${dateTimeFromNow(1, false)},abc,US,ORDER-2001,Maybe,Granted`,
      `jane@example.com,+14155552671,,${dateOnlyFromNow(-120)},99.00,USD,ORDER-2002,Granted,Denied`,
      "abcdef1234567890abcdef1234567890,+442071838750,Purchase,not a date,-10,GBP,ORDER-2002,Granted,Granted",
      `, ,Purchase,${dateTimeFromNow(-1)},50,SGD,ORDER-2004,Denied,Denied`,
      `jane@example.com,+14155552671,Qualified lead,${dateOnlyFromNow(-120)},99.00,USD,ORDER-2005,Granted,Granted`,
      `jane@example.com,+14155552671,Qualified lead,${dateOnlyFromNow(-120)},99.00,USD,ORDER-2006,Granted,Granted`,
    ].join("\n"),
  },
];

export function CheckerApp() {
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<WorkflowSelection>("auto");
  const lastCsvTextRef = useRef("");
  const activeValidationRequestRef = useRef(0);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const requestId = ++activeValidationRequestRef.current;
    setFileName(file.name);
    setError("");
    setIsChecking(true);
    track("file_selected", { size_bucket: bucketCount(file.size) });
    try {
      const { parsed: parsedCsv, result: validationResult, source, text } = await validateUploadedFile(file, workflowMode);
      if (requestId !== activeValidationRequestRef.current) return;
      lastCsvTextRef.current = text;
      setParsed(parsedCsv);
      setResult(validationResult);
      setSeverityFilter("all");
      setFieldFilter("all");
      setQuery("");
      const counts = getIssueCounts(validationResult);
      track("check_completed", {
        source: "upload",
        processing_mode: source,
        row_count_bucket: bucketCount(parsedCsv.rawRowCount),
        issue_count_bucket: bucketCount(validationResult.issues.length),
        critical_count_bucket: bucketCount(counts.critical),
        warning_count_bucket: bucketCount(counts.warning),
        risk_status: validationResult.riskStatus,
        workflow_mode: validationResult.mode,
        requested_workflow_mode: workflowMode,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong while parsing this CSV.";
      if (requestId !== activeValidationRequestRef.current) return;
      lastCsvTextRef.current = "";
      setParsed(null);
      setResult(null);
      setError(message);
      track("parse_failed", {
        source: "upload",
        reason: parseFailureReason(message),
        size_bucket: bucketCount(file.size),
      });
    } finally {
      input.value = "";
      if (requestId === activeValidationRequestRef.current) setIsChecking(false);
    }
  }

  function loadSample(sample: (typeof sampleLoaders)[number]) {
    const requestId = ++activeValidationRequestRef.current;
    setFileName(sample.fileName);
    setWorkflowMode(sample.mode);
    setError("");
    setIsChecking(true);
    track("sample_loaded", { sample_id: sample.id, requested_workflow_mode: sample.mode });
    try {
      const csvText = sample.csv();
      const parsedCsv = parseCsvText(csvText);
      const validationResult = validateCsv(parsedCsv, sample.mode);
      lastCsvTextRef.current = csvText;
      setParsed(parsedCsv);
      setResult(validationResult);
      setSeverityFilter("all");
      setFieldFilter("all");
      setQuery("");
      const counts = getIssueCounts(validationResult);
      track("check_completed", {
        source: "sample",
        processing_mode: "main_thread",
        row_count_bucket: bucketCount(parsedCsv.rawRowCount),
        issue_count_bucket: bucketCount(validationResult.issues.length),
        critical_count_bucket: bucketCount(counts.critical),
        warning_count_bucket: bucketCount(counts.warning),
        risk_status: validationResult.riskStatus,
        workflow_mode: validationResult.mode,
        requested_workflow_mode: sample.mode,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load the sample CSV.";
      if (requestId !== activeValidationRequestRef.current) return;
      lastCsvTextRef.current = "";
      setParsed(null);
      setResult(null);
      setError(message);
      track("parse_failed", {
        source: "sample",
        reason: parseFailureReason(message),
        size_bucket: "sample",
      });
    } finally {
      if (requestId === activeValidationRequestRef.current) setIsChecking(false);
    }
  }

  async function updateWorkflowMode(value: WorkflowSelection) {
    const requestId = ++activeValidationRequestRef.current;
    setWorkflowMode(value);
    setError("");
    setSeverityFilter("all");
    setFieldFilter("all");
    setQuery("");
    track("workflow_mode_selected", { requested_workflow_mode: value });

    const lastCsvText = lastCsvTextRef.current;
    if (!lastCsvText) return;

    setIsChecking(true);
    try {
      const { parsed: parsedCsv, result: validationResult, source } = await validateCsvTextInWorker(lastCsvText, value);
      if (requestId !== activeValidationRequestRef.current) return;
      setParsed(parsedCsv);
      setResult(validationResult);
      const counts = getIssueCounts(validationResult);
      track("check_completed", {
        source: "workflow_change",
        processing_mode: source,
        row_count_bucket: bucketCount(parsedCsv.rawRowCount),
        issue_count_bucket: bucketCount(validationResult.issues.length),
        critical_count_bucket: bucketCount(counts.critical),
        warning_count_bucket: bucketCount(counts.warning),
        risk_status: validationResult.riskStatus,
        workflow_mode: validationResult.mode,
        requested_workflow_mode: value,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not re-check this CSV with the selected workflow.";
      if (requestId !== activeValidationRequestRef.current) return;
      setParsed(null);
      setResult(null);
      setError(message);
      track("parse_failed", {
        source: "workflow_change",
        reason: parseFailureReason(message),
        size_bucket: bucketCount(lastCsvText.length),
      });
    } finally {
      if (requestId === activeValidationRequestRef.current) setIsChecking(false);
    }
  }

  function downloadSample(sample: (typeof sampleLoaders)[number]) {
    track("sample_downloaded", { sample_id: sample.id, source: "dynamic" });
    downloadTextFile(sample.fileName, sample.csv(), "text/csv;charset=utf-8");
  }

  function updateSeverityFilter(severity: SeverityFilter) {
    setSeverityFilter(severity);
    track("result_filter_changed", { filter_type: "severity", value: severity });
  }

  function updateFieldFilter(value: string) {
    setFieldFilter(value);
    track("result_filter_changed", { filter_type: "field", value: value === "all" ? "all" : "specific_field" });
  }

  function updateSearchQuery(value: string) {
    setQuery(value);
    if (value.trim().length > 0) {
      track("result_search_used", { query_length_bucket: bucketTextLength(value.trim().length) });
    }
  }

  const fieldOptions = useMemo(() => {
    if (!result) return [];
    return Array.from(new Set(result.issues.map((issue) => issue.field).filter(Boolean) as string[])).sort();
  }, [result]);

  const filteredIssues = useMemo(() => {
    if (!result) return [];
    return result.issues.filter((issue) => {
      const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter;
      const matchesField = fieldFilter === "all" || issue.field === fieldFilter;
      const text = [issue.id, issue.severity, issue.rowNumber, issue.field, issue.message, issue.suggestion, issue.currentValue].join(" ").toLowerCase();
      return matchesSeverity && matchesField && text.includes(query.toLowerCase());
    });
  }, [fieldFilter, query, result, severityFilter]);

  const visibleIssues = filteredIssues.slice(0, DISPLAY_LIMIT);
  const modeCopy = result ? getValidationModeCopy(result.mode) : null;
  const previewCounts = result ? getIssueCounts(result) : null;

  function downloadReport() {
    if (!result) return;
    track("report_downloaded", {
      row_count_bucket: bucketCount(parsed?.rawRowCount ?? 0),
      issue_count_bucket: bucketCount(result.issues.length),
      risk_status: result.riskStatus,
    });
    downloadTextFile("google-ads-offline-conversion-check-report.csv", exportIssuesCsv(result.issues), "text/csv;charset=utf-8");
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:py-16" aria-labelledby="checker-title">
      <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">Independent local CSV preflight checker</p>
          <h1 id="checker-title" className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">Google Ads Offline Conversion CSV Checker</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Upload a CSV locally in your browser to check headers, conversion time formats, GCLID, GBRAID, WBRAID, user-data hash risks, consent fields, conversion value, currency, duplicate rows, and common Google Ads import risks before previewing the file.</p>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">Browser-local processing: your CSV is not uploaded to our server. This independent tool focuses on CSV-level checks and does not verify Google Ads account settings, conversion ownership, or final import results.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft" aria-labelledby="upload-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="upload-title" className="text-xl font-bold text-slate-950">Upload and preview CSV risk</h2>
              <p className="mt-1 text-sm text-slate-600">CSV only · up to 10MB · browser-local validation.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Local only</span>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label htmlFor="workflow-mode" className="text-sm font-semibold text-slate-950">Workflow to check</label>
            <select id="workflow-mode" value={workflowMode} onChange={(event) => updateWorkflowMode(event.target.value as WorkflowSelection)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-blue-500 focus:ring-2">
              <option value="auto">Auto-detect from headers</option>
              <option value="click_id_upload">Click ID upload: GCLID / GBRAID / WBRAID</option>
              <option value="user_data_preflight">User-data / Data Manager preflight</option>
              <option value="user_data_scheduled_prehashed">Scheduled/pre-hashed user-data upload</option>
              <option value="user_data_manual_unhashed">Manual unhashed user-data review</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">Use an explicit workflow when your headers include both click IDs and user-provided data, or when hashing requirements differ between scheduled/pre-hashed and manual unhashed review.</p>
          </div>
          <label htmlFor="csv-upload" className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-9 text-center transition hover:border-blue-400 hover:bg-blue-50">
            <span className="text-lg font-semibold text-slate-950">Check CSV File Locally</span>
            <span className="mt-2 text-sm text-slate-600">Detect workflow, file-level timezone, fields, row-level issues, and reportable fixes</span>
            <input id="csv-upload" type="file" accept=".csv,text/csv" onChange={handleFileChange} className="sr-only" aria-describedby="csv-upload-privacy" />
          </label>
          <p id="csv-upload-privacy" className="mt-3 text-center text-xs text-slate-500">No Google Ads login required. Your file stays in your browser.</p>
          <div className="mt-5 flex flex-wrap gap-3">{sampleLoaders.map((sample) => <button key={sample.fileName} onClick={() => loadSample(sample)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{sample.label}</button>)}</div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Download fresh sample CSV files</p>
            <p className="mt-1 text-xs text-slate-500">Generated with relative dates so examples stay useful over time.</p>
            <div className="mt-3 flex flex-wrap gap-3">{sampleLoaders.map((sample) => <button key={sample.fileName} onClick={() => downloadSample(sample)} className="text-left text-sm font-medium text-blue-700 hover:text-blue-900">{sample.fileName}</button>)}</div>
          </div>
          {isChecking && <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">Checking your CSV locally… parsing rows, detecting fields, applying the selected workflow, and running validation rules in a browser worker when possible.</div>}
          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          {!parsed && !result && !isChecking && !error && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">Preview will appear after validation.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The first result card will show the selected or inferred workflow, critical issues, warning count, rows without detected critical issues, and the report download action.</p>
            </div>
          )}
          {parsed && result && modeCopy && previewCounts && (
            <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-200">{fileName}</p>
                  <p className="mt-1 text-xs text-slate-400">{modeCopy.label}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{result.riskStatus}</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><dt className="text-slate-400">Rows</dt><dd className="mt-1 text-xl font-bold">{parsed.rawRowCount.toLocaleString()}</dd></div>
                <div><dt className="text-slate-400">Critical</dt><dd className="mt-1 text-xl font-bold">{previewCounts.critical}</dd></div>
                <div><dt className="text-slate-400">Warnings</dt><dd className="mt-1 text-xl font-bold">{previewCounts.warning}</dd></div>
                <div><dt className="text-slate-400">Mapped</dt><dd className="mt-1 text-xl font-bold">{Object.keys(result.mapping).length}</dd></div>
              </dl>
              <p className="mt-4 text-xs leading-5 text-slate-300">{modeCopy.description} Final acceptance still requires Google Ads preview/import validation.</p>
              <button onClick={downloadReport} className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-50">Download row-level fix report</button>
            </div>
          )}
        </div>
      </div>
      {parsed && result && (
        <section className="mt-10 space-y-8" aria-labelledby="results-title">
          <ResultsSummary parsed={parsed} result={result} />
          <ResultInterpretation result={result} />
          <FieldMappingPanel mapping={result.mapping} headers={parsed.headers} />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 id="results-title" className="text-2xl font-bold text-slate-950">Detected issues</h2><p className="mt-1 text-sm text-slate-600">Filter by severity or field, search issue text, then download the full issue report.</p><p className="mt-2 text-sm text-slate-600">The report contains row number, field, severity, issue message, current value, and suggested fix. It is designed as a working checklist before you preview the corrected file in Google Ads.</p></div><button onClick={downloadReport} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Download row-level fix report</button></div>
            <div className="mt-6 grid gap-3 lg:grid-cols-[auto_220px_1fr] lg:items-center">
              <div className="flex flex-wrap gap-2" aria-label="Filter issues by severity">{(["all", "critical", "warning", "info"] as SeverityFilter[]).map((severity) => <button key={severity} onClick={() => updateSeverityFilter(severity)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${severityFilter === severity ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{severity}</button>)}</div>
              <label className="sr-only" htmlFor="field-filter">Filter issues by field</label>
              <select id="field-filter" value={fieldFilter} onChange={(event) => updateFieldFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none ring-blue-500 focus:ring-2"><option value="all">All fields</option>{fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}</select>
              <label className="sr-only" htmlFor="issue-search">Search detected issues</label>
              <input id="issue-search" value={query} onChange={(event) => updateSearchQuery(event.target.value)} placeholder="Search row, field, rule, or message…" className="min-w-0 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none ring-blue-500 focus:ring-2" />
            </div>
            {filteredIssues.length > DISPLAY_LIMIT && <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">Showing the first {DISPLAY_LIMIT.toLocaleString()} matching issues for browser performance. The downloaded report includes all {result.issues.length.toLocaleString()} detected issues.</p>}
            <IssuesTable issues={visibleIssues} />
          </div>
        </section>
      )}
      <section className="mt-14 grid gap-4 md:grid-cols-3" aria-label="Common CSV risks this checker detects">{["Missing headers and duplicated columns", "Invalid, future, date-only, or old conversion times", "Plain-text email, suspicious phone, address hash, and SHA-256 issues", "Empty click ID or user identifiers", "Consent field and user-data hashing risks", "Invalid ISO currency and value formatting", "Duplicate conversion and Order ID risks"].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm">{item}</div>)}</section>
    </section>
  );
}


function ResultsSummary({ parsed, result }: { parsed: ParsedCsv; result: ValidationResult }) {
  const { critical, warning, info } = getIssueCounts(result);
  const modeCopy = getValidationModeCopy(result.mode);
  const cards = [
    { label: "Workflow", value: modeCopy.shortLabel },
    { label: "Total rows", value: parsed.rawRowCount.toLocaleString() },
    { label: "Critical", value: critical.toString() },
    { label: "Warnings", value: warning.toString() },
    { label: "Info", value: info.toString() },
    { label: "Rows without detected critical issues", value: result.readyRows.toLocaleString() },
    { label: "Risk status", value: result.riskStatus },
  ];
  return <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">{cards.map((card) => <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p></div>)}</div>;
}

function ResultInterpretation({ result }: { result: ValidationResult }) {
  const { critical, warning, info } = getIssueCounts(result);
  const headline = critical > 0 ? "Fix critical issues before previewing this upload" : warning > 0 ? "Review warnings before previewing in Google Ads" : "No blocking CSV-level issues detected";
  const body = critical > 0
    ? "Critical findings usually indicate rows that may fail import or match poorly, such as missing identifiers, missing conversion names, invalid conversion times, broken row structure, or unusable user data. Download the report and fix these rows first."
    : warning > 0
      ? "Warnings can still affect match quality, duplicate handling, attribution, or reporting accuracy. Review old click IDs, timezone-less timestamps, suspicious phone values, duplicate Order IDs, and unusual value or currency fields before upload."
      : "This local preflight check did not find CSV-level blockers. Still preview the file in Google Ads before applying the upload, because account settings, conversion action ownership, click ownership, and final attribution cannot be verified locally.";

  return (
    <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm" aria-labelledby="result-interpretation-title">
      <h2 id="result-interpretation-title" className="text-2xl font-bold text-slate-950">{headline}</h2>
      <p className="mt-3 leading-7 text-slate-700">{body}</p>
      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4"><dt className="font-bold text-red-800">Critical</dt><dd className="mt-1 text-slate-700">{critical} found. Fix before upload preview.</dd></div>
        <div className="rounded-2xl bg-white p-4"><dt className="font-bold text-amber-800">Warning</dt><dd className="mt-1 text-slate-700">{warning} found. Review before applying.</dd></div>
        <div className="rounded-2xl bg-white p-4"><dt className="font-bold text-blue-800">Info</dt><dd className="mt-1 text-slate-700">{info} found. Use for cleanup context.</dd></div>
      </dl>
    </section>
  );
}

function FieldMappingPanel({ mapping, headers }: { mapping: FieldMapping; headers: string[] }) {
  const mappedHeaders = new Set(Object.values(mapping));
  const unmapped = headers.filter((header) => !mappedHeaders.has(header));
  return <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">Detected fields</h2><div className="mt-4 grid gap-2">{Object.entries(mapping).length === 0 ? <p className="text-sm text-slate-600">No Google Ads fields were detected.</p> : Object.entries(mapping).map(([key, header]) => <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-700">{key}</span><span className="text-right text-slate-600">{header}</span></div>)}</div></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">Unmapped columns</h2><div className="mt-4 flex flex-wrap gap-2">{unmapped.length === 0 ? <p className="text-sm text-slate-600">All columns were mapped to known fields.</p> : unmapped.map((header, index) => <span key={`${header}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{header || "(empty header)"}</span>)}</div></div></div>;
}

function IssuesTable({ issues }: { issues: ValidationIssue[] }) {
  if (!issues.length) return <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-emerald-900">No issues match this filter.</div>;
  return <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><caption className="sr-only">Detected Google Ads offline conversion CSV issues</caption><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3" scope="col">Severity</th><th className="px-4 py-3" scope="col">Row</th><th className="px-4 py-3" scope="col">Field</th><th className="px-4 py-3" scope="col">Issue</th><th className="px-4 py-3" scope="col">Suggested fix</th><th className="px-4 py-3" scope="col">Current value</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{issues.map((issue, index) => <tr key={`${issue.id}-${issue.rowNumber ?? "file"}-${issue.field ?? ""}-${index}`}><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${severityClass(issue.severity)}`}>{issue.severity}</span></td><td className="px-4 py-3 text-slate-700">{issue.rowNumber ?? "File"}</td><td className="px-4 py-3 text-slate-700">{issue.field ?? "—"}</td><td className="max-w-md px-4 py-3 font-medium text-slate-950">{issue.message}</td><td className="max-w-md px-4 py-3 text-slate-700">{issue.suggestion}</td><td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-500" title={issue.currentValue}>{issue.currentValue ?? "—"}</td></tr>)}</tbody></table></div>;
}

function severityClass(severity: ValidationIssue["severity"]) {
  if (severity === "critical") return "bg-red-100 text-red-800";
  if (severity === "warning") return "bg-amber-100 text-amber-800";
  return "bg-blue-100 text-blue-800";
}
