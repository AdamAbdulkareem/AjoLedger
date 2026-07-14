import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, useThemedStyles, type Theme } from "../theme";

export type OptionsPickerItem = {
  id: string;
  label: string;
};

type OptionsPickerSheetProps = {
  visible: boolean;
  title: string;
  options: OptionsPickerItem[];
  selectedId?: string;
  cancelLabel: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function OptionsPickerSheet({
  visible,
  title,
  options,
  selectedId,
  cancelLabel,
  searchPlaceholder,
  emptyLabel,
  onSelect,
  onClose,
}: OptionsPickerSheetProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const showSearch = Boolean(searchPlaceholder) && options.length > 6;

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(trimmed),
    );
  }, [options, query]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const handleSelect = (id: string) => {
    setQuery("");
    onSelect(id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={styles.title}>{title}</Text>

          {showSearch ? (
            <View style={styles.searchRow}>
              <Ionicons
                name="search-outline"
                size={18}
                color={theme.colors.textMuted}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.searchInput}
                accessibilityLabel={searchPlaceholder}
              />
            </View>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={
              filtered.length === 0 ? styles.listEmptyContent : undefined
            }
            ListEmptyComponent={
              emptyLabel ? (
                <Text style={styles.emptyText}>{emptyLabel}</Text>
              ) : null
            }
            renderItem={({ item, index }) => {
              const selected = item.id === selectedId;
              const isLast = index === filtered.length - 1;

              return (
                <Pressable
                  onPress={() => handleSelect(item.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={item.label}
                  style={({ pressed }) => [
                    styles.row,
                    !isLast && styles.rowDivider,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text
                    style={[styles.rowLabel, selected && styles.rowLabelSelected]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={theme.colors.textPrimary}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />

          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.rowPressed,
            ]}
          >
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(223, 227, 233, 0.7)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      maxHeight: "80%",
      gap: theme.spacing.md,
      ...theme.shadows.card,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      minHeight: 44,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 22,
      color: theme.colors.textPrimary,
      paddingVertical: theme.spacing.sm,
    },
    list: {
      maxHeight: 360,
    },
    listEmptyContent: {
      paddingVertical: theme.spacing.lg,
    },
    emptyText: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    row: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.inputBorder,
    },
    rowPressed: {
      opacity: 0.7,
    },
    rowLabel: {
      flex: 1,
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    rowLabelSelected: {
      fontFamily: theme.fontFamily.semibold,
    },
    cancelButton: {
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.button,
      backgroundColor: theme.colors.cardFooterBg,
    },
    cancelLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textSecondary,
    },
  });
