import type { FieldMapping, ValidationIssue } from "../types";
import { get, issue } from "./helpers";

export function checkValueCurrency(row: Record<string, string>, mapping: FieldMapping, rowNumber: number, issues: ValidationIssue[]) {
  const value = get(row, mapping.conversion_value);
  const currency = get(row, mapping.conversion_currency);

  if (value) {
    const numeric = Number(value.replace(/[$,\s]/g, ""));
    if (!Number.isFinite(numeric)) {
      issues.push(issue("INVALID_CONVERSION_VALUE", "warning", "Conversion Value is not numeric.", "Use a numeric value.", { rowNumber, field: mapping.conversion_value, currentValue: value }));
    } else if (numeric < 0) {
      issues.push(issue("NEGATIVE_CONVERSION_VALUE", "warning", "Conversion Value is negative.", "Check if negative values are intended.", { rowNumber, field: mapping.conversion_value, currentValue: value }));
    }

    if (!mapping.conversion_currency) {
      issues.push(issue("MISSING_CURRENCY_WITH_VALUE", "warning", "Conversion Value exists, but no currency column was detected.", "Add Conversion Currency column.", { rowNumber, field: "Conversion Currency" }));
    }
  }

  if (currency && !/^[A-Z]{3}$/.test(currency.toUpperCase())) {
    issues.push(issue("INVALID_CURRENCY", "warning", "Currency does not look like a three-letter ISO 4217 code.", "Use codes like USD, EUR, GBP, SGD, or JPY.", { rowNumber, field: mapping.conversion_currency, currentValue: currency }));
  }
}
