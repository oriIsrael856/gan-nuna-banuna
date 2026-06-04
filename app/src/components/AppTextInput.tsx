import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { KeyboardTypeOptions, StyleProp, TextStyle, ViewStyle } from "react-native";

import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";

interface AppTextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function AppTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  keyboardType = "default",
  style,
  inputStyle,
}: AppTextInputProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        textAlign="right"
        style={[
          styles.input,
          multiline ? styles.multilineInput : undefined,
          inputStyle,
        ]}
      />
    </View>
  );
}

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
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E8DDD2",
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});