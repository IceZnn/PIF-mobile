import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function LoginScreen({ onLogin, onSignup }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.placeholder}>
        <Text style={typography.body}>Campos de login</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onSignup}>
        <Text style={styles.secondaryButtonText}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h2,
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: colors.onPrimary,
    ...typography.button,
  },
  secondaryButton: {
    backgroundColor: colors.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    ...typography.button,
  },
});
