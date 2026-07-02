import type { TFunction } from "i18next";

import { formatActivityTimestamp } from "./formatDate";
import { formatNaira } from "./formatMoney";
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
    case "payment_received":
      return {
        title: t("home.activity.paymentReceived.title"),
        subtitle: t("home.activity.paymentReceived.subtitle", {
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
