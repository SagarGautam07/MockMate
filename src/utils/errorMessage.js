export function toDisplayMessage(value, fallback = 'Something went wrong. Please try again.') {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => toDisplayMessage(item, ''))
      .filter(Boolean);
    return parts.join(', ') || fallback;
  }
  if (typeof value === 'object') {
    if (typeof value.message === 'string' && value.message.trim()) return value.message.trim();
    if (typeof value.error === 'string' && value.error.trim()) return value.error.trim();
    if (typeof value.detail === 'string' && value.detail.trim()) return value.detail.trim();
    if (typeof value.code === 'string' && typeof value.message === 'string') {
      return `${value.code}: ${value.message}`;
    }
    try {
      return JSON.stringify(value);
    } catch (_) {
      return fallback;
    }
  }
  return fallback;
}

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return toDisplayMessage(
    error?.response?.data?.error ??
      error?.response?.data?.message ??
      error?.response?.data?.details ??
      error?.message,
    fallback,
  );
}
