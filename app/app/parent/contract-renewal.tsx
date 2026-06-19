import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { HeroBanner } from "../../src/components/HeroBanner";
import { StatusBadge } from "../../src/components/StatusBadge";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  getCurrentDaycareName,
  getCurrentParentChildId,
} from "../../src/services/auth.service";
import { getChildById } from "../../src/services/children.service";
import { getContractByChildId, getContracts, setContractStatus } from "../../src/services/contracts.service";
import { getContractSignedUrl } from "../../src/services/storage.service";
import { Colors } from "../../src/theme/colors";
import { Heroes } from "../../src/theme/heroes";
import { heroOverlayTextStyles } from "../../src/theme/heroOverlay";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

export default function ParentContractRenewalScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const parentChildId = getCurrentParentChildId();
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [child, contracts, fallbackContract] = await Promise.all([
      getChildById(parentChildId),
      getContracts(),
      getContractByChildId(parentChildId),
    ]);
    const contract =
      contracts.find((item) => item.childId === parentChildId && item.status === "sent") ??
      fallbackContract;
    return { child, contract };
  }, [parentChildId]);
  const child = data?.child;
  const contract = data?.contract;
  const [opening, setOpening] = useState(false);
  const [signing, setSigning] = useState(false);

  async function handleSignContract() {
    if (!contract || contract.status === "signed") {
      return;
    }

    Alert.alert(
      "אישור חתימה",
      "לאחר שקראתם את החוזה, לאשר שאתם מסכימים לתנאיו?",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מאשר/ת חתימה",
          onPress: async () => {
            setSigning(true);
            const ok = await setContractStatus(contract.id, "signed");
            setSigning(false);
            if (ok) {
              Alert.alert("החוזה נחתם", "תודה! החוזה סומן כחתום.");
              reload();
            } else {
              Alert.alert("שגיאה", "לא הצלחנו לעדכן את סטטוס החוזה.");
            }
          },
        },
      ],
    );
  }

  async function handleViewDocument() {
    if (!contract?.filePath) {
      Alert.alert("אין מסמך לצפייה", "המסמך עדיין לא הועלה על ידי הגן.");
      return;
    }

    setOpening(true);
    const url = await getContractSignedUrl(contract.filePath);
    setOpening(false);

    if (!url) {
      Alert.alert("שגיאה", "לא הצלחנו לפתוח את המסמך. נסו שוב מאוחר יותר.");
      return;
    }

    await Linking.openURL(url);
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <HeroBanner source={Heroes.parentContract} height={220}>
          <View style={styles.headerOverlay}>
            <AppHeader
              variant="back"
              onLeadingPress={() => router.push("/parent/home")}
              onBellPress={() => router.push("/notifications")}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={heroOverlayTextStyles.title}>חוזה הגן</Text>
            <Text style={heroOverlayTextStyles.subtitle}>חידוש / חתימה על חוזה</Text>
          </View>
        </HeroBanner>

        <View style={styles.body}>
        {loading ? (
          <AppStateCard
            state="loading"
            title="טוען חוזה"
            message="רגע, טוענים את פרטי החוזה"
          />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת החוזה. נסו שוב."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : (
          <>
        <AppCard style={styles.childCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{child?.name.slice(0, 1) ?? "י"}</Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child?.name ?? contract?.childName ?? "ילד/ה"}</Text>
            <Text style={styles.childSubtext}>{getCurrentDaycareName()}</Text>
          </View>
        </AppCard>

        {contract ? (
          <>
            <AppCard style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.sectionLabel}>סטטוס החוזה</Text>
                <StatusBadge status={contract.status} />
              </View>
              <Text style={styles.contractTitle}>חוזה לשנת {contract.activityYear}</Text>
              <Text style={styles.contractText}>
                בתוקף החל מ-{formatDate(contract.periodStart)} עד {formatDate(contract.periodEnd)}
              </Text>
            </AppCard>

            <AppCard style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>פרטי החוזה</Text>
              <DetailRow label="שנת פעילות" value={contract.activityYear ?? "לא צוין"} />
              <DetailRow
                label="תקופת החוזה"
                value={`${formatDate(contract.periodStart)} - ${formatDate(contract.periodEnd)}`}
              />
              <DetailRow label="ילד/ה" value={contract.childName} />
              <DetailRow
                label="מספר ימי פעילות בשבוע"
                value={`${contract.activityDaysPerWeek ?? 5} ימים`}
              />
            </AppCard>

            <AppCard style={styles.documentCard}>
              <Text style={styles.sectionTitle}>מסמך החוזה</Text>
              <Text style={styles.fileName}>{contract.fileName}</Text>
              <Text style={styles.fileSize}>{contract.fileSize ?? "PDF"}</Text>
              <AppButton
                title={opening ? "פותח..." : "צפייה במסמך"}
                variant="outline"
                onPress={handleViewDocument}
                disabled={opening}
                style={styles.cardButton}
              />
            </AppCard>

            <AppCard style={styles.signatureCard}>
              <Text style={styles.sectionTitle}>חתימה על החוזה</Text>
              <Text style={styles.cardText}>
                לאחר קריאת החוזה, ניתן לאשר את החתימה. לחתימה דיגיטלית מלאה יתווסף בעתיד ספק
                חיצוני.
              </Text>
              <AppButton
                title={signing ? "שומר..." : contract.status === "signed" ? "החוזה חתום" : "אישור חתימה"}
                onPress={handleSignContract}
                disabled={signing || contract.status === "signed"}
                style={styles.cardButton}
              />
            </AppCard>
          </>
        ) : (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.sectionTitle}>אין חוזה להצגה</Text>
            <Text style={styles.cardText}>כרגע לא נמצא חוזה משויך לילד/ה.</Text>
          </AppCard>
        )}

        <AppCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>מידע נוסף</Text>
          <Text style={styles.cardText}>
            ניתן לפנות אל הגן בכל שאלה או הבהרה בנוגע לחוזה.
          </Text>
          <AppButton
            title="צור קשר עם הגן"
            variant="outline"
            onPress={() => router.push("/parent/contact")}
            style={styles.cardButton}
          />
        </AppCard>
          </>
        )}
        </View>
      </AppScreen>

      <BottomNavBar
        activeItem="home"
        variant="parent"
        onItemPress={handleBottomNavPress}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "לא צוין";
  }

  return new Date(value).toLocaleDateString("he-IL");
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  headerOverlay: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  titleBlock: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
    gap: Spacing.lg,
  },
  childCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
  },
  childInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  childName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  childSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusCard: {
    gap: Spacing.sm,
  },
  statusHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "700",
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  contractText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  detailsCard: {
    gap: Spacing.sm,
  },
  documentCard: {
    gap: Spacing.sm,
  },
  signatureCard: {
    gap: Spacing.sm,
  },
  infoCard: {
    gap: Spacing.sm,
  },
  emptyCard: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  detailRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "700",
    textAlign: "left",
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  fileSize: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  cardButton: {
    marginTop: Spacing.xs,
  },
});
