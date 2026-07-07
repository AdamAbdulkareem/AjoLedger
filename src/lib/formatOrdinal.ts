export function formatOrdinal(position: number, locale = "en"): string {
  if (!Number.isFinite(position) || position <= 0) {
    return String(position);
  }

  const rounded = Math.trunc(position);

  if (locale.startsWith("en")) {
    const mod100 = rounded % 100;
    const mod10 = rounded % 10;

    if (mod100 >= 11 && mod100 <= 13) {
      return `${rounded}th`;
    }

    if (mod10 === 1) {
      return `${rounded}st`;
    }

    if (mod10 === 2) {
      return `${rounded}nd`;
    }

    if (mod10 === 3) {
      return `${rounded}rd`;
    }

    return `${rounded}th`;
  }

  return String(rounded);
}
