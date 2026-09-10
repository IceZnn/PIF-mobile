import React, { useState } from "react";
import {
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

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleRegister = () => {
    if (Object.values(form).some((value) => !value.trim())) {
      setErro("Preencha todos os campos para criar sua conta.");
      return;
    }

    setErro("");
    onRegister(form);
  };

  const fields = [
    ["nome", "Nome", "Digite seu nome"],
    ["email", "Email", "Digite seu email"],
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
          <Text style={styles.title}>Cadastro de Usuário</Text>
          {fields.map(([field, label, placeholder]) => (
            <View key={field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[field]}
                onChangeText={(value) =>
                  updateField(
                    field,
                    field === "cpf" ? value.replace(/\D/g, "") : value,
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
                autoCapitalize={field === "email" ? "none" : "sentences"}
                secureTextEntry={field === "senha"}
                maxLength={field === "cpf" ? 11 : undefined}
              />
            </View>
          ))}
          {erro || externalError ? (
            <Text style={styles.error}>{erro || externalError}</Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>CADASTRAR USUÁRIO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
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
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
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
  form: { backgroundColor: colors.surface, borderRadius: 12, padding: 20 },
  title: { ...typography.h2, marginBottom: 6 },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  label: { ...typography.button, color: colors.text, marginBottom: 6 },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: { color: colors.error, marginBottom: 12 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  buttonText: { ...typography.button, color: colors.onPrimary },
  secondaryButton: { alignItems: "center" },
  secondaryButtonText: { ...typography.button, color: colors.primary },
});
