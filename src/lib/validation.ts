import { DateTime } from "luxon";
import type { FieldKey, FieldMapping, ParsedCsv, ValidationIssue, ValidationResult } from "./types";

const aliases: Record<FieldKey, string[]> = {
  gclid: ["gclid", "google click id", "google_click_id"],
  gbraid: ["gbraid"],
  wbraid: ["wbraid"],
  conversion_name: ["conversion name", "conversion action", "conversion_action", "conversion"],
  conversion_time: ["conversion time", "conversion timestamp", "date", "converted at", "conversion_date", "conversion date"],
  conversion_value: ["conversion value", "value", "amount", "revenue", "sale amount"],
  conversion_currency: ["conversion currency", "currency", "currency code"],
  order_id: ["order id", "order_id", "transaction id", "transaction_id"],
  email: ["email", "email address", "customer email"],
  phone: ["phone", "phone number", "mobile", "customer phone"],
  first_name: ["first name", "firstname", "fname"],
  last_name: ["last name", "lastname", "lname"],
  street_address: ["street address", "address", "address line 1"],
  city: ["city"],
  state: ["state", "province", "region"],
  country: ["country", "country code"],
  zip: ["zip", "postal code", "postcode", "zipcode"],
};

const identifiers: FieldKey[] = ["gclid", "gbraid", "wbraid", "email", "phone"];
const clickIds: FieldKey[] = ["gclid", "gbraid", "wbraid"];
const address: FieldKey[] = ["first_name", "last_name", "street_address", "city", "state", "country", "zip"];

export function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/^\uFEFF/, "").replace(/[_-]+/g, " ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function detectFields(headers: string[]): FieldMapping {
  const normalized = headers.map((original) => ({ original, value: normalizeHeader(original) }));
  const mapping: FieldMapping = {};
  for (const [key, names] of Object.entries(aliases) as [FieldKey, string[]][]) {
    const namesSet = new Set(names.map(normalizeHeader));
    const found = normalized.find((header) => namesSet.has(header.value));
    if (found) mapping[key] = found.original;
  }
  return mapping;
}

export function validateCsv(parsed: ParsedCsv): ValidationResult {
  const mapping = detectFields(parsed.headers);
  const issues = dedupe([...checkStructure(parsed), ...checkRequired(parsed, mapping), ...checkRows(parsed, mapping)]).sort(sortIssues);
  const criticalRows = new Set(issues.filter((issue) => issue.severity === "critical" && issue.rowNumber).map((issue) => issue.rowNumber));
  const hasFileBlockingCritical = issues.some((issue) => issue.severity === "critical" && !issue.rowNumber);
  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const readyRows = hasFileBlockingCritical ? 0 : Math.max(parsed.rawRowCount - criticalRows.size, 0);
  const riskStatus = criticalCount > 10 || (parsed.rawRowCount > 0 && criticalCount / parsed.rawRowCount > 0.2) ? "High Risk" : criticalCount || warningCount > 10 ? "Needs Fix" : "Ready";
  return { issues, mapping, readyRows, riskStatus };
}

function checkStructure(parsed: ParsedCsv): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!parsed.rawRows.length) return [issue("CSV_EMPTY", "critical", "The CSV file is empty.", "Upload a CSV with headers and rows.")];
  const seen = new Map<string, number>();
  parsed.headers.forEach((header, index) => {
    if (!header.trim()) issues.push(issue("EMPTY_HEADERS", "critical", "A header cell is empty.", "Add names to all columns.", { field: `Column ${index + 1}` }));
    const key = normalizeHeader(header);
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (key && (seen.get(key) ?? 0) > 1) issues.push(issue("DUPLICATE_HEADERS", "critical", `The header "${header}" appears more than once.`, "Rename duplicated columns.", { field: header }));
  });
  parsed.rawRows.slice(1).forEach((row, index) => {
    if (row.length !== parsed.headers.length) issues.push(issue("ROW_LENGTH_MISMATCH", "warning", `This row has ${row.length} columns, but the header has ${parsed.headers.length}.`, "Check extra commas, missing values, or broken quotes.", { rowNumber: index + 2, currentValue: row.join(",") }));
  });
  return issues;
}

function checkRequired(parsed: ParsedCsv, mapping: FieldMapping): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!parsed.rawRowCount) issues.push(issue("CSV_EMPTY", "critical", "The CSV has a header row but no data rows.", "Add at least one conversion row."));
  if (!mapping.conversion_name) issues.push(issue("MISSING_CONVERSION_NAME", "critical", "No Conversion Name column was detected.", "Add a Conversion Name column.", { field: "Conversion Name" }));
  if (!mapping.conversion_time) issues.push(issue("MISSING_CONVERSION_TIME", "critical", "No Conversion Time column was detected.", "Add a Conversion Time column.", { field: "Conversion Time" }));
  const hasId = identifiers.some((field) => mapping[field]);
  const hasAddress = address.some((field) => mapping[field]);
  if (!hasId && !hasAddress) issues.push(issue("MISSING_IDENTIFIER", "critical", "No click ID or user-provided identifier column was detected.", "Add at least one valid identifier such as GCLID, GBRAID, WBRAID, Email, Phone, or address data."));
  if (!hasId && hasAddress && (!mapping.country || !mapping.zip)) issues.push(issue("INCOMPLETE_ADDRESS", "warning", "Address-style user data was detected, but country or zip/postal code is missing.", "Add country and zip/postal code if available."));
  return issues;
}

