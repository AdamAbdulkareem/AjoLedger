import type { CarouselProgressTone, GroupContributionStatusKey } from "../models/home";

export function getCarouselProgressTone(
  progressPercent: number,
  daysUntilDue: number,
  statusKey: GroupContributionStatusKey,
): CarouselProgressTone {
  if (statusKey === "notPaid" || daysUntilDue <= 5) {
    return "urgent";
  }

  if (progressPercent >= 70) {
    return "success";
  }

  return "neutral";
}
