import type { FieldMapping, IssueSeverity, ValidationIssue, ValidationMode } from "../types";
import { hashedAddressFields, plainAddressFields } from "./constants";
import { get, isSha256, issue, looksLikeBrokenHash } from "./helpers";
import { isValidPlainEmail, isValidPlainPhone } from "./identifierHelpers";

const consentValues = new Set(["granted", "denied", ""]);

export function checkUserData(row: Record<string, string>, mapping: FieldMapping, mode: ValidationMode, rowNumber: number, issues: ValidationIssue[]) {
  const hashRequirement = hashRequirementForMode(mode);
  const email = get(row, mapping.email);
  if (email && !isSha256(email)) {
    if (looksLikeBrokenHash(email)) {
      issues.push(issue("HASH_INVALID_LENGTH", hashRequirement.brokenHashSeverity, "Hash-like email value is not a 64-character SHA-256 hex digest.", "Use a lowercase SHA-256 hex digest after normalizing the email.", { rowNumber, field: mapping.email, currentValue: email }));
    } else if (!isValidPlainEmail(email)) {
      issues.push(issue("EMAIL_INVALID", hashRequirement.invalidIdentifierSeverity, "Email format looks invalid.", hashRequirement.invalidIdentifierSuggestion, { rowNumber, field: mapping.email, currentValue: email }));
    } else {
      issues.push(issue("EMAIL_NOT_HASHED", hashRequirement.plainIdentifierSeverity, "Email appears to be plain text.", hashRequirement.plainIdentifierSuggestion, { rowNumber, field: mapping.email }));
    }
  }

  const phone = get(row, mapping.phone);
  if (phone && !isSha256(phone)) {
    if (looksLikeBrokenHash(phone) && /[a-fA-F]/.test(phone)) {
      issues.push(issue("HASH_INVALID_LENGTH", hashRequirement.brokenHashSeverity, "Hash-like phone value is not a 64-character SHA-256 hex digest.", "Use a SHA-256 hex digest.", { rowNumber, field: mapping.phone, currentValue: phone }));
    } else {
      if (!isValidPlainPhone(phone)) {
        issues.push(issue("PHONE_INVALID", hashRequirement.invalidIdentifierSeverity, "Phone format looks suspicious.", hashRequirement.invalidIdentifierSuggestion, { rowNumber, field: mapping.phone, currentValue: phone }));
      } else {
        issues.push(issue("PHONE_NOT_HASHED", hashRequirement.plainIdentifierSeverity, "Phone appears to be plain text.", hashRequirement.plainIdentifierSuggestion, { rowNumber, field: mapping.phone }));
      }
    }
  }

  hashedAddressFields.forEach((fieldKey) => {
    const field = mapping[fieldKey];
    const value = get(row, field);
    if (!value || isSha256(value)) return;

    if (looksLikeBrokenHash(value)) {
      issues.push(issue("ADDRESS_HASH_INVALID_LENGTH", hashRequirement.brokenHashSeverity, `${labelFor(fieldKey)} looks hash-like but is not a 64-character SHA-256 hex digest.`, "Use a SHA-256 digest for name and street address fields when required.", { rowNumber, field, currentValue: value }));
    } else {
      issues.push(issue("ADDRESS_FIELD_NOT_HASHED", hashRequirement.plainIdentifierSeverity, `${labelFor(fieldKey)} appears to be plain text.`, hashRequirement.addressSuggestion, { rowNumber, field }));
    }
  });

  plainAddressFields.forEach((fieldKey) => {
    const field = mapping[fieldKey];
    const value = get(row, field);
    if (!value) return;

    if (isSha256(value)) {
      issues.push(issue("LOCATION_FIELD_HASHED", "warning", `${labelFor(fieldKey)} appears to be SHA-256 hashed.`, "City, state, country, and zip/postal code should remain plain location values when used for address matching.", { rowNumber, field, currentValue: value }));
    }
  });

  validateConsent(row, mapping.ad_user_data, "Ad User Data", rowNumber, issues);
  validateConsent(row, mapping.ad_personalization, "Ad Personalization", rowNumber, issues);
}

function hashRequirementForMode(mode: ValidationMode): {
  plainIdentifierSeverity: IssueSeverity;
  brokenHashSeverity: IssueSeverity;
  plainIdentifierSuggestion: string;
  addressSuggestion: string;
  invalidIdentifierSeverity: IssueSeverity;
  invalidIdentifierSuggestion: string;
} {
  if (mode === "user_data_scheduled_prehashed") {
    return {
      plainIdentifierSeverity: "critical",
      brokenHashSeverity: "critical",
      plainIdentifierSuggestion: "Normalize and SHA-256 hash user-provided identifiers before scheduled or pre-hashed upload.",
      addressSuggestion: "Hash first name, last name, and street address fields before scheduled or pre-hashed user-data upload.",
      invalidIdentifierSeverity: "critical",
      invalidIdentifierSuggestion: "Use a valid normalized identifier before hashing, or provide a valid SHA-256 hash expected by this scheduled/pre-hashed workflow.",
    };
  }

  if (mode === "user_data_manual_unhashed") {
    return {
      plainIdentifierSeverity: "info",
      brokenHashSeverity: "warning",
      plainIdentifierSuggestion: "Manual one-time workflows may allow unhashed user data, but verify this in Google Ads before importing.",
      addressSuggestion: "Manual one-time workflows may allow unhashed name and street values, but verify this in Google Ads before importing.",
      invalidIdentifierSeverity: "warning",
      invalidIdentifierSuggestion: "Fix the email or phone format before manual review. Unhashed manual workflows still need usable raw identifiers.",
    };
  }

  return {
    plainIdentifierSeverity: mode === "user_data_preflight" || mode === "mixed_identifiers" ? "warning" : "info",
    brokenHashSeverity: "warning",
    plainIdentifierSuggestion: "Normalize and SHA-256 hash this identifier when your Google Ads workflow requires hashed user data.",
    addressSuggestion: "Hash first name, last name, and street address fields when your user-data upload workflow requires hashing.",
    invalidIdentifierSeverity: "warning",
    invalidIdentifierSuggestion: "Use a valid email or phone value for local normalization, or provide a valid SHA-256 hash expected by your upload workflow.",
  };
}

function validateConsent(row: Record<string, string>, field: string | undefined, label: string, rowNumber: number, issues: ValidationIssue[]) {
  const value = get(row, field);
  if (!field || consentValues.has(value.trim().toLowerCase())) return;

  issues.push(issue("INVALID_CONSENT_VALUE", "warning", `${label} must be Granted, Denied, or blank.`, "Use Granted or Denied exactly as expected by the Google Ads upload workflow.", { rowNumber, field, currentValue: value }));
}

function labelFor(fieldKey: string) {
  return fieldKey.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
