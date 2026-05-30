import type { FieldKey, FieldMapping } from "../types";
import { clickIdFields, hashedAddressFields, plainAddressFields, userIdentifierFields } from "./constants";
import { get, isSha256 } from "./helpers";

export function hasValue(row: Record<string, string>, mapping: FieldMapping, fields: readonly FieldKey[]) {
  return fields.some((field) => Boolean(get(row, mapping[field])));
}

export function isValidPlainEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPlainPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return !/[A-Za-z]/.test(trimmed) && digits.length >= 7 && digits.length <= 15;
}

export function isValidUserIdentifier(field: FieldKey, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isSha256(trimmed)) return true;
  if (field === "email") return isValidPlainEmail(trimmed);
  if (field === "phone") return isValidPlainPhone(trimmed);
  return false;
}

export function isValidClickId(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 10 && /^[A-Za-z0-9_-]+$/.test(trimmed);
}

export function hasClickIdValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasValue(row, mapping, clickIdFields);
}

export function hasValidClickIdValue(row: Record<string, string>, mapping: FieldMapping) {
  return clickIdFields.some((field) => isValidClickId(get(row, mapping[field])));
}

export function hasUserIdentifierValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasValue(row, mapping, userIdentifierFields);
}

export function hasValidUserIdentifierValue(row: Record<string, string>, mapping: FieldMapping) {
  return userIdentifierFields.some((field) => isValidUserIdentifier(field, get(row, mapping[field])));
}

export function hasAnyAddressValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasValue(row, mapping, [...hashedAddressFields, ...plainAddressFields]);
}

export function hasHashedAddressValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasValue(row, mapping, hashedAddressFields);
}

export function hasPlainAddressValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasValue(row, mapping, plainAddressFields);
}

export function hasUsableAddressIdentifier(row: Record<string, string>, mapping: FieldMapping) {
  return Boolean(
    get(row, mapping.first_name) &&
      get(row, mapping.last_name) &&
      get(row, mapping.country) &&
      get(row, mapping.zip),
  );
}

export function hasLocationOnlyAddressValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasPlainAddressValue(row, mapping) && !hasHashedAddressValue(row, mapping);
}

export function firstUsableIdentifier(row: Record<string, string>, mapping: FieldMapping) {
  for (const field of clickIdFields) {
    const value = get(row, mapping[field]);
    if (isValidClickId(value)) return value;
  }

  for (const field of userIdentifierFields) {
    const value = get(row, mapping[field]);
    if (isValidUserIdentifier(field, value)) return value;
  }

  if (!hasUsableAddressIdentifier(row, mapping)) return "";

  return [
    get(row, mapping.first_name),
    get(row, mapping.last_name),
    get(row, mapping.street_address),
    get(row, mapping.city),
    get(row, mapping.state),
    get(row, mapping.country),
    get(row, mapping.zip),
  ]
    .filter(Boolean)
    .join("|");
}
