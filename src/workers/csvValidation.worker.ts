import { parseCsvText } from "@/lib/csv";
import { validateCsv } from "@/lib/validation";
import type { ParsedCsv, ValidationResult } from "@/lib/types";

type WorkerRequest = {
  id: string;
  text: string;
};

type WorkerSuccess = {
  id: string;
  ok: true;
  parsed: ParsedCsv;
  result: ValidationResult;
};

type WorkerFailure = {
  id: string;
  ok: false;
  error: string;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, text } = event.data;

  try {
    const parsedCsv = parseCsvText(text);
    const validationResult = validateCsv(parsedCsv);

    const lightweightParsed: ParsedCsv = {
      headers: parsedCsv.headers,
      rawRowCount: parsedCsv.rawRowCount,
      rows: [],
      rawRows: [],
    };

    self.postMessage({ id, ok: true, parsed: lightweightParsed, result: validationResult } satisfies WorkerSuccess);
  } catch (error) {
    self.postMessage({ id, ok: false, error: error instanceof Error ? error.message : "Worker validation failed." } satisfies WorkerFailure);
  }
};

export {};
