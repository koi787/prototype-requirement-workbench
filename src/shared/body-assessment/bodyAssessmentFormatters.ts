import type { AssessmentMetric } from './bodyAssessmentTypes';

export interface AssessmentMetricFormatOptions {
  signed?: boolean;
  emptyValue?: string;
}

export function formatAssessmentMetric(
  item: AssessmentMetric,
  { signed = false, emptyValue = '' }: AssessmentMetricFormatOptions = {},
): string {
  if (item.value === null) return emptyValue;
  const precision = item.precision ?? (Number.isInteger(item.value) ? 0 : 1);
  const prefix = signed && item.value > 0 ? '+' : '';
  const value = signed && item.value === 0 ? '0' : item.value.toFixed(precision);
  return `${prefix}${value}${item.unit ?? ''}`;
}

export function formatAbsoluteAssessmentMetric(item: AssessmentMetric, precision: number, unit = item.unit): string {
  if (item.value === null) return '';
  return `${Math.abs(item.value).toFixed(precision)}${unit ?? ''}`;
}
