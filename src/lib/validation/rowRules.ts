import type { FieldMapping, ParsedCsv, ValidationIssue } from "../types";
import { checkDuplicateConversion, checkDuplicateOrderId } from "./duplicateRules";
import { get, issue } from "./helpers";
import { checkIdentifiers } from "./identifierRules";
import { checkTime } from "./timeRules";
import { checkUserData } from "./userDataRules";
import { checkValueCurrency } from "./valueRules";

export function checkRows(parsed: ParsedCsv, mapping: FieldMapping): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const conversions = new Map<string, number>();
  const orderIds = new Map<string, number>();

  parsed.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const conversionName = get(row, mapping.conversion_name);

    if (mapping.conversion_name && !conversionName) {
      issues.push(issue("MISSING_CONVERSION_NAME", "critical", "Conversion Name is empty.", "Add the conversion action name used in Google Ads.", { rowNumber, field: mapping.conversion_name }));
    }

    if (mapping.conversion_time) {
      checkTime(get(row, mapping.conversion_time), mapping.conversion_time, rowNumber, issues);
    }

    checkIdentifiers(row, mapping, rowNumber, issues);
    checkUserData(row, mapping, rowNumber, issues);
    checkValueCurrency(row, mapping, rowNumber, issues);
    checkDuplicateConversion(row, mapping, rowNumber, conversions, issues);
    checkDuplicateOrderId(row, mapping, rowNumber, orderIds, issues);
  });

  return issues;
}
