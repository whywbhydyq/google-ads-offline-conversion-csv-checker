import type { FieldKey, FieldMapping, ValidationMode, ValidationModeInput } from "../types";
import { clickIdFields, hashedAddressFields, userIdentifierFields } from "./constants";

export type ValidationModeCopy = {
  label: string;
  shortLabel: string;
  description: string;
  ageLimitDays: number;
};

export function hasMappedField(mapping: FieldMapping, fields: readonly FieldKey[]) {
  return fields.some((field) => Boolean(mapping[field]));
}

export function resolveValidationMode(mapping: FieldMapping, rows: Record<string, string>[] = [], requestedMode: ValidationModeInput = "auto"): ValidationMode {
  if (requestedMode !== "auto") return requestedMode;
  return inferValidationMode(mapping, rows);
}

export function inferValidationMode(mapping: FieldMapping, rows: Record<string, string>[] = []): ValidationMode {
  const hasClickIdHeader = hasMappedField(mapping, clickIdFields);
  const userIdentityFields = [...userIdentifierFields, ...hashedAddressFields];
  const hasUserDataHeader = hasMappedField(mapping, userIdentityFields);
  const hasClickIdValue = hasAnyValue(rows, mapping, clickIdFields);
  const hasUserDataValue = hasAnyValue(rows, mapping, userIdentityFields);

  if (hasClickIdValue && hasUserDataValue) return "mixed_identifiers";
  if (hasClickIdValue) return "click_id_upload";
  if (hasUserDataValue) return "user_data_preflight";

  if (hasClickIdHeader && !hasUserDataHeader) return "click_id_upload";
  if (hasUserDataHeader && !hasClickIdHeader) return "user_data_preflight";
  if (hasClickIdHeader && hasUserDataHeader) return "mixed_identifiers";
  return "unknown";
}

function hasAnyValue(rows: Record<string, string>[], mapping: FieldMapping, fields: readonly FieldKey[]) {
  return rows.some((row) => fields.some((field) => {
    const header = mapping[field];
    return Boolean(header && row[header]?.trim());
  }));
}

export function getValidationModeCopy(mode: ValidationMode): ValidationModeCopy {
  if (mode === "click_id_upload") {
    return {
      label: "Legacy click ID CSV preflight",
      shortLabel: "Click ID CSV",
      description: "Checks CSV-level risks for files that identify conversions with GCLID, GBRAID, or WBRAID.",
      ageLimitDays: 90,
    };
  }

  if (mode === "user_data_scheduled_prehashed") {
    return {
      label: "Scheduled / pre-hashed user-data preflight",
      shortLabel: "Pre-hashed user data",
      description: "Checks user-data files where email, phone, first name, last name, and street address are expected to be normalized and SHA-256 hashed before upload.",
      ageLimitDays: 63,
    };
  }

  if (mode === "user_data_manual_unhashed") {
    return {
      label: "Manual unhashed user-data review",
      shortLabel: "Manual user data",
      description: "Checks CSV-level user-data risks while treating plain email, phone, and address identity values as review items rather than automatic blockers.",
      ageLimitDays: 63,
    };
  }

  if (mode === "user_data_preflight") {
    return {
      label: "User-data / Data Manager preflight",
      shortLabel: "User data",
      description: "Checks user-data formatting, hashing, consent-field, time, value, and duplicate risks. It does not validate the full Google Ads Data Manager schema.",
      ageLimitDays: 63,
    };
  }

  if (mode === "mixed_identifiers") {
    return {
      label: "Mixed identifier preflight",
      shortLabel: "Mixed",
      description: "This file contains click IDs and user-provided data. Verify that this combination matches the Google Ads import workflow you intend to use.",
      ageLimitDays: 63,
    };
  }

  return {
    label: "Unknown upload workflow",
    shortLabel: "Unknown",
    description: "No known Google Ads identifier column was detected, so only structural checks can run reliably.",
    ageLimitDays: 90,
  };
}
