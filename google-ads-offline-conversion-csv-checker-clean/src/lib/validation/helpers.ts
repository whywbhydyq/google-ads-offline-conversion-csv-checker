import type { FieldKey, FieldMapping, ValidationIssue } from "../types";

export function get(row: Record<string, string>, field?: string) {
  return field ? (row[field] ?? "").trim() : "";
}

export function firstValue(row: Record<string, string>, mapping: FieldMapping, keys: FieldKey[]) {
  for (const key of keys) {
    const value = get(row, mapping[key]);
    if (value) return value;
  }
  return "";
}

export function isSha256(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value.trim());
}

export function isLowercaseSha256(value: string) {
  return /^[a-f0-9]{64}$/.test(value.trim());
}

export function looksLikeBrokenHash(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 32 && /^[a-fA-F0-9]+$/.test(trimmed) && !isSha256(trimmed);
}

export function issue(
  id: string,
  severity: ValidationIssue["severity"],
  message: string,
  suggestion: string,
  extra: Partial<ValidationIssue> = {},
): ValidationIssue {
  return { id, severity, message, suggestion, ...extra };
}

export function dedupeIssues(issues: ValidationIssue[]) {
  const seen = new Set<string>();
  return issues.filter((item) => {
    const key = [item.id, item.severity, item.rowNumber ?? "", item.field ?? "", item.currentValue ?? "", item.message].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sortIssues(a: ValidationIssue, b: ValidationIssue) {
  const order = { critical: 0, warning: 1, info: 2 };
  return order[a.severity] - order[b.severity] || (a.rowNumber ?? 0) - (b.rowNumber ?? 0);
}
