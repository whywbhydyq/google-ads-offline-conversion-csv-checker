import { describe, expect, it } from "vitest";
import { exportIssuesCsv, parseCsvText } from "./csv";

const dangerousValues = ["=IMPORTXML(\"https://example.com\")", "+SUM(1,2)", "-10+20", "@SUM(1,2)"];

describe("parseCsvText", () => {
  it("removes UTF-8 BOM and parses rows", () => {
    const parsed = parseCsvText("\uFEFFGoogle Click ID,Conversion Name\nabc123,Lead");

    expect(parsed.headers).toEqual(["Google Click ID", "Conversion Name"]);
    expect(parsed.rawRowCount).toBe(1);
    expect(parsed.rows[0]["Google Click ID"]).toBe("abc123");
  });

  it("throws for empty input", () => {
    expect(() => parseCsvText("\n\n")).toThrow("empty");
  });
});

describe("exportIssuesCsv", () => {
  it("escapes spreadsheet formula-like values", () => {
    const csv = exportIssuesCsv(
      dangerousValues.map((value, index) => ({
        id: `RULE_${index}`,
        severity: "warning" as const,
        rowNumber: index + 2,
        message: "Formula-like value",
        suggestion: "Escape it",
        currentValue: value,
      })),
    );

    expect(csv).toContain("'=IMPORTXML");
    expect(csv).toContain("'+SUM");
    expect(csv).toContain("'-10+20");
    expect(csv).toContain("'@SUM");
  });
});
