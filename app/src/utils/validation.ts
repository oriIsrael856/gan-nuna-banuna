export function isBlank(value: string) {
  return value.trim().length === 0;
}

export function isValidPhone(value: string) {
  const normalized = value.replace(/[\s-]/g, "");
  return /^0\d{8,9}$/.test(normalized);
}

export function isValidEmail(value: string) {
  if (isBlank(value)) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
