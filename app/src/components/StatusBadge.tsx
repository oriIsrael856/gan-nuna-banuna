import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";
import type { AttendanceStatus } from "../types/child";
import type { ContractStatus } from "../types/contract";

type BadgeStatus = AttendanceStatus | ContractStatus;

interface StatusBadgeProps {
  status: BadgeStatus;
}

function getStatusLabel(status: BadgeStatus) {
  switch (status) {
    case "arrived":
      return "הגיע";
    case "not_arrived":
      return "לא הגיע";
    case "late":
      return "מאחר";
    case "left_early":
      return "יצא מוקדם";
    case "sent":
      return "נשלח לחתימה";
    case "viewed":
      return "נצפה";
    case "signed":
      return "נחתם";
    case "declined":
      return "נדחה";
    case "expired":
      return "פג תוקף";
    case "error":
      return "שגיאה";
    case "draft":
      return "טיוטה";
    default:
      return "";
  }
}

function getBadgeColors(status: BadgeStatus) {
  switch (status) {
    case "arrived":
      return {
        backgroundColor: Colors.presentBackground,
        color: Colors.presentText,
      };
    case "not_arrived":
      return {
        backgroundColor: Colors.absentBackground,
        color: Colors.absentText,
      };
    case "late":
      return {
        backgroundColor: Colors.lateBackground,
        color: Colors.lateText,
      };
    case "left_early":
      return {
        backgroundColor: Colors.leftEarlyBackground,
        color: Colors.leftEarlyText,
      };
    case "sent":
    case "viewed":
      return {
        backgroundColor: Colors.sentBackground,
        color: Colors.sentText,
      };
    case "signed":
      return {
        backgroundColor: Colors.signedBackground,
        color: Colors.signedText,
      };
    case "expired":
    case "declined":
    case "error":
      return {
        backgroundColor: Colors.expiredBackground,
        color: Colors.expiredText,
      };
    case "draft":
      return {
        backgroundColor: Colors.draftBackground,
        color: Colors.draftText,
      };
    default:
      return {
        backgroundColor: Colors.draftBackground,
        color: Colors.draftText,
      };
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = getBadgeColors(status);

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.text, { color: colors.color }]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});