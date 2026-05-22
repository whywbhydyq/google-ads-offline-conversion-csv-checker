import type { FieldKey, FieldMapping, ValidationIssue, ParsedCsv } from "../types";
import { clickIdFields, identifierFields } from "./constants";
import { get, firstValue, issue } from "./helpers";

export function checkIdentifiers(row: Record<string, string>, mapping: FieldMapping, rowNumber: number, issues: ValidationIssue[]) {
  const hasIdValue = identifierFields.some((field) => Boolean(get(row, mapping[field])));
  const hasAddressValue = ["first_name", "last_name", "street_address", "city", "state", "country", "zip"].some((field) => Boolean(get(row, mapping[field])));

  if (!hasIdValue && !hasAddressValue) {
    issues.push(issue("EMPTY_CLICK_ID", "critical", "No identifier value was found in this row.", "Add GCLID, GBRAID, WBRAID, Email, Phone, or user-provided address data.", { rowNumber }));
  }

  if (clickIdFields.filter((field) => Boolean(get(row, mapping[field]))).length > 1) {
    issues.push(issue("MULTIPLE_CLICK_IDS", "info", "This row has more than one click ID field populated.", "Verify the upload format and intended identifier.", { rowNumber }));
  }

  const gclid = get(row, mapping.gclid);
  if (gclid && (gclid.length < 10 || /[^A-Za-z0-9_-]/.test(gclid))) {
    issues.push(issue("SUSPICIOUS_GCLID", "warning", "GCLID length or characters look suspicious.", "Check the original Google click ID.", { rowNumber, field: mapping.gclid, currentValue: gclid }));
  }
}
