import type { FieldMapping, ParsedCsv, ValidationIssue } from "../types";
import { addressFields, identifierFields } from "./constants";
import { issue } from "./helpers";

export function checkRequired(parsed: ParsedCsv, mapping: FieldMapping): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!parsed.rawRowCount) {
    issues.push(issue("CSV_EMPTY", "critical", "The CSV has a header row but no data rows.", "Add at least one conversion row."));
  }

  if (!mapping.conversion_name) {
    issues.push(issue("MISSING_CONVERSION_NAME", "critical", "No Conversion Name column was detected.", "Add a Conversion Name column.", { field: "Conversion Name" }));
  }

  if (!mapping.conversion_time) {
    issues.push(issue("MISSING_CONVERSION_TIME", "critical", "No Conversion Time column was detected.", "Add a Conversion Time column.", { field: "Conversion Time" }));
  }

  const hasId = identifierFields.some((field) => mapping[field]);
  const hasAddress = addressFields.some((field) => mapping[field]);

  if (!hasId && !hasAddress) {
    issues.push(issue("MISSING_IDENTIFIER", "critical", "No click ID or user-provided identifier column was detected.", "Add at least one valid identifier such as GCLID, GBRAID, WBRAID, Email, Phone, or address data."));
  }

  if (!hasId && hasAddress && (!mapping.country || !mapping.zip)) {
    issues.push(issue("INCOMPLETE_ADDRESS", "warning", "Address-style user data was detected, but country or zip/postal code is missing.", "Add country and zip/postal code if available."));
  }

  return issues;
}
