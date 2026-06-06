import type { FieldKey, FieldMapping } from "../types";

const aliases: Record<FieldKey, string[]> = {
  gclid: ["gclid", "google click id", "google_click_id", "google click identifier"],
  gbraid: ["gbraid", "gbraid id"],
  wbraid: ["wbraid", "wbraid id"],
  conversion_name: ["conversion name", "conversion action", "conversion_action", "conversion", "conversion action name"],
  conversion_time: ["conversion time", "conversion timestamp", "date", "converted at", "conversion_date", "conversion date", "conversion datetime"],
  conversion_value: ["conversion value", "value", "amount", "revenue", "sale amount"],
  conversion_currency: ["conversion currency", "currency", "currency code"],
  order_id: ["order id", "order_id", "transaction id", "transaction_id", "transaction identifier"],
  email: ["email", "email address", "customer email", "hashed email", "email sha256", "sha256 email"],
  phone: ["phone", "phone number", "mobile", "customer phone", "hashed phone", "phone sha256", "sha256 phone"],
  first_name: ["first name", "firstname", "fname", "given name", "hashed first name", "first name sha256"],
  last_name: ["last name", "lastname", "lname", "surname", "family name", "hashed last name", "last name sha256"],
  street_address: ["street address", "address", "address line 1", "address1", "street", "hashed street address", "street address sha256"],
  city: ["city", "town"],
  state: ["state", "province", "region"],
  country: ["country", "country code"],
  zip: ["zip", "postal code", "postcode", "zipcode", "zip code"],
  ad_user_data: ["ad user data", "ad_user_data", "user data consent", "consent for ad user data"],
  ad_personalization: ["ad personalization", "ad_personalization", "ad personalisation", "personalization consent", "personalisation consent"],
};

export function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectFields(headers: string[]): FieldMapping {
  const normalized = headers.map((original) => ({ original, value: normalizeHeader(original) }));
  const mapping: FieldMapping = {};

  for (const [key, names] of Object.entries(aliases) as [FieldKey, string[]][]) {
    const namesSet = new Set(names.map(normalizeHeader));
    const found = normalized.find((header) => namesSet.has(header.value));
    if (found) mapping[key] = found.original;
  }

  return mapping;
}
