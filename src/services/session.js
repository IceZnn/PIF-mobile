import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "sesi.auth.token";

function getWebStorage() {
  if (typeof globalThis.sessionStorage === "undefined") {
    throw new Error("O armazenamento da sessão não está disponível.");
  }

  return globalThis.sessionStorage;
}

export async function getSessionToken() {
  if (Platform.OS === "web") {
    return getWebStorage().getItem(TOKEN_KEY);
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveSessionToken(token) {
  if (Platform.OS === "web") {
    getWebStorage().setItem(TOKEN_KEY, token);
    return;
  }

  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSessionToken() {
  if (Platform.OS === "web") {
    getWebStorage().removeItem(TOKEN_KEY);
    return;
  }

  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
