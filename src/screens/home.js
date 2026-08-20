import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function HomeScreen({ onNewTask, onLogout }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>✓</Text>
        <Text style={styles.title}>Bem-vindo ao Task App</Text>
        <Text style={styles.description}>
          Aqui começa sua lista de tarefas.
        </Text>

        <TouchableOpacity style={styles.button} onPress={onNewTask}>
          <Text style={styles.buttonText}>Nova tarefa</Text>
        </TouchableOpacity>

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
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: colors.onPrimary,
    ...typography.button,
  },
  secondaryButton: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    ...typography.button,
  },
});
