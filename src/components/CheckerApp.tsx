"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { downloadTextFile, exportIssuesCsv, parseCsvText } from "@/lib/csv";
import type { FieldMapping, ParsedCsv, ValidationIssue, ValidationResult } from "@/lib/types";
import { validateCsv } from "@/lib/validation";

type SeverityFilter = "all" | "critical" | "warning" | "info";
type ValidationSource = "worker" | "main_thread";
type WorkerResponse =
  | { id: string; ok: true; parsed: ParsedCsv; result: ValidationResult }
  | { id: string; ok: false; error: string };

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

function validateCsvText(text: string): { parsed: ParsedCsv; result: ValidationResult; source: ValidationSource } {
  const parsed = parseCsvText(text);
  return { parsed, result: validateCsv(parsed), source: "main_thread" };
}

function validateCsvTextInWorker(text: string): Promise<{ parsed: ParsedCsv; result: ValidationResult; source: ValidationSource }> {
  if (typeof Worker === "undefined") return Promise.resolve(validateCsvText(text));

  return new Promise((resolve, reject) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const worker = new Worker(new URL("../workers/csvValidation.worker.ts", import.meta.url), { type: "module" });
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("CSV worker timed out."));
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
      else reject(new Error(message.error));
    };

    worker.onerror = () => {
      cleanup();
      reject(new Error("CSV worker failed."));
    };

    worker.postMessage({ id, text });
  });
}

async function validateUploadedFile(file: File) {
  if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please upload a CSV file.");
  if (file.size === 0) throw new Error("This file appears to be empty.");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("This file is too large for the browser checker. Try a smaller file.");

  const text = await file.text();
  try {
    return await validateCsvTextInWorker(text);
  } catch {
    return validateCsvText(text);
  }
}

