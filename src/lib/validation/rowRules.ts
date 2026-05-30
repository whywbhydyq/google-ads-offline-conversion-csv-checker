import type { FieldMapping, ParsedCsv, ValidationIssue, ValidationMode } from "../types";
import { checkDuplicateConversion, checkDuplicateOrderId } from "./duplicateRules";
import { get, issue } from "./helpers";
import { hasAnyAddressValue, hasClickIdValue, hasUserIdentifierValue } from "./identifierHelpers";
import { checkIdentifiers } from "./identifierRules";
import { getValidationModeCopy } from "./modes";
import { checkTime, isValidFileTimezone } from "./timeRules";
import { checkUserData } from "./userDataRules";
import { checkValueCurrency } from "./valueRules";

export function checkRows(parsed: ParsedCsv, mapping: FieldMapping, mode: ValidationMode): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const conversions = new Map<string, number>();
  const orderIds = new Map<string, number>();
  const modeCopy = getValidationModeCopy(mode);
  const fileTimezone = parsed.parameters.timezone ?? "";

  if (fileTimezone && !isValidFileTimezone(fileTimezone)) {
    issues.push(issue("INVALID_FILE_TIMEZONE_PARAMETER", "warning", `Parameters:TimeZone=${fileTimezone} does not look like a valid timezone ID or GMT offset.`, "Use an IANA timezone ID such as America/Los_Angeles, Europe/London, or Asia/Taipei; use a GMT offset such as -0500; or include timezone offsets in each Conversion Time value.", { field: "Parameters:TimeZone", currentValue: fileTimezone }));
  }

  parsed.rows.forEach((row, index) => {
    const rowNumber = parsed.rowNumbers[index] ?? index + parsed.headerRowNumber + 1;
    const conversionName = get(row, mapping.conversion_name);

    if (mapping.conversion_name && !conversionName) {
      issues.push(issue("MISSING_CONVERSION_NAME", "critical", "Conversion Name is empty.", "Add the conversion action name used in Google Ads.", { rowNumber, field: mapping.conversion_name }));
    }

    if (mapping.conversion_time) {
      checkTime(get(row, mapping.conversion_time), mapping.conversion_time, rowNumber, issues, getAgeLimitDaysForRow(row, mapping, mode, modeCopy.ageLimitDays), fileTimezone);
    }

    checkIdentifiers(row, mapping, mode, rowNumber, issues);
    checkUserData(row, mapping, mode, rowNumber, issues);
    checkValueCurrency(row, mapping, rowNumber, issues);
    checkDuplicateConversion(row, mapping, rowNumber, conversions, issues);
    checkDuplicateOrderId(row, mapping, rowNumber, orderIds, issues);
  });

  return issues;
}

function getAgeLimitDaysForRow(row: Record<string, string>, mapping: FieldMapping, mode: ValidationMode, defaultAgeLimitDays: number) {
  if (mode !== "mixed_identifiers") return defaultAgeLimitDays;

  const hasClickId = hasClickIdValue(row, mapping);
  const hasUserData = hasUserIdentifierValue(row, mapping) || hasAnyAddressValue(row, mapping);

  if (hasClickId && !hasUserData) return 90;
  if (hasUserData) return 63;
  return defaultAgeLimitDays;
}
