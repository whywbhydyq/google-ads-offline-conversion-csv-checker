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
    const mapping = detectFields(["Email Address", "Phone Number", "First Name", "Zip", "Ad User Data"]);

    expect(mapping.email).toBe("Email Address");
    expect(mapping.phone).toBe("Phone Number");
    expect(mapping.first_name).toBe("First Name");
    expect(mapping.zip).toBe("Zip");
    expect(mapping.ad_user_data).toBe("Ad User Data");
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

    expect(result.issues.map((issue) => issue.id)).toContain("EMPTY_IDENTIFIER");
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


  it("uses Parameters:TimeZone as file-level timezone for official-style CSV files", () => {
    const result = validate([
      "Parameters:TimeZone=America/Los_Angeles",
      "Google Click ID,Conversion Name,Conversion Time",
      "EAIaIQobChMIvalidGclid01,Qualified lead,05/22/2026 14:30:00",
    ].join("\n"));

    expect(result.issues.map((issue) => issue.id)).not.toContain("MISSING_TIMEZONE");
    expect(result.issues.map((issue) => issue.id)).not.toContain("INVALID_CONVERSION_TIME");
  });

  it("does not treat location-only address data as a usable identifier", () => {
    const result = validate([
      "Country,Zip,Conversion Name,Conversion Time",
      `US,94043,Qualified lead,${dateTimeFromNow(-1)}`,
    ].join("\n"));
    const ids = result.issues.map((issue) => issue.id);

    expect(ids).toContain("LOCATION_ONLY_ADDRESS_COLUMNS");
    expect(ids).toContain("LOCATION_ONLY_IDENTIFIER");
    expect(result.readyRows).toBe(0);
  });

  it("accepts official-style numeric timezone offsets with or without a separating space", () => {
    const result = validate([
      "Google Click ID,Conversion Name,Conversion Time",
      "EAIaIQobChMIvalidGclid01,Qualified lead,05/22/2026 14:30:00 -0500",
      "EAIaIQobChMIvalidGclid02,Qualified lead,2026-05-22 14:30:00+0800",
    ].join("\n"));

    expect(result.issues.map((issue) => issue.id)).not.toContain("INVALID_CONVERSION_TIME");
  });

  it("accepts Parameters:TimeZone with a GMT offset", () => {
    const result = validate([
      "Parameters:TimeZone=-0500",
      "Google Click ID,Conversion Name,Conversion Time",
      "EAIaIQobChMIvalidGclid01,Qualified lead,05/22/2026 14:30:00",
    ].join("\n"));

    expect(result.issues.map((issue) => issue.id)).not.toContain("INVALID_FILE_TIMEZONE_PARAMETER");
    expect(result.issues.map((issue) => issue.id)).not.toContain("MISSING_TIMEZONE");
    expect(result.issues.map((issue) => issue.id)).not.toContain("INVALID_CONVERSION_TIME");
  });

  it("treats multiple click IDs as critical in click ID workflow", () => {
    const result = validateCsv(parseCsvText([
      "Google Click ID,GBRAID,Conversion Name,Conversion Time",
      `EAIaIQobChMIvalidGclid01,gbraid_valid_12345,Qualified lead,${dateTimeFromNow(-1)}`,
    ].join("\n")), "click_id_upload");

    const issue = result.issues.find((item) => item.id === "MULTIPLE_CLICK_IDS");
    expect(issue?.severity).toBe("critical");
  });

  it("does not let empty user-data headers force mixed mode when click IDs have values", () => {
    const result = validate([
      "Google Click ID,Email,Conversion Name,Conversion Time",
      `EAIaIQobChMIvalidGclid01,,Qualified lead,${dateTimeFromNow(-1)}`,
    ].join("\n"));

    expect(result.mode).toBe("click_id_upload");
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
