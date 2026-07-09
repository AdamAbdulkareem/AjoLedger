import {
  getCarouselIndexFromOffset,
  getCarouselLayout,
  getCarouselSnapOffset,
  getInitialCarouselIndex,
} from "../carouselMetrics";

describe("getInitialCarouselIndex", () => {
  it("returns 0 for empty or single-item carousels", () => {
    expect(getInitialCarouselIndex(0)).toBe(0);
    expect(getInitialCarouselIndex(1)).toBe(0);
  });

  it("starts on the middle card so neighbors peek on both sides", () => {
    expect(getInitialCarouselIndex(2)).toBe(0);
    expect(getInitialCarouselIndex(3)).toBe(1);
    expect(getInitialCarouselIndex(4)).toBe(1);
    expect(getInitialCarouselIndex(5)).toBe(2);
  });
});

describe("getCarouselLayout", () => {
  it("centers the active card with equal side padding", () => {
    const layout = getCarouselLayout(375, 3);

    expect(layout.sidePadding).toBe((375 - layout.itemWidth) / 2);
    expect(layout.sidePadding).toBeGreaterThan(0);
  });
});

describe("carousel snap math", () => {
  it("maps offsets to indexes", () => {
    expect(getCarouselSnapOffset(1, 174)).toBe(174);
    expect(getCarouselIndexFromOffset(174, 174, 3)).toBe(1);
    expect(getCarouselIndexFromOffset(0, 174, 3)).toBe(0);
  });
});
