import type { FieldKey } from "../types";

export const clickIdFields: FieldKey[] = ["gclid", "gbraid", "wbraid"];
export const userIdentifierFields: FieldKey[] = ["email", "phone"];
export const hashedAddressFields: FieldKey[] = ["first_name", "last_name", "street_address"];
export const plainAddressFields: FieldKey[] = ["city", "state", "country", "zip"];
export const addressFields: FieldKey[] = [...hashedAddressFields, ...plainAddressFields];
export const usableIdentifierFields: FieldKey[] = [...clickIdFields, ...userIdentifierFields];
export const consentFields: FieldKey[] = ["ad_user_data", "ad_personalization"];
