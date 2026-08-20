import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function CadastroUserScreen({ onRegister, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Usuário</Text>
      <View style={styles.placeholder}>
        <Text style={typography.body}>Campos de cadastro </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: { ...typography.h2, marginBottom: 12 },
  placeholder: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { ...typography.button, color: colors.onPrimary },
  secondaryButton: {
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: { ...typography.button, color: colors.text },
});
