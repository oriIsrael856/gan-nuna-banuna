import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getContactMessages } from "../../src/services/contact.service";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeacherContactMessagesScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data, loading, error, reload } = useAsyncData(() => getContactMessages(), []);
  const messages = data ?? [];

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.push("/teacher/home")}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>פניות מהורים</Text>
        <Text style={styles.subtitle}>הודעות שנשלחו דרך טופס יצירת קשר</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען פניות" message="רגע..." />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת הפניות."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : messages.length === 0 ? (
          <AppStateCard
            state="empty"
            title="אין פניות"
            message="פניות מהורים יופיעו כאן."
          />
        ) : (
          messages.map((message) => (
            <AppCard key={message.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{formatDate(message.createdAt)}</Text>
                <Text style={styles.sender}>{message.senderName}</Text>
              </View>
              {message.subject ? (
                <Text style={styles.subject}>{message.subject}</Text>
              ) : null}
              <Text style={styles.body}>{message.body}</Text>
            </AppCard>
          ))
        )}
      </AppScreen>

      <BottomNavBar activeItem="home" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "right",
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textPrimary,
    textAlign: "right",
  },
});
