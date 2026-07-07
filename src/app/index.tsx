import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button } from "../components/Button";
import {
  AJOLEDGER_LOGO_SIZE,
  AjoLedgerLogo,
} from "../components/AjoLedgerLogo";
import { useAuthStatus } from "../context/AuthProvider";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "../lib/onboardingStorage";
import { useTheme, useThemedStyles, type Theme } from "../theme";

type SlideKey = "welcome" | "recorded" | "confidence";

type Slide = {
  key: SlideKey;
  image: ImageSourcePropType;
  titleKey: `onboarding.${SlideKey}.title`;
  bodyKey: `onboarding.${SlideKey}.body`;
};

type ResolvedSlide = Slide & {
  title: string;
  body: string;
};

/** Figma onboarding frames are 375×812 with absolute positioning. */
const FIGMA_FRAME_WIDTH = 375;
const FIGMA_LOGO_BOTTOM = 54 + AJOLEDGER_LOGO_SIZE;
const FIGMA_CONTENT_PADDING = 16;
const FIGMA_BUTTON_INSET = 12;
const FIGMA_TITLE_BODY_GAP = 5;
const FIGMA_TEXT_BUTTON_GAP = 32;
const FIGMA_BUTTON_DOTS_GAP = 32;
const DOT_SIZE = 8;
const DOT_ACTIVE_WIDTH = 24;

const slideIllustrations: Record<
  SlideKey,
  { x: number; y: number; width: number; height: number }
> = {
  welcome: { x: -58, y: 143, width: 504, height: 336 },
  recorded: { x: -81, y: 128, width: 537, height: 358 },
  confidence: { x: -45, y: 153, width: 465, height: 310 },
};

const slideDefinitions: Slide[] = [
  {
    key: "welcome",
    image: require("../../assets/onboarding/onboarding-1.png"),
    titleKey: "onboarding.welcome.title",
    bodyKey: "onboarding.welcome.body",
  },
  {
    key: "recorded",
    image: require("../../assets/onboarding/onboarding-2.png"),
    titleKey: "onboarding.recorded.title",
    bodyKey: "onboarding.recorded.body",
  },
  {
    key: "confidence",
    image: require("../../assets/onboarding/onboarding-3.png"),
    titleKey: "onboarding.confidence.title",
    bodyKey: "onboarding.confidence.body",
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<ResolvedSlide>,
);

type PaginationDotProps = {
  index: number;
  slideWidth: number;
  scrollX: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
};

function PaginationDot({
  index,
  slideWidth,
  scrollX,
  activeColor,
  inactiveColor,
}: PaginationDotProps) {
  const inputRange = [
    (index - 1) * slideWidth,
    index * slideWidth,
    (index + 1) * slideWidth,
  ];

  const animatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      scrollX.value,
      inputRange,
      [DOT_SIZE, DOT_ACTIVE_WIDTH, DOT_SIZE],
      Extrapolation.CLAMP,
    ),
    backgroundColor: interpolateColor(scrollX.value, inputRange, [
      inactiveColor,
      activeColor,
      inactiveColor,
    ]),
  }));

  return <Animated.View style={[dotStyles.dot, animatedStyle]} />;
}

const dotStyles = StyleSheet.create({
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});

export default function Onboarding() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const listRef = useRef<FlatList<ResolvedSlide>>(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const authStatus = useAuthStatus();
  const scale = width / FIGMA_FRAME_WIDTH;

  const slides = useMemo(
    () =>
      slideDefinitions.map((slide) => ({
        ...slide,
        title: t(slide.titleKey),
        body: t(slide.bodyKey),
      })),
    [t],
  );

  useEffect(() => {
    getOnboardingCompleted()
      .then(setHasCompletedOnboarding)
      .catch(() => setHasCompletedOnboarding(false));
  }, []);

  const isLast = index === slides.length - 1;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  if (hasCompletedOnboarding === null) {
    return <View style={styles.container} />;
  }

  if (hasCompletedOnboarding) {
    if (authStatus === "booting") {
      return <View style={styles.container} />;
    }
    if (authStatus === "authenticated") {
      return <Redirect href="/(app)/home" />;
    }
    if (authStatus === "needsPasscodeEntry") {
      return <Redirect href="/enter-access-passcode" />;
    }
    if (authStatus === "needsPasscodeSetup") {
      return <Redirect href="/setup-access-passcode" />;
    }
    return <Redirect href="/register" />;
  }

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const handleNext = async () => {
    if (isLast) {
      await setOnboardingCompleted();
      router.replace("/register");
      return;
    }
    listRef.current?.scrollToOffset({
      offset: (index + 1) * width,
      animated: true,
    });
  };

  const renderItem = ({ item }: ListRenderItemInfo<ResolvedSlide>) => {
    const illustration = slideIllustrations[item.key];

    return (
      <View style={[styles.slide, { width }]}>
        <Image
          source={item.image}
          style={{
            position: "absolute",
            top: (illustration.y - FIGMA_LOGO_BOTTOM) * scale,
            left: illustration.x * scale,
            width: illustration.width * scale,
            height: illustration.height * scale,
          }}
          contentFit="contain"
          transition={0}
          recyclingKey={item.key}
          accessibilityLabel={item.title}
        />

        <View
          style={[
            styles.textBlock,
            {
              paddingHorizontal: FIGMA_CONTENT_PADDING * scale,
              gap: FIGMA_TITLE_BODY_GAP * scale,
            },
          ]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <AjoLedgerLogo style={styles.logo} />

      <AnimatedFlatList
        ref={listRef}
        data={slides}
        keyExtractor={(slide) => slide.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.list}
      />

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: FIGMA_CONTENT_PADDING * scale,
            paddingTop: FIGMA_TEXT_BUTTON_GAP * scale,
          },
        ]}
      >
        <Button
          label={isLast ? t("onboarding.getStarted") : t("onboarding.continue")}
          iconRight="arrow-forward"
          onPress={handleNext}
          style={{ marginHorizontal: FIGMA_BUTTON_INSET * scale }}
        />

        <View
          style={[styles.dots, { marginTop: FIGMA_BUTTON_DOTS_GAP * scale }]}
        >
          {slides.map((slide, dotIndex) => (
            <PaginationDot
              key={slide.key}
              index={dotIndex}
              slideWidth={width}
              scrollX={scrollX}
              activeColor={theme.colors.brand}
              inactiveColor={theme.colors.dotInactive}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    logo: {
      alignSelf: "center",
    },
    list: {
      flex: 1,
    },
    slide: {
      flex: 1,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    textBlock: {
      alignItems: "stretch",
    },
    title: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    body: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    footer: {
      alignItems: "stretch",
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },
  });
