import { useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useThemedStyles, type Theme } from "../../theme";

const CELL_SIZE = 42;
const CELL_GAP = 18;
const OTP_LENGTH = 6;

type OtpDigitInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  autoFocus?: boolean;
  editable?: boolean;
  accessibilityLabel?: string;
};

export function normalizeOtpDigits(text: string): string {
  return text.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export function OtpDigitInput({
  value,
  onChangeText,
  error,
  autoFocus = false,
  editable = true,
  accessibilityLabel = "Verification code",
}: OtpDigitInputProps) {
  const inputRef = useRef<TextInput>(null);
  const styles = useThemedStyles(createStyles);

  const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  return (
    <View style={styles.section}>
      <Pressable
        onPress={() => {
          if (editable) inputRef.current?.focus();
        }}
        accessible={false}
        style={styles.row}
      >
        {digits.map((digit, index) => {
          const filled = digit.trim().length > 0;
          const isActive = index === activeIndex && value.length < OTP_LENGTH;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                error ? styles.cellError : null,
                isActive ? styles.cellActive : null,
              ]}
            >
              <Text style={[styles.cellText, !filled && styles.cellPlaceholder]}>
                {filled ? digit : "*"}
              </Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChangeText(normalizeOtpDigits(text))}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        editable={editable}
        caretHidden
        style={styles.hiddenInput}
        accessibilityLabel={accessibilityLabel}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      gap: theme.spacing.sm,
      alignSelf: "stretch",
      position: "relative",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignSelf: "stretch",
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    cellActive: {
      borderColor: theme.colors.textMuted,
    },
    cellError: {
      borderColor: theme.colors.errorBorder,
    },
    cellText: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
    },
    cellPlaceholder: {
      color: theme.colors.dotInactive,
    },
    hiddenInput: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