function checkRows(parsed: ParsedCsv, mapping: FieldMapping): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const conversions = new Map<string, number>();
  const orderIds = new Map<string, number>();
  parsed.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const conversionName = get(row, mapping.conversion_name);
    const conversionTime = get(row, mapping.conversion_time);
    if (mapping.conversion_name && !conversionName) issues.push(issue("MISSING_CONVERSION_NAME", "critical", "Conversion Name is empty.", "Add the conversion action name used in Google Ads.", { rowNumber, field: mapping.conversion_name }));
    if (mapping.conversion_time) checkTime(conversionTime, mapping.conversion_time, rowNumber, issues);
    checkIdentifiers(row, mapping, rowNumber, issues);
    checkUserData(row, mapping, rowNumber, issues);
    checkValueCurrency(row, mapping, rowNumber, issues);
    const identifier = firstValue(row, mapping, identifiers);
    if (identifier && conversionName && conversionTime) {
      const key = `${identifier}__${conversionName}__${conversionTime}`.toLowerCase();
      const firstRow = conversions.get(key);
      if (firstRow) issues.push(issue("DUPLICATE_CONVERSION", "warning", `This conversion appears to duplicate row ${firstRow}.`, "Remove duplicate rows or use a unique Order ID.", { rowNumber, currentValue: key }));
      else conversions.set(key, rowNumber);
    }
    const orderId = get(row, mapping.order_id);
    if (orderId) {
      const firstRow = orderIds.get(orderId.toLowerCase());
      if (firstRow) issues.push(issue("DUPLICATE_ORDER_ID", "warning", `Order ID duplicates row ${firstRow}.`, "Verify whether this duplicate Order ID is intentional.", { rowNumber, field: mapping.order_id, currentValue: orderId }));
      else orderIds.set(orderId.toLowerCase(), rowNumber);
    }
  });
  return issues;
}

function checkTime(value: string, field: string, rowNumber: number, issues: ValidationIssue[]) {
  if (!value) return issues.push(issue("INVALID_CONVERSION_TIME", "critical", "Conversion Time is empty.", "Use a supported date/time format.", { rowNumber, field }));
  const parsed = parseDate(value);
  if (!parsed) return issues.push(issue("INVALID_CONVERSION_TIME", "critical", "Conversion Time could not be parsed.", "Use formats such as 2026-05-22 14:30:00 or 2026-05-22 14:30:00+08:00.", { rowNumber, field, currentValue: value }));
  const now = DateTime.now();
  if (parsed.toMillis() > now.plus({ minutes: 1 }).toMillis()) issues.push(issue("FUTURE_CONVERSION_TIME", "critical", "Conversion Time is in the future.", "Use the actual past conversion time.", { rowNumber, field, currentValue: value }));
  if (parsed.toMillis() < now.minus({ days: 90 }).toMillis()) issues.push(issue("OLD_CLICK_TIME_RISK", "warning", "Conversion Time is more than 90 days old.", "Google Ads may reject old click-based conversions.", { rowNumber, field, currentValue: value }));
  if (/^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim())) issues.push(issue("DATE_ONLY_TIME", "warning", "Conversion Time contains only a date.", "Add time of day for better accuracy.", { rowNumber, field, currentValue: value }));
  if (!/(?:z|[+-]\d{2}:?\d{2})$/i.test(value.trim())) issues.push(issue("MISSING_TIMEZONE", "warning", "Conversion Time does not include a timezone.", "Include timezone when possible, for example +08:00.", { rowNumber, field, currentValue: value }));
}

function checkIdentifiers(row: Record<string, string>, mapping: FieldMapping, rowNumber: number, issues: ValidationIssue[]) {
  const hasIdValue = identifiers.some((field) => Boolean(get(row, mapping[field])));
  const hasAddressValue = address.some((field) => Boolean(get(row, mapping[field])));
  if (!hasIdValue && !hasAddressValue) issues.push(issue("EMPTY_CLICK_ID", "critical", "No identifier value was found in this row.", "Add GCLID, GBRAID, WBRAID, Email, Phone, or user-provided address data.", { rowNumber }));
  if (clickIds.filter((field) => Boolean(get(row, mapping[field]))).length > 1) issues.push(issue("MULTIPLE_CLICK_IDS", "info", "This row has more than one click ID field populated.", "Verify the upload format and intended identifier.", { rowNumber }));
  const gclid = get(row, mapping.gclid);
  if (gclid && (gclid.length < 10 || /[^A-Za-z0-9_-]/.test(gclid))) issues.push(issue("SUSPICIOUS_GCLID", "warning", "GCLID length or characters look suspicious.", "Check the original Google click ID.", { rowNumber, field: mapping.gclid, currentValue: gclid }));
}

