import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton } from "../../../src/components/AppButton";
import { AppHeader } from "../../../src/components/AppHeader";
import { AppScreen } from "../../../src/components/AppScreen";
import { AppStateCard } from "../../../src/components/AppStateCard";
import { BottomNavBar } from "../../../src/components/BottomNavBar";
import { ChildProfile } from "../../../src/components/ChildProfile";
import { useAsyncData } from "../../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../../src/navigation/useBottomNavPress";
import { deleteChild, getChildById } from "../../../src/services/children.service";
import { getContractByChildId } from "../../../src/services/contracts.service";
import { confirmDelete } from "../../../src/utils/confirm";
import { Colors } from "../../../src/theme/colors";
import { Spacing } from "../../../src/theme/spacing";

export default function TeacherChildScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data, loading, error, reload } = useAsyncData(async () => {
    const child = await getChildById(params.id);
    const contract = await getContractByChildId(child?.id);
    return { child, contract };
  }, [params.id]);
  const child = data?.child;
  const contract = data?.contract;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/teacher/children");
  }

  function handleDelete() {
    if (!child) {
      return;
    }
    confirmDelete(`למחוק את ${child.name} מהרשימה?`, async () => {
      await deleteChild(child.id);
      router.push("/teacher/children");
    });
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
          <>
            <ChildProfile child={child} contract={contract} />
            <AppButton
              title="עריכת פרטים"
              onPress={() => router.push(`/teacher/add-child?editId=${child.id}`)}
              style={styles.actionButton}
            />
            <AppButton
              title="דיווח יומי"
              variant="outline"
              onPress={() => router.push("/teacher/daily-report")}
              style={styles.actionButtonOutline}
            />
            <AppButton
              title="ניהול חוזה"
              variant="outline"
              onPress={() => router.push("/teacher/contracts")}
              style={styles.actionButtonOutline}
            />
            <AppButton
              title="מחיקת ילד"
              variant="danger"
              onPress={handleDelete}
              style={styles.actionButtonOutline}
            />
          </>
        ) : (
          <Text style={styles.empty}>לא נמצאו פרטי הילד/ה.</Text>
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
  actionButton: {
    marginTop: Spacing.lg,
  },
  actionButtonOutline: {
    marginTop: Spacing.sm,
  },
  empty: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: Spacing.xxl,
    fontSize: 15,
  },
});
