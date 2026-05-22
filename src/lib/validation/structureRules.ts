import type { ParsedCsv, ValidationIssue } from "../types";
import { normalizeHeader } from "./fieldDetection";
import { issue } from "./helpers";

export function checkStructure(parsed: ParsedCsv): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!parsed.rawRows.length) {
    return [issue("CSV_EMPTY", "critical", "The CSV file is empty.", "Upload a CSV with headers and rows.")];
  }

  const seen = new Map<string, number>();
  parsed.headers.forEach((header, index) => {
    if (!header.trim()) {
      issues.push(issue("EMPTY_HEADERS", "critical", "A header cell is empty.", "Add names to all columns.", { field: `Column ${index + 1}` }));
    }

    const key = normalizeHeader(header);
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (key && (seen.get(key) ?? 0) > 1) {
      issues.push(issue("DUPLICATE_HEADERS", "critical", `The header "${header}" appears more than once.`, "Rename duplicated columns.", { field: header }));
    }
  });

  parsed.rawRows.slice(1).forEach((row, index) => {
    if (row.length !== parsed.headers.length) {
      issues.push(
        issue(
          "ROW_LENGTH_MISMATCH",
          "warning",
          `This row has ${row.length} columns, but the header has ${parsed.headers.length}.`,
          "Check extra commas, missing values, or broken quotes.",
          { rowNumber: index + 2, currentValue: row.join(",") },
        ),
      );
    }
  });

  return issues;
}
