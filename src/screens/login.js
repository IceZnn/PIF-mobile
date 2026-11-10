import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import typography from "../theme/typography";
import colors from "../theme/colors";

export default function LoginScreen({
  onLogin,
  onSignup,
  externalError,
  notice,
}) {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [hideExternalError, setHideExternalError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setErro("");
    setHideExternalError(false);
  }, [externalError]);

  const handleLogin = async () => {
    if (!cpf.trim() || !senha) {
      setErro("Preencha seu CPF e sua senha.");
      return;
    }

    setErro("");
    setSaving(true);
    try {
      await onLogin({ cpf: cpf.replace(/\D/g, ""), senha });
    } finally {
      setSaving(false);
    }
  };

  const message = erro || (!hideExternalError && externalError);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Text style={styles.logo}>SESI</Text>
          <Text style={styles.brandTitle}>
            Sistema de Controle de Desperdício Alimentar
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Entrar</Text>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={(value) => {
              setCpf(value.replace(/\D/g, "").slice(0, 11));
              setErro("");
              setHideExternalError(true);
            }}
            placeholder="Digite seu CPF"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={11}
            textContentType="username"
            returnKeyType="next"
            accessibilityLabel="CPF"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={(value) => {
              setSenha(value);
              setErro("");
              setHideExternalError(true);
            }}
            placeholder="Digite sua senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            accessibilityLabel="Senha"
          />

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.button, saving && styles.disabledButton]}
            onPress={handleLogin}
            disabled={saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSignup}
            disabled={saving}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Criar uma conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  content: { flexGrow: 1, justifyContent: "center", paddingVertical: 28 },
  brand: { marginBottom: 24 },
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
    maxWidth: 340,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text, marginBottom: 18 },
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
    minHeight: 50,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notice: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: colors.onPrimary, ...typography.button },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButtonText: { color: colors.primary, ...typography.button },
});
