import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type BenefitKey = "secure" | "community" | "informed";

const BENEFITS: BenefitKey[] = ["secure", "community", "informed"];

const BENEFIT_ICONS: Record<
  BenefitKey,
  keyof typeof Ionicons.glyphMap
> = {
  secure: "shield-checkmark-outline",
  community: "people-outline",
  informed: "notifications-outline",
};

export function WhySaveWithAjoLedger() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("home.firstTime.whySaveTitle")}</Text>
      <View style={styles.row}>
        {BENEFITS.map((key) => (
          <View key={key} style={styles.benefit}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={BENEFIT_ICONS[key]}
                size={22}
                color={theme.colors.successDark}
              />
            </View>
            <Text style={styles.benefitTitle}>
              {t(`home.firstTime.benefits.${key}.title`)}
            </Text>
            <Text style={styles.benefitBody}>
              {t(`home.firstTime.benefits.${key}.body`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.cardFooterBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      padding: 10,
      gap: 11,
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },
    benefit: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.successMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    benefitTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 10,
      lineHeight: 12,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    benefitBody: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 10,
      lineHeight: 12,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
  });
