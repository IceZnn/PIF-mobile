import { Platform } from "react-native";

const defaultApiUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:8080"
    : "http://127.0.0.1:8080";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || defaultApiUrl
).replace(/\/+$/, "");
