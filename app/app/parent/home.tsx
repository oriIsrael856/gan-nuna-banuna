import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../src/auth/AuthContext";
import { AppStateCard } from "../../src/components/AppStateCard";
import { ChildBanner } from "../../src/components/parentHome/ChildBanner";
import { HomeBottomNav } from "../../src/components/parentHome/HomeBottomNav";
import { HomeHeroControls } from "../../src/components/parentHome/HomeHeroControls";
import { QuickActionsGrid } from "../../src/components/parentHome/QuickActionsGrid";
import HeroCornerDecor from "../../assets/parent/home/hero/hero-corner-decor-mobile.svg";
import {
  TodaySummaryCard,
  type SummaryValues,
} from "../../src/components/parentHome/TodaySummaryCard";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { useNotifications } from "../../src/notifications/NotificationsContext";
import { getCurrentParentChildId } from "../../src/services/auth.service";
import { getChildById } from "../../src/services/children.service";
import { getContractByChildId } from "../../src/services/contracts.service";
import { getParentHomeStats } from "../../src/services/parentHome.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

// Parent Home always uses the exact approved local Hero artwork (1179 x 1020);
// no per-daycare remote override is applied on this screen.
const PARENT_HOME_HERO = require("../../assets/parent/home/hero/hero-background-artwork-mobile.png");

// Hero artwork intrinsic aspect ratio (1179 x 1020).
const HERO_ASPECT = 1020 / 1179;
// Figma Hero Corner Decor — slightly narrower/inward vs prior pass to bring shapes closer.
const DECOR_VIEWPORT = 393;
const DECOR_WIDTH_RATIO = 560 / DECOR_VIEWPORT;
const DECOR_HEIGHT_RATIO = 182.007 / DECOR_VIEWPORT;
const DECOR_LEFT_RATIO = -82 / DECOR_VIEWPORT;
const DECOR_TOP_RATIO = -41 / DECOR_VIEWPORT;
// How far the floating summary card overlaps the bottom of the Hero.
const CARD_OVERLAP = 28;

export default function ParentHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const handleBottomNavPress = useBottomNavPress("parent");
  const { profile, setParentChildId } = useAuth();
  const { unreadCount } = useNotifications();
  const parentChildId = getCurrentParentChildId();
  const hasMultipleChildren = (profile?.parentChildIds.length ?? 0) > 1;

  const { data, loading, error, reload } = useAsyncData(async () => {
    const childIds = profile?.parentChildIds ?? [parentChildId];
    const children = await Promise.all(childIds.map((id) => getChildById(id)));
    const [child, contract, stats] = await Promise.all([
      getChildById(parentChildId),
      getContractByChildId(parentChildId),
      getParentHomeStats(),
    ]);
    return { children: children.filter(Boolean), child, contract, stats };
  }, [parentChildId, profile?.parentChildIds]);

  const parentChild = data?.child;
  const hasPendingContract = data?.contract?.status === "sent";
  const statsById = new Map((data?.stats ?? []).map((stat) => [stat.id, stat]));
  const childrenCount = data?.children.length ?? 0;

  const summaryValues: SummaryValues = {
    events: statsById.get("events")?.value ?? "—",
    messages: String(unreadCount),
    attendance: statsById.get("attendance")?.value ?? "—",
    children: data ? String(childrenCount) : "—",
  };

  const heroHeight = Math.round(width * HERO_ASPECT);
  const decorWidth = Math.round(width * DECOR_WIDTH_RATIO);
  const decorHeight = Math.round(width * DECOR_HEIGHT_RATIO);
  const decorLeft = Math.round(width * DECOR_LEFT_RATIO);
  const decorTop = Math.round(width * DECOR_TOP_RATIO);
  const cardTop = heroHeight - CARD_OVERLAP;

  const [cardHeight, setCardHeight] = useState(150);
  const [navHeight, setNavHeight] = useState(84);

  const contentTop = cardTop + cardHeight + Spacing.md;
  const contentBottom = navHeight + Spacing.md;

  return (
    <View style={styles.root}>
      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: contentTop, paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {hasMultipleChildren && data ? (
          <View style={styles.childPicker}>
            {data.children.map((childOption) => {
              if (!childOption) {
                return null;
              }
              const selected = childOption.id === parentChildId;
              return (
                <TouchableOpacity
                  key={childOption.id}
                  activeOpacity={0.85}
                  onPress={() => setParentChildId(childOption.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={childOption.name}
                  style={[
                    styles.childPickerItem,
                    selected && styles.childPickerItemSelected,
                  ]}
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

        <QuickActionsGrid />

        {error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת הנתונים. נסו שוב."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : loading || !data ? null : (
          <View style={styles.bannerWrap}>
            <ChildBanner
              childName={parentChild?.name ?? ""}
              pending={Boolean(hasPendingContract)}
              onPress={() =>
                router.push(
                  hasPendingContract ? "/parent/contract-renewal" : "/parent/child",
                )
              }
            />
          </View>
        )}
      </ScrollView>

      {/* Hero artwork + overlay (clipped for bottom radius); decor sits above unclipped */}
      <View
        style={[styles.heroBackdrop, { height: heroHeight }]}
        pointerEvents="none"
      >
        <Image
          source={PARENT_HOME_HERO}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
        />
        <View style={styles.heroOverlay} />
      </View>
      <View
        style={[
          styles.heroDecor,
          {
            height: heroHeight,
            width,
          },
        ]}
        pointerEvents="none"
      >
        <View
          style={{
            position: "absolute",
            width: decorWidth,
            height: decorHeight,
            left: decorLeft,
            top: decorTop,
          }}
        >
          <HeroCornerDecor width={decorWidth} height={decorHeight} />
        </View>
      </View>
      <View style={[styles.heroControls, { height: heroHeight }]} pointerEvents="box-none">
        <HomeHeroControls
          topInset={insets.top}
          unreadCount={unreadCount}
          onMenuPress={() => router.push("/settings")}
          onNotificationsPress={() => router.push("/notifications")}
        />
      </View>

      {/* Fixed floating Today Summary Card (overlaps Hero → content transition) */}
      <View
        style={[styles.summaryWrap, { top: cardTop }]}
        pointerEvents="box-none"
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
      >
        <TodaySummaryCard values={summaryValues} />
      </View>

      {/* Fixed Bottom Navigation */}
      <View
        style={styles.navWrap}
        onLayout={(e) => setNavHeight(e.nativeEvent.layout.height)}
      >
        <HomeBottomNav activeItem="home" onItemPress={handleBottomNavPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Figma Parent Home page background (warm cream, node 22:45 surface).
    backgroundColor: "#FFF9F3",
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  heroBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Figma node 4:6 — uniform tint over the full hero (no bottom band cut).
    backgroundColor: "rgba(31,58,43,0.12)",
  },
  heroDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "visible",
    zIndex: 2,
  },
  heroControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  summaryWrap: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
  },
  navWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerWrap: {
    marginTop: 0,
  },
  childPicker: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  childPickerItem: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
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
    ...Typography.captionMedium,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  childPickerTextSelected: {
    color: Colors.primary,
  },
});
