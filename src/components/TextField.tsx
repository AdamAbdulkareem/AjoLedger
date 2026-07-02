import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemedStyles, type Theme } from "../theme";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  textContentType,
  autoComplete,
}: TextFieldProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const styles = useThemedStyles(createStyles);
  const isSecure = secureTextEntry && hidden;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          autoComplete={autoComplete}
          style={styles.input}
          accessibilityLabel={label}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={styles.icon.color}
            />
          </Pressable>
        ) : null}
      </View>
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
    },
    label: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    inputWrap: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    inputWrapError: {
      borderColor: theme.colors.errorBorder,
    },
    input: {
      flex: 1,
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
      paddingVertical: theme.spacing.md,
    },
    placeholder: {
      color: theme.colors.textMuted,
    },
    icon: {
      color: theme.colors.textMuted,
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.error,
    },
  });
