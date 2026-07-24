import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";

interface AppDateInputProps {
  label?: string;
  /** ISO date string (yyyy-mm-dd) or empty string. */
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function AppDateInput({
  label,
  value,
  onChange,
  placeholder = "בחר תאריך",
  maximumDate,
  minimumDate,
}: AppDateInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <input
          type="date"
          value={value}
          max={maximumDate ? toIsoDate(maximumDate) : undefined}
          min={minimumDate ? toIsoDate(minimumDate) : undefined}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label ?? placeholder}
          style={webInputStyle}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label ?? "תאריך"}: ${value}` : placeholder}
      >
        <Text style={[styles.dateButtonText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {showPicker ? (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(_event, date) => {
            setShowPicker(Platform.OS === "ios");
            if (date) {
              onChange(toIsoDate(date));
            }
          }}
        />
      ) : null}
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  minHeight: 48,
  borderWidth: 1.5,
  borderStyle: "solid",
  borderColor: Colors.border,
  borderRadius: BorderRadius.md,
  backgroundColor: Colors.cardBackground,
  paddingLeft: Spacing.md,
  paddingRight: Spacing.md,
  fontSize: 16,
  color: Colors.textPrimary,
  direction: "rtl",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  dateButton: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
});
