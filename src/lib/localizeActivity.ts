import type { TFunction } from "i18next";

import { formatActivityTimestamp, formatShortDate } from "./formatDate";
import { formatNaira, formatPlainAmount } from "./formatMoney";
import type { RecentActivityItem } from "../models/home";

export type LocalizedActivityCopy = {
  title: string;
  subtitle: string;
  dateLabel: string;
};

export function localizeActivityItem(
  t: TFunction,
  item: RecentActivityItem,
  locale?: string,
): LocalizedActivityCopy {
  const dateLabel = formatActivityTimestamp(item.occurredAt, locale);

  switch (item.type) {
    case "payment_paid":
      return {
        title: t("home.activity.paymentPaid.title"),
        subtitle: t("home.activity.paymentPaid.subtitle", {
          amount: formatNaira(item.amount ?? 0),
        }),
        dateLabel,
      };
    case "contribution_reminder":
      return {
        title: t("home.activity.contributionReminder.title"),
        subtitle: t("home.activity.contributionReminder.subtitle"),
        dateLabel,
      };
    case "upcoming_payout":
      return {
        title: t("home.activity.upcomingPayout.title"),
        subtitle: t("home.activity.upcomingPayout.subtitle", {
          name: item.recipientName ?? "",
        }),
        dateLabel,
      };
  }
}

function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatPayoutNumber(payoutNumber: number, locale?: string): string {
  if (!locale || locale.startsWith("en")) {
    return `${payoutNumber}${ordinalSuffix(payoutNumber)}`;
  }
  return String(payoutNumber);
}

export function formatPayoutProgressLabel(
  t: TFunction,
  payoutNumber: number,
  payoutAmountPaid: number,
  payoutAmountTotal: number,
  locale?: string,
): string {
  return t("home.payoutProgress", {
    number: formatPayoutNumber(payoutNumber, locale),
    paid: formatPlainAmount(payoutAmountPaid),
    total: formatPlainAmount(payoutAmountTotal),
  });
}

export function formatAmountRemainsDue(
  t: TFunction,
  daysUntilDue: number,
  dueDate: string,
): string {
  const date = formatShortDate(dueDate);
  if (daysUntilDue <= 0) {
    return t("home.dueTodayDash", { date });
  }
  return t("home.dueInDaysDash", { count: daysUntilDue, date });
}
