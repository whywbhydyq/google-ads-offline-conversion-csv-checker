import type { FieldMapping, ParsedCsv, ValidationIssue, ValidationMode } from "../types";
import { addressFields, clickIdFields, consentFields, hashedAddressFields, plainAddressFields, userIdentifierFields } from "./constants";
import { issue } from "./helpers";

export function checkRequired(parsed: ParsedCsv, mapping: FieldMapping, mode: ValidationMode): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!parsed.rawRowCount) {
    issues.push(issue("CSV_EMPTY", "critical", "The CSV has a header row but no data rows.", "Add at least one conversion row."));
  }

  if (!mapping.conversion_name) {
    issues.push(issue("MISSING_CONVERSION_NAME", "critical", "No Conversion Name column was detected.", "Add a Conversion Name column that matches the Google Ads conversion action name.", { field: "Conversion Name" }));
  }

  if (!mapping.conversion_time) {
    issues.push(issue("MISSING_CONVERSION_TIME", "critical", "No Conversion Time column was detected.", "Add a Conversion Time column with a supported timestamp and timezone where possible.", { field: "Conversion Time" }));
  }

  const hasClickId = clickIdFields.some((field) => mapping[field]);
  const hasUserIdentifier = userIdentifierFields.some((field) => mapping[field]);
  const hasAddress = addressFields.some((field) => mapping[field]);
  const hasHashedAddressPart = hashedAddressFields.some((field) => mapping[field]);
  const hasPlainAddressPart = plainAddressFields.some((field) => mapping[field]);
  const hasConsent = consentFields.some((field) => mapping[field]);

  if (!hasClickId && !hasUserIdentifier && !hasAddress) {
    issues.push(issue("MISSING_IDENTIFIER", "critical", "No click ID or user-provided identifier column was detected.", "Add GCLID, GBRAID, WBRAID, Email, Phone, or user-provided address data that matches your Google Ads import workflow."));
  }

  if (hasPlainAddressPart && !hasHashedAddressPart && !hasUserIdentifier && !hasClickId) {
    issues.push(issue("LOCATION_ONLY_ADDRESS_COLUMNS", "critical", "Only plain location address columns were detected, not user identity columns.", "Country, city, state, or zip/postal code cannot identify a user by themselves. Add email, phone, or complete address-style user data with first name and last name."));
  }

  if (mode === "user_data_preflight" || mode === "user_data_scheduled_prehashed" || mode === "user_data_manual_unhashed") {
    const message = mode === "user_data_scheduled_prehashed"
      ? "This is checking a scheduled or pre-hashed user-data workflow, not a legacy click ID CSV."
      : mode === "user_data_manual_unhashed"
        ? "This is checking a manual unhashed user-data review workflow, not a legacy click ID CSV."
        : "This is checking a user-data or Data Manager style preflight, not a legacy click ID CSV.";
    issues.push(issue("USER_DATA_WORKFLOW_NOTICE", "info", message, "Use this report to catch CSV-level user-data risks, then verify the actual template and import method inside Google Ads."));
  }

  if (mode === "mixed_identifiers") {
    issues.push(issue("MIXED_IDENTIFIER_WORKFLOW", "warning", "This file contains both click ID columns and user-provided data columns.", "Confirm that your chosen Google Ads import workflow expects mixed identifiers; otherwise split the file or use the official template for that workflow."));
  }

  if ((hasUserIdentifier || hasAddress) && !hasConsent) {
    issues.push(issue("CONSENT_COLUMNS_NOT_DETECTED", "info", "Ad User Data and Ad Personalization consent columns were not detected.", "If your upload workflow requires consent signals, add Ad User Data and Ad Personalization with Granted or Denied values."));
  }

  if (hasAddress) {
    if (hasHashedAddressPart && (!mapping.first_name || !mapping.last_name)) {
      issues.push(issue("INCOMPLETE_HASHED_NAME", "warning", "Address-style user data was detected without both First Name and Last Name columns.", "Include both first and last name when matching by address-style user data."));
    }

    if (hasHashedAddressPart && (!mapping.country || !mapping.zip)) {
      issues.push(issue("INCOMPLETE_ADDRESS_LOCATION", "warning", "Address-style user data was detected, but country or zip/postal code is missing.", "Add country and zip/postal code when available. These location fields should remain plain, not SHA-256 hashed."));
    }

    if (hasHashedAddressPart && !hasPlainAddressPart) {
      issues.push(issue("ADDRESS_LOCATION_NOT_DETECTED", "warning", "Hashed address fields were detected without plain location fields.", "Add city, state, country, or zip/postal code if your Google Ads workflow uses address matching."));
    }
  }

  return issues;
}
