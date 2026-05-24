import Papa from "papaparse";
import type { ParsedCsv, ValidationIssue } from "./types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const DANGEROUS_CSV_PREFIX = /^[=+\-@\t\r]/;

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please upload a CSV file.");
  if (file.size === 0) throw new Error("This file appears to be empty.");
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("This file is too large for the browser checker. Try a smaller file.");
  }

  return parseCsvText(await file.text());
}

export function parseCsvText(text: string): ParsedCsv {
  const cleanText = text.replace(/^\uFEFF/, "");
  if (!cleanText.trim()) throw new Error("This file appears to be empty.");

  const result = Papa.parse<string[]>(cleanText, { skipEmptyLines: "greedy" });
  if (result.errors.length) {
    throw new Error(
      `We could not parse this CSV. Check delimiters, quotes, or encoding. ${result.errors[0]?.message || ""}`,
    );
  }

  const rawRows = result.data.filter((row) => row.some((cell) => String(cell ?? "").trim()));
  if (!rawRows.length) throw new Error("This file appears to be empty.");

  const headers = (rawRows[0] ?? []).map((h) => String(h ?? "").trim());
  if (!headers.length || headers.every((h) => !h)) throw new Error("No header row detected.");

  const rowKeys = makeRowKeys(headers);
  const rows = rawRows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    rowKeys.forEach((header, index) => {
      record[header] = String(row[index] ?? "").trim();
    });
    return record;
  });

  return { headers, rows, rawRows, rawRowCount: rows.length };
}

function makeRowKeys(headers: string[]) {
  const seen = new Map<string, number>();

  return headers.map((header, index) => {
    const baseKey = header || `__empty_header_${index + 1}`;
    const count = seen.get(baseKey) ?? 0;
    seen.set(baseKey, count + 1);
    return count === 0 ? baseKey : `${baseKey}__duplicate_${count + 1}`;
  });
}

export function exportIssuesCsv(issues: ValidationIssue[]): string {
  const headers = ["severity", "row_number", "field", "rule_id", "message", "suggested_fix", "current_value"];
  const rows = issues.map((issue) => [
    issue.severity,
    issue.rowNumber?.toString() ?? "",
    issue.field ?? "",
    issue.id,
    issue.message,
    issue.suggestion,
    issue.currentValue ?? "",
  ]);

  return "\uFEFF" + [headers, ...rows].map(csvLine).join("\n");
}

function csvLine(values: string[]) {
  return values.map(csvCell).join(",");
}

function csvCell(value: string) {
  const safeValue = DANGEROUS_CSV_PREFIX.test(value) ? `'${value}` : value;
  const escaped = safeValue.replaceAll('"', '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
