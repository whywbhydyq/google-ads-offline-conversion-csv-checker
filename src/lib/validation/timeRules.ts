import { DateTime } from "luxon";
import type { ValidationIssue } from "../types";
import { issue } from "./helpers";

const numericOffsetPattern = /^[+-]\d{2}:?\d{2}$/;
const timezoneSuffixPattern = /(?:z|[+-]\d{2}:?\d{2}|[A-Za-z_]+\/[A-Za-z0-9_+\-/]+)$/i;
const trailingTimezonePattern = /^(.+?)\s+([A-Za-z_]+\/[A-Za-z0-9_+\-/]+)$/;
const trailingNumericOffsetPattern = /^(.+?)\s*([+-]\d{2}:?\d{2})$/;
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/;

export function checkTime(value: string, field: string, rowNumber: number, issues: ValidationIssue[], ageLimitDays = 90, fileTimezone = "") {
  if (!value) {
    issues.push(issue("INVALID_CONVERSION_TIME", "critical", "Conversion Time is empty.", "Use a supported date/time format.", { rowNumber, field }));
    return;
  }

  const parsed = parseDate(value, fileTimezone);
  if (!parsed) {
    issues.push(
      issue(
        "INVALID_CONVERSION_TIME",
        "critical",
        "Conversion Time could not be parsed.",
        "Use a supported Google Ads-style timestamp such as 2026-05-22 14:30:00+0800, 2026-05-22 14:30:00 +0800, 2026-05-22T14:30:00+08:00, 05/22/2026 14:30:00 -0500, or May 22,2026 02:30:00 PM.",
        { rowNumber, field, currentValue: value },
      ),
    );
    return;
  }

  const now = DateTime.now();
  if (parsed.toMillis() > now.plus({ minutes: 1 }).toMillis()) {
    issues.push(issue("FUTURE_CONVERSION_TIME", "critical", "Conversion Time is in the future.", "Use the actual past conversion time.", { rowNumber, field, currentValue: value }));
  }

  if (parsed.toMillis() < now.minus({ days: ageLimitDays }).toMillis()) {
    issues.push(issue("OLD_CONVERSION_TIME_RISK", "warning", `Conversion Time is more than ${ageLimitDays} days old for the selected workflow.`, "Verify the click or user-data attribution window before upload preview.", { rowNumber, field, currentValue: value }));
  }

  if (dateOnlyPattern.test(value.trim())) {
    issues.push(issue("DATE_ONLY_TIME", "warning", "Conversion Time contains only a date.", "Add time of day for better attribution accuracy.", { rowNumber, field, currentValue: value }));
  }

  if (!timezoneSuffixPattern.test(value.trim()) && !isValidFileTimezone(fileTimezone)) {
    issues.push(issue("MISSING_TIMEZONE", "warning", "Conversion Time does not include a timezone or valid file-level TimeZone parameter.", "Include a numeric timezone offset such as +0800, a timezone ID such as America/Los_Angeles, or a valid Parameters:TimeZone row.", { rowNumber, field, currentValue: value }));
  }
}

export function parseDate(value: string, fileTimezone = ""): DateTime | null {
  const trimmed = value.trim();
  const normalizedOffset = normalizeOffset(trimmed);
  const iso = DateTime.fromISO(normalizedOffset, { setZone: true });
  if (iso.isValid) return iso;

  const numericOffsetDate = parseWithNumericOffset(trimmed);
  if (numericOffsetDate) return numericOffsetDate;

  const zoneMatch = trimmed.match(trailingTimezonePattern);
  if (zoneMatch) {
    const [, datePart, zone] = zoneMatch;
    const zoneDate = parseWithoutOffset(datePart.trim(), zone);
    if (zoneDate) return zoneDate;
  }

  for (const candidate of [trimmed, normalizedOffset]) {
    for (const format of formatsWithOffset) {
      const date = DateTime.fromFormat(candidate, format, { setZone: true });
      if (date.isValid) return date;
    }
  }

  const normalizedFileTimezone = normalizeFileTimezone(fileTimezone);
  if (normalizedFileTimezone) {
    if (isNumericOffset(normalizedFileTimezone)) {
      const fileOffsetDate = parseWithNumericOffset(`${trimmed}${normalizedFileTimezone}`);
      if (fileOffsetDate) return fileOffsetDate;
    } else {
      const fileZoneDate = parseWithoutOffset(trimmed, normalizedFileTimezone);
      if (fileZoneDate) return fileZoneDate;
    }
  }

  return parseWithoutOffset(trimmed, undefined);
}

