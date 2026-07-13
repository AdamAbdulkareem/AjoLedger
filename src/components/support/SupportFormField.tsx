import { StyleSheet, Text, TextInput, View } from "react-native";

import { useThemedStyles, type Theme } from "../../theme";

type SupportFormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "email-address";
  editable?: boolean;
};

export function SupportFormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  editable = true,
}: SupportFormFieldProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
          editable={editable}
          style={styles.input}
          accessibilityLabel={label}
        />
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
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: "#181C21",
    },
    inputWrap: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: "#BFC7D3",
      borderRadius: 12,
      paddingHorizontal: theme.spacing.md,
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    inputWrapError: {
      borderColor: theme.colors.errorBorder,
    },
    input: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
      paddingVertical: theme.spacing.sm,
    },
    placeholder: {
      color: "#BFC7D3",
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.error,
    },
  });
