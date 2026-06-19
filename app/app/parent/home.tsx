import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../src/auth/AuthContext";
import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { StatusBadge } from "../../src/components/StatusBadge";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { Colors } from "../../src/theme/colors";
import { Heroes } from "../../src/theme/heroes";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import {
  getCurrentDaycareName,
  getCurrentParentChildId,
  getCurrentUser,
} from "../../src/services/auth.service";
import { getChildById } from "../../src/services/children.service";
import { getContractByChildId } from "../../src/services/contracts.service";
import { getDailyActivities } from "../../src/services/dailyReports.service";
import {
  getParentHomeMessages,
  getParentHomePhotos,
  getParentHomeStats,
} from "../../src/services/parentHome.service";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const STAT_ICONS: Record<string, IoniconName> = {
  events: "calendar-outline",
  payments: "wallet-outline",
  messages: "notifications-outline",
  attendance: "people-outline",
};

const STAT_ROUTES: Partial<Record<string, Href>> = {
  events: "/parent/upcoming-events",
  messages: "/messages",
  attendance: "/parent/daily-summary",
};

const parentQuickActions: {
  id: string;
  label: string;
  icon: IoniconName;
  route?: Href;
}[] = [
  { id: "contact", label: "צור קשר עם הגן", icon: "call-outline", route: "/parent/contact" },
  {
    id: "contracts",
    label: "טפסים ומסמכים",
    icon: "document-text-outline",
    route: "/parent/contract-renewal",
  },
  {
    id: "calendar",
    label: "לוח שנה",
    icon: "calendar-outline",
    route: "/calendar",
  },
  { id: "profile", label: "פרופיל", icon: "person-outline", route: "/profile" },
];

