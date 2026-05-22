export type IssueSeverity = "critical" | "warning" | "info";

export type ValidationIssue = {
  id: string;
  severity: IssueSeverity;
  rowNumber?: number;
  field?: string;
  message: string;
  suggestion: string;
  currentValue?: string;
};

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
  rawRowCount: number;
};

export type FieldKey =
  | "gclid"
  | "gbraid"
  | "wbraid"
  | "conversion_name"
  | "conversion_time"
  | "conversion_value"
  | "conversion_currency"
  | "order_id"
  | "email"
  | "phone"
  | "first_name"
  | "last_name"
  | "street_address"
  | "city"
  | "state"
  | "country"
  | "zip";

export type FieldMapping = Partial<Record<FieldKey, string>>;

export type ValidationResult = {
  issues: ValidationIssue[];
  mapping: FieldMapping;
  readyRows: number;
  riskStatus: "Ready" | "Needs Fix" | "High Risk";
};
