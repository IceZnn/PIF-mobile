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

export default function CadastroUserScreen({
  onRegister,
  onBack,
  externalError,
}) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    escola: "",
  });
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);
  const [hideExternalError, setHideExternalError] = useState(false);

  useEffect(() => {
    setHideExternalError(false);
  }, [externalError]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErro("");
    setHideExternalError(true);
  };

  const handleRegister = async () => {
    if (Object.values(form).some((value) => !value.trim())) {
      setErro("Preencha todos os campos para criar sua conta.");
      return;
    }
    if (form.cpf.length !== 11) {
      setErro("Informe um CPF com 11 números.");
      return;
    }

    setErro("");
    setSaving(true);
    try {
      await onRegister(form);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ["nome", "Nome", "Digite seu nome"],
    ["email", "E-mail", "Digite seu e-mail"],
    ["senha", "Senha", "Digite sua senha"],
    ["cpf", "CPF", "Digite seu CPF"],
    ["escola", "Escola", "Digite sua escola"],
  ];

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
          <Text style={styles.brandTitle}>Crie seu acesso ao sistema</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.title}>Cadastro de usuário</Text>
          {fields.map(([field, label, placeholder]) => (
            <View key={field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[field]}
                onChangeText={(value) =>
                  updateField(
                    field,
                    field === "cpf" ? value.replace(/\D/g, "").slice(0, 11) : value,
                  )
                }
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                keyboardType={
                  field === "cpf"
                    ? "numeric"
                    : field === "email"
                      ? "email-address"
                      : "default"
                }
                autoCapitalize={
                  field === "email" || field === "senha" ? "none" : "sentences"
                }
                autoComplete={
                  field === "senha"
                    ? "new-password"
                    : field === "email"
                      ? "email"
                      : "off"
                }
                secureTextEntry={field === "senha"}
                maxLength={field === "cpf" ? 11 : undefined}
                accessibilityLabel={label}
              />
            </View>
          ))}
          {erro || (!hideExternalError && externalError) ? (
            <Text style={styles.error}>
              {erro || (!hideExternalError && externalError)}
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.button, saving && styles.disabledButton]}
            onPress={handleRegister}
            disabled={saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>CADASTRAR USUÁRIO</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onBack}
            disabled={saving}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              Já possui cadastro? Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  brand: { marginBottom: 22 },
  logo: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  brandTitle: { color: colors.text, fontSize: 18, fontWeight: "600" },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text, marginBottom: 18 },
  label: { ...typography.button, color: colors.text, marginBottom: 6 },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: { color: colors.error, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    marginTop: 4,
    marginBottom: 10,
  },
  disabledButton: { opacity: 0.6 },
  buttonText: { ...typography.button, color: colors.onPrimary },
  secondaryButton: { alignItems: "center", justifyContent: "center", minHeight: 48 },
  secondaryButtonText: { ...typography.button, color: colors.primary },
});
