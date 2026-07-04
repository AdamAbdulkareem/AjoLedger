import { ActionSheetIOS, Alert, Platform } from "react-native";
import type { TFunction } from "i18next";

import { NIGERIAN_BANKS, type NigerianBank } from "./nigerianBanks";

type ShowBankPickerOptions = {
  t: TFunction;
  selectedBankCode?: string;
  onSelect: (bank: NigerianBank) => void;
};

export function showBankPicker({
  t,
  selectedBankCode,
  onSelect,
}: ShowBankPickerOptions): void {
  const labels = NIGERIAN_BANKS.map((bank) => bank.name);
  const cancelLabel = t("home.bankDetails.cancel");

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: t("home.bankDetails.bankLabel"),
        options: [...labels, cancelLabel],
        cancelButtonIndex: labels.length,
      },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex >= labels.length) return;
        onSelect(NIGERIAN_BANKS[buttonIndex]);
      },
    );
    return;
  }

  Alert.alert(
    t("home.bankDetails.bankLabel"),
    undefined,
    [
      ...NIGERIAN_BANKS.map((bank) => ({
        text:
          bank.code === selectedBankCode ? `${bank.name} ✓` : bank.name,
        onPress: () => onSelect(bank),
      })),
      { text: cancelLabel, style: "cancel" as const },
    ],
    { cancelable: true },
  );
}
