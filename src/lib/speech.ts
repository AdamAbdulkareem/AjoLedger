import * as Speech from "expo-speech";

import type { LanguageCode } from "../i18n/languages";

const SPEECH_LANGUAGE: Record<LanguageCode, string> = {
  en: "en-NG",
  yo: "yo-NG",
  ha: "ha-NG",
  ig: "ig-NG",
  pcm: "en-NG",
};

let speechGeneration = 0;

async function haltSpeech(): Promise<void> {
  if (await Speech.isSpeakingAsync()) {
    await Speech.stop();
  }
}

export async function stopSpeech(): Promise<void> {
  speechGeneration += 1;
  await haltSpeech();
}

export function speakText(
  text: string,
  language: LanguageCode,
  onFinished?: () => void,
  shouldContinue?: () => boolean,
): void {
  const generation = ++speechGeneration;

  void (async () => {
    await haltSpeech();

    if (generation !== speechGeneration) {
      return;
    }

    if (shouldContinue && !shouldContinue()) {
      return;
    }

    const finishIfCurrent = () => {
      if (generation !== speechGeneration) {
        return;
      }
      onFinished?.();
    };

    Speech.speak(text, {
      language: SPEECH_LANGUAGE[language] ?? "en-NG",
      onDone: finishIfCurrent,
      onStopped: finishIfCurrent,
    });
  })();
}
