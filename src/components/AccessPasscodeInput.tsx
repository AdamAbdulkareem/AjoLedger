import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  ACCESS_PASSCODE_LENGTH,
  normalizeAccessPasscode,
} from "../lib/accessPasscodeStorage";
import { useThemedStyles, type Theme } from "../theme";

type AccessPasscodeInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
};

export function AccessPasscodeInput({
  label,
  value,
  onChangeText,
  error,
  helperText,
}: AccessPasscodeInputProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(normalizeAccessPasscode(text))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={ACCESS_PASSCODE_LENGTH}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        style={[styles.input, error ? styles.inputError : null]}
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
      alignItems: "center",
    },
    label: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    helper: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    input: {
      width: 220,
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      textAlign: "center",
      fontFamily: theme.fontFamily.semibold,
      fontSize: 24,
      letterSpacing: 8,
      color: theme.colors.textPrimary,
      paddingVertical: theme.spacing.md,
    },
    inputError: {
      borderColor: theme.colors.errorBorder,
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
