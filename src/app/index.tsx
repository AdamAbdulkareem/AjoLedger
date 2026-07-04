import { useEffect, useMemo, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";

import { Button } from "../components/Button";
import { VoiceButton } from "../components/VoiceButton";
import { useAuthStatus } from "../context/AuthProvider";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "../lib/onboardingStorage";
import { stopSpeech } from "../lib/speech";
import { useThemedStyles, type Theme } from "../theme";

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

export default function Onboarding() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const listRef = useRef<FlatList<ResolvedSlide>>(null);
  const [index, setIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const styles = useThemedStyles(createStyles);
  const authStatus = useAuthStatus();

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

  useEffect(() => {
    void stopSpeech();
  }, [index]);

  const isLast = index === slides.length - 1;
  const currentSlide = slides[index];
  const speechText = currentSlide
    ? `${currentSlide.title}. ${currentSlide.body}`
    : "";

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

  const renderItem = ({ item }: ListRenderItemInfo<ResolvedSlide>) => (
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
        {speechText ? <VoiceButton text={speechText} /> : null}

        <Button
          label={isLast ? t("onboarding.getStarted") : t("onboarding.continue")}
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
      alignItems: "center",
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
