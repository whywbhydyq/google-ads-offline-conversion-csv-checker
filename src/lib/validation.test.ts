import { describe, expect, it } from "vitest";
import { parseCsvText } from "./csv";
import { detectFields, normalizeHeader, validateCsv } from "./validation";

function dateTimeFromNow(days: number, includeTimezone = true) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const pad = (value: number) => value.toString().padStart(2, "0");
  const base = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  return includeTimezone ? `${base}+08:00` : base;
}

function validate(text: string) {
  return validateCsv(parseCsvText(text));
}

describe("normalizeHeader", () => {
  it("normalizes separators, casing, and punctuation", () => {
    expect(normalizeHeader(" Conversion_Name ")).toBe("conversion name");
    expect(normalizeHeader("Google-Click-ID")).toBe("google click id");
    expect(normalizeHeader("\uFEFFConversion Time")).toBe("conversion time");
  });
});

describe("detectFields", () => {
  it("detects common Google Ads offline conversion columns", () => {
    const mapping = detectFields([
      "Google Click ID",
      "Conversion Name",
      "Conversion Time",
      "Conversion Value",
      "Conversion Currency",
      "Order ID",
    ]);

    expect(mapping.gclid).toBe("Google Click ID");
    expect(mapping.conversion_name).toBe("Conversion Name");
    expect(mapping.conversion_time).toBe("Conversion Time");
    expect(mapping.conversion_value).toBe("Conversion Value");
    expect(mapping.conversion_currency).toBe("Conversion Currency");
    expect(mapping.order_id).toBe("Order ID");
  });

  it("detects enhanced-conversion user data columns", () => {
    const mapping = detectFields(["Email Address", "Phone Number", "First Name", "Zip"]);

    expect(mapping.email).toBe("Email Address");
    expect(mapping.phone).toBe("Phone Number");
    expect(mapping.first_name).toBe("First Name");
    expect(mapping.zip).toBe("Zip");
  });
});

describe("validateCsv", () => {
  it("accepts a valid click ID CSV without critical issues", () => {
    const result = validate([
      "Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID",
      `EAIaIQobChMIvalidGclid01,Qualified lead,${dateTimeFromNow(-1)},125.50,USD,ORDER-1001`,
    ].join("\n"));

    expect(result.issues.filter((issue) => issue.severity === "critical")).toHaveLength(0);
    expect(result.readyRows).toBe(1);
  });

  it("marks rows as not ready when file-level required columns are missing", () => {
    const result = validate("Email,Phone\njane@example.com,+14155552671");

    expect(result.issues.map((issue) => issue.id)).toContain("MISSING_CONVERSION_NAME");
    expect(result.issues.map((issue) => issue.id)).toContain("MISSING_CONVERSION_TIME");
    expect(result.readyRows).toBe(0);
  });

  it("detects missing row identifiers", () => {
    const result = validate([
      "Google Click ID,Conversion Name,Conversion Time",
      `,Qualified lead,${dateTimeFromNow(-1)}`,
    ].join("\n"));

    expect(result.issues.map((issue) => issue.id)).toContain("EMPTY_CLICK_ID");
  });

  it("detects invalid, future, date-only, and timezone-less conversion times", () => {
    const result = validate([
      "Google Click ID,Conversion Name,Conversion Time",
      "EAIaIQobChMIvalidGclid01,Qualified lead,not a date",
      `EAIaIQobChMIvalidGclid02,Qualified lead,${dateTimeFromNow(1, false)}`,
      "EAIaIQobChMIvalidGclid03,Qualified lead,2026-01-01",
    ].join("\n"));
    const ids = result.issues.map((issue) => issue.id);

    expect(ids).toContain("INVALID_CONVERSION_TIME");
    expect(ids).toContain("FUTURE_CONVERSION_TIME");
    expect(ids).toContain("DATE_ONLY_TIME");
    expect(ids).toContain("MISSING_TIMEZONE");
  });

  it("does not treat ordinary numeric phone numbers as broken hashes", () => {
    const result = validate([
      "Email,Phone,Conversion Name,Conversion Time",
      `jane@example.com,+14155552671,Qualified lead,${dateTimeFromNow(-1)}`,
    ].join("\n"));

    expect(result.issues.map((issue) => issue.id)).not.toContain("HASH_INVALID_LENGTH");
  });

  it("detects duplicate conversions and duplicate order IDs", () => {
    const time = dateTimeFromNow(-1);
    const result = validate([
      "Google Click ID,Conversion Name,Conversion Time,Order ID",
      `EAIaIQobChMIvalidGclid01,Qualified lead,${time},ORDER-1001`,
      `EAIaIQobChMIvalidGclid01,Qualified lead,${time},ORDER-1001`,
    ].join("\n"));
    const ids = result.issues.map((issue) => issue.id);

    expect(ids).toContain("DUPLICATE_CONVERSION");
    expect(ids).toContain("DUPLICATE_ORDER_ID");
  });

  it("warns about invalid conversion values and currency formats", () => {
    const result = validate([
      "Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency",
      `EAIaIQobChMIvalidGclid01,Qualified lead,${dateTimeFromNow(-1)},abc,US`,
    ].join("\n"));
    const ids = result.issues.map((issue) => issue.id);

    expect(ids).toContain("INVALID_CONVERSION_VALUE");
    expect(ids).toContain("INVALID_CURRENCY");
  });
});
