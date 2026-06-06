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

export type CsvParameter = {
  name: string;
  value: string;
  raw: string;
  rowNumber: number;
};

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
  rawRowCount: number;
  rowNumbers: number[];
  headerRowNumber: number;
  parameters: Record<string, string>;
  parameterRows: CsvParameter[];
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
  | "zip"
  | "ad_user_data"
  | "ad_personalization";

export type FieldMapping = Partial<Record<FieldKey, string>>;

export type ValidationMode = "click_id_upload" | "user_data_preflight" | "user_data_scheduled_prehashed" | "user_data_manual_unhashed" | "mixed_identifiers" | "unknown";
export type ValidationModeInput = "auto" | "click_id_upload" | "user_data_preflight" | "user_data_scheduled_prehashed" | "user_data_manual_unhashed";

export type ValidationResult = {
  issues: ValidationIssue[];
  mapping: FieldMapping;
  mode: ValidationMode;
  requestedMode: ValidationModeInput;
  readyRows: number;
  riskStatus: "No CSV blockers" | "Needs Fix" | "High Risk";
};
