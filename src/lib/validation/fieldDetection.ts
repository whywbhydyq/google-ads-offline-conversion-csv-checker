import type { FieldKey, FieldMapping } from "../types";

const aliases: Record<FieldKey, string[]> = {
  gclid: ["gclid", "google click id", "google_click_id"],
  gbraid: ["gbraid"],
  wbraid: ["wbraid"],
  conversion_name: ["conversion name", "conversion action", "conversion_action", "conversion"],
  conversion_time: ["conversion time", "conversion timestamp", "date", "converted at", "conversion_date", "conversion date"],
  conversion_value: ["conversion value", "value", "amount", "revenue", "sale amount"],
  conversion_currency: ["conversion currency", "currency", "currency code"],
  order_id: ["order id", "order_id", "transaction id", "transaction_id"],
  email: ["email", "email address", "customer email"],
  phone: ["phone", "phone number", "mobile", "customer phone"],
  first_name: ["first name", "firstname", "fname"],
  last_name: ["last name", "lastname", "lname"],
  street_address: ["street address", "address", "address line 1"],
  city: ["city"],
  state: ["state", "province", "region"],
  country: ["country", "country code"],
  zip: ["zip", "postal code", "postcode", "zipcode"],
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
