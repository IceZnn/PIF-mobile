import React from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../theme/colors";
import typography from "../theme/typography";
import {
  formatDate,
  formatKg,
  formatPercent,
  getRecordStatus,
  parseDecimal,
  periodLabel,
  roomLabelsFor,
} from "../utils/format";

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function RecordDetails({
  visible,
  record,
  loading,
  error,
  onClose,
  onRecordWeight,
  onDelete,
}) {
  const hasWeight =
    record?.peso_desperdicio !== null && record?.peso_desperdicio !== undefined;
  const prepared = parseDecimal(record?.quantidade_preparada);
  const weight = parseDecimal(record?.peso_desperdicio);
  const percentage =
    hasWeight && prepared !== null && prepared > 0 && weight !== null
      ? (weight / prepared) * 100
      : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalhes do registro</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.headerButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
        {loading && !record ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {record ? (
              <>
                <Text style={styles.cardapio}>{record.cardapio || "Cardápio não informado"}</Text>
                <Text style={styles.date}>{formatDate(record.created_at)}</Text>
                <View style={styles.detailList}>
                  <Detail label="Período" value={periodLabel(record.periodo)} />
                  <Detail label="Salas" value={roomLabelsFor(record.salas)} />
                  <Detail
                    label="Quantidade preparada"
                    value={formatKg(record.quantidade_preparada)}
                  />
                  <Detail
                    label="Meta máxima"
                    value={
                      parseDecimal(record.maximo_desperdicio) === null
                        ? "Meta não informada"
                        : formatPercent(record.maximo_desperdicio)
                    }
                  />
                  <Detail
                    label="Peso real desperdiçado"
                    value={hasWeight ? formatKg(record.peso_desperdicio) : "Sem peso registrado"}
                  />
                  {hasWeight ? (
                    <Detail
                      label="Percentual real"
                      value={
                        percentage === null
                          ? "Não calculável"
                          : formatPercent(percentage)
                      }
                    />
                  ) : null}
                  <Detail
                    label="Situação"
                    value={getRecordStatus(record)}
                  />
                  <Detail
                    label="Observações"
                    value={record.observacoes?.trim() || "Sem observações"}
                  />
                </View>

                {!hasWeight ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onRecordWeight}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryButtonText}>Registrar peso</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={onDelete}
                  accessibilityRole="button"
                >
                  <Text style={styles.deleteButtonText}>Excluir registro</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerButton: { minHeight: 48, justifyContent: "center", paddingHorizontal: 8 },
  headerButtonText: { ...typography.button, color: colors.primary },
  content: { padding: 20, paddingBottom: 36 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardapio: { ...typography.h2, color: colors.text },
  date: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 6 },
  detailList: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  detail: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { ...typography.bodySmall, color: colors.textSecondary },
  detailValue: { ...typography.body, color: colors.text, marginTop: 4 },
  error: { color: colors.error, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  primaryButton: {
    minHeight: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryButtonText: { color: colors.onPrimary, ...typography.button },
  deleteButton: {
    minHeight: 50,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  deleteButtonText: { color: colors.error, ...typography.button },
});
