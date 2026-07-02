import type { TFunction } from "i18next";

import { formatShortDate } from "./formatDate";
import { formatNaira } from "./formatMoney";
import { localizeActivityItem } from "./localizeActivity";
import type { HomeDashboard } from "../models/home";

export function buildHomeSpeechText(
  t: TFunction,
  greetingKey: "goodMorning" | "goodAfternoon" | "goodEvening",
  dashboard: HomeDashboard,
): string {
  const parts = [
    t(`home.${greetingKey}`, { name: dashboard.displayName }),
    t("home.overviewSubtitle"),
    `${dashboard.group.name}. ${t(`home.${groupStatusKey(dashboard.group.status)}`)}.`,
    t("home.cycleAmount", {
      frequency: t(
        dashboard.group.cycleFrequency === "monthly"
          ? "home.cycleMonthly"
          : "home.cycleWeekly",
      ),
      amount: formatNaira(dashboard.group.amountPerMember),
    }),
    `${t("home.myProgress")}. ${dashboard.progress.percent}%. ${t("home.contributed", {
      paid: formatNaira(dashboard.progress.amountPaid),
      total: formatNaira(dashboard.progress.expectedTotal),
    })}`,
    `${t("home.nextPayout")}. ${formatShortDate(dashboard.payout.date)}. ${formatDaysToGo(t, dashboard.payout.daysRemaining)}.`,
    `${t("home.nextContribution")}. ${formatNaira(dashboard.nextContribution.amount)}. ${formatContributionDue(t, dashboard.nextContribution.daysUntilDue, dashboard.nextContribution.dueDate)}.`,
  ];

  for (const item of dashboard.recentActivity) {
    const copy = localizeActivityItem(t, item);
    parts.push(`${copy.title}. ${copy.subtitle}. ${copy.dateLabel}.`);
  }

  return parts.join(" ");
}

export function formatDaysToGo(t: TFunction, days: number): string {
  if (days <= 0) return t("home.dueTodayShort");
  if (days === 1) return t("home.dayToGo");
  return t("home.daysToGo", { count: days });
}

export function formatContributionDue(
  t: TFunction,
  daysUntilDue: number,
  dueDate: string,
): string {
  const date = formatShortDate(dueDate);
  if (daysUntilDue <= 0) return t("home.dueTodayWithDate", { date });
  if (daysUntilDue === 1) return t("home.dueTomorrowWithDate", { date });
  return t("home.dueInDaysWithDate", { count: daysUntilDue, date });
}

export function groupStatusKey(
  status: HomeDashboard["group"]["status"],
): "groupActive" | "groupPending" | "groupCompleted" {
  switch (status) {
    case "active":
      return "groupActive";
    case "pending":
      return "groupPending";
    case "completed":
      return "groupCompleted";
  }
}