export default function ParentHomeScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const { profile, setParentChildId } = useAuth();
  const parent = getCurrentUser();
  const parentChildId = getCurrentParentChildId();
  const hasMultipleChildren = (profile?.parentChildIds.length ?? 0) > 1;

  const { data, loading, error, reload } = useAsyncData(async () => {
    const childIds = profile?.parentChildIds ?? [parentChildId];
    const children = await Promise.all(childIds.map((id) => getChildById(id)));
    const [child, contract, activities, stats, photos, messages] = await Promise.all([
      getChildById(parentChildId),
      getContractByChildId(parentChildId),
      getDailyActivities(),
      getParentHomeStats(),
      getParentHomePhotos(),
      getParentHomeMessages(),
    ]);
    return { children: children.filter(Boolean), child, contract, activities, stats, photos, messages };
  }, [parentChildId, profile?.parentChildIds]);

  const parentChild = data?.child;
  const parentContract = data?.contract;
  const hasPendingContract = parentContract?.status === "sent";
  const todayActivities = data?.activities ?? [];
  const parentStats = data?.stats ?? [];
  const parentPhotos = data?.photos ?? [];
  const parentMessages = data?.messages ?? [];

  function handleQuickActionPress(route: Href | undefined) {
    if (route) {
      router.push(route);
      return;
    }

    Alert.alert("בקרוב", "הפעולה הזו תתווסף בהמשך.");
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable noPadding contentStyle={styles.screenContent}>
        <View style={styles.heroSection}>
          <Image
            source={Heroes.parentHome}
            style={styles.fullHeroImage}
            contentFit="cover"
            contentPosition="top"
          />
          <View style={styles.headerOverlay}>
            <AppHeader
              onBellPress={() => router.push("/notifications")}
              onLeadingPress={() => router.push("/settings")}
            />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>שלום, {parent.name}!</Text>
            <Text style={styles.greetingSubtext}>♥ כיף שבאת הביתה</Text>
          </View>
          {loading || !data ? (
            <AppStateCard
              state="loading"
              title="טוען נתונים"
              message="רגע, טוענים את העדכונים מהגן"
            />
          ) : error ? (
            <AppStateCard
              state="error"
              title="לא הצלחנו לטעון"
              message="אירעה שגיאה בטעינת הנתונים. נסו שוב."
              actionLabel="נסו שוב"
              onActionPress={reload}
            />
          ) : (
            <>
          {hasMultipleChildren ? (
            <View style={styles.childPicker}>
              {(data?.children ?? []).map((childOption) => {
                if (!childOption) {
                  return null;
                }
                const selected = childOption.id === parentChildId;
                return (
                  <TouchableOpacity
                    key={childOption.id}
                    activeOpacity={0.85}
                    onPress={() => setParentChildId(childOption.id)}
                    style={[styles.childPickerItem, selected && styles.childPickerItemSelected]}
                  >
                    <Text
                      style={[
                        styles.childPickerText,
                        selected && styles.childPickerTextSelected,
                      ]}
                    >
                      {childOption.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/parent/child")}>
            <AppCard style={styles.childCard}>
              <ChildAvatar avatarText={parentChild?.name.slice(0, 1) ?? "י"} />
              <View style={styles.childTextBlock}>
                <Text style={styles.childName}>{parentChild?.name ?? "ילד/ה"}</Text>
                <Text style={styles.childSubtitle}>{getCurrentDaycareName()}</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
            </AppCard>
          </TouchableOpacity>

          <View style={styles.statsGrid}>
            {parentStats.map((stat) => {
              const route = STAT_ROUTES[stat.id];
              const card = (
                <AppCard style={styles.statCard}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Ionicons
                    name={STAT_ICONS[stat.id] ?? "ellipse-outline"}
                    size={22}
                    color={Colors.primary}
                    style={styles.statIcon}
                  />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statText}>{stat.text}</Text>
                </AppCard>
              );

              return (
                <TouchableOpacity
                  key={stat.id}
                  activeOpacity={route ? 0.85 : 1}
                  disabled={!route}
                  onPress={() => route && router.push(route)}
                  style={styles.statPressable}
                >
                  {card}
                </TouchableOpacity>
              );
            })}
          </View>

          {hasPendingContract && (
            <AppCard style={styles.contractAlert}>
              <View style={styles.contractHeader}>
                <StatusBadge status="sent" />
                <Text style={styles.contractTitle}>חוזה חדש ממתין לחתימה</Text>
              </View>
              <Text style={styles.contractText}>
                יש לעיין בחוזה ולחתום עליו בהקדם כדי להשלים את ההרשמה.
              </Text>
              <AppButton
                title="חתימה על חוזה"
                onPress={() => router.push("/parent/contract-renewal")}
                style={styles.contractButton}
              />
            </AppCard>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/parent/daily-summary")}
          >
            <AppCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>היום בגן</Text>
                <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activitiesScroll}
              >
                {todayActivities.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    activeOpacity={0.75}
                    onPress={() => router.push("/parent/daily-summary")}
                    style={styles.activityCard}
                  >
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <View style={styles.activityThumb}>
                      {activity.imageUrl ? (
                        <Image source={{ uri: activity.imageUrl }} style={styles.activityImage} />
                      ) : (
                        <Ionicons name="image-outline" size={26} color={Colors.primary} />
                      )}
                    </View>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityText} numberOfLines={1}>
                      {activity.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </AppCard>
          </TouchableOpacity>

          <View style={styles.twoColumns}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/parent/gallery")}
              style={styles.columnPressable}
            >
              <AppCard style={styles.columnCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="images-outline" size={18} color={Colors.primary} />
                  <Text style={styles.columnTitle}>תמונות אחרונות</Text>
                  <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
                </View>
                <View style={styles.photosGrid}>
                  {parentPhotos.map((photo) => (
                    <View key={photo.id} style={styles.photoTile}>
                      {"imageUrl" in photo && photo.imageUrl ? (
                        <Image source={{ uri: photo.imageUrl }} style={styles.photoImage} />
                      ) : (
                        <Ionicons name="image-outline" size={22} color={Colors.primary} />
                      )}
                    </View>
                  ))}
                </View>
                <Text style={styles.columnAction}>צפייה בכל התמונות ‹</Text>
              </AppCard>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/messages")}
              style={styles.columnPressable}
            >
              <AppCard style={styles.columnCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="megaphone-outline" size={18} color={Colors.primary} />
                  <Text style={styles.columnTitle}>הודעות מהגן</Text>
                  <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
                </View>
                {parentMessages.map((message, index) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageItem,
                      index === parentMessages.length - 1 && styles.messageItemLast,
                    ]}
                  >
                    <Text style={styles.messageDate}>{message.date}</Text>
                    <Text style={styles.messageTitle}>{message.title}</Text>
                    <Text style={styles.messageText} numberOfLines={2}>
                      {message.description}
                    </Text>
                  </View>
                ))}
                <Text style={styles.columnAction}>לכל ההודעות ‹</Text>
              </AppCard>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsRow}>
            {parentQuickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                activeOpacity={0.75}
                onPress={() => handleQuickActionPress(action.route)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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

function ChildAvatar({ avatarText }: { avatarText: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{avatarText}</Text>
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
  heroSection: {
    width: "100%",
    height: 380,
    position: "relative",
    backgroundColor: Colors.background,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  fullHeroImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  greetingBlock: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
  },
  greetingSubtext: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  childPicker: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  childPickerItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  childPickerItemSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primary,
  },
  childPickerText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  childPickerTextSelected: {
    color: Colors.primary,
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
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  childTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  childName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  childSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statPressable: {
    width: "48%",
  },
  statCard: {
    width: "100%",
    alignItems: "center",
  },
  statIcon: {
    marginVertical: 4,
  },
  statValue: {
    fontSize: 23,
    fontWeight: "800",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  contractAlert: {
    marginTop: Spacing.md,
    backgroundColor: Colors.sentBackground,
  },
  contractHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  contractTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  contractText: {
    color: Colors.sentText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  contractButton: {
    marginTop: Spacing.md,
  },
  sectionCard: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  activitiesScroll: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  activityCard: {
    width: 140,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  activityThumb: {
    height: 70,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    marginVertical: Spacing.xs,
    overflow: "hidden",
  },
  activityImage: {
    width: "100%",
    height: "100%",
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  activityText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
  twoColumns: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  columnPressable: {
    flex: 1,
  },
  columnCard: {
    flex: 1,
  },
  columnTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  columnAction: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  photosGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  photoTile: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  messageItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    alignItems: "flex-end",
  },
  messageItemLast: {
    borderBottomWidth: 0,
  },
  messageDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 2,
    textAlign: "right",
  },
  messageText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
    lineHeight: 18,
  },
  quickActionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
  },
  quickActionLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "700",
    textAlign: "center",
  },
});
