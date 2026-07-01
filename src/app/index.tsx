import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";

import { Button } from "../components/Button";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "../lib/onboardingStorage";
import { useThemedStyles, type Theme } from "../theme";

type Slide = {
  key: string;
  image: ImageSourcePropType;
  title: string;
  body: string;
};

const slides: Slide[] = [
  {
    key: "welcome",
    image: require("../../assets/onboarding/onboarding-1.png"),
    title: "Welcome to AjoLedger",
    body: "Modernizing community savings with transparency, trust, and simplicity while preserving the Ajo tradition you already know.",
  },
  {
    key: "recorded",
    image: require("../../assets/onboarding/onboarding-2.png"),
    title: "Every Payment. Automatically Recorded.",
    body: "No more spreadsheets or payment receipts. Every contribution is tracked automatically, giving you a clear view of your savings anytime.",
  },
  {
    key: "confidence",
    image: require("../../assets/onboarding/onboarding-3.png"),
    title: "Track Your Savings with Confidence.",
    body: "Know your contribution status, upcoming payouts, and savings progress all in one simple, accessible dashboard designed for everyone.",
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    getOnboardingCompleted()
      .then(setHasCompletedOnboarding)
      .catch(() => setHasCompletedOnboarding(false));
  }, []);

  const isLast = index === slides.length - 1;

  if (hasCompletedOnboarding === null) {
    return <View style={styles.container} />;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/get-started" />;
  }

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const handleNext = async () => {
    if (isLast) {
      await setOnboardingCompleted();
      router.replace("/get-started");
      return;
    }
    listRef.current?.scrollToOffset({
      offset: (index + 1) * width,
      animated: true,
    });
  };

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.illustrationWrap}>
        <Image
          source={item.image}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={item.title}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(slide) => slide.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      />

      <View style={styles.footer}>
        <Button
          label={isLast ? "Get Started" : "Continue"}
          iconRight="arrow-forward"
          onPress={handleNext}
        />

        <View style={styles.dots}>
          {slides.map((slide, i) => (
            <View
              key={slide.key}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotInactive,
              ]}
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
    slide: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    illustrationWrap: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    illustration: {
      width: "100%",
      height: "100%",
    },
    textWrap: {
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingBottom: theme.spacing.lg,
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
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    dotActive: {
      width: 24,
      backgroundColor: theme.colors.brand,
    },
    dotInactive: {
      width: 8,
      backgroundColor: theme.colors.dotInactive,
    },
  });
