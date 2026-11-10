import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../theme/colors";
import typography from "../theme/typography";
import { formatPercent, parseDecimal } from "../utils/format";

export default function WeightForm({
  record,
  onCancel,
  onSubmit,
  saving,
  error,
}) {
  const [weight, setWeight] = useState("");
  const [validationError, setValidationError] = useState("");
  const prepared = parseDecimal(record?.quantidade_preparada);
  const numericWeight = parseDecimal(weight);
  const target = parseDecimal(record?.maximo_desperdicio);
  const percentage =
    prepared !== null && prepared > 0 && numericWeight !== null
      ? (numericWeight / prepared) * 100
      : null;

  const submit = async () => {
    if (numericWeight === null || numericWeight < 0) {
      setValidationError("Informe um peso válido, igual ou maior que zero.");
      return;
    }
    setValidationError("");
    await onSubmit(numericWeight);
  };

  return (
    <KeyboardAvoidingView
      style={styles.modalRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.modalRoot}>
        <View style={styles.header}>
          <Text style={styles.title}>Registrar peso real</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Fechar registro de peso"
          >
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.description}>
            Informe manualmente o peso real desperdiçado para este registro.
          </Text>
          <Text style={styles.label}>Peso desperdiçado (kg) *</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={(value) => {
              setWeight(value.replace(/[^\d,.]/g, ""));
              setValidationError("");
            }}
            placeholder="Ex.: 1,25"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            accessibilityLabel="Peso desperdiçado em quilogramas"
          />
          {percentage === null ? (
            <Text style={styles.helper}>
              O percentual será calculado quando a quantidade preparada for maior
              que zero.
            </Text>
          ) : (
            <View
              style={[
                styles.preview,
                target === null
                  ? styles.previewNeutral
                  : percentage <= target
                    ? styles.previewGood
                    : styles.previewWarning,
              ]}
            >
              <Text style={styles.previewTitle}>
                Desperdício: {formatPercent(percentage)}
              </Text>
              <Text style={styles.previewText}>
                {target === null
                  ? "Meta não informada; não é possível determinar a situação."
                  : percentage <= target
                    ? `Dentro da meta de ${formatPercent(target)}.`
                    : `Exige atenção: acima da meta de ${formatPercent(target)}.`}
              </Text>
            </View>
          )}
          {validationError || error ? (
            <Text style={styles.error}>{validationError || error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.disabledButton]}
            onPress={submit}
            disabled={saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Salvar peso</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 64,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { ...typography.h2, color: colors.text, flexShrink: 1 },
  closeButton: { minHeight: 48, justifyContent: "center", paddingHorizontal: 8 },
  closeText: { ...typography.button, color: colors.primary },
  content: { padding: 20, paddingBottom: 36 },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 18,
  },
  label: { ...typography.button, color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  helper: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 14,
  },
  preview: { borderRadius: 8, padding: 14, marginTop: 16 },
  previewGood: { backgroundColor: "#e8f5e9" },
  previewWarning: { backgroundColor: "#fff4e5" },
  previewNeutral: { backgroundColor: colors.primaryLight },
  previewTitle: { ...typography.button, color: colors.text },
  previewText: { ...typography.bodySmall, color: colors.text, marginTop: 4 },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  primaryButton: {
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    paddingHorizontal: 16,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: colors.onPrimary, ...typography.button },
});
