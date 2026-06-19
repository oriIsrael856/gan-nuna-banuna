import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { ChildProfile } from "../../src/components/ChildProfile";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getCurrentParentChildId } from "../../src/services/auth.service";
import { getChildById } from "../../src/services/children.service";
import { getContractByChildId } from "../../src/services/contracts.service";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";

export default function ParentChildScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const parentChildId = getCurrentParentChildId();
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [child, contract] = await Promise.all([
      getChildById(parentChildId),
      getContractByChildId(parentChildId),
    ]);
    return { child, contract };
  }, [parentChildId]);
  const child = data?.child;
  const contract = data?.contract;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/parent/home");
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
        {loading ? (
          <AppStateCard
            state="loading"
            title="טוען פרטים"
            message="רגע, טוענים את פרטי הילד/ה"
          />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת הפרטים. נסו שוב."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : child ? (
          <ChildProfile child={child} contract={contract} />
        ) : (
          <Text style={styles.empty}>לא נמצאו פרטי ילד/ה.</Text>
        )}
      </AppScreen>

      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
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
  empty: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: Spacing.xxl,
    fontSize: 15,
  },
});
