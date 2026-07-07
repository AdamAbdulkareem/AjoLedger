import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import type { GroupHomeDashboard } from "../../models/home";
import { useThemedStyles, type Theme } from "../../theme";

type HomeGroupSwitcherProps = {
  groups: GroupHomeDashboard[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
};

export function HomeGroupSwitcher({
  groups,
  selectedGroupId,
  onSelectGroup,
}: HomeGroupSwitcherProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {groups.map((entry) => {
        const isSelected = entry.groupId === selectedGroupId;

        return (
          <Pressable
            key={entry.groupId}
            onPress={() => onSelectGroup(entry.groupId)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={entry.group.name}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
              numberOfLines={1}
            >
              {entry.group.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      gap: 10,
      paddingVertical: 2,
    },
    chip: {
      maxWidth: 180,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
    },
    chipSelected: {
      borderColor: theme.colors.brand,
      backgroundColor: theme.colors.brand,
    },
    chipLabel: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    chipLabelSelected: {
      color: theme.colors.textPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
