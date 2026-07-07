import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
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
      [0, 12],
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
  const { width: screenWidth } = useWindowDimensions();
  const layout = useMemo(() => getCarouselLayout(screenWidth), [screenWidth]);
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

  const ensureInitialPosition = useCallback(() => {
    centerOnIndex(selectedIndexRef.current, false);
  }, [centerOnIndex]);

  useEffect(() => {
    centerOnIndex(selectedIndexRef.current, false);

    const frame = requestAnimationFrame(() => {
      centerOnIndex(selectedIndexRef.current, false);
    });

    return () => cancelAnimationFrame(frame);
  }, [centerOnIndex, groups.length, layout.itemWidth, layout.sidePadding]);

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
    <View style={styles.section}>
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
          onContentSizeChange={ensureInitialPosition}
          onLayout={ensureInitialPosition}
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
      marginTop: theme.spacing.xs,
    },
    carouselViewport: {
      overflow: "hidden",
    },
  });
