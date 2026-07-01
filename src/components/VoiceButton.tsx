import { useEffect, useRef, useState } from "react";
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
  const isMountedRef = useRef(true);
  const speakGenerationRef = useRef(0);

  const language: LanguageCode = isLanguageCode(i18n.language)
    ? i18n.language
    : "en";

  const setSpeakingIfMounted = (speaking: boolean) => {
    if (isMountedRef.current) {
      setIsSpeaking(speaking);
    }
  };

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
      setSpeakingIfMounted(false);
      return;
    }

    const generation = speakGenerationRef.current + 1;
    speakGenerationRef.current = generation;
    setSpeakingIfMounted(true);

    speakText(
      text,
      language,
      () => {
        if (!isMountedRef.current || speakGenerationRef.current !== generation) {
          return;
        }
        setIsSpeaking(false);
      },
      () => isMountedRef.current && speakGenerationRef.current === generation,
    );
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
