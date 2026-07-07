/** Layout metrics for the home group carousel (Figma-proportioned, centered active card). */
export type CarouselLayout = {
  screenWidth: number;
  cardWidth: number;
  cardHeight: number;
  itemWidth: number;
  sidePadding: number;
  activeHeight: number;
};

/** Figma frame `2323:2308` — compact carousel card is 162×188–210pt. */
const FIGMA_CARD_WIDTH = 162;
const CARD_GAP = 12;
const CARD_HEIGHT = 188;
const ACTIVE_HEIGHT = 210;

export function getCarouselLayout(screenWidth: number): CarouselLayout {
  const cardWidth = Math.min(
    FIGMA_CARD_WIDTH,
    Math.round(screenWidth * 0.432),
  );
  const itemWidth = cardWidth + CARD_GAP;
  const sidePadding = (screenWidth - itemWidth) / 2;

  return {
    screenWidth,
    cardWidth,
    cardHeight: CARD_HEIGHT,
    itemWidth,
    sidePadding,
    activeHeight: ACTIVE_HEIGHT,
  };
}

export function getCarouselSnapOffset(index: number, itemWidth: number): number {
  return index * itemWidth;
}

export function getCarouselIndexFromOffset(
  offsetX: number,
  itemWidth: number,
  count: number,
): number {
  const index = Math.round(offsetX / itemWidth);
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
}
