import type { FieldKey, FieldMapping, ValidationIssue } from "../types";
import { get, isSha256, issue, looksLikeBrokenHash } from "./helpers";

export function checkUserData(row: Record<string, string>, mapping: FieldMapping, rowNumber: number, issues: ValidationIssue[]) {
  const email = get(row, mapping.email);
  if (email && !isSha256(email)) {
    if (looksLikeBrokenHash(email)) {
      issues.push(issue("HASH_INVALID_LENGTH", "warning", "Hash-like email value is not a 64-character SHA-256 hex digest.", "Use a SHA-256 hex digest.", { rowNumber, field: mapping.email, currentValue: email }));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      issues.push(issue("EMAIL_INVALID", "warning", "Email format looks invalid.", "Use a valid email address or SHA-256 hash.", { rowNumber, field: mapping.email, currentValue: email }));
    } else {
      issues.push(issue("EMAIL_NOT_HASHED", "warning", "Email appears to be plain text.", "Normalize and hash email with SHA-256 before upload if required.", { rowNumber, field: mapping.email }));
    }
  }

  const phone = get(row, mapping.phone);
  if (phone && !isSha256(phone)) {
    if (looksLikeBrokenHash(phone) && /[a-fA-F]/.test(phone)) {
      issues.push(issue("HASH_INVALID_LENGTH", "warning", "Hash-like phone value is not a 64-character SHA-256 hex digest.", "Use a SHA-256 hex digest.", { rowNumber, field: mapping.phone, currentValue: phone }));
    } else {
      const digits = phone.replace(/\D/g, "");
      if (/[A-Za-z]/.test(phone) || digits.length < 7) {
        issues.push(issue("PHONE_INVALID", "warning", "Phone format looks suspicious.", "Use E.164 format when possible or a SHA-256 hash.", { rowNumber, field: mapping.phone, currentValue: phone }));
      } else {
        issues.push(issue("PHONE_NOT_HASHED", "info", "Phone appears to be plain text.", "Normalize and hash phone where required.", { rowNumber, field: mapping.phone }));
      }
    }
  }
}
