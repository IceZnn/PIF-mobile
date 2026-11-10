import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, ApiError, SessionExpiredError } from "../services/api";
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
import MealForm from "./meal_form";
import RecordDetails from "./record_details";
import WeightForm from "./weight_form";

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const periodOrder = [
  ["cafe", "Café"],
  ["almoco", "Almoço"],
  ["cafe_tarde", "Café da tarde"],
];
const periodTargets = {
  cafe: 10,
  almoco: 12,
  cafe_tarde: 8,
};

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function getDashboardData(records) {
  const preparedRecords = records
    .map((record) => parseDecimal(record.quantidade_preparada))
    .filter((prepared) => prepared !== null);
  const measured = records
    .map((record) => ({
      record,
      weight: parseDecimal(record.peso_desperdicio),
      prepared: parseDecimal(record.quantidade_preparada),
    }))
    .filter(({ weight }) => weight !== null);
  const preparedMeasured = measured.filter(
    ({ prepared }) => prepared !== null && prepared > 0,
  );
  const totalWaste = measured.length > 0
    ? sum(measured.map(({ weight }) => weight))
    : null;
  const totalPreparedMeasured = preparedMeasured.length > 0
    ? sum(preparedMeasured.map(({ prepared }) => prepared))
    : null;
  const totalPrepared = preparedRecords.length > 0 ? sum(preparedRecords) : null;
  const averageWastePercent =
    totalPreparedMeasured && totalPreparedMeasured > 0
      ? (sum(
          preparedMeasured.map(({ weight }) => weight),
        ) /
          totalPreparedMeasured) *
        100
      : null;
  const averageEfficiency =
    averageWastePercent === null ? null : 100 - averageWastePercent;
  const alerts = measured.filter(
    ({ record, weight, prepared }) => {
      const target = parseDecimal(record.maximo_desperdicio);
      return (
        target !== null &&
        prepared !== null &&
        prepared > 0 &&
        (weight / prepared) * 100 > target
      );
    },
  ).length;

  const monthly = new Map();
  for (const { record, weight } of measured) {
    const date = new Date(record.created_at);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = monthly.get(key) || {
      label: `${monthLabels[date.getMonth()]} ${date.getFullYear()}`,
      value: 0,
      percentTotal: 0,
      percentCount: 0,
      date: new Date(date.getFullYear(), date.getMonth(), 1),
    };
    month.value += weight;
    const prepared = parseDecimal(record.quantidade_preparada);
    if (prepared !== null && prepared > 0) {
      month.percentTotal += (weight / prepared) * 100;
      month.percentCount += 1;
    }
    monthly.set(key, month);
  }
  const monthlyData = [...monthly.values()]
    .sort((left, right) => left.date - right.date)
    .slice(-6)
    .map((month) => ({
      ...month,
      averagePercent:
        month.percentCount > 0 ? month.percentTotal / month.percentCount : null,
    }));
  const maxMonthlyPercent = Math.max(
    ...monthlyData.map(({ averagePercent }) => averagePercent ?? 0),
    0,
  );

  const turnos = periodOrder.map(([key, label]) => {
      const periodRecords = preparedMeasured.filter(
        ({ record }) => record.periodo === key,
      );
      const actual =
        periodRecords.length === 0
          ? null
          : sum(
              periodRecords.map(({ weight, prepared }) => (weight / prepared) * 100),
            ) / periodRecords.length;
      const target = periodTargets[key];

      return {
        label,
        target,
        actual,
        status:
          actual === null
            ? "Sem dados"
            : actual <= target
              ? "Dentro da meta"
              : "Atenção",
      };
    });

  const schoolGroupWeights = new Map();
  for (const { record, weight } of measured) {
    const rooms = Array.isArray(record.salas) ? record.salas : [];
    const groups = new Set(
      rooms
        .filter((room) => typeof room === "string")
        .map((room) =>
          room.startsWith("fund")
            ? "Fundamental"
            : room === "em"
              ? "Médio"
              : room === "senai"
                ? "SENAI"
                : null,
        )
        .filter(Boolean),
    );
    for (const group of groups) {
      schoolGroupWeights.set(
        group,
        (schoolGroupWeights.get(group) || 0) + weight,
      );
    }
  }
  const schoolGroups = [...schoolGroupWeights.entries()].map(
    ([label, value]) => ({ label, value }),
  );
  const maxSchoolGroupWeight = Math.max(
    ...schoolGroups.map(({ value }) => value),
    0,
  );
  const criticalPeriod = turnos
    .filter(({ actual }) => actual !== null)
    .sort((left, right) => right.actual - left.actual)[0] || null;

  return {
    measuredCount: measured.length,
    hasPercentages: preparedMeasured.length > 0,
    missingWeightCount: records.length - measured.length,
    totalPrepared,
    totalWaste,
    totalPreparedMeasured,
    averageWastePercent,
    averageEfficiency,
    alerts,
    monthlyData: monthlyData.map((item) => ({
      ...item,
      height:
        maxMonthlyPercent > 0 && item.averagePercent !== null
          ? item.averagePercent / maxMonthlyPercent
          : 0,
    })),
    schoolGroups: schoolGroups.map((item) => ({
      ...item,
      width:
        maxSchoolGroupWeight > 0 ? item.value / maxSchoolGroupWeight : 0,
    })),
    turnos,
    criticalPeriod,
  };
}

