import type { FieldMapping, ValidationIssue } from "../types";
import { get, issue } from "./helpers";

const iso4217Currencies = new Set([
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD",
  "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUP", "CVE", "CZK",
  "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR",
  "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD",
  "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK",
  "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT",
  "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN",
  "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG",
  "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL",
  "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS",
  "UAH", "UGX", "USD", "USN", "UYI", "UYU", "UYW", "UZS", "VED", "VES", "VND", "VUV",
  "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XOF", "XPD", "XPF", "XPT", "XSU", "XTS", "XUA", "XXX",
  "YER", "ZAR", "ZMW", "ZWG",
]);

export function checkValueCurrency(row: Record<string, string>, mapping: FieldMapping, rowNumber: number, issues: ValidationIssue[]) {
  const value = get(row, mapping.conversion_value);
  const currency = get(row, mapping.conversion_currency);

  if (value) {
    const normalizedValue = value.replace(/[$,\s]/g, "");
    const numeric = Number(normalizedValue);
    if (!Number.isFinite(numeric)) {
      issues.push(issue("INVALID_CONVERSION_VALUE", "critical", "Conversion Value is not numeric.", "Use a numeric value without currency symbols or text.", { rowNumber, field: mapping.conversion_value, currentValue: value }));
    } else {
      const decimalPart = normalizedValue.match(/^-?\d+\.(\d+)$/)?.[1] ?? "";
      if (decimalPart.length > 2) {
        issues.push(issue("CONVERSION_VALUE_PRECISION", "warning", "Conversion Value has more than two decimal places.", "Review whether this precision is intended. Currency values are usually exported with at most two decimal places before Google Ads import.", { rowNumber, field: mapping.conversion_value, currentValue: value }));
      }

      if (numeric < 0) {
        issues.push(issue("NEGATIVE_CONVERSION_VALUE", "warning", "Conversion Value is negative.", "Check if negative values are intended for your import workflow.", { rowNumber, field: mapping.conversion_value, currentValue: value }));
      }
    }

    if (!mapping.conversion_currency) {
      issues.push(issue("MISSING_CURRENCY_WITH_VALUE", "warning", "Conversion Value exists, but no currency column was detected.", "Add a Conversion Currency column with an ISO 4217 code such as USD, EUR, GBP, SGD, JPY, or TWD.", { rowNumber, field: "Conversion Currency" }));
    }
  }

  if (currency) {
    const normalizedCurrency = currency.toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      issues.push(issue("INVALID_CURRENCY", "critical", "Currency is not a three-letter ISO 4217 code.", "Use codes like USD, EUR, GBP, SGD, JPY, or TWD.", { rowNumber, field: mapping.conversion_currency, currentValue: currency }));
    } else if (!iso4217Currencies.has(normalizedCurrency)) {
      issues.push(issue("UNKNOWN_ISO_CURRENCY", "warning", "Currency has three letters but is not in the built-in ISO 4217 currency list.", "Check the currency code against the official currency expected by your Google Ads account.", { rowNumber, field: mapping.conversion_currency, currentValue: currency }));
    }
  }
}
