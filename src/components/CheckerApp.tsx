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

const guideLinks = {
  uploadErrors: "/guide/google-ads-offline-conversion-upload-errors",
  templateChecklist: "/guide/offline-conversion-csv-template-checklist",
  enhancedConversions: "/guide/enhanced-conversions-for-leads-csv-errors",
  faq: "/faq",
  privacy: "/privacy",
};

const validationChecks = [
  {
    title: "Required Google Ads columns",
    body: "Detect missing Conversion Name, Conversion Time, click ID, user identifier, and duplicate header risks before upload.",
    href: guideLinks.templateChecklist,
    anchor: "CSV template checklist",
  },
  {
    title: "Conversion time formatting",
    body: "Flag empty, unparseable, future, date-only, timezone-free, or old conversion times that need manual review.",
    href: `${guideLinks.uploadErrors}#conversion-time`,
    anchor: "conversion time examples",
  },
  {
    title: "Click IDs and user identifiers",
    body: "Check GCLID, GBRAID, WBRAID, email, phone, and address-style identifiers for missing or suspicious values.",
    href: guideLinks.uploadErrors,
    anchor: "common upload errors",
  },
  {
    title: "Enhanced conversions for leads data",
    body: "Find plain-text email, suspicious phone values, and broken SHA-256-like hashes in user-provided data columns.",
    href: guideLinks.enhancedConversions,
    anchor: "enhanced conversions CSV errors",
  },
  {
    title: "Values, currencies, and duplicates",
    body: "Review invalid conversion values, malformed currency codes, repeated Order IDs, and duplicate conversion rows.",
    href: guideLinks.uploadErrors,
    anchor: "upload error guide",
  },
  {
    title: "Local privacy boundary",
    body: "Run checks in the browser without Google Ads login, server upload, or row-level storage by this tool.",
    href: guideLinks.privacy,
    anchor: "local CSV processing",
  },
];

const commonErrors = [
  "Missing Conversion Name or Conversion Time columns",
  "Conversion Time with only a date or no timezone",
  "Future conversion times or very old conversion times",
  "Empty GCLID, GBRAID, WBRAID, email, phone, or address data",
  "Plain-text email where hashed user-provided data is expected",
  "Duplicate Order ID or duplicate conversion row risk",
];

