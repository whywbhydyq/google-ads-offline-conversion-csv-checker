import Papa from "papaparse";
import type { CsvParameter, ParsedCsv, ValidationIssue } from "./types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const DANGEROUS_CSV_PREFIX = /^[=+\-@\t\r]/;
const PARAMETER_ROW_PATTERN = /^parameters?\s*:\s*([^=]+?)\s*=\s*(.+)$/i;

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

  const parsedRows = result.data
    .map((row, index) => ({ cells: row.map((cell) => String(cell ?? "")), rowNumber: index + 1 }))
    .filter(({ cells }) => cells.some((cell) => cell.trim()));

  if (!parsedRows.length) throw new Error("This file appears to be empty.");

  const parameters: Record<string, string> = {};
  const parameterRows: CsvParameter[] = [];
  let headerIndex = 0;

  while (headerIndex < parsedRows.length) {
    const parameter = parseParameterRow(parsedRows[headerIndex].cells, parsedRows[headerIndex].rowNumber);
    if (!parameter) break;
    parameters[normalizeParameterName(parameter.name)] = parameter.value;
    parameterRows.push(parameter);
    headerIndex += 1;
  }

  const tableRows = parsedRows.slice(headerIndex);
  if (!tableRows.length) throw new Error("No header row detected after Google Ads parameter rows.");

  const headers = (tableRows[0]?.cells ?? []).map((h) => h.trim());
  if (!headers.length || headers.every((h) => !h)) throw new Error("No header row detected.");

  const rowKeys = makeRowKeys(headers);
  const dataRows = tableRows.slice(1);
  const rows = dataRows.map(({ cells }) => {
    const record: Record<string, string> = {};
    rowKeys.forEach((header, index) => {
      record[header] = String(cells[index] ?? "").trim();
    });
    return record;
  });

  return {
    headers,
    rows,
    rawRows: tableRows.map(({ cells }) => cells),
    rawRowCount: rows.length,
    rowNumbers: dataRows.map(({ rowNumber }) => rowNumber),
    headerRowNumber: tableRows[0].rowNumber,
    parameters,
    parameterRows,
  };
}

function parseParameterRow(cells: string[], rowNumber: number): CsvParameter | null {
  const firstCell = (cells[0] ?? "").trim();
  if (!firstCell) return null;
  if (cells.slice(1).some((cell) => cell.trim())) return null;

  const match = firstCell.match(PARAMETER_ROW_PATTERN);
  if (!match) return null;

  return {
    name: match[1].trim(),
    value: match[2].trim(),
    raw: firstCell,
    rowNumber,
  };
}

function normalizeParameterName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
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
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
