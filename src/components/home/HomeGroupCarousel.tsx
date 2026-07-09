import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import { HomeGroupCarouselCard } from "./HomeGroupCarouselCard";
import { HomeCarouselPagination } from "./HomeCarouselPagination";
import type { GroupHomeDashboard } from "../../models/home";
import {
  getCarouselIndexFromOffset,
  getCarouselLayout,
  getCarouselSnapOffset,
} from "../../lib/carouselMetrics";
import { useThemedStyles, type Theme } from "../../theme";

type HomeGroupCarouselProps = {
  groups: GroupHomeDashboard[];
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
  onGroupPress: (groupId: string) => void;
};

type CarouselSlideProps = {
  dashboard: GroupHomeDashboard;
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  cardWidth: number;
  cardHeight: number;
  isSelected: boolean;
  onPress: () => void;
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<GroupHomeDashboard>);

const CarouselSlide = memo(function CarouselSlide({
  dashboard,
  index,
  scrollX,
  itemWidth,
  cardWidth,
  cardHeight,
  isSelected,
  onPress,
}: CarouselSlideProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const itemOffset = index * itemWidth;
    const distance = Math.abs(scrollX.value - itemOffset);

    const scale = interpolate(
      distance,
      [0, itemWidth],
      [1, 0.9],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      distance,
      [0, itemWidth * 0.5, itemWidth],
      [1, 0.9, 0.75],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      distance,
      [0, itemWidth],
      [0, 10],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <View style={[slideStyles.slide, { width: itemWidth, height: cardHeight + 28 }]}>
      <Animated.View style={[slideStyles.cardWrap, animatedStyle]}>
        <HomeGroupCarouselCard
          dashboard={dashboard}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          isSelected={isSelected}
          onPress={onPress}
        />
      </Animated.View>
    </View>
  );
});

export function HomeGroupCarousel({
  groups,
  selectedIndex,
  onSelectedIndexChange,
  onGroupPress,
}: HomeGroupCarouselProps) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const [viewportWidth, setViewportWidth] = useState(windowWidth);
  const layout = useMemo(
    () => getCarouselLayout(viewportWidth, groups.length),
    [groups.length, viewportWidth],
  );
  const listRef = useRef<FlatList<GroupHomeDashboard>>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const initialOffset = getCarouselSnapOffset(selectedIndex, layout.itemWidth);
  const scrollX = useSharedValue(initialOffset);

  selectedIndexRef.current = selectedIndex;

  const snapOffsets = useMemo(
    () => groups.map((_, index) => getCarouselSnapOffset(index, layout.itemWidth)),
    [groups, layout.itemWidth],
  );

  const contentOffset = useMemo(
    () => ({ x: initialOffset, y: 0 }),
    [initialOffset],
  );

  const updateSelectedIndex = useCallback(
    (offsetX: number) => {
      const clamped = getCarouselIndexFromOffset(
        offsetX,
        layout.itemWidth,
        groups.length,
      );

      if (clamped !== selectedIndexRef.current) {
        onSelectedIndexChange(clamped);
      }
    },
    [groups.length, layout.itemWidth, onSelectedIndexChange],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      runOnJS(updateSelectedIndex)(event.contentOffset.x);
    },
    onEndDrag: (event) => {
      runOnJS(updateSelectedIndex)(event.contentOffset.x);
    },
  });

  const centerOnIndex = useCallback(
    (index: number, animated = false) => {
      const clamped = Math.min(Math.max(index, 0), groups.length - 1);
      const offset = getCarouselSnapOffset(clamped, layout.itemWidth);

      scrollX.value = offset;
      listRef.current?.scrollToOffset({ offset, animated });
    },
    [groups.length, layout.itemWidth, scrollX],
  );

  const ensureCenteredPosition = useCallback(() => {
    centerOnIndex(selectedIndexRef.current, false);
  }, [centerOnIndex]);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setViewportWidth((current) => (current === nextWidth ? current : nextWidth));
    }
  }, []);

  useEffect(() => {
    setViewportWidth(windowWidth);
  }, [windowWidth]);

  useEffect(() => {
    ensureCenteredPosition();

    const frame = requestAnimationFrame(() => {
      ensureCenteredPosition();
    });

    return () => cancelAnimationFrame(frame);
  }, [
    ensureCenteredPosition,
    groups.length,
    layout.itemWidth,
    layout.sidePadding,
    selectedIndex,
    viewportWidth,
  ]);

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      centerOnIndex(index, animated);
      onSelectedIndexChange(index);
    },
    [centerOnIndex, onSelectedIndexChange],
  );

  const handleCardPress = useCallback(
    (index: number, groupId: string) => {
      if (index === selectedIndexRef.current) {
        onGroupPress(groupId);
        return;
      }

      scrollToIndex(index);
    },
    [onGroupPress, scrollToIndex],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<GroupHomeDashboard> | null | undefined, index: number) => ({
      length: layout.itemWidth,
      offset: layout.itemWidth * index,
      index,
    }),
    [layout.itemWidth],
  );

  return (
    <View style={[styles.section, { width: windowWidth }]} onLayout={handleViewportLayout}>
      <View style={[styles.carouselViewport, { height: layout.activeHeight + 8 }]}>
        <AnimatedFlatList
          ref={listRef}
          data={groups}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.groupId}
          snapToOffsets={snapOffsets}
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          contentOffset={contentOffset}
          contentContainerStyle={[
            slideStyles.listContent,
            { paddingHorizontal: layout.sidePadding },
          ]}
          getItemLayout={getItemLayout}
          initialNumToRender={groups.length}
          onContentSizeChange={ensureCenteredPosition}
          onLayout={ensureCenteredPosition}
          renderItem={({ item, index }) => (
            <CarouselSlide
              dashboard={item}
              index={index}
              scrollX={scrollX}
              itemWidth={layout.itemWidth}
              cardWidth={layout.cardWidth}
              cardHeight={layout.cardHeight}
              isSelected={index === selectedIndex}
              onPress={() => handleCardPress(index, item.groupId)}
            />
          )}
        />
      </View>

      <HomeCarouselPagination count={groups.length} activeIndex={selectedIndex} />
    </View>
  );
}

const slideStyles = StyleSheet.create({
  listContent: {
    alignItems: "center",
  },
  slide: {
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cardWrap: {
    width: "100%",
    alignItems: "center",
  },
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      gap: 4,
      marginHorizontal: -theme.spacing.md,
    },
    carouselViewport: {
      overflow: "hidden",
    },
  });