const sampleLoaders = [
  {
    label: "Try valid click ID CSV",
    fileName: "valid-click-id-offline-conversions.csv",
    staticPath: "/samples/valid-click-id-offline-conversions.csv",
    csv: () => [
      "Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID",
      `EAIaIQobChMIvalidGclid01,Qualified lead,${dateTimeFromNow(-2)},125.50,USD,ORDER-1001`,
      `EAIaIQobChMIvalidGclid02,Qualified lead,${dateTimeFromNow(-1)},220,SGD,ORDER-1002`,
      `EAIaIQobChMIvalidGclid03,Booked consultation,${dateTimeFromNow(-1)},0,USD,ORDER-1003`,
    ].join("\n"),
  },
  {
    label: "Try invalid enhanced conversions CSV",
    fileName: "invalid-enhanced-conversions-sample.csv",
    staticPath: "/samples/invalid-enhanced-conversions-sample.csv",
    csv: () => [
      "Email,Phone,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID",
      `bad-email,callme,Qualified lead,${dateTimeFromNow(1, false)},abc,US,ORDER-2001`,
      `jane@example.com,+14155552671,,${dateOnlyFromNow(-120)},99.00,USD,ORDER-2002`,
      "abcdef1234567890abcdef1234567890,+442071838750,Purchase,not a date,-10,GBP,ORDER-2002",
      `, ,Purchase,${dateTimeFromNow(-1)},50,SGD,ORDER-2004`,
      `jane@example.com,+14155552671,Qualified lead,${dateOnlyFromNow(-120)},99.00,USD,ORDER-2005`,
      `jane@example.com,+14155552671,Qualified lead,${dateOnlyFromNow(-120)},99.00,USD,ORDER-2006`,
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

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setIsChecking(true);
    track("file_selected", { size_bucket: bucketCount(file.size) });
    try {
      const { parsed: parsedCsv, result: validationResult, source } = await validateUploadedFile(file);
      setParsed(parsedCsv);
      setResult(validationResult);
      setSeverityFilter("all");
      setFieldFilter("all");
      setQuery("");
      track("check_completed", {
        source: "upload",
        processing_mode: source,
        row_count_bucket: bucketCount(parsedCsv.rawRowCount),
        issue_count_bucket: bucketCount(validationResult.issues.length),
        risk_status: validationResult.riskStatus,
      });
    } catch (err) {
      setParsed(null);
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong while parsing this CSV.");
    } finally {
      setIsChecking(false);
    }
  }

  function loadSample(sample: (typeof sampleLoaders)[number]) {
    setFileName(sample.fileName);
    setError("");
    setIsChecking(true);
    track("sample_loaded", { sample: sample.fileName });
    try {
      const parsedCsv = parseCsvText(sample.csv());
      const validationResult = validateCsv(parsedCsv);
      setParsed(parsedCsv);
      setResult(validationResult);
      setSeverityFilter("all");
      setFieldFilter("all");
      setQuery("");
      track("check_completed", {
        source: "sample",
        processing_mode: "main_thread",
        row_count_bucket: bucketCount(parsedCsv.rawRowCount),
        issue_count_bucket: bucketCount(validationResult.issues.length),
        risk_status: validationResult.riskStatus,
      });
    } catch (err) {
      setParsed(null);
      setResult(null);
      setError(err instanceof Error ? err.message : "Could not load the sample CSV.");
    } finally {
      setIsChecking(false);
    }
  }

  function downloadSample(sample: (typeof sampleLoaders)[number]) {
    track("sample_downloaded", { sample: sample.fileName, source: "dynamic" });
    downloadTextFile(sample.fileName, sample.csv(), "text/csv;charset=utf-8");
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
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">Free local preflight checker</p>
          <h1 id="checker-title" className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">Google Ads Offline Conversion CSV Checker</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Upload a CSV locally in your browser to catch common Google Ads offline conversion import risks before you preview or apply the file: missing headers, invalid conversion times, old click IDs, unhashed user data, duplicate rows, and value or currency formatting issues.</p>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><strong>Privacy:</strong> Your CSV is parsed locally in this browser. It is not uploaded to our server and row-level conversion data is not stored.</div>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">This is a CSV-level preflight check only. Google Ads can still reject or ignore rows because of account settings, conversion action ownership, click ownership, customer data terms, or attribution eligibility.</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft" aria-labelledby="upload-title">
          <h2 id="upload-title" className="sr-only">Upload a CSV for a local preflight check</h2>
          <label htmlFor="csv-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50">
            <span className="text-lg font-semibold text-slate-950">Check CSV File Locally</span>
            <span className="mt-2 text-sm text-slate-600">CSV only · up to 10MB · processed in a browser worker when possible</span>
            <input id="csv-upload" type="file" accept=".csv,text/csv" onChange={handleFileChange} className="sr-only" />
          </label>
          <p className="mt-3 text-center text-xs text-slate-500">No Google Ads login required. Your file stays in your browser.</p>
          <div className="mt-5 flex flex-wrap gap-3">{sampleLoaders.map((sample) => <button key={sample.fileName} onClick={() => loadSample(sample)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{sample.label}</button>)}</div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Download fresh sample CSV files</p>
            <p className="mt-1 text-xs text-slate-500">These downloads are generated with relative dates so the examples stay useful over time.</p>
            <div className="mt-3 flex flex-wrap gap-3">{sampleLoaders.map((sample) => <button key={sample.staticPath} onClick={() => downloadSample(sample)} className="text-left text-sm font-medium text-blue-700 hover:text-blue-900">{sample.fileName}</button>)}</div>
          </div>
          {isChecking && <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">Checking your CSV locally… parsing rows, detecting fields, and running validation rules in a browser worker when possible.</div>}
          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          {parsed && result && <FileSnapshot fileName={fileName} parsed={parsed} mapping={result.mapping} />}
        </div>
      </div>
      {parsed && result && (
        <section className="mt-10 space-y-8">
          <ResultsSummary parsed={parsed} result={result} />
          <FieldMappingPanel mapping={result.mapping} headers={parsed.headers} />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-bold text-slate-950">Detected issues</h2><p className="mt-1 text-sm text-slate-600">Filter by severity or field, search issue text, then download the full issue report.</p></div><button onClick={downloadReport} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Download full report CSV</button></div>
            <div className="mt-6 grid gap-3 lg:grid-cols-[auto_220px_1fr] lg:items-center">
              <div className="flex flex-wrap gap-2">{(["all", "critical", "warning", "info"] as SeverityFilter[]).map((severity) => <button key={severity} onClick={() => setSeverityFilter(severity)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${severityFilter === severity ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{severity}</button>)}</div>
              <select value={fieldFilter} onChange={(event) => setFieldFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none ring-blue-500 focus:ring-2"><option value="all">All fields</option>{fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}</select>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search row, field, rule, or message…" className="min-w-0 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none ring-blue-500 focus:ring-2" />
            </div>
            {filteredIssues.length > DISPLAY_LIMIT && <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">Showing the first {DISPLAY_LIMIT.toLocaleString()} matching issues for browser performance. The downloaded report includes all {result.issues.length.toLocaleString()} detected issues.</p>}
            <IssuesTable issues={visibleIssues} />
          </div>
        </section>
      )}
      <section className="mt-14 grid gap-4 md:grid-cols-3" aria-label="Common CSV risks this checker detects">{["Missing headers and duplicated columns", "Invalid, future, date-only, or old conversion times", "Plain-text email, suspicious phone, and SHA-256 hash issues", "Empty click ID or user identifiers", "Invalid value and currency formatting", "Duplicate conversion and Order ID risks"].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm">{item}</div>)}</section>
    </section>
  );
}

function FileSnapshot({ fileName, parsed, mapping }: { fileName: string; parsed: ParsedCsv; mapping: FieldMapping }) {
  return <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><p className="text-sm font-semibold text-blue-200">{fileName}</p><dl className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><dt className="text-slate-400">Rows</dt><dd className="mt-1 text-xl font-bold">{parsed.rawRowCount.toLocaleString()}</dd></div><div><dt className="text-slate-400">Columns</dt><dd className="mt-1 text-xl font-bold">{parsed.headers.length}</dd></div><div><dt className="text-slate-400">Mapped</dt><dd className="mt-1 text-xl font-bold">{Object.keys(mapping).length}</dd></div></dl></div>;
}

function ResultsSummary({ parsed, result }: { parsed: ParsedCsv; result: ValidationResult }) {
  const critical = result.issues.filter((issue) => issue.severity === "critical").length;
  const warning = result.issues.filter((issue) => issue.severity === "warning").length;
  const info = result.issues.filter((issue) => issue.severity === "info").length;
  const cards = [{ label: "Total rows", value: parsed.rawRowCount.toLocaleString() }, { label: "Critical", value: critical.toString() }, { label: "Warnings", value: warning.toString() }, { label: "Info", value: info.toString() }, { label: "Ready rows", value: result.readyRows.toLocaleString() }, { label: "Risk status", value: result.riskStatus }];
  return <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">{cards.map((card) => <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p></div>)}</div>;
}

function FieldMappingPanel({ mapping, headers }: { mapping: FieldMapping; headers: string[] }) {
  const mappedHeaders = new Set(Object.values(mapping));
  const unmapped = headers.filter((header) => !mappedHeaders.has(header));
  return <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">Detected fields</h2><div className="mt-4 grid gap-2">{Object.entries(mapping).length === 0 ? <p className="text-sm text-slate-600">No Google Ads fields were detected.</p> : Object.entries(mapping).map(([key, header]) => <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-700">{key}</span><span className="text-right text-slate-600">{header}</span></div>)}</div></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">Unmapped columns</h2><div className="mt-4 flex flex-wrap gap-2">{unmapped.length === 0 ? <p className="text-sm text-slate-600">All columns were mapped to known fields.</p> : unmapped.map((header, index) => <span key={`${header}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{header || "(empty header)"}</span>)}</div></div></div>;
}

function IssuesTable({ issues }: { issues: ValidationIssue[] }) {
  if (!issues.length) return <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-emerald-900">No issues match this filter.</div>;
  return <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Row</th><th className="px-4 py-3">Field</th><th className="px-4 py-3">Issue</th><th className="px-4 py-3">Suggested fix</th><th className="px-4 py-3">Current value</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{issues.map((issue, index) => <tr key={`${issue.id}-${issue.rowNumber ?? "file"}-${issue.field ?? ""}-${index}`}><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${severityClass(issue.severity)}`}>{issue.severity}</span></td><td className="px-4 py-3 text-slate-700">{issue.rowNumber ?? "File"}</td><td className="px-4 py-3 text-slate-700">{issue.field ?? "—"}</td><td className="max-w-md px-4 py-3 font-medium text-slate-950">{issue.message}</td><td className="max-w-md px-4 py-3 text-slate-700">{issue.suggestion}</td><td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-500" title={issue.currentValue}>{issue.currentValue ?? "—"}</td></tr>)}</tbody></table></div>;
}

function severityClass(severity: ValidationIssue["severity"]) {
  if (severity === "critical") return "bg-red-100 text-red-800";
  if (severity === "warning") return "bg-amber-100 text-amber-800";
  return "bg-blue-100 text-blue-800";
}