const faqItems = [
  {
    question: "Does this tool upload my Google Ads CSV?",
    answer:
      "No. The CSV is parsed and checked locally in your browser. The tool does not require a Google Ads login and does not upload or store row-level CSV data.",
  },
  {
    question: "Can it guarantee that Google Ads will accept my import?",
    answer:
      "No. It checks CSV-level formatting and data risks only. Google Ads account settings, conversion action ownership, click ownership, consent, permissions, and final attribution still need to be verified inside Google Ads.",
  },
  {
    question: "Does it support Enhanced Conversions for Leads CSV files?",
    answer:
      "It can flag common CSV-level issues for user-provided data, including plain-text email, suspicious phone values, missing identifiers, and broken SHA-256-like hashes. It does not enable enhanced conversions or verify your Google Ads account setup.",
  },
  {
    question: "What should I do after downloading the report?",
    answer:
      "Fix critical issues first, rerun the CSV through this checker, then import the cleaned file into Google Ads and review the official upload diagnostics.",
  },
];

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
    track("file_selected", { size_bucket: bucketCount(file.size), file_extension: file.name.split(".").pop()?.toLowerCase() || "unknown", entry_point: "upload_card" });
    track("check_started", { source: "upload" });
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
      const message = err instanceof Error ? err.message : "Something went wrong while parsing this CSV.";
      setParsed(null);
      setResult(null);
      setError(message);
      track("upload_rejected", { reason: message, size_bucket: bucketCount(file.size) });
    } finally {
      setIsChecking(false);
    }
  }

  function loadSample(sample: (typeof sampleLoaders)[number]) {
    setFileName(sample.fileName);
    setError("");
    setIsChecking(true);
    track("sample_loaded", { sample: sample.fileName, location: "upload_card" });
    track("check_started", { source: "sample" });
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
      const message = err instanceof Error ? err.message : "Could not load the sample CSV.";
      setParsed(null);
      setResult(null);
      setError(message);
      track("upload_rejected", { reason: message, size_bucket: "sample" });
    } finally {
      setIsChecking(false);
    }
  }

  function downloadSample(sample: (typeof sampleLoaders)[number]) {
    track("sample_downloaded", { sample: sample.fileName, source: "dynamic", location: "upload_card" });
    downloadTextFile(sample.fileName, sample.csv(), "text/csv;charset=utf-8");
  }

  function trackGuideClick(targetPath: string, anchorText: string, sourceSection: string) {
    track("guide_link_clicked", { target_path: targetPath, anchor_text: anchorText, source_section: sourceSection });
  }

  function updateSeverityFilter(severity: SeverityFilter) {
    setSeverityFilter(severity);
    track("issue_filter_changed", { filter_type: "severity", filter_value: severity, risk_status: result?.riskStatus || "none" });
  }

  function updateFieldFilter(value: string) {
    setFieldFilter(value);
    track("issue_filter_changed", { filter_type: "field", filter_value: value, risk_status: result?.riskStatus || "none" });
  }

  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim().length >= 3) {
      track("issue_search_used", { query_length_bucket: bucketCount(value.trim().length), risk_status: result?.riskStatus || "none" });
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
    <main className="min-h-screen">
      <noscript>
        <div className="mx-auto max-w-7xl px-6 py-4 text-sm text-red-800">
          JavaScript is required to check CSV files locally in your browser. You can still read the guide pages and download the CSV checklist.
        </div>
      </noscript>
      <section className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">Free local preflight checker</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">Google Ads Offline Conversion CSV Checker</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              Upload a CSV locally in your browser to catch common Google Ads offline conversion import risks before you try to import: missing fields, invalid conversion times, old or empty click IDs, unhashed user data, duplicate rows, and value or currency formatting issues.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#csv-upload" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Upload CSV locally</a>
              <a href={guideLinks.templateChecklist} onClick={() => trackGuideClick(guideLinks.templateChecklist, "Download CSV template checklist", "hero")} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">Download CSV template checklist</a>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><strong>Privacy:</strong> Your CSV stays in your browser. No Google Ads login, no server upload, no row-level storage by this tool. <a href={guideLinks.privacy} onClick={() => trackGuideClick(guideLinks.privacy, "how local CSV processing works", "privacy_notice")} className="font-semibold underline">How local processing works</a>.</div>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">This tool checks your CSV locally before upload. It cannot verify account-level settings, conversion action ownership, click ownership, consent, permissions, or final attribution inside Google Ads. <a href={guideLinks.faq} onClick={() => trackGuideClick(guideLinks.faq, "what this checker can and cannot verify", "hero_limitations")} className="font-semibold underline">What it can and cannot verify</a>.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <label htmlFor="csv-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50">
              <span className="text-lg font-semibold text-slate-950">Upload CSV locally</span>
              <span className="mt-2 text-sm text-slate-600">CSV only · up to 10MB · processed locally in your browser when possible</span>
              <input id="csv-upload" type="file" accept=".csv,text/csv" onChange={handleFileChange} className="sr-only" />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">{sampleLoaders.map((sample) => <button key={sample.fileName} type="button" onClick={() => loadSample(sample)} aria-label={`Load ${sample.fileName} sample`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">{sample.label}</button>)}</div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Download fresh sample CSV files</p>
              <p className="mt-1 text-xs text-slate-500">These downloads are generated with relative dates so the examples stay useful over time.</p>
              <div className="mt-3 flex flex-wrap gap-3">{sampleLoaders.map((sample) => <button key={sample.staticPath} type="button" onClick={() => downloadSample(sample)} aria-label={`Download ${sample.fileName}`} className="text-left text-sm font-medium text-blue-700 hover:text-blue-900">{sample.fileName}</button>)}</div>
            </div>
            {isChecking && <div role="status" aria-live="polite" className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">Checking your CSV locally… parsing rows, detecting fields, and running validation rules in a browser worker when possible.</div>}
            {error && <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            {parsed && result && <FileSnapshot fileName={fileName} parsed={parsed} mapping={result.mapping} />}
          </div>
        </div>
        {parsed && result && (
          <section className="mt-10 space-y-8" aria-labelledby="results-title">
            <h2 id="results-title" className="sr-only">CSV check results</h2>
            <ResultsSummary parsed={parsed} result={result} />
            <FixGuidance result={result} onGuideClick={trackGuideClick} />
            <FieldMappingPanel mapping={result.mapping} headers={parsed.headers} />
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-bold text-slate-950">Detected issues</h2><p className="mt-1 text-sm text-slate-600">Filter by severity or field, search issue text, then download the full issue report. Review the report before sharing because it may include row-level values from your CSV.</p></div><button type="button" onClick={downloadReport} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Download full report CSV</button></div>
              <div className="mt-6 grid gap-3 lg:grid-cols-[auto_220px_1fr] lg:items-center">
                <div className="flex flex-wrap gap-2">{(["all", "critical", "warning", "info"] as SeverityFilter[]).map((severity) => <button key={severity} type="button" aria-pressed={severityFilter === severity} onClick={() => updateSeverityFilter(severity)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${severityFilter === severity ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{severity}</button>)}</div>
                <label className="sr-only" htmlFor="field-filter">Filter issues by field</label>
                <select id="field-filter" value={fieldFilter} onChange={(event) => updateFieldFilter(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none ring-blue-500 focus:ring-2"><option value="all">All fields</option>{fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}</select>
                <label className="sr-only" htmlFor="issue-search">Search detected issues</label>
                <input id="issue-search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search row, field, rule, or message…" className="min-w-0 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none ring-blue-500 focus:ring-2" />
              </div>
              {filteredIssues.length > DISPLAY_LIMIT && <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">Showing the first {DISPLAY_LIMIT.toLocaleString()} matching issues for browser performance. The downloaded report includes all {result.issues.length.toLocaleString()} detected issues.</p>}
              <IssuesTable issues={visibleIssues} />
            </div>
          </section>
        )}
        <HomepageContent onGuideClick={trackGuideClick} />
        <footer className="mt-14 flex flex-col gap-3 border-t border-slate-200 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between"><p>Built for local CSV preflight checks before Google Ads offline conversion import. Not affiliated with Google.</p><div className="flex flex-wrap gap-4"><a href="/faq" className="font-medium text-blue-700 hover:text-blue-900">FAQ</a><a href="/guide" className="font-medium text-blue-700 hover:text-blue-900">Guides</a><a href="/privacy" className="font-medium text-blue-700 hover:text-blue-900">Privacy</a><a href="/contact" className="font-medium text-blue-700 hover:text-blue-900">Contact</a></div></footer>
      </section>
    </main>
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

function FixGuidance({ result, onGuideClick }: { result: ValidationResult; onGuideClick: (targetPath: string, anchorText: string, sourceSection: string) => void }) {
  const criticalCount = result.issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = result.issues.filter((issue) => issue.severity === "warning").length;
  const hasTimeIssue = result.issues.some((issue) => issue.id.includes("TIME") || issue.id.includes("OLD_CLICK"));
  const hasIdentifierIssue = result.issues.some((issue) => issue.id.includes("IDENTIFIER") || issue.id.includes("CLICK_ID") || issue.id.includes("GCLID"));
  const hasUserDataIssue = result.issues.some((issue) => issue.id.includes("EMAIL") || issue.id.includes("PHONE") || issue.id.includes("HASH"));
  const suggestions = [
    criticalCount > 0 ? `Fix ${criticalCount} critical issue${criticalCount === 1 ? "" : "s"} before uploading this CSV.` : "No critical CSV-level issues were found.",
    warningCount > 0 ? `Review ${warningCount} warning${warningCount === 1 ? "" : "s"}, especially old conversion times, suspicious identifiers, and duplicate rows.` : "No warnings are currently visible in this report.",
    "After editing your CSV, rerun it here before importing it into Google Ads.",
  ];

  return (
    <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6" aria-labelledby="fix-guidance-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 id="fix-guidance-title" className="text-2xl font-bold text-slate-950">Fix critical issues first</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">This report checks CSV-level formatting and data risks only. It does not verify your Google Ads conversion action, click ownership, account permissions, consent settings, or final attribution.</p>
        </div>
        <a href={guideLinks.uploadErrors} onClick={() => onGuideClick(guideLinks.uploadErrors, "Fix common upload errors", "result_fix_guidance")} className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">Fix common upload errors</a>
      </div>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">{suggestions.map((suggestion) => <li key={suggestion} className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">{suggestion}</li>)}</ul>
      <div className="mt-5 flex flex-wrap gap-3">
        {hasTimeIssue && <a href={`${guideLinks.uploadErrors}#conversion-time`} onClick={() => onGuideClick(`${guideLinks.uploadErrors}#conversion-time`, "Conversion time format examples", "result_fix_guidance")} className="text-sm font-semibold text-blue-800 underline">Conversion time format examples</a>}
        {hasIdentifierIssue && <a href={guideLinks.templateChecklist} onClick={() => onGuideClick(guideLinks.templateChecklist, "Identifier and required column checklist", "result_fix_guidance")} className="text-sm font-semibold text-blue-800 underline">Identifier and required column checklist</a>}
        {hasUserDataIssue && <a href={guideLinks.enhancedConversions} onClick={() => onGuideClick(guideLinks.enhancedConversions, "Enhanced conversions CSV errors", "result_fix_guidance")} className="text-sm font-semibold text-blue-800 underline">Enhanced conversions CSV errors</a>}
      </div>
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
  return (
    <>
      <div className="mt-6 grid gap-3 md:hidden">{issues.map((issue, index) => <article key={`${issue.id}-${issue.rowNumber ?? "file"}-${issue.field ?? ""}-${index}-card`} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${severityClass(issue.severity)}`}>{issue.severity}</span><span className="text-xs text-slate-500">Row {issue.rowNumber ?? "File"}</span></div><p className="mt-3 font-semibold text-slate-950">{issue.message}</p><p className="mt-2 text-sm text-slate-700">{issue.suggestion}</p>{issue.field && <p className="mt-3 text-xs text-slate-500">Field: {issue.field}</p>}{issue.currentValue && <p className="mt-2 truncate font-mono text-xs text-slate-500" title={issue.currentValue}>Current value: {issue.currentValue}</p>}</article>)}</div>
      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-200 md:block"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Row</th><th className="px-4 py-3">Field</th><th className="px-4 py-3">Issue</th><th className="px-4 py-3">Suggested fix</th><th className="px-4 py-3">Current value</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{issues.map((issue, index) => <tr key={`${issue.id}-${issue.rowNumber ?? "file"}-${issue.field ?? ""}-${index}`}><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${severityClass(issue.severity)}`}>{issue.severity}</span></td><td className="px-4 py-3 text-slate-700">{issue.rowNumber ?? "File"}</td><td className="px-4 py-3 text-slate-700">{issue.field ?? "—"}</td><td className="max-w-md px-4 py-3 font-medium text-slate-950">{issue.message}</td><td className="max-w-md px-4 py-3 text-slate-700">{issue.suggestion}</td><td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-500" title={issue.currentValue}>{issue.currentValue ?? "—"}</td></tr>)}</tbody></table></div>
    </>
  );
}

function HomepageContent({ onGuideClick }: { onGuideClick: (targetPath: string, anchorText: string, sourceSection: string) => void }) {
  return (
    <div className="mt-14 space-y-12">
      <section aria-labelledby="checks-title">
        <div className="max-w-3xl"><h2 id="checks-title" className="text-3xl font-bold tracking-tight text-slate-950">What this checker validates</h2><p className="mt-3 text-sm leading-6 text-slate-700">Use this as a local preflight step before Google Ads offline conversion import. It focuses on CSV structure, field detection, row-level formatting, and high-risk data quality issues.</p></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{validationChecks.map((item) => <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{item.body}</p><a href={item.href} onClick={() => onGuideClick(item.href, item.anchor, "validation_checks")} className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">{item.anchor}</a></article>)}</div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start" aria-labelledby="errors-title">
        <div><h2 id="errors-title" className="text-3xl font-bold tracking-tight text-slate-950">Common Google Ads CSV upload errors</h2><p className="mt-3 text-sm leading-6 text-slate-700">Many offline conversion imports fail because the CSV looks valid at a glance but contains missing fields, wrong timestamps, unusable identifiers, or duplicate rows. This checker highlights those issues before you upload.</p><a href={guideLinks.uploadErrors} onClick={() => onGuideClick(guideLinks.uploadErrors, "fix common Google Ads CSV upload errors", "common_errors")} className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">See upload error guide</a></div>
        <ul className="grid gap-3 md:grid-cols-2">{commonErrors.map((item) => <li key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">{item}</li>)}</ul>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="report-title"><h2 id="report-title" className="text-3xl font-bold tracking-tight text-slate-950">How to read the report</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-900"><strong>Critical:</strong> Fix before upload. These rows or files are most likely to fail import or be unusable.</div><div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Warning:</strong> Review before upload. These rows may import but still carry attribution, formatting, or data-quality risk.</div><div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900"><strong>Info:</strong> Human review recommended. These items usually need workflow confirmation rather than automatic blocking.</div></div></section>
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6" aria-labelledby="limitations-title"><h2 id="limitations-title" className="text-3xl font-bold tracking-tight text-slate-950">What this tool cannot verify</h2><p className="mt-3 text-sm leading-6 text-slate-800">This tool does not connect to Google Ads and cannot verify conversion action ownership, account permissions, click ownership, consent mode, enhanced conversions account setup, or final attribution. Treat it as a CSV preflight checker, not an official Google Ads upload validator.</p><p className="mt-3 text-sm leading-6 text-slate-800">Last updated: May 2026. Validation rules should be reviewed when Google Ads import requirements or field naming conventions change.</p></section>
      <section aria-labelledby="faq-title"><h2 id="faq-title" className="text-3xl font-bold tracking-tight text-slate-950">FAQ</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{faqItems.map((item, index) => <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onToggle={(event) => { if (event.currentTarget.open) track("faq_expand", { question_id: `home_${index + 1}` }); }}><summary className="cursor-pointer font-bold text-slate-950">{item.question}</summary><p className="mt-3 text-sm leading-6 text-slate-700">{item.answer}</p></details>)}</div></section>
    </div>
  );
}

function severityClass(severity: ValidationIssue["severity"]) {
  if (severity === "critical") return "bg-red-100 text-red-800";
  if (severity === "warning") return "bg-amber-100 text-amber-800";
  return "bg-blue-100 text-blue-800";
}
