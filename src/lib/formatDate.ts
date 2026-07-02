import { i18n } from "../i18n";
import { getDateLocale } from "./dateLocale";

export function formatShortDate(
  isoDate: string,
  locale = getDateLocale(i18n.language),
): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return date.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatActivityTimestamp(
  isoDate: string,
  locale = getDateLocale(i18n.language),
): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const datePart = date.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hasTime = date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0;

  if (!hasTime) {
    return datePart;
  }

  const timePart = date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} • ${timePart}`;
}
