import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function HomeScreen({ onLogout }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SESI</Text>
        <Text style={styles.headerTitle}>
          Sistema de Controle de Desperdício Alimentar
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Tudo certo!</Text>
        <Text style={styles.description}>
          Seu acesso foi realizado com sucesso.
        </Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={onLogout}>
          <Text style={styles.secondaryButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    padding: 24,
  },
  logo: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 23,
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    ...typography.button,
  },
});
