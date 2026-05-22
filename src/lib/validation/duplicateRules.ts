import type { FieldMapping, ValidationIssue } from "../types";
import { identifierFields } from "./constants";
import { firstValue, get, issue } from "./helpers";

export function checkDuplicateConversion(
  row: Record<string, string>,
  mapping: FieldMapping,
  rowNumber: number,
  conversions: Map<string, number>,
  issues: ValidationIssue[],
) {
  const identifier = firstValue(row, mapping, identifierFields);
  const conversionName = get(row, mapping.conversion_name);
  const conversionTime = get(row, mapping.conversion_time);

  if (!identifier || !conversionName || !conversionTime) return;

  const key = `${identifier}__${conversionName}__${conversionTime}`.toLowerCase();
  const firstRow = conversions.get(key);
  if (firstRow) {
    issues.push(issue("DUPLICATE_CONVERSION", "warning", `This conversion appears to duplicate row ${firstRow}.`, "Remove duplicate rows or use a unique Order ID.", { rowNumber, currentValue: key }));
  } else {
    conversions.set(key, rowNumber);
  }
}

export function checkDuplicateOrderId(
  row: Record<string, string>,
  mapping: FieldMapping,
  rowNumber: number,
  orderIds: Map<string, number>,
  issues: ValidationIssue[],
) {
  const orderId = get(row, mapping.order_id);
  if (!orderId) return;

  const firstRow = orderIds.get(orderId.toLowerCase());
  if (firstRow) {
    issues.push(issue("DUPLICATE_ORDER_ID", "warning", `Order ID duplicates row ${firstRow}.`, "Verify whether this duplicate Order ID is intentional.", { rowNumber, field: mapping.order_id, currentValue: orderId }));
  } else {
    orderIds.set(orderId.toLowerCase(), rowNumber);
  }
}
