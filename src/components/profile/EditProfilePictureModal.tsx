import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemedStyles, type Theme } from "../../theme";

type EditProfilePictureModalProps = {
  visible: boolean;
  hasCustomPhoto: boolean;
  onClose: () => void;
  onChooseAvatar: () => void;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
  onDeletePhoto: () => void;
};

type ActionRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
};

function ActionRow({
  label,
  icon,
  onPress,
  destructive = false,
  isFirst = false,
  isLast = false,
}: ActionRowProps) {
  const styles = useThemedStyles(createActionStyles);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
        !isLast && styles.rowDivider,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
      <Ionicons
        name={icon}
        size={24}
        color={destructive ? "#E72424" : "#181C21"}
      />
    </Pressable>
  );
}

export function EditProfilePictureModal({
  visible,
  hasCustomPhoto,
  onClose,
  onChooseAvatar,
  onTakePhoto,
  onChoosePhoto,
  onDeletePhoto,
}: EditProfilePictureModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 32) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={styles.title}>{t("profile.editPhoto.title")}</Text>

          <View style={styles.group}>
            <ActionRow
              label={t("profile.editPhoto.chooseAvatar")}
              icon="person-outline"
              onPress={onChooseAvatar}
              isFirst
            />
            <ActionRow
              label={t("profile.editPhoto.takePhoto")}
              icon="camera-outline"
              onPress={onTakePhoto}
            />
            <ActionRow
              label={t("profile.editPhoto.choosePhoto")}
              icon="image-outline"
              onPress={onChoosePhoto}
              isLast
            />
          </View>

          <View style={styles.group}>
            {hasCustomPhoto ? (
              <ActionRow
                label={t("profile.editPhoto.deletePhoto")}
                icon="trash-outline"
                onPress={onDeletePhoto}
                destructive
                isFirst
              />
            ) : null}
            <ActionRow
              label={t("profile.editPhoto.cancel")}
              icon="close-outline"
              onPress={onClose}
              isFirst={!hasCustomPhoto}
              isLast
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(30, 30, 30, 0.6)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 28,
      color: "#1C1C1C",
      textAlign: "center",
    },
    group: {
      borderRadius: 12,
      overflow: "hidden",
    },
  });

const createActionStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: "#F5F5F5",
    },
    rowFirst: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    rowLast: {
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: "#E8E8E8",
    },
    label: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: "#181C21",
    },
    destructive: {
      color: "#E72424",
    },
    pressed: {
      opacity: 0.85,
    },
  });
