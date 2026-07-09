/** Layout metrics for the home group carousel (Figma `2323:2308`). */
export type CarouselLayout = {
  screenWidth: number;
  cardWidth: number;
  cardHeight: number;
  itemWidth: number;
  sidePadding: number;
  activeHeight: number;
  cardGap: number;
};

/** Figma registered home frame — 375pt wide, carousel card 162×188pt, 12pt gap. */
const FIGMA_FRAME_WIDTH = 375;
const FIGMA_CARD_WIDTH = 162;
const FIGMA_CARD_HEIGHT = 188;
const CARD_WIDTH_RATIO = FIGMA_CARD_WIDTH / FIGMA_FRAME_WIDTH;
const CARD_GAP = 12;
const ACTIVE_HEIGHT_EXTRA = 22;
const MIN_CARD_WIDTH = 148;
const MAX_CARD_WIDTH = 196;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getCarouselLayout(
  screenWidth: number,
  _groupCount = 1,
): CarouselLayout {
  const cardWidth = clamp(
    Math.round(screenWidth * CARD_WIDTH_RATIO),
    MIN_CARD_WIDTH,
    MAX_CARD_WIDTH,
  );
  const itemWidth = cardWidth + CARD_GAP;
  const sidePadding = Math.max(0, (screenWidth - itemWidth) / 2);
  const cardHeight = clamp(
    Math.round(FIGMA_CARD_HEIGHT * (cardWidth / FIGMA_CARD_WIDTH)),
    FIGMA_CARD_HEIGHT,
    210,
  );

  return {
    screenWidth,
    cardWidth,
    cardHeight,
    itemWidth,
    sidePadding,
    activeHeight: cardHeight + ACTIVE_HEIGHT_EXTRA,
    cardGap: CARD_GAP,
  };
}

export function getCarouselSnapOffset(index: number, itemWidth: number): number {
  return index * itemWidth;
}

/** Start near the middle so neighbors peek on both sides (e.g. 3 groups → index 1). */
export function getInitialCarouselIndex(count: number): number {
  if (count <= 1) return 0;
  return Math.floor((count - 1) / 2);
}

export function getCarouselIndexFromOffset(
  offsetX: number,
  itemWidth: number,
  count: number,
): number {
  const index = Math.round(offsetX / itemWidth);
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
}
