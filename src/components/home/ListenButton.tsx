import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import {
  isLanguageCode,
  type LanguageCode,
} from "../../i18n/languages";
import { speakText, stopSpeech } from "../../lib/speech";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type ListenButtonProps = {
  text: string;
};

export function ListenButton({ text }: ListenButtonProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isMountedRef = useRef(true);
  const speakGenerationRef = useRef(0);

  const language: LanguageCode = isLanguageCode(i18n.language)
    ? i18n.language
    : "en";

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      speakGenerationRef.current += 1;
      void stopSpeech();
    };
  }, []);

  const handlePress = async () => {
    if (isSpeaking) {
      speakGenerationRef.current += 1;
      await stopSpeech();
      if (isMountedRef.current) setIsSpeaking(false);
      return;
    }

    const generation = speakGenerationRef.current + 1;
    speakGenerationRef.current = generation;
    setIsSpeaking(true);

    speakText(
      text,
      language,
      () => {
        if (isMountedRef.current && speakGenerationRef.current === generation) {
          setIsSpeaking(false);
        }
      },
      () => isMountedRef.current && speakGenerationRef.current === generation,
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={isSpeaking ? t("voice.stop") : t("home.listen")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={isSpeaking ? "stop-circle-outline" : "volume-high-outline"}
        size={18}
        color={theme.colors.successDark}
      />
      <Text style={styles.label}>
        {isSpeaking ? t("voice.stop") : t("home.listen")}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
    label: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.successDark,
    },
  });
