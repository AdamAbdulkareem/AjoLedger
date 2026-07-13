import { useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  ACCESS_PASSCODE_LENGTH,
  normalizeAccessPasscode,
} from "../lib/accessPasscodeStorage";
import { useTheme, useThemedStyles, type Theme } from "../theme";

const OTP_CELL_SIZE = 40;
const OTP_CELL_GAP = 16;

type PasscodeOtpInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  autoFocus?: boolean;
  editable?: boolean;
  length?: number;
  normalize?: (text: string) => string;
};

export function PasscodeOtpInput({
  label,
  value,
  onChangeText,
  error,
  autoFocus = false,
  editable = true,
  length = ACCESS_PASSCODE_LENGTH,
  normalize = normalizeAccessPasscode,
}: PasscodeOtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const styles = useThemedStyles(createStyles);

  const digits = value.padEnd(length, " ").split("").slice(0, length);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={styles.otpSection}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => {
          if (editable) inputRef.current?.focus();
        }}
        accessible={false}
        style={styles.otpRow}
      >
        {digits.map((digit, index) => {
          const filled = digit.trim().length > 0;
          const isActive = index === activeIndex && value.length < length;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                error ? styles.cellError : null,
                isActive ? styles.cellActive : null,
              ]}
            >
              <Text style={styles.cellText}>{filled ? "•" : ""}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChangeText(normalize(text))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        editable={editable}
        caretHidden
        style={styles.hiddenInput}
        accessibilityLabel={label}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type PasscodeRowInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  onComplete?: (passcode: string) => void;
  editable?: boolean;
};

export function PasscodeRowInput({
  placeholder,
  value,
  onChangeText,
  error,
  onComplete,
  editable = true,
}: PasscodeRowInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const styles = useThemedStyles(createStyles);

  const handleChange = (text: string) => {
    if (!editable) return;

    const next = normalizeAccessPasscode(text);
    onChangeText(next);
    if (next.length === ACCESS_PASSCODE_LENGTH) {
      onComplete?.(next);
    }
  };

  const displayValue =
    value.length > 0 ? "•".repeat(value.length) : "";

  return (
    <View style={styles.rowSection}>
      <Pressable
        onPress={() => {
          if (editable) inputRef.current?.focus();
        }}
        accessible={false}
        style={[styles.row, error ? styles.rowError : null]}
      >
        <Text
          style={[
            styles.rowText,
            !displayValue ? styles.rowPlaceholder : null,
          ]}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={13}
          color={theme.colors.textMuted}
        />
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={ACCESS_PASSCODE_LENGTH}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        editable={editable}
        style={styles.hiddenInput}
        accessibilityLabel={placeholder}
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
    otpSection: {
      gap: theme.spacing.md,
      alignSelf: "stretch",
      position: "relative",
    },
    fieldLabel: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    otpRow: {
      flexDirection: "row",
      gap: OTP_CELL_GAP,
      alignSelf: "stretch",
    },
    cell: {
      width: OTP_CELL_SIZE,
      height: OTP_CELL_SIZE,
      borderRadius: 8,
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
      fontFamily: theme.fontFamily.semibold,
      fontSize: 20,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    rowSection: {
      gap: theme.spacing.sm + 3,
      alignSelf: "stretch",
      position: "relative",
    },
    row: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rowError: {
      borderColor: theme.colors.errorBorder,
    },
    rowText: {
      ...theme.typography.body,
      flex: 1,
      color: theme.colors.textPrimary,
    },
    rowPlaceholder: {
      color: theme.colors.textMuted,
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
