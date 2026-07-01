import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import {
  isLanguageCode,
  type LanguageCode,
} from "../i18n/languages";
import { speakText, stopSpeech } from "../lib/speech";
import { useTheme, useThemedStyles, type Theme } from "../theme";

type VoiceButtonProps = {
  text: string;
  accessibilityLabel?: string;
};

export function VoiceButton({ text, accessibilityLabel }: VoiceButtonProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const language: LanguageCode = isLanguageCode(i18n.language)
    ? i18n.language
    : "en";

  useEffect(() => {
    return () => {
      void stopSpeech();
    };
  }, []);

  const handlePress = async () => {
    if (isSpeaking) {
      await stopSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speakText(text, language, () => setIsSpeaking(false));
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (isSpeaking ? t("voice.stop") : t("voice.readAloud"))
      }
      accessibilityState={{ selected: isSpeaking }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={isSpeaking ? "stop-circle-outline" : "volume-high-outline"}
        size={22}
        color={theme.colors.textPrimary}
      />
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.dotInactive,
    },
    pressed: {
      opacity: 0.85,
    },
  });