function checkUserData(row: Record<string, string>, mapping: FieldMapping, rowNumber: number, issues: ValidationIssue[]) {
  const email = get(row, mapping.email);
  if (email && !isSha256(email)) {
    if (looksLikeBrokenHash(email)) issues.push(issue("HASH_INVALID_LENGTH", "warning", "Hash-like email value is not a 64-character SHA-256 hex digest.", "Use a SHA-256 hex digest.", { rowNumber, field: mapping.email, currentValue: email }));
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.push(issue("EMAIL_INVALID", "warning", "Email format looks invalid.", "Use a valid email address or SHA-256 hash.", { rowNumber, field: mapping.email, currentValue: email }));
    else issues.push(issue("EMAIL_NOT_HASHED", "warning", "Email appears to be plain text.", "Normalize and hash email with SHA-256 before upload if required.", { rowNumber, field: mapping.email }));
  }
  const phone = get(row, mapping.phone);
  if (phone && !isSha256(phone)) {
    if (looksLikeBrokenHash(phone) && /[a-fA-F]/.test(phone)) issues.push(issue("HASH_INVALID_LENGTH", "warning", "Hash-like phone value is not a 64-character SHA-256 hex digest.", "Use a SHA-256 hex digest.", { rowNumber, field: mapping.phone, currentValue: phone }));
    else {
      const digits = phone.replace(/\D/g, "");
      if (/[A-Za-z]/.test(phone) || digits.length < 7) issues.push(issue("PHONE_INVALID", "warning", "Phone format looks suspicious.", "Use E.164 format when possible or a SHA-256 hash.", { rowNumber, field: mapping.phone, currentValue: phone }));
      else issues.push(issue("PHONE_NOT_HASHED", "info", "Phone appears to be plain text.", "Normalize and hash phone where required.", { rowNumber, field: mapping.phone }));
    }
  }
}

function checkValueCurrency(row: Record<string, string>, mapping: FieldMapping, rowNumber: number, issues: ValidationIssue[]) {
  const value = get(row, mapping.conversion_value);
  const currency = get(row, mapping.conversion_currency);
  if (value) {
    const numeric = Number(value.replace(/[$,\s]/g, ""));
    if (!Number.isFinite(numeric)) issues.push(issue("INVALID_CONVERSION_VALUE", "warning", "Conversion Value is not numeric.", "Use a numeric value.", { rowNumber, field: mapping.conversion_value, currentValue: value }));
    else if (numeric < 0) issues.push(issue("NEGATIVE_CONVERSION_VALUE", "warning", "Conversion Value is negative.", "Check if negative values are intended.", { rowNumber, field: mapping.conversion_value, currentValue: value }));
    if (!mapping.conversion_currency) issues.push(issue("MISSING_CURRENCY_WITH_VALUE", "warning", "Conversion Value exists, but no currency column was detected.", "Add Conversion Currency column.", { rowNumber, field: "Conversion Currency" }));
  }
  if (currency && !/^[A-Z]{3}$/.test(currency.toUpperCase())) issues.push(issue("INVALID_CURRENCY", "warning", "Currency does not look like a three-letter ISO 4217 code.", "Use codes like USD, EUR, GBP, SGD, or JPY.", { rowNumber, field: mapping.conversion_currency, currentValue: currency }));
}

function parseDate(value: string): DateTime | null {
  const formats = ["yyyy-MM-dd HH:mm:ssZZ", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd", "M/d/yyyy h:mm a", "M/d/yyyy"];
  const iso = DateTime.fromISO(value, { setZone: true });
  if (iso.isValid) return iso;
  for (const format of formats) {
    const date = DateTime.fromFormat(value, format, { setZone: true });
    if (date.isValid) return date;
  }
  return null;
}

function get(row: Record<string, string>, field?: string) { return field ? (row[field] ?? "").trim() : ""; }
function firstValue(row: Record<string, string>, mapping: FieldMapping, keys: FieldKey[]) { for (const key of keys) { const value = get(row, mapping[key]); if (value) return value; } return ""; }
function isSha256(value: string) { return /^[a-fA-F0-9]{64}$/.test(value.trim()); }
function looksLikeBrokenHash(value: string) { const trimmed = value.trim(); return trimmed.length >= 32 && /^[a-fA-F0-9]+$/.test(trimmed) && !isSha256(trimmed); }
function issue(id: string, severity: ValidationIssue["severity"], message: string, suggestion: string, extra: Partial<ValidationIssue> = {}): ValidationIssue { return { id, severity, message, suggestion, ...extra }; }
function dedupe(issues: ValidationIssue[]) { const seen = new Set<string>(); return issues.filter((item) => { const key = [item.id, item.severity, item.rowNumber ?? "", item.field ?? "", item.currentValue ?? "", item.message].join("|"); if (seen.has(key)) return false; seen.add(key); return true; }); }
function sortIssues(a: ValidationIssue, b: ValidationIssue) { const order = { critical: 0, warning: 1, info: 2 }; return order[a.severity] - order[b.severity] || (a.rowNumber ?? 0) - (b.rowNumber ?? 0); }
