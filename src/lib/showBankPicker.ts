import { ActionSheetIOS, Alert, Platform } from "react-native";
import type { TFunction } from "i18next";

import type { Bank } from "../models/bank";

type ShowBankPickerOptions = {
  t: TFunction;
  banks: Bank[];
  selectedBankCode?: string;
  onSelect: (bank: Bank) => void;
};

export function showBankPicker({
  t,
  banks,
  selectedBankCode,
  onSelect,
}: ShowBankPickerOptions): void {
  if (banks.length === 0) {
    Alert.alert(t("home.bankDetails.errors.banksUnavailable"));
    return;
  }

  const labels = banks.map((bank) => bank.bankName);
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
        onSelect(banks[buttonIndex]);
      },
    );
    return;
  }

  Alert.alert(
    t("home.bankDetails.bankLabel"),
    undefined,
    [
      ...banks.map((bank) => ({
        text:
          bank.bankCode === selectedBankCode
            ? `${bank.bankName} ✓`
            : bank.bankName,
        onPress: () => onSelect(bank),
      })),
      { text: cancelLabel, style: "cancel" as const },
    ],
    { cancelable: true },
  );
}

export function findBankByCode(
  banks: Bank[],
  bankCode: string,
): Bank | undefined {
  return banks.find((bank) => bank.bankCode === bankCode);
}
