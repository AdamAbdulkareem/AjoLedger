import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useThemedStyles, type Theme } from "../../theme";

type HomeCarouselPaginationProps = {
  count: number;
  activeIndex: number;
};

type AnimatedDotProps = {
  index: number;
  activeIndex: number;
  inactiveColor: string;
  activeColor: string;
};

function AnimatedDot({
  index,
  activeIndex,
  inactiveColor,
  activeColor,
}: AnimatedDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = index === activeIndex;

    return {
      width: withSpring(isActive ? 36 : 8, { damping: 18, stiffness: 220 }),
      backgroundColor: isActive ? activeColor : inactiveColor,
    };
  }, [activeIndex, index, activeColor, inactiveColor]);

  return <Animated.View style={[dotStyles.dot, animatedStyle]} />;
}

export function HomeCarouselPagination({
  count,
  activeIndex,
}: HomeCarouselPaginationProps) {
  const styles = useThemedStyles(createStyles);

  if (count <= 1) {
    return null;
  }

  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <AnimatedDot
          key={index}
          index={index}
          activeIndex={activeIndex}
          inactiveColor={styles.inactiveDot.backgroundColor as string}
          activeColor={styles.activeDot.backgroundColor as string}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 6,
  },
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 6,
    },
    inactiveDot: {
      backgroundColor: theme.colors.carouselDotInactive,
    },
    activeDot: {
      backgroundColor: theme.colors.brand,
    },
  });
