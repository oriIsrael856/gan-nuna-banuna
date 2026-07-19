import React, { useState } from "react";
import {
  Platform,
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
import { ParentHomeColors } from "../../src/components/parentHome/homeAssets";
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
// Slightly increased overlap + shorter hero shell → more room for scroll content.
const HERO_HEIGHT_SCALE = 1.02;
const CARD_OVERLAP = 42;

// On web, pin the hero and bottom nav to the visual viewport so browser
// toolbar show/hide and scroll chaining don't shift them.
const FIXED_POSITION = Platform.OS === "web" ? ("fixed" as "absolute") : "absolute";

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

  const heroHeight = Math.round(width * HERO_ASPECT * HERO_HEIGHT_SCALE);
  const decorWidth = Math.round(width * DECOR_WIDTH_RATIO);
  const decorHeight = Math.round(width * DECOR_HEIGHT_RATIO);
  const decorLeft = Math.round(width * DECOR_LEFT_RATIO);
  const decorTop = Math.round(width * DECOR_TOP_RATIO);
  const cardTop = heroHeight - CARD_OVERLAP;

  const [navHeight, setNavHeight] = useState(84);

  const contentBottom = navHeight + Spacing.md;

  return (
    <View style={styles.root}>
      {/* Pinned Hero (artwork → overlay → corner decor); content scrolls over it */}
      <View
        style={[styles.hero, { height: heroHeight }]}
        pointerEvents="none"
      >
        <Image
          source={PARENT_HOME_HERO}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
        />
        <View style={styles.heroOverlay} pointerEvents="none" />
        <View
          style={[
            styles.heroDecor,
            {
              width: decorWidth,
              height: decorHeight,
              left: decorLeft,
              top: decorTop,
            },
          ]}
          pointerEvents="none"
        >
          <HeroCornerDecor width={decorWidth} height={decorHeight} />
        </View>
      </View>

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: cardTop, paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TodaySummaryCard values={summaryValues} />

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

      {/* Pinned hero controls (menu + notifications) above the scroll layer */}
      <View style={styles.heroControlsLayer} pointerEvents="box-none">
        <HomeHeroControls
          topInset={insets.top}
          unreadCount={unreadCount}
          onMenuPress={() => router.push("/settings")}
          onNotificationsPress={() => router.push("/notifications")}
        />
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
    backgroundColor: ParentHomeColors.pageBackground,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  hero: {
    position: FIXED_POSITION,
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
  },
  heroControlsLayer: {
    position: FIXED_POSITION,
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    overflow: "visible",
    zIndex: 10,
  },
  navWrap: {
    position: FIXED_POSITION,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
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
