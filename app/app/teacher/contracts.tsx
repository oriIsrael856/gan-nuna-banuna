import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { BrandedHeroBanner } from "../../src/components/BrandedHeroBanner";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";

import { StatusBadge } from "../../src/components/StatusBadge";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  deleteContract,
  getContracts,
  setContractStatus,
} from "../../src/services/contracts.service";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { heroOverlayTextStyles } from "../../src/theme/heroOverlay";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";
import type { ContractStatus } from "../../src/types/contract";

export default function TeacherContractsScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const [searchText, setSearchText] = useState("");
  const { data, loading, error, reload } = useAsyncData(() => getContracts(), []);
  const contracts = useMemo(() => data ?? [], [data]);

  const filteredContracts = useMemo(() => {
    const query = searchText.trim();

    if (!query) {
      return contracts;
    }

    return contracts.filter((contract) =>
      [contract.childName, contract.parentName, contract.fileName].some((value) =>
        value.includes(query),
      ),
    );
  }, [contracts, searchText]);

  async function handleMarkSigned(id: string) {
    await setContractStatus(id, "signed");
    reload();
  }

  function handleDeleteContract(id: string) {
    confirmDelete("למחוק את החוזה?", async () => {
      await deleteContract(id);
      reload();
    });
  }

  const sentCount = contracts.filter((contract) => contract.status === "sent").length;
  const signedCount = contracts.filter((contract) => contract.status === "signed").length;
  const needsCareCount = contracts.filter((contract) =>
    ["expired", "declined", "error"].includes(contract.status),
  ).length;

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <BrandedHeroBanner heroKey="teacherContracts" height={220}>
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
          <View style={styles.titleBlock}>
            <Text style={heroOverlayTextStyles.title}>חוזים</Text>
            <Text style={heroOverlayTextStyles.subtitle}>ניהול חוזים וחתימות להורים</Text>
          </View>
        </BrandedHeroBanner>

        <View style={styles.body}>
          <View style={styles.summaryGrid}>
            <SummaryCard label="סה״כ חוזים" value={contracts.length} />
            <SummaryCard label="ממתינים לחתימה" value={sentCount} />
            <SummaryCard label="נחתמו" value={signedCount} />
            <SummaryCard label="דורשים טיפול" value={needsCareCount} />
          </View>

          <AppButton
            title="העלאת חוזה חדש"
            onPress={() => router.push("/teacher/upload-contract")}
            style={styles.uploadButton}
          />

          <View style={styles.searchRow}>
            <AppTextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="חיפוש חוזה, שם ילד או הורה..."
              style={styles.searchInput}
            />

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.filterButton}
              accessibilityRole="button"
              accessibilityLabel="סינון חוזים"
            >
              <Ionicons name="options-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>רשימת חוזים</Text>
            <Text style={styles.sectionMeta}>{filteredContracts.length} מוצגים</Text>
          </View>

          {loading ? (
            <AppStateCard
              state="loading"
              title="טוען חוזים"
              message="רגע, טוענים את רשימת החוזים"
            />
          ) : error ? (
            <AppStateCard
              state="error"
              title="לא הצלחנו לטעון"
              message="אירעה שגיאה בטעינת החוזים. נסו שוב."
              actionLabel="נסו שוב"
              onActionPress={reload}
            />
          ) : filteredContracts.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>לא נמצאו חוזים</Text>
              <Text style={styles.emptyText}>נסו לחפש שם אחר או לנקות את החיפוש.</Text>
            </AppCard>
          ) : (
            filteredContracts.map((contract) => (
              <TouchableOpacity
                key={contract.id}
                activeOpacity={0.85}
                onPress={() => router.push(`/teacher/child/${contract.childId}`)}
                accessibilityRole="button"
                accessibilityLabel={`חוזה של ${contract.childName}`}
              >
                <AppCard style={styles.contractCard}>
                <View style={styles.contractHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{contract.childName.slice(0, 1)}</Text>
                  </View>

                  <View style={styles.contractInfo}>
                    <Text style={styles.childName}>{contract.childName}</Text>
                    <Text style={styles.childAge}>{contract.childAge}</Text>
                  </View>

                  <StatusBadge status={contract.status as ContractStatus} />
                </View>

                <View style={styles.contractMeta}>
                  <Text style={styles.metaText}>הורה: {contract.parentName}</Text>
                  <Text style={styles.metaText}>קובץ: {contract.fileName}</Text>
                  <Text style={styles.metaText}>
                    נשלח: {new Date(contract.sentAt).toLocaleDateString("he-IL")}
                  </Text>
                  {contract.expiryDate ? (
                    <Text style={styles.metaText}>
                      תוקף: {new Date(contract.expiryDate).toLocaleDateString("he-IL")}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.actionRow}>
                  {contract.status !== "signed" ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.actionChip}
                      onPress={() => handleMarkSigned(contract.id)}
                      accessibilityRole="button"
                      accessibilityLabel="סמן כנחתם"
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary} />
                      <Text style={styles.actionChipText}>סמן כנחתם</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.actionChip}
                    onPress={() => handleDeleteContract(contract.id)}
                    accessibilityRole="button"
                    accessibilityLabel="מחיקת חוזה"
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    <Text style={[styles.actionChipText, styles.actionChipDanger]}>מחיקה</Text>
                  </TouchableOpacity>
                </View>
                </AppCard>
              </TouchableOpacity>
            ))
          )}
        </View>
      </AppScreen>

      <BottomNavBar
        activeItem="home"
        variant="teacher"
        onItemPress={handleBottomNavPress}
      />
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <AppCard style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </AppCard>
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
  headerOverlay: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  titleBlock: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
  },
  summaryGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  summaryCard: {
    width: "48%",
    alignItems: "center",
  },
  summaryValue: {
    ...Typography.titleLarge,
    color: Colors.primary,
  },
  summaryLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  uploadButton: {
    marginTop: Spacing.lg,
  },
  searchRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    minHeight: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardBackground,
  },
  listHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  sectionMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyCard: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.subtitle,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  contractCard: {
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  contractHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  avatarText: {
    ...Typography.titleLarge,
    color: Colors.primary,
  },
  contractInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  childName: {
    ...Typography.subtitle,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  childAge: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contractMeta: {
    gap: 4,
    alignItems: "flex-end",
  },
  actionRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  actionChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    minHeight: 44,
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  actionChipText: {
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.primary,
  },
  actionChipDanger: {
    color: Colors.error,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "right",
  },
});
