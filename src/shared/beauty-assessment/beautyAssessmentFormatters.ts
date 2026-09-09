/**
 * Formats the source wall-clock value without converting it through a local
 * timezone. Beauty reports are displayed with the timestamp supplied by the
 * source system.
 */
export function formatBeautyDetectTime(value: string | null, emptyValue = '--'): string {
  if (!value) return emptyValue;

  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.exec(value.trim());
  if (!match) return emptyValue;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (
    month < 1 || month > 12 || day < 1 || day > (days[month - 1] ?? 0)
    || Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText ?? 0) > 59
  ) return emptyValue;

  return `${yearText}-${monthText}-${dayText} ${hourText}:${minuteText}`;
}
