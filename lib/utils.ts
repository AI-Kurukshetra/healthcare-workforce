export type ClassValue = string | number | boolean | undefined | null | Record<string, boolean>;

export function cn(...inputs: ClassValue[]) {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === "string" || typeof input === "number") return String(input).trim();
      if (typeof input === "boolean") return input ? [] : [];
      return Object.entries(input)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key.trim());
    })
    .filter(Boolean)
    .join(" ");
}
