import { DateTime } from "luxon";
import type { ValidationIssue } from "../types";
import { issue } from "./helpers";

export function checkTime(value: string, field: string, rowNumber: number, issues: ValidationIssue[]) {
  if (!value) {
    issues.push(issue("INVALID_CONVERSION_TIME", "critical", "Conversion Time is empty.", "Use a supported date/time format.", { rowNumber, field }));
    return;
  }

  const parsed = parseDate(value);
  if (!parsed) {
    issues.push(
      issue(
        "INVALID_CONVERSION_TIME",
        "critical",
        "Conversion Time could not be parsed.",
        "Use formats such as 2026-05-22 14:30:00 or 2026-05-22 14:30:00+08:00.",
        { rowNumber, field, currentValue: value },
      ),
    );
    return;
  }

  const now = DateTime.now();
  if (parsed.toMillis() > now.plus({ minutes: 1 }).toMillis()) {
    issues.push(issue("FUTURE_CONVERSION_TIME", "critical", "Conversion Time is in the future.", "Use the actual past conversion time.", { rowNumber, field, currentValue: value }));
  }

  if (parsed.toMillis() < now.minus({ days: 90 }).toMillis()) {
    issues.push(issue("OLD_CLICK_TIME_RISK", "warning", "Conversion Time is more than 90 days old.", "Google Ads may reject old click-based conversions.", { rowNumber, field, currentValue: value }));
  }

  if (/^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim())) {
    issues.push(issue("DATE_ONLY_TIME", "warning", "Conversion Time contains only a date.", "Add time of day for better accuracy.", { rowNumber, field, currentValue: value }));
  }

  if (!/(?:z|[+-]\d{2}:?\d{2})$/i.test(value.trim())) {
    issues.push(issue("MISSING_TIMEZONE", "warning", "Conversion Time does not include a timezone.", "Include timezone when possible, for example +08:00.", { rowNumber, field, currentValue: value }));
  }
}

export function parseDate(value: string): DateTime | null {
  const formats = ["yyyy-MM-dd HH:mm:ssZZ", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd", "M/d/yyyy h:mm a", "M/d/yyyy"];
  const iso = DateTime.fromISO(value, { setZone: true });
  if (iso.isValid) return iso;

  for (const format of formats) {
    const date = DateTime.fromFormat(value, format, { setZone: true });
    if (date.isValid) return date;
  }

  return null;
}