function StatCard({ title, value, detail, accent }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {detail ? <Text style={styles.statDetail}>{detail}</Text> : null}
    </View>
  );
}

function RecordCard({ record, onOpen, onRecordWeight }) {
  const status = getRecordStatus(record);
  const hasWeight =
    record.peso_desperdicio !== null && record.peso_desperdicio !== undefined;
  const statusStyle =
    status === "Dentro da meta"
      ? styles.statusGood
      : status === "Atenção"
        ? styles.statusWarning
        : styles.statusNeutral;

  return (
    <View style={styles.recordCard}>
      <TouchableOpacity
        style={styles.recordOpen}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Abrir detalhes do registro ${record.cardapio || ""}`}
      >
        <View style={styles.recordTitleRow}>
          <Text style={styles.recordTitle} numberOfLines={2}>
            {record.cardapio || "Cardápio não informado"}
          </Text>
          <Text style={[styles.status, statusStyle]}>{status}</Text>
        </View>
        <Text style={styles.recordMeta}>
          {formatDate(record.created_at)} · {periodLabel(record.periodo)}
        </Text>
        <Text style={styles.recordMeta}>{roomLabelsFor(record.salas)}</Text>
        <View style={styles.recordStats}>
          <Text style={styles.recordStat}>
            Preparado: {formatKg(record.quantidade_preparada)}
          </Text>
          <Text style={styles.recordStat}>
            Meta:{" "}
            {parseDecimal(record.maximo_desperdicio) === null
              ? "—"
              : formatPercent(record.maximo_desperdicio)}
          </Text>
        </View>
        <Text style={styles.recordWeight}>
          Desperdício: {hasWeight ? formatKg(record.peso_desperdicio) : "Sem peso registrado"}
        </Text>
      </TouchableOpacity>
      {!hasWeight ? (
        <TouchableOpacity
          style={styles.smallAction}
          onPress={onRecordWeight}
          accessibilityRole="button"
        >
          <Text style={styles.smallActionText}>Registrar peso</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function Dashboard({ records }) {
  const data = useMemo(() => getDashboardData(records), [records]);
  const noMeasurements = data.measuredCount === 0;
  const noPercentages = !data.hasPercentages;
  const criticalAlert =
    data.criticalPeriod !== null &&
    data.criticalPeriod.actual > data.criticalPeriod.target;
  const monthlyWithPercent = data.monthlyData.filter(
    (month) => month.averagePercent !== null,
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Visão geral</Text>
      <Text style={styles.sectionDescription}>
        Perda, aproveitamento e alertas usam somente registros com peso. A
        produção inclui todas as refeições registradas.
      </Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Aproveitamento médio"
          value={
            data.averageEfficiency === null
              ? "—"
              : formatPercent(data.averageEfficiency)
          }
          detail={
            data.averageWastePercent === null
              ? "Sem peso registrado"
              : `Perda média: ${formatPercent(data.averageWastePercent)}`
          }
        />
        <StatCard
          title="Produção total"
          value={
            data.totalPrepared === null ? "—" : formatKg(data.totalPrepared)
          }
          detail={
            data.totalWaste === null
              ? "Sem peso registrado"
              : `Peso real perdido: ${formatKg(data.totalWaste)}`
          }
          accent
        />
        <StatCard
          title="Alertas"
          value={
            noPercentages
              ? "—"
              : String(data.alerts).padStart(2, "0")
          }
          detail={
            noPercentages
              ? "Sem dados completos"
              : data.alerts > 0
                ? "Em revisão"
                : "Sem alertas"
          }
        />
        <StatCard
          title="Registros"
          value={String(records.length)}
          detail={`${data.missingWeightCount} sem peso registrado`}
        />
        <StatCard
          title="Desperdício registrado"
          value={data.totalWaste === null ? "—" : formatKg(data.totalWaste)}
          detail={
            noMeasurements
              ? "Sem peso registrado"
              : `${data.measuredCount} registros pesados`
          }
        />
        <StatCard
          title="Base dos percentuais"
          value={
            data.totalPreparedMeasured === null
              ? "—"
              : formatKg(data.totalPreparedMeasured)
          }
          detail="Produção com peso informado"
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Média de desperdício por mês</Text>
        {monthlyWithPercent.length === 0 ? (
          <Text style={styles.emptyChart}>
            Ainda não há pesos e quantidades válidas para calcular percentuais.
          </Text>
        ) : (
          <View style={styles.chart}>
            {monthlyWithPercent.map((month) => (
              <View key={month.label} style={styles.chartColumn}>
                <Text style={styles.chartValue}>
                  {formatPercent(month.averagePercent)}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(
                          month.height * 100,
                          month.averagePercent > 0 ? 5 : 0,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{month.label}</Text>
                <Text style={styles.chartSubValue}>{formatKg(month.value)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Desperdício por grupo de salas</Text>
        {data.schoolGroups.length === 0 ? (
          <Text style={styles.emptyChart}>
            Ainda não há pesos registrados por grupo de salas.
          </Text>
        ) : (
          data.schoolGroups.map((group) => (
            <View key={group.label} style={styles.groupRow}>
              <Text style={styles.periodLabel}>{group.label}</Text>
              <View style={styles.groupBarTrack}>
                <View
                  style={[
                    styles.groupBar,
                    { width: `${group.width * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.periodValue}>{formatKg(group.value)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Comparativo por período</Text>
        {data.turnos.map((turno) => (
          <View key={turno.label} style={styles.turnoRow}>
            <View style={styles.turnoName}>
              <Text style={styles.periodLabel}>{turno.label}</Text>
              <Text style={styles.turnoMeta}>Meta: {turno.target}%</Text>
            </View>
            <Text
              style={[
                styles.turnoActual,
                turno.status === "Atenção"
                  ? styles.statusWarning
                  : turno.status === "Dentro da meta"
                    ? styles.statusGood
                    : styles.statusNeutral,
              ]}
            >
              {turno.actual === null
                ? "Sem dados"
                : `${formatPercent(turno.actual)} · ${turno.status}`}
            </Text>
          </View>
        ))}
        <Text
          style={[
            styles.currentStatus,
            criticalAlert
              ? styles.statusWarning
              : noPercentages
                ? styles.statusNeutral
                : styles.statusGood,
          ]}
        >
          {noPercentages
            ? noMeasurements
              ? "Sem pesos registrados para avaliar o desempenho."
              : "Não há quantidades válidas com peso para comparar as metas."
            : criticalAlert
              ? `Atenção no período de ${data.criticalPeriod.label.toLowerCase()}: ${formatPercent(data.criticalPeriod.actual)} de desperdício.`
              : "Os períodos com dados estão dentro das metas."}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen({
  token,
  onLogout,
  onSessionExpired,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [weightRecord, setWeightRecord] = useState(null);
  const [weightVisible, setWeightVisible] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightError, setWeightError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const refreshRecords = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError("");

      try {
        const nextRecords = await api.getRecords(token);
        setRecords(nextRecords);
        return nextRecords;
      } catch (requestError) {
        if (requestError instanceof SessionExpiredError) {
          await onSessionExpired();
        } else {
          setError(requestError.message);
        }
        return null;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [onSessionExpired, token],
  );

  useEffect(() => {
    refreshRecords(true);
  }, [refreshRecords]);

  const openDetails = async (record) => {
    setSelectedRecord(record);
    setDetailLoading(true);
    setDetailError("");
    try {
      const details = await api.getRecord(token, record.id);
      setSelectedRecord(details);
    } catch (requestError) {
      if (requestError instanceof SessionExpiredError) {
        await onSessionExpired();
      } else {
        setDetailError(requestError.message);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const openWeight = (record) => {
    setWeightRecord(record);
    setWeightError("");
    setWeightVisible(true);
  };

  const createRecord = async (payload) => {
    setCreating(true);
    setCreateError("");
    try {
      const result = await api.createRecord(token, payload);
      if (result?.refeicao_id === undefined || result?.refeicao_id === null) {
        throw new ApiError("A API não retornou o identificador do registro criado.");
      }

      const createdRecord = {
        id: result.refeicao_id,
        cardapio: payload.cardapio,
        periodo: payload.periodo,
        salas: payload.salas,
        quantidade_preparada: payload.quantidade,
        maximo_desperdicio: payload.desperdicio,
        peso_desperdicio: null,
        observacoes: payload.observacoes,
      };
      setCreateVisible(false);
      setFeedback("Refeição salva. Agora você pode registrar o peso real.");
      setActiveTab("records");
      setWeightRecord(createdRecord);
      setWeightVisible(true);
      await refreshRecords(false);
    } catch (requestError) {
      if (requestError instanceof SessionExpiredError) {
        await onSessionExpired();
      } else {
        setCreateError(requestError.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const saveWeight = async (weight) => {
    if (!weightRecord?.id) {
      setWeightError("Não foi possível identificar o registro para salvar o peso.");
      return;
    }

    setSavingWeight(true);
    setWeightError("");
    try {
      await api.recordWeight(token, weightRecord.id, weight);
      setWeightVisible(false);
      setFeedback("Peso registrado com sucesso.");
      await refreshRecords(false);
    } catch (requestError) {
      if (requestError instanceof SessionExpiredError) {
        await onSessionExpired();
      } else {
        setWeightError(requestError.message);
      }
    } finally {
      setSavingWeight(false);
    }
  };

  const deleteSelectedRecord = async () => {
    if (!selectedRecord?.id) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteRecord(token, selectedRecord.id);
      setSelectedRecord(null);
      setFeedback("Registro excluído.");
      await refreshRecords(false);
    } catch (requestError) {
      if (requestError instanceof SessionExpiredError) {
        await onSessionExpired();
      } else {
        setDetailError(requestError.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    const message = "Deseja excluir este registro? Esta ação não pode ser desfeita.";
    if (Platform.OS === "web") {
      if (typeof globalThis.confirm === "function" && globalThis.confirm(message)) {
        deleteSelectedRecord();
      }
      return;
    }

    Alert.alert("Excluir registro", message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: deleteSelectedRecord,
      },
    ]);
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  const renderRecord = ({ item }) => (
    <RecordCard
      record={item}
      onOpen={() => openDetails(item)}
      onRecordWeight={() => openWeight(item)}
    />
  );

  const recordsHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.sectionTitle}>Registros</Text>
      <Text style={styles.sectionDescription}>
        Suas refeições e os pesos informados.
      </Text>
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text style={styles.logo}>SESI</Text>
          <Text style={styles.headerTitle}>
            Controle de desperdício alimentar
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          disabled={loggingOut}
          accessibilityRole="button"
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.logoutText}>Sair</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {[
          ["dashboard", "Visão geral"],
          ["records", "Registros"],
        ].map(([tab, label]) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => {
            setCreateError("");
            setCreateVisible(true);
          }}
          accessibilityRole="button"
        >
          <Text style={styles.newButtonText}>+ Refeição</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "records" ? (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item, index) => String(item.id ?? index)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={recordsHeader}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando registros…</Text>
              </View>
            ) : error ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => refreshRecords(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.outlineButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
                <Text style={styles.emptyText}>
                  Crie uma refeição para começar a acompanhar o desperdício.
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setCreateVisible(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryButtonText}>Criar refeição</Text>
                </TouchableOpacity>
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refreshRecords(false)}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.dashboardContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refreshRecords(false)}
              tintColor={colors.primary}
            />
          }
        >
          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          {loading && records.length === 0 ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando indicadores…</Text>
            </View>
          ) : error && records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => refreshRecords(true)}
                accessibilityRole="button"
              >
                <Text style={styles.outlineButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Dashboard records={records} />
          )}
        </ScrollView>
      )}

      <Modal
        visible={createVisible}
        animationType="slide"
        onRequestClose={() => {
          if (!creating) {
            setCreateVisible(false);
          }
        }}
        presentationStyle="fullScreen"
      >
        <MealForm
          key={createVisible ? "open" : "closed"}
          onCancel={() => setCreateVisible(false)}
          onSubmit={createRecord}
          saving={creating}
          error={createError}
        />
      </Modal>

      <Modal
        visible={weightVisible}
        animationType="slide"
        onRequestClose={() => {
          if (!savingWeight) {
            setWeightVisible(false);
          }
        }}
        presentationStyle="fullScreen"
      >
        {weightRecord ? (
          <WeightForm
            key={weightVisible ? String(weightRecord.id) : "closed"}
            record={weightRecord}
            onCancel={() => setWeightVisible(false)}
            onSubmit={saveWeight}
            saving={savingWeight}
            error={weightError}
          />
        ) : null}
      </Modal>

      <RecordDetails
        visible={selectedRecord !== null}
        record={selectedRecord}
        loading={detailLoading}
        error={detailError}
        onClose={() => setSelectedRecord(null)}
        onRecordWeight={() => {
          const current = selectedRecord;
          setSelectedRecord(null);
          if (current) {
            openWeight(current);
          }
        }}
        onDelete={confirmDelete}
      />

      {deleting ? (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator size="large" color={colors.onPrimary} />
          <Text style={styles.deletingText}>Excluindo registro…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flex: 1, paddingRight: 10 },
  logo: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerTitle: {
    color: colors.textSecondary,
    ...typography.bodySmall,
    marginTop: 2,
  },
  logoutButton: {
    minWidth: 52,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { color: colors.primary, ...typography.button },
  tabs: {
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: 6,
  },
  tab: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: colors.primaryLight },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  tabTextActive: { color: colors.primary },
  newButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  newButtonText: { color: colors.onPrimary, fontSize: 13, fontWeight: "700" },
  dashboardContent: { padding: 18, paddingBottom: 36 },
  listContent: { paddingHorizontal: 16, paddingBottom: 36, flexGrow: 1 },
  listHeader: { paddingTop: 18, paddingBottom: 8 },
  sectionTitle: { ...typography.h2, color: colors.text },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 5,
    marginBottom: 14,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    width: "48%",
    minHeight: 106,
    flexGrow: 1,
  },
  statCardAccent: { borderColor: colors.primary },
  statTitle: { ...typography.bodySmall, color: colors.textSecondary },
  statValue: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 8,
  },
  statDetail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 3,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginTop: 14,
  },
  chartTitle: { ...typography.button, color: colors.text, marginBottom: 14 },
  emptyChart: { ...typography.bodySmall, color: colors.textSecondary },
  chart: {
    minHeight: 160,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 8,
  },
  chartColumn: { flex: 1, alignItems: "center", height: 150 },
  chartValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 6,
  },
  barTrack: {
    height: 100,
    width: "70%",
    backgroundColor: colors.background,
    justifyContent: "flex-end",
    borderRadius: 5,
    overflow: "hidden",
  },
  bar: { width: "100%", backgroundColor: colors.primary, borderRadius: 5 },
  chartLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
  chartSubValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  groupRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  periodLabel: { ...typography.body, color: colors.text },
  periodValue: { ...typography.button, color: colors.primary },
  groupBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  groupBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  turnoRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  turnoName: { flex: 1 },
  turnoMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 3,
  },
  turnoActual: {
    ...typography.bodySmall,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  currentStatus: {
    ...typography.bodySmall,
    lineHeight: 20,
    marginTop: 12,
  },
  errorBanner: {
    color: colors.error,
    backgroundColor: "#fff1f0",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  feedback: {
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  recordOpen: { minHeight: 44 },
  recordTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  recordTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  status: {
    ...typography.bodySmall,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  statusGood: { color: "#237a3b" },
  statusWarning: { color: colors.error },
  statusNeutral: { color: colors.textSecondary },
  recordMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 6,
  },
  recordStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10,
  },
  recordStat: { ...typography.bodySmall, color: colors.text },
  recordWeight: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginTop: 8,
  },
  smallAction: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 10,
  },
  smallActionText: { color: colors.primary, ...typography.button },
  loadingState: { alignItems: "center", paddingVertical: 38 },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyState: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 36 },
  emptyTitle: {
    ...typography.button,
    color: colors.text,
    fontSize: 17,
    textAlign: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 16,
  },
  primaryButtonText: { color: colors.onPrimary, ...typography.button },
  outlineButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 14,
  },
  outlineButtonText: { color: colors.primary, ...typography.button },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  deletingText: { color: colors.onPrimary, ...typography.button, marginTop: 12 },
});
