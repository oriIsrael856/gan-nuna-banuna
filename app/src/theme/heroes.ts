import type { ImageSource } from "expo-image";

export const Heroes: Record<string, ImageSource> = {
  login: require("../../assets/heroes/login.jpg") as ImageSource,
  parentHome: require("../../assets/heroes/parent-home-branding-cropped.jpg") as ImageSource,
  teacherHome: require("../../assets/heroes/teacher-home-greeting-cropped.jpg") as ImageSource,
  children: require("../../assets/heroes/children.jpg") as ImageSource,
  attendance: require("../../assets/heroes/attendance.jpg") as ImageSource,
  dailySummary: require("../../assets/heroes/daily-summary.jpg") as ImageSource,
  teacherContracts: require("../../assets/heroes/teacher-contracts.jpg") as ImageSource,
  uploadContract: require("../../assets/heroes/upload-contract.jpg") as ImageSource,
  parentContract: require("../../assets/heroes/parent-contract.jpg") as ImageSource,
};
