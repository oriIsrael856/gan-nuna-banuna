import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { CLIENT_CONFIG } from "../../src/config/client.config";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getCurrentDaycareName } from "../../src/services/auth.service";
import { submitContactMessage } from "../../src/services/contact.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const CONTACT_PHONE = CLIENT_CONFIG.supportPhone || "03-1234567";
const CONTACT_EMAIL = CLIENT_CONFIG.supportEmail || "info@gan-nuna.co.il";

export default function ParentContactScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/parent/home");
  }

  function openLink(url: string) {
    Linking.openURL(url).catch(() => {
      Alert.alert("שגיאה", "לא ניתן לפתוח את היישום המתאים במכשיר.");
    });
  }

  async function handleSend() {
    if (!message.trim()) {
      Alert.alert("חסר תוכן", "נא לכתוב הודעה לפני השליחה.");
      return;
    }

    setSending(true);
    const ok = await submitContactMessage({ subject, body: message });
    setSending(false);

    if (!ok) {
      Alert.alert("שגיאה", "לא הצלחנו לשלוח את ההודעה. נסו שוב.");
      return;
    }

    Alert.alert("נשלח", "ההודעה נשלחה לצוות הגן. נחזור אליך בהקדם.");
    setSubject("");
    setMessage("");
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          notificationCount={0}
          onLeadingPress={handleBack}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>צור קשר</Text>
        <Text style={styles.subtitle}>{getCurrentDaycareName()}</Text>

        <View style={styles.actionsRow}>
          <ContactAction
            icon="call"
            label="התקשרות"
            onPress={() => openLink(`tel:${CONTACT_PHONE}`)}
          />
          <ContactAction
            icon="logo-whatsapp"
            label="וואטסאפ"
            onPress={() => openLink(`https://wa.me/972${CONTACT_PHONE.replace(/\D/g, "").replace(/^0/, "")}`)}
          />
          <ContactAction
            icon="mail"
            label="אימייל"
            onPress={() => openLink(`mailto:${CONTACT_EMAIL}`)}
          />
        </View>

        <AppCard style={styles.detailsCard}>
          <DetailRow icon="call-outline" label="טלפון" value={CONTACT_PHONE} />
          <DetailRow icon="mail-outline" label="אימייל" value={CONTACT_EMAIL} />
          <DetailRow icon="time-outline" label="שעות פעילות" value="א'-ה' 07:00-17:00" />
        </AppCard>

        <AppCard style={styles.formCard}>
          <Text style={styles.formTitle}>שליחת הודעה</Text>
          <AppTextInput
            label="נושא"
            value={subject}
            onChangeText={setSubject}
            placeholder="נושא הפנייה"
          />
          <AppTextInput
            label="הודעה"
            value={message}
            onChangeText={setMessage}
            placeholder="כתוב/כתבי את הודעתך כאן..."
            multiline
          />
          <AppButton title={sending ? "שולח..." : "שליחה"} onPress={handleSend} disabled={sending} style={styles.sendButton} />
        </AppCard>
      </AppScreen>

      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
    </View>
  );
}

function ContactAction({
  icon,
  label,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.action}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: IoniconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailValue}>{value}</Text>
      <View style={styles.detailLabelBlock}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Ionicons name={icon} size={16} color={Colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  actionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  action: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  actionLabel: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  detailsCard: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailLabelBlock: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "left",
  },
  formCard: {
    gap: Spacing.sm,
  },
  formTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  sendButton: {
    marginTop: Spacing.sm,
  },
});
