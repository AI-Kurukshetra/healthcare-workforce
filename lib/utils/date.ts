export const toIso = (value: string | Date) =>
  (value instanceof Date ? value : new Date(value)).toISOString();
