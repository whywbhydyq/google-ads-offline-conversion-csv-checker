import type { ParsedCsv, ValidationIssue, ValidationModeInput, ValidationResult } from "./types";
import { detectFields, normalizeHeader } from "./validation/fieldDetection";
import { dedupeIssues, sortIssues } from "./validation/helpers";
import { resolveValidationMode } from "./validation/modes";
import { checkRequired } from "./validation/requiredFieldRules";
import { checkRows } from "./validation/rowRules";
import { checkStructure } from "./validation/structureRules";

export { detectFields, normalizeHeader };
export { getValidationModeCopy } from "./validation/modes";

export function validateCsv(parsed: ParsedCsv, requestedMode: ValidationModeInput = "auto"): ValidationResult {
  const mapping = detectFields(parsed.headers);
  const mode = resolveValidationMode(mapping, parsed.rows, requestedMode);
  const issues = dedupeIssues([
    ...checkStructure(parsed),
    ...checkRequired(parsed, mapping, mode),
    ...checkRows(parsed, mapping, mode),
  ]).sort(sortIssues);

  const criticalRows = new Set(
    issues.filter((issue: ValidationIssue) => issue.severity === "critical" && issue.rowNumber).map((issue) => issue.rowNumber),
  );
  const hasFileBlockingCritical = issues.some((issue) => issue.severity === "critical" && !issue.rowNumber);
  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const readyRows = hasFileBlockingCritical ? 0 : Math.max(parsed.rawRowCount - criticalRows.size, 0);
  const riskStatus =
    criticalCount > 10 || (parsed.rawRowCount > 0 && criticalCount / parsed.rawRowCount > 0.2)
      ? "High Risk"
      : criticalCount || warningCount > 10
        ? "Needs Fix"
        : "No CSV blockers";

  return { issues, mapping, mode, requestedMode, readyRows, riskStatus };
}
