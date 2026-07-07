import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { ContributionFrequency } from "../../models/group";
import { useThemedStyles, type Theme } from "../../theme";

const FREQUENCIES: ContributionFrequency[] = ["DAILY", "WEEKLY", "MONTHLY"];

type ContributionFrequencyPickerProps = {
  value: ContributionFrequency;
  onChange: (frequency: ContributionFrequency) => void;
  label: string;
};

export function ContributionFrequencyPicker({
  value,
  onChange,
  label,
}: ContributionFrequencyPickerProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  const labelFor = (frequency: ContributionFrequency) => {
    switch (frequency) {
      case "DAILY":
        return t("groups.create.frequency.daily");
      case "WEEKLY":
        return t("groups.create.frequency.weekly");
      case "MONTHLY":
        return t("groups.create.frequency.monthly");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segmentRow} accessibilityRole="tablist">
        {FREQUENCIES.map((frequency) => {
          const selected = frequency === value;
          return (
            <Pressable
              key={frequency}
              onPress={() => onChange(frequency)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={labelFor(frequency)}
              style={({ pressed }) => [
                styles.segment,
                selected && styles.segmentSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}
              >
                {labelFor(frequency)}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    segmentRow: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      padding: 4,
      gap: 4,
    },
    segment: {
      flex: 1,
      minHeight: 40,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xs,
    },
    segmentSelected: {
      backgroundColor: theme.colors.brand,
    },
    segmentLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    segmentLabelSelected: {
      color: theme.colors.textPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
