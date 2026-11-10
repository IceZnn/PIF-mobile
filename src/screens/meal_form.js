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
import { parseDecimal } from "../utils/format";

const periods = [
  ["cafe", "Café"],
  ["almoco", "Almoço"],
  ["cafe_tarde", "Café da tarde"],
];

const rooms = [
  ["fund1", "Fundamental 1"],
  ["fund2", "Fundamental 2"],
  ["em", "E.M."],
  ["senai", "SENAI"],
];

function Choice({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.choice, selected && styles.choiceSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MealForm({
  onCancel,
  onSubmit,
  saving,
  error,
}) {
  const [form, setForm] = useState({
    cardapio: "",
    periodo: "",
    salas: [],
    quantidade: "",
    desperdicio: "",
    observacoes: "",
  });
  const [validationError, setValidationError] = useState("");

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError("");
  };

  const toggleRoom = (room) => {
    const nextRooms = form.salas.includes(room)
      ? form.salas.filter((item) => item !== room)
      : [...form.salas, room];
    update("salas", nextRooms);
  };

  const submit = async () => {
    const quantity = parseDecimal(form.quantidade);
    const target = parseDecimal(form.desperdicio);

    if (!form.cardapio.trim()) {
      setValidationError("Informe o cardápio.");
      return;
    }
    if (!form.periodo) {
      setValidationError("Selecione o período.");
      return;
    }
    if (form.salas.length === 0) {
      setValidationError("Selecione pelo menos uma sala.");
      return;
    }
    if (quantity === null || quantity <= 0) {
      setValidationError("Informe uma quantidade preparada maior que zero.");
      return;
    }
    if (target === null || !Number.isInteger(target) || target < 0 || target > 100) {
      setValidationError("A meta deve ser um número inteiro entre 0 e 100%.");
      return;
    }

    setValidationError("");
    await onSubmit({
      cardapio: form.cardapio.trim(),
      periodo: form.periodo,
      salas: form.salas,
      quantidade: quantity,
      desperdicio: target,
      observacoes: form.observacoes.trim() || null,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.modalRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.modalRoot}>
        <View style={styles.header}>
          <Text style={styles.title}>Nova refeição</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Fechar formulário"
          >
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Cardápio *</Text>
          <TextInput
            style={styles.input}
            value={form.cardapio}
            onChangeText={(value) => update("cardapio", value)}
            placeholder="Ex.: arroz, feijão e salada"
            placeholderTextColor={colors.textSecondary}
            maxLength={255}
            returnKeyType="next"
            accessibilityLabel="Cardápio"
          />

          <Text style={styles.label}>Período *</Text>
          <View style={styles.choices}>
            {periods.map(([value, label]) => (
              <Choice
                key={value}
                label={label}
                selected={form.periodo === value}
                onPress={() => update("periodo", value)}
              />
            ))}
          </View>

          <Text style={styles.label}>Salas atendidas *</Text>
          <View style={styles.choices}>
            {rooms.map(([value, label]) => (
              <Choice
                key={value}
                label={label}
                selected={form.salas.includes(value)}
                onPress={() => toggleRoom(value)}
              />
            ))}
          </View>

          <Text style={styles.label}>Quantidade preparada (kg) *</Text>
          <TextInput
            style={styles.input}
            value={form.quantidade}
            onChangeText={(value) =>
              update("quantidade", value.replace(/[^\d,.]/g, ""))
            }
            placeholder="Ex.: 12,50"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            returnKeyType="next"
            accessibilityLabel="Quantidade preparada em quilogramas"
          />

          <Text style={styles.label}>Meta máxima de desperdício (%) *</Text>
          <TextInput
            style={styles.input}
            value={form.desperdicio}
            onChangeText={(value) =>
              update("desperdicio", value.replace(/[^\d]/g, ""))
            }
            placeholder="De 0 a 100"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={3}
            returnKeyType="next"
            accessibilityLabel="Meta máxima de desperdício em percentual"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={form.observacoes}
            onChangeText={(value) => update("observacoes", value)}
            placeholder="Opcional"
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            maxLength={2000}
            accessibilityLabel="Observações"
          />

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
              <Text style={styles.primaryButtonText}>Salvar refeição</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.required}>* Campo obrigatório</Text>
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
  title: { ...typography.h2, color: colors.text },
  closeButton: { minHeight: 48, justifyContent: "center", paddingHorizontal: 8 },
  closeText: { ...typography.button, color: colors.primary },
  content: { padding: 20, paddingBottom: 36 },
  label: {
    ...typography.button,
    color: colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: { minHeight: 110 },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  choice: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  choiceSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  choiceText: { ...typography.bodySmall, color: colors.text },
  choiceTextSelected: { color: colors.primary, fontWeight: "700" },
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
    marginTop: 20,
    paddingHorizontal: 16,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: colors.onPrimary, ...typography.button },
  required: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    marginTop: 12,
    textAlign: "center",
  },
});
