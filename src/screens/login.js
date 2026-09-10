import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function LoginScreen({ onLogin, onSignup, externalError }) {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = () => {
    if (!cpf.trim() || !senha.trim()) {
      setErro("Preencha seu CPF e sua senha.");
      return;
    }

    setErro("");
    onLogin({ cpf: cpf.trim(), senha });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.brand}>
        <Text style={styles.logo}>SESI</Text>
        <Text style={styles.brandTitle}>
          Sistema de Controle de Desperdício Alimentar
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}></Text>

        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          value={cpf}
          onChangeText={setCpf}
          placeholder="Digite seu CPF"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          placeholder="Digite sua senha"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        {erro || externalError ? (
          <Text style={styles.error}>{erro || externalError}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onSignup}>
          <Text style={styles.secondaryButtonText}>Criar uma conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  brand: {
    marginBottom: 28,
  },
  logo: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  brandTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    maxWidth: 320,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    ...typography.h2,
    marginBottom: 6,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  label: {
    ...typography.button,
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  buttonText: {
    color: colors.onPrimary,
    ...typography.button,
  },
  secondaryButton: {
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    ...typography.button,
  },
});
