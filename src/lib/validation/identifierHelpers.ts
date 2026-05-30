import type { FieldKey, FieldMapping } from "../types";
import { clickIdFields, hashedAddressFields, plainAddressFields, userIdentifierFields } from "./constants";
import { get } from "./helpers";

export function hasValue(row: Record<string, string>, mapping: FieldMapping, fields: readonly FieldKey[]) {
  return fields.some((field) => Boolean(get(row, mapping[field])));
}

export function hasClickIdValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasValue(row, mapping, clickIdFields);
}

export function hasUserIdentifierValue(row: Record<string, string>, mapping: FieldMapping) {
  return hasValue(row, mapping, userIdentifierFields);
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
  for (const field of [...clickIdFields, ...userIdentifierFields]) {
    const value = get(row, mapping[field]);
    if (value) return value;
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
