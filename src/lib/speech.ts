import * as Speech from "expo-speech";

import type { LanguageCode } from "../i18n/languages";

const SPEECH_LANGUAGE: Record<LanguageCode, string> = {
  en: "en-NG",
  yo: "yo-NG",
  ha: "ha-NG",
  ig: "ig-NG",
  pcm: "en-NG",
};

export async function stopSpeech(): Promise<void> {
  const isSpeaking = await Speech.isSpeakingAsync();
  if (isSpeaking) {
    Speech.stop();
  }
}

export function speakText(
  text: string,
  language: LanguageCode,
  onFinished?: () => void,
): void {
  void stopSpeech().then(() => {
    Speech.speak(text, {
      language: SPEECH_LANGUAGE[language] ?? "en-NG",
      onDone: onFinished,
      onStopped: onFinished,
    });
  });
}
