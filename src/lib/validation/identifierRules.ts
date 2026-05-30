import type { FieldMapping, ValidationIssue, ValidationMode } from "../types";
import { clickIdFields } from "./constants";
import { get, issue } from "./helpers";
import {
  hasAnyAddressValue,
  hasClickIdValue,
  hasLocationOnlyAddressValue,
  hasUsableAddressIdentifier,
  hasUserIdentifierValue,
  hasValidClickIdValue,
  hasValidUserIdentifierValue,
  isValidClickId,
} from "./identifierHelpers";

export function checkIdentifiers(row: Record<string, string>, mapping: FieldMapping, mode: ValidationMode, rowNumber: number, issues: ValidationIssue[]) {
  const clickIdValues = clickIdFields.filter((field) => Boolean(get(row, mapping[field])));
  const hasClickId = hasClickIdValue(row, mapping);
  const hasValidClickId = hasValidClickIdValue(row, mapping);
  const hasUserIdentifier = hasUserIdentifierValue(row, mapping);
  const hasValidUserIdentifier = hasValidUserIdentifierValue(row, mapping);
  const hasAnyAddress = hasAnyAddressValue(row, mapping);
  const hasUsableAddress = hasUsableAddressIdentifier(row, mapping);
  const hasAnyUsableIdentifier = hasValidClickId || hasValidUserIdentifier || hasUsableAddress;

  if (!hasAnyUsableIdentifier) {
    issues.push(issue("EMPTY_IDENTIFIER", "critical", "No usable identifier value was found in this row.", "Add GCLID, GBRAID, WBRAID, Email, Phone, or complete user-provided address data with first name, last name, country, and zip/postal code for the selected workflow.", { rowNumber }));
  }

  if (hasAnyAddress && !hasUsableAddress) {
    const severity = hasValidClickId || hasValidUserIdentifier ? "warning" : "critical";
    issues.push(issue("INCOMPLETE_ADDRESS_IDENTIFIER", severity, "Address-style data is present, but it is not enough to act as a usable identifier.", "Use address data together with first name, last name, country, and zip/postal code. Location-only values such as country or zip are not a user identifier by themselves.", { rowNumber }));
  }

  if (hasLocationOnlyAddressValue(row, mapping) && !hasValidClickId && !hasValidUserIdentifier) {
    issues.push(issue("LOCATION_ONLY_IDENTIFIER", "critical", "This row only has plain location address values, not user identity fields.", "Add email, phone, click ID, or complete address-style user data. Country, city, state, or zip alone cannot identify a conversion row.", { rowNumber }));
  }

  if (mode === "click_id_upload" && !hasClickId) {
    issues.push(issue("MISSING_CLICK_ID_VALUE", "critical", "This click-ID style row has no GCLID, GBRAID, or WBRAID value.", "Add exactly one click ID value for a click-ID offline conversion upload.", { rowNumber }));
  } else if (mode === "click_id_upload" && !hasValidClickId) {
    issues.push(issue("NO_VALID_CLICK_ID_VALUE", "critical", "This click-ID style row has click ID text, but no usable GCLID, GBRAID, or WBRAID value.", "Use exactly one valid click ID value and remove spaces, URL fragments, or unsupported characters.", { rowNumber }));
  }

  if ((mode === "user_data_preflight" || mode === "user_data_scheduled_prehashed" || mode === "user_data_manual_unhashed") && !hasUserIdentifier && !hasUsableAddress) {
    issues.push(issue("MISSING_USER_DATA_IDENTIFIER", "critical", "This user-data style row has no email, phone, or complete address identifier value.", "Add email, phone, or complete address-style user data that matches your Google Ads import workflow.", { rowNumber }));
  } else if ((mode === "user_data_preflight" || mode === "user_data_scheduled_prehashed" || mode === "user_data_manual_unhashed") && !hasValidUserIdentifier && !hasUsableAddress) {
    issues.push(issue("NO_VALID_USER_DATA_IDENTIFIER", "critical", "This user-data style row has user identifier text, but no valid email, phone, or complete address identifier.", "Fix invalid email or phone values, or provide complete address-style user data with first name, last name, country, and zip/postal code.", { rowNumber }));
  }

  if (clickIdValues.length > 1) {
    const severity = mode === "click_id_upload" ? "critical" : "warning";
    issues.push(issue("MULTIPLE_CLICK_IDS", severity, "This row has more than one click ID field populated.", "Use exactly one of GCLID, GBRAID, or WBRAID for a click-ID conversion row unless your official template says otherwise.", { rowNumber }));
  }

  if (mode === "mixed_identifiers" && hasValidClickId && (hasValidUserIdentifier || hasUsableAddress)) {
    issues.push(issue("ROW_MIXES_IDENTIFIER_TYPES", "info", "This row mixes click ID and user-provided identifiers.", "Verify that the row matches your intended Google Ads import workflow and template.", { rowNumber }));
  }

  const suspiciousClickIdSeverity = mode === "click_id_upload" ? "critical" : "warning";

  const gclid = get(row, mapping.gclid);
  if (gclid && !isValidClickId(gclid)) {
    issues.push(issue("SUSPICIOUS_GCLID", suspiciousClickIdSeverity, "GCLID length or characters look suspicious.", "Check the original Google click ID and remove spaces or pasted URL fragments.", { rowNumber, field: mapping.gclid, currentValue: gclid }));
  }

  const gbraid = get(row, mapping.gbraid);
  if (gbraid && !isValidClickId(gbraid)) {
    issues.push(issue("SUSPICIOUS_GBRAID", suspiciousClickIdSeverity, "GBRAID length or characters look suspicious.", "Check the original GBRAID value and remove spaces or pasted URL fragments.", { rowNumber, field: mapping.gbraid, currentValue: gbraid }));
  }

  const wbraid = get(row, mapping.wbraid);
  if (wbraid && !isValidClickId(wbraid)) {
    issues.push(issue("SUSPICIOUS_WBRAID", suspiciousClickIdSeverity, "WBRAID length or characters look suspicious.", "Check the original WBRAID value and remove spaces or pasted URL fragments.", { rowNumber, field: mapping.wbraid, currentValue: wbraid }));
  }
}