export function isValidTimezone(zone: string | undefined) {
  if (!zone) return false;
  return DateTime.now().setZone(zone.trim()).isValid;
}

export function isValidFileTimezone(zone: string | undefined) {
  const normalized = normalizeFileTimezone(zone);
  if (!normalized) return false;
  return isNumericOffset(normalized) || isValidTimezone(normalized);
}

function parseWithNumericOffset(value: string) {
  const match = value.trim().match(trailingNumericOffsetPattern);
  if (!match) return null;
  const [, datePart, offset] = match;
  const normalized = normalizeOffset(offset);

  for (const format of formatsWithoutZone) {
    const date = DateTime.fromFormat(`${datePart.trim()}${normalized}`, `${format}ZZ`, { setZone: true });
    if (date.isValid) return date;
  }

  return null;
}

function parseWithoutOffset(value: string, zone: string | undefined) {
  const options = zone ? { zone, setZone: true } : undefined;
  for (const format of formatsWithoutZone) {
    const date = DateTime.fromFormat(value, format, options);
    if (date.isValid) return date;
  }
  return null;
}

function normalizeFileTimezone(zone: string | undefined) {
  if (!zone) return "";
  const trimmed = zone.trim();
  return isNumericOffset(trimmed) ? normalizeOffset(trimmed) : trimmed;
}

function isNumericOffset(value: string) {
  return numericOffsetPattern.test(value.trim());
}

const formatsWithoutZone = [
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd H:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd H:mm",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'H:mm:ss",
  "yyyy-MM-dd'T'HH:mm",
  "yyyy-MM-dd'T'H:mm",
  "yyyy-MM-dd",
  "M/d/yyyy h:mm:ss a",
  "M/d/yyyy hh:mm:ss a",
  "MM/dd/yyyy hh:mm:ss a",
  "M/d/yyyy h:mm a",
  "M/d/yyyy hh:mm a",
  "MM/dd/yyyy hh:mm a",
  "M/d/yyyy H:mm:ss",
  "M/d/yyyy HH:mm:ss",
  "MM/dd/yyyy HH:mm:ss",
  "M/d/yyyy H:mm",
  "M/d/yyyy HH:mm",
  "MM/dd/yyyy HH:mm",
  "M/d/yyyy",
  "MMM d,yyyy h:mm:ss a",
  "MMM d,yyyy hh:mm:ss a",
  "MMM d, yyyy h:mm:ss a",
  "MMM d, yyyy hh:mm:ss a",
  "MMM dd,yyyy h:mm:ss a",
  "MMM dd,yyyy hh:mm:ss a",
  "MMM dd, yyyy h:mm:ss a",
  "MMM dd, yyyy hh:mm:ss a",
];

const formatsWithOffset = [
  "yyyy-MM-dd HH:mm:ssZZ",
  "yyyy-MM-dd H:mm:ssZZ",
  "yyyy-MM-dd HH:mm:ss ZZ",
  "yyyy-MM-dd H:mm:ss ZZ",
  "yyyy-MM-dd HH:mm:ssZZZ",
  "yyyy-MM-dd H:mm:ssZZZ",
  "yyyy-MM-dd HH:mm:ss ZZZ",
  "yyyy-MM-dd H:mm:ss ZZZ",
  "yyyy-MM-dd'T'HH:mm:ssZZ",
  "yyyy-MM-dd'T'H:mm:ssZZ",
  "yyyy-MM-dd'T'HH:mm:ssZZZ",
  "yyyy-MM-dd'T'H:mm:ssZZZ",
  "M/d/yyyy h:mm:ss a ZZ",
  "M/d/yyyy hh:mm:ss a ZZ",
  "MM/dd/yyyy hh:mm:ss a ZZ",
  "M/d/yyyy H:mm:ssZZ",
  "M/d/yyyy HH:mm:ssZZ",
  "MM/dd/yyyy HH:mm:ssZZ",
  "M/d/yyyy H:mm:ss ZZ",
  "M/d/yyyy HH:mm:ss ZZ",
  "MM/dd/yyyy HH:mm:ss ZZ",
  "M/d/yyyy H:mm:ss ZZZ",
  "M/d/yyyy HH:mm:ss ZZZ",
  "MM/dd/yyyy HH:mm:ss ZZZ",
];

function normalizeOffset(value: string) {
  return value.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
}
